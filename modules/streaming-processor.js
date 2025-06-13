const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const { Transform } = require('stream');
const log = require('electron-log');
const errorHandler = require('./error-handler');

class StreamingProcessor {
  constructor() {
    this.currentProgress = 0;
    this.totalProgress = 100;
    this.activeStreams = new Set(); // Track active streams for cleanup
    this.maxConcurrentStreams = 3; // Limit concurrent operations
  }

  // Cleanup method to properly close all streams
  cleanup() {
    for (const stream of this.activeStreams) {
      try {
        if (stream && !stream.destroyed) {
          stream.destroy();
        }
      } catch (error) {
        log.warn('Error destroying stream during cleanup:', error);
      }
    }
    this.activeStreams.clear();
  }

  // Track stream for proper cleanup
  trackStream(stream) {
    this.activeStreams.add(stream);
    stream.on('close', () => this.activeStreams.delete(stream));
    stream.on('end', () => this.activeStreams.delete(stream));
    stream.on('error', () => this.activeStreams.delete(stream));
  }

  async processFiles(event, options) {
    const { filePaths, operation, outputPath, delimiter, splitOptions } = options;
    
    log.info(`Starting streaming processing for ${filePaths.length} files`);
    
    try {
      // Validate operation
      const validOperations = ['merge', 'convert', 'split'];
      if (!validOperations.includes(operation)) {
        throw errorHandler.createError(
          errorHandler.errorCodes.VALIDATION_ERROR,
          `Invalid streaming operation: ${operation}`,
          null,
          { operation, validOperations }
        );
      }

      // Validate file paths for streaming
      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        throw errorHandler.createError(
          errorHandler.errorCodes.VALIDATION_ERROR,
          'No files provided for streaming processing',
          null,
          { filePaths }
        );
      }

      const methodMap = {
        'merge': 'streamMerge',
        'convert': 'streamConvert', 
        'split': 'streamSplit'
      };

      const wrappedMethod = errorHandler.wrapAsync(
        this[methodMap[operation]].bind(this),
        { operation: `streaming_${operation}`, fileCount: filePaths.length }
      );

      const result = await wrappedMethod(event, filePaths, outputPath, delimiter, splitOptions);
      
      log.info(`Streaming ${operation} operation completed successfully`);
      return result;

    } catch (error) {
      // Clean up streams on error
      this.cleanup();
      
      // Convert to standardized error if not already
      if (!error.code || !errorHandler.errorCodes[error.code]) {
        const standardError = errorHandler.createError(
          errorHandler.errorCodes.PROCESSING_ERROR,
          `Streaming processing failed: ${error.message}`,
          error,
          { operation, fileCount: filePaths.length, streaming: true }
        );
        return errorHandler.errorToResult(standardError);
      }
      
      return errorHandler.errorToResult(error);
    }
  }

  async streamMerge(event, filePaths, outputPath, delimiter = ',') {
    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(outputPath);
      this.trackStream(outputStream);
      
      let isFirstFile = true;
      let processedFiles = 0;
      let headers = [];

      // Handle cleanup on errors
      const cleanup = (error) => {
        this.cleanup();
        if (error) {
          reject(error);
        }
      };

      outputStream.on('error', cleanup);

      const processNextFile = async (index) => {
        try {
          if (index >= filePaths.length) {
            outputStream.end();
            resolve({ 
              success: true, 
              message: 'Merge concluído com sucesso!',
              totalRows: processedFiles,
              outputFile: path.basename(outputPath)
            });
            return;
          }

          const filePath = filePaths[index];
          const ext = path.extname(filePath).toLowerCase();
          
          let fileHeaders;
          if (ext === '.csv' || ext === '.txt') {
            fileHeaders = await this.streamCSVMerge(filePath, outputStream, delimiter, isFirstFile, headers);
          } else if (ext === '.xlsx' || ext === '.xls') {
            fileHeaders = await this.streamXLSXMerge(filePath, outputStream, isFirstFile, headers);
          } else {
            throw new Error(`Formato de arquivo não suportado: ${ext}`);
          }

          if (isFirstFile) {
            headers = fileHeaders;
            isFirstFile = false;
          }
          
          processedFiles++;
          this.updateProgress(event, processedFiles, filePaths.length);
          
          // Add small delay to prevent memory buildup
          setTimeout(() => processNextFile(index + 1), 10);
          
        } catch (error) {
          log.error(`Error processing file ${filePaths[index]}:`, error);
          cleanup(error);
        }
      };

      processNextFile(0);
    });
  }

  async streamCSVMerge(filePath, outputStream, delimiter, isFirstFile, existingHeaders) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath, { highWaterMark: 16 * 1024 }); // 16KB chunks
      this.trackStream(fileStream);
      
      let headers = [];
      let isFirstRow = true;
      let rowCount = 0;

      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        header: false,
        skipEmptyLines: true,
        step: (row) => {
          try {
            if (isFirstRow) {
              headers = row.data.filter(h => h && h.trim()); // Clean headers
              if (isFirstFile && headers.length > 0) {
                outputStream.write(Papa.unparse([headers]) + '\n');
              }
              isFirstRow = false;
            } else if (row.data && row.data.length > 0) {
              // Filter out completely empty rows
              const cleanRow = row.data.map(cell => cell || '');
              if (cleanRow.some(cell => cell.trim())) {
                outputStream.write(Papa.unparse([cleanRow]) + '\n');
                rowCount++;
              }
            }
          } catch (error) {
            log.warn('Error processing row:', error);
          }
        },
        complete: () => {
          // Ensure streams are properly closed
          if (fileStream && !fileStream.destroyed) {
            fileStream.destroy();
          }
          log.info(`CSV merge completed for ${filePath}: ${rowCount} rows processed`);
          resolve(headers);
        },
        error: (error) => {
          log.error('CSV parsing error:', error);
          if (fileStream && !fileStream.destroyed) {
            fileStream.destroy();
          }
          reject(error);
        }
      });

      // Handle stream errors
      fileStream.on('error', (error) => {
        log.error('File stream error:', error);
        reject(error);
      });

      parseStream.on('error', (error) => {
        log.error('Parse stream error:', error);
        reject(error);
      });

      fileStream.pipe(parseStream);
    });
  }

  async streamXLSXMerge(filePath, outputStream, isFirstFile, existingHeaders) {
    return new Promise((resolve, reject) => {
      try {
        log.info(`Processing XLSX file: ${filePath}`);
        
        // Read file with reduced memory footprint
        const workbook = XLSX.readFile(filePath, { 
          cellText: false,
          cellDates: false,
          sheetStubs: false
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error('No worksheet found in XLSX file');
        }
        
        // Process in chunks to reduce memory usage
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        let headers = [];
        let rowCount = 0;
        
        // Get headers first
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = worksheet[cellAddress];
          headers.push(cell ? String(cell.v || '').trim() : '');
        }
        
        if (isFirstFile && headers.length > 0) {
          outputStream.write(Papa.unparse([headers]) + '\n');
        }
        
        // Process data rows in smaller chunks
        const chunkSize = 1000; // Process 1000 rows at a time
        for (let startRow = range.s.r + 1; startRow <= range.e.r; startRow += chunkSize) {
          const endRow = Math.min(startRow + chunkSize - 1, range.e.r);
          
          for (let row = startRow; row <= endRow; row++) {
            const rowData = [];
            let hasData = false;
            
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              const value = cell ? String(cell.v || '') : '';
              rowData.push(value);
              if (value.trim()) hasData = true;
            }
            
            if (hasData) {
              outputStream.write(Papa.unparse([rowData]) + '\n');
              rowCount++;
            }
          }
          
          // Force garbage collection between chunks
          if (global.gc) {
            global.gc();
          }
        }
        
        // Clear references to help garbage collection
        delete workbook.Sheets[sheetName];
        
        log.info(`XLSX merge completed for ${filePath}: ${rowCount} rows processed`);
        resolve(headers);
        
      } catch (error) {
        log.error('XLSX processing error:', error);
        reject(error);
      }
    });
  }

  async streamSplit(event, filePaths, outputPath, delimiter, splitOptions) {
    const results = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const result = await this.streamSplitSingleFile(filePath, outputPath, delimiter, splitOptions);
      results.push(result);
      
      this.updateProgress(event, i + 1, filePaths.length);
    }
    
    return { 
      success: true, 
      message: `${results.length} arquivo(s) dividido(s) com sucesso!`,
      details: results
    };
  }

  async streamSplitSingleFile(filePath, outputPath, delimiter, splitOptions) {
    return new Promise((resolve, reject) => {
      const baseName = path.basename(filePath, path.extname(filePath));
      const ext = path.extname(filePath);
      
      let currentChunk = 0;
      let currentRowCount = 0;
      let targetRowsPerChunk = splitOptions.type === 'lines' ? 
        parseInt(splitOptions.value) : 0;
      
      let totalRows = 0;
      let headers = [];
      let chunks = [];
      let currentChunkData = [];

      // First pass: count total rows
      const countStream = fs.createReadStream(filePath);
      const countParser = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        step: (row) => {
          if (totalRows === 0) {
            headers = row.data;
          }
          totalRows++;
        },
        complete: () => {
          totalRows--; // Subtract header row
          
          if (splitOptions.type === 'files') {
            targetRowsPerChunk = Math.ceil(totalRows / parseInt(splitOptions.value));
          }
          
          // Second pass: split the file
          this.performSplit(filePath, outputPath, baseName, ext, delimiter, 
                           targetRowsPerChunk, headers)
            .then(resolve)
            .catch(reject);
        },
        error: reject
      });

      countStream.pipe(countParser);
    });
  }

  async performSplit(filePath, outputPath, baseName, ext, delimiter, 
                    targetRowsPerChunk, headers) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      let currentChunk = 0;
      let currentRowCount = 0;
      let currentOutputStream = null;
      let isFirstRow = true;

      const createNewChunk = () => {
        if (currentOutputStream) {
          currentOutputStream.end();
        }
        currentChunk++;
        const chunkPath = path.join(outputPath, 
          `${baseName}_part_${currentChunk.toString().padStart(3, '0')}${ext}`);
        currentOutputStream = fs.createWriteStream(chunkPath);
        
        // Write headers to new chunk
        currentOutputStream.write(Papa.unparse([headers]) + '\n');
        currentRowCount = 0;
      };

      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        step: (row) => {
          if (isFirstRow) {
            isFirstRow = false;
            createNewChunk();
            return;
          }

          if (currentRowCount >= targetRowsPerChunk) {
            createNewChunk();
          }

          currentOutputStream.write(Papa.unparse([row.data]) + '\n');
          currentRowCount++;
        },
        complete: () => {
          if (currentOutputStream) {
            currentOutputStream.end();
          }
          resolve({
            file: path.basename(filePath),
            chunks: currentChunk,
            rowsPerChunk: targetRowsPerChunk
          });
        },
        error: reject
      });

      fileStream.pipe(parseStream);
    });
  }

  async streamConvert(event, filePaths, outputPath, delimiter) {
    const results = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const result = await this.streamConvertSingleFile(filePath, outputPath, delimiter);
      results.push(result);
      
      this.updateProgress(event, i + 1, filePaths.length);
    }
    
    return { 
      success: true, 
      message: `${results.length} arquivo(s) convertido(s) com sucesso!` 
    };
  }

  async streamConvertSingleFile(filePath, outputPath, delimiter) {
    const inputExt = path.extname(filePath).toLowerCase();
    const outputExt = path.extname(outputPath).toLowerCase();
    const baseName = path.basename(filePath, inputExt);
    const outputDir = path.dirname(outputPath);
    const finalOutputPath = path.join(outputDir, `${baseName}_converted${outputExt}`);

    if (inputExt === outputExt) {
      throw new Error('Formato de entrada e saída são iguais');
    }

    if (inputExt === '.xlsx' || inputExt === '.xls') {
      return await this.convertXLSXToCSV(filePath, finalOutputPath, delimiter);
    } else if (outputExt === '.xlsx') {
      return await this.convertCSVToXLSX(filePath, finalOutputPath, delimiter);
    } else {
      return await this.convertCSVToCSV(filePath, finalOutputPath, delimiter);
    }
  }

  async convertXLSXToCSV(inputPath, outputPath, delimiter) {
    return new Promise((resolve, reject) => {
      try {
        const workbook = XLSX.readFile(inputPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const outputStream = fs.createWriteStream(outputPath);
        const csvData = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });
        
        outputStream.write(csvData);
        outputStream.end();
        
        resolve({ inputFile: path.basename(inputPath), outputFile: path.basename(outputPath) });
      } catch (error) {
        reject(error);
      }
    });
  }

  async convertCSVToXLSX(inputPath, outputPath, delimiter) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(inputPath, { highWaterMark: 16 * 1024 });
      this.trackStream(fileStream);
      
      const data = [];
      const maxRowsInMemory = 10000; // Limit rows in memory
      let rowCount = 0;
      let headers = [];
      
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        header: false,
        skipEmptyLines: true,
        step: (row) => {
          try {
            if (rowCount === 0) {
              headers = row.data;
            } else {
              // Create object with headers as keys
              const rowObj = {};
              headers.forEach((header, index) => {
                rowObj[header] = row.data[index] || '';
              });
              data.push(rowObj);
              
              // If we've accumulated too many rows, this might cause memory issues
              if (data.length >= maxRowsInMemory) {
                log.warn(`Large CSV file detected (${data.length} rows). Consider using smaller files for XLSX conversion.`);
              }
            }
            rowCount++;
          } catch (error) {
            log.warn('Error processing CSV row for XLSX conversion:', error);
          }
        },
        complete: () => {
          try {
            log.info(`Converting ${data.length} rows to XLSX format`);
            
            // Use streaming approach for large datasets
            if (data.length > maxRowsInMemory) {
              // Process in chunks
              const chunkSize = 5000;
              const worksheet = XLSX.utils.json_to_sheet(data.slice(0, chunkSize));
              
              for (let i = chunkSize; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                XLSX.utils.sheet_add_json(worksheet, chunk, { origin: -1, skipHeader: true });
              }
              
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
              XLSX.writeFile(workbook, outputPath);
            } else {
              const worksheet = XLSX.utils.json_to_sheet(data);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
              XLSX.writeFile(workbook, outputPath);
            }
            
            // Clean up memory
            data.length = 0;
            
            if (fileStream && !fileStream.destroyed) {
              fileStream.destroy();
            }
            
            resolve({ 
              inputFile: path.basename(inputPath), 
              outputFile: path.basename(outputPath),
              rowsProcessed: rowCount - 1
            });
          } catch (error) {
            log.error('Error creating XLSX file:', error);
            reject(error);
          }
        },
        error: (error) => {
          if (fileStream && !fileStream.destroyed) {
            fileStream.destroy();
          }
          reject(error);
        }
      });

      fileStream.on('error', reject);
      fileStream.pipe(parseStream);
    });
  }

  async convertCSVToCSV(inputPath, outputPath, delimiter) {
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputPath, { highWaterMark: 16 * 1024 });
      const outputStream = fs.createWriteStream(outputPath);
      
      this.trackStream(inputStream);
      this.trackStream(outputStream);
      
      let rowCount = 0;
      
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: ',', // Assume input is comma-delimited
        skipEmptyLines: true,
        step: (row) => {
          try {
            if (row.data && row.data.length > 0) {
              outputStream.write(Papa.unparse([row.data], { delimiter }) + '\n');
              rowCount++;
            }
          } catch (error) {
            log.warn('Error processing CSV row:', error);
          }
        },
        complete: () => {
          outputStream.end();
          
          // Clean up streams
          if (inputStream && !inputStream.destroyed) {
            inputStream.destroy();
          }
          
          log.info(`CSV conversion completed: ${rowCount} rows processed`);
          resolve({ 
            inputFile: path.basename(inputPath), 
            outputFile: path.basename(outputPath),
            rowsProcessed: rowCount
          });
        },
        error: (error) => {
          // Clean up on error
          if (inputStream && !inputStream.destroyed) {
            inputStream.destroy();
          }
          if (outputStream && !outputStream.destroyed) {
            outputStream.destroy();
          }
          reject(error);
        }
      });

      // Handle stream errors
      inputStream.on('error', reject);
      outputStream.on('error', reject);
      
      inputStream.pipe(parseStream);
    });
  }

  async analyzeFile(filePath) {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.csv' || ext === '.txt') {
      return await this.analyzeCSVFile(filePath, stats);
    } else if (ext === '.xlsx' || ext === '.xls') {
      return await this.analyzeXLSXFile(filePath, stats);
    }
    
    return {
      size: stats.size,
      lastModified: stats.mtime,
      type: ext,
      error: 'Formato não suportado para análise streaming'
    };
  }

  async analyzeCSVFile(filePath, stats) {
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      let headers = [];
      let sampleRows = [];
      const maxSampleRows = 5;
      let isCompleted = false;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          log.warn('CSV analysis timed out, returning partial results');
          resolve({
            size: stats.size,
            lastModified: stats.mtime,
            totalRows: Math.max(0, rowCount - 1),
            columns: headers.length,
            headers: headers,
            sampleData: sampleRows,
            type: 'CSV',
            streaming: true,
            analyzed: new Date().toISOString(),
            warning: 'Analysis timed out - partial results'
          });
        }
      }, 5000); // 5 second timeout
      
      const fileStream = fs.createReadStream(filePath, { highWaterMark: 16 * 1024 });
      this.trackStream(fileStream);
      
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        header: false,
        skipEmptyLines: true,
        preview: 100, // Limit to first 100 rows for analysis
        step: (row) => {
          try {
            if (rowCount === 0) {
              headers = row.data.filter(h => h && h.trim());
            } else if (sampleRows.length < maxSampleRows && row.data.length > 0) {
              const cleanRow = row.data.map(cell => cell || '');
              if (cleanRow.some(cell => cell.trim())) {
                sampleRows.push(cleanRow);
              }
            }
            rowCount++;
          } catch (error) {
            log.warn('Error during CSV analysis:', error);
          }
        },
        complete: () => {
          if (!isCompleted) {
            isCompleted = true;
            clearTimeout(timeout);
            
            // Clean up stream
            if (fileStream && !fileStream.destroyed) {
              fileStream.destroy();
            }
            
            resolve({
              size: stats.size,
              lastModified: stats.mtime,
              totalRows: Math.max(0, rowCount - 1),
              columns: headers.length,
              headers: headers,
              sampleData: sampleRows,
              type: 'CSV',
              streaming: true,
              analyzed: new Date().toISOString()
            });
          }
        },
        error: (error) => {
          if (!isCompleted) {
            isCompleted = true;
            clearTimeout(timeout);
            
            // Clean up on error
            if (fileStream && !fileStream.destroyed) {
              fileStream.destroy();
            }
            log.error('CSV analysis error:', error);
            reject(error);
          }
        }
      });

      fileStream.on('error', (error) => {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeout);
          reject(error);
        }
      });

      try {
        fileStream.pipe(parseStream);
      } catch (error) {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeout);
          reject(error);
        }
      }
    });
  }

  async analyzeXLSXFile(filePath, stats) {
    try {
      log.info(`Analyzing XLSX file: ${filePath}`);
      
      // Read with minimal options to reduce memory usage
      const workbook = XLSX.readFile(filePath, { 
        cellText: false,
        cellDates: false,
        sheetStubs: false,
        bookSheets: true // Only read sheet names first
      });
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in XLSX file');
      }
      
      // Now read only the first sheet
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet || !worksheet['!ref']) {
        throw new Error('Empty or invalid worksheet');
      }
      
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const totalRows = range.e.r;
      const totalCols = range.e.c + 1;
      
      // Get headers (limit to reasonable number)
      const headers = [];
      const maxCols = Math.min(range.e.c, 100); // Limit to 100 columns
      for (let col = range.s.c; col <= maxCols; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        headers.push(cell ? String(cell.v || '').trim() : '');
      }
      
      // Get sample data (limit rows and columns)
      const sampleRows = [];
      const maxSampleRows = Math.min(5, totalRows);
      for (let row = range.s.r + 1; row <= Math.min(range.s.r + maxSampleRows, range.e.r); row++) {
        const rowData = [];
        for (let col = range.s.c; col <= maxCols; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          rowData.push(cell ? String(cell.v || '') : '');
        }
        sampleRows.push(rowData);
      }
      
      // Clear references to help garbage collection
      delete workbook.Sheets[sheetName];
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        totalRows: totalRows,
        columns: totalCols,
        headers: headers,
        sampleData: sampleRows,
        type: 'XLSX',
        streaming: false,
        analyzed: new Date().toISOString()
      };
    } catch (error) {
      log.error('XLSX analysis error:', error);
      return {
        size: stats.size,
        lastModified: stats.mtime,
        type: 'XLSX',
        error: `Erro na análise: ${error.message}`,
        analyzed: new Date().toISOString()
      };
    }
  }

  updateProgress(event, current, total) {
    const percentage = Math.round((current / total) * 100);
    event.sender.send('progress-update', {
      current: current,
      total: total,
      percentage: percentage
    });
  }
}

module.exports = StreamingProcessor;