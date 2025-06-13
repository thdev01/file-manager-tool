const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const { Transform } = require('stream');
const log = require('electron-log');

class StreamingProcessor {
  constructor() {
    this.currentProgress = 0;
    this.totalProgress = 100;
  }

  async processFiles(event, options) {
    const { filePaths, operation, outputPath, delimiter, splitOptions } = options;
    
    log.info(`Starting streaming processing for ${filePaths.length} files`);
    
    try {
      switch (operation) {
        case 'merge':
          return await this.streamMerge(event, filePaths, outputPath, delimiter);
        case 'convert':
          return await this.streamConvert(event, filePaths, outputPath, delimiter);
        case 'split':
          return await this.streamSplit(event, filePaths, outputPath, delimiter, splitOptions);
        default:
          throw new Error('Operação não suportada');
      }
    } catch (error) {
      log.error('Streaming processing error:', error);
      throw error;
    }
  }

  async streamMerge(event, filePaths, outputPath, delimiter = ',') {
    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(outputPath);
      let isFirstFile = true;
      let processedFiles = 0;
      let headers = [];

      const processNextFile = (index) => {
        if (index >= filePaths.length) {
          outputStream.end();
          resolve({ success: true, message: 'Merge concluído com sucesso!' });
          return;
        }

        const filePath = filePaths[index];
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.csv' || ext === '.txt') {
          this.streamCSVMerge(filePath, outputStream, delimiter, isFirstFile, headers)
            .then((fileHeaders) => {
              if (isFirstFile) {
                headers = fileHeaders;
                isFirstFile = false;
              }
              processedFiles++;
              this.updateProgress(event, processedFiles, filePaths.length);
              processNextFile(index + 1);
            })
            .catch(reject);
        } else if (ext === '.xlsx' || ext === '.xls') {
          this.streamXLSXMerge(filePath, outputStream, isFirstFile, headers)
            .then((fileHeaders) => {
              if (isFirstFile) {
                headers = fileHeaders;
                isFirstFile = false;  
              }
              processedFiles++;
              this.updateProgress(event, processedFiles, filePaths.length);
              processNextFile(index + 1);
            })
            .catch(reject);
        }
      };

      processNextFile(0);
    });
  }

  async streamCSVMerge(filePath, outputStream, delimiter, isFirstFile, existingHeaders) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      let headers = [];
      let isFirstRow = true;

      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        header: false,
        step: (row) => {
          if (isFirstRow) {
            headers = row.data;
            if (isFirstFile) {
              // Write headers for the first file only
              outputStream.write(Papa.unparse([headers]) + '\n');
            }
            isFirstRow = false;
          } else {
            // Write data rows
            outputStream.write(Papa.unparse([row.data]) + '\n');
          }
        },
        complete: () => {
          resolve(headers);
        },
        error: (error) => {
          log.error('CSV parsing error:', error);
          reject(error);
        }
      });

      fileStream.pipe(parseStream);
    });
  }

  async streamXLSXMerge(filePath, outputStream, isFirstFile, existingHeaders) {
    return new Promise((resolve, reject) => {
      try {
        // For XLSX, we need to read the file completely due to format constraints
        // But we can process it in chunks
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to CSV format in chunks
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        const rows = csvData.split('\n');
        
        let headers = [];
        for (let i = 0; i < rows.length; i++) {
          if (i === 0) {
            headers = rows[i].split(',');
            if (isFirstFile) {
              outputStream.write(rows[i] + '\n');
            }
          } else if (rows[i].trim()) {
            outputStream.write(rows[i] + '\n');
          }
        }
        
        resolve(headers);
      } catch (error) {
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
      const data = [];
      const fileStream = fs.createReadStream(inputPath);
      
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: delimiter,
        header: true,
        step: (row) => {
          data.push(row.data);
        },
        complete: () => {
          try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            XLSX.writeFile(workbook, outputPath);
            
            resolve({ inputFile: path.basename(inputPath), outputFile: path.basename(outputPath) });
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });

      fileStream.pipe(parseStream);
    });
  }

  async convertCSVToCSV(inputPath, outputPath, delimiter) {
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputPath);
      const outputStream = fs.createWriteStream(outputPath);
      
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        delimiter: ',', // Assume input is comma-delimited
        step: (row) => {
          outputStream.write(Papa.unparse([row.data], { delimiter }) + '\n');
        },
        complete: () => {
          outputStream.end();
          resolve({ inputFile: path.basename(inputPath), outputFile: path.basename(outputPath) });
        },
        error: reject
      });

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
      
      const fileStream = fs.createReadStream(filePath);
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        header: false,
        step: (row) => {
          if (rowCount === 0) {
            headers = row.data;
          } else if (rowCount <= maxSampleRows) {
            sampleRows.push(row.data);
          }
          rowCount++;
        },
        complete: () => {
          resolve({
            size: stats.size,
            lastModified: stats.mtime,
            totalRows: rowCount - 1, // Exclude header
            columns: headers.length,
            headers: headers,
            sampleData: sampleRows,
            type: 'CSV',
            streaming: true
          });
        },
        error: reject
      });

      fileStream.pipe(parseStream);
    });
  }

  async analyzeXLSXFile(filePath, stats) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const totalRows = range.e.r;
      const totalCols = range.e.c + 1;
      
      // Get headers
      const headers = [];
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        headers.push(cell ? cell.v : '');
      }
      
      // Get sample data
      const sampleRows = [];
      const maxSampleRows = Math.min(5, totalRows);
      for (let row = 1; row <= maxSampleRows; row++) {
        const rowData = [];
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          rowData.push(cell ? cell.v : '');
        }
        sampleRows.push(rowData);
      }
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        totalRows: totalRows,
        columns: totalCols,
        headers: headers,
        sampleData: sampleRows,
        type: 'XLSX',
        streaming: false
      };
    } catch (error) {
      return {
        size: stats.size,
        lastModified: stats.mtime,
        type: 'XLSX',
        error: error.message
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