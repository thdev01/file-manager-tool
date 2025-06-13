const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const log = require('electron-log');
const errorHandler = require('./error-handler');

class FileProcessor {
  constructor() {
    this.supportedFormats = ['.csv', '.xlsx', '.xls', '.txt'];
  }

  async getTotalFileSize(filePaths) {
    let totalSize = 0;
    const errors = [];
    
    for (const filePath of filePaths) {
      try {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      } catch (error) {
        const standardError = errorHandler.handleFileSystemError(error, filePath, 'getTotalFileSize');
        errors.push(standardError);
        log.warn(`Skipping file due to error: ${filePath}`);
      }
    }
    
    // If we have too many errors, throw
    if (errors.length > 0 && errors.length === filePaths.length) {
      throw errorHandler.createError(
        errorHandler.errorCodes.FILE_NOT_FOUND,
        'No files could be accessed',
        null,
        { errors: errors.length }
      );
    }
    
    return totalSize;
  }

  async processFiles(event, options) {
    const { filePaths, operation, outputPath, delimiter, splitOptions } = options;
    
    log.info(`Processing ${filePaths.length} files with operation: ${operation}`);
    
    try {
      // Validate operation
      const validOperations = ['merge', 'convert', 'split'];
      if (!validOperations.includes(operation)) {
        throw errorHandler.createError(
          errorHandler.errorCodes.VALIDATION_ERROR,
          `Invalid operation: ${operation}`,
          null,
          { operation, validOperations }
        );
      }

      // Validate file paths
      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        throw errorHandler.createError(
          errorHandler.errorCodes.VALIDATION_ERROR,
          'No files provided for processing',
          null,
          { filePaths }
        );
      }

      const wrappedMethod = errorHandler.wrapAsync(
        this[operation === 'merge' ? 'mergeFiles' : operation === 'convert' ? 'convertFiles' : 'splitFiles'].bind(this),
        { operation, fileCount: filePaths.length }
      );

      const result = await wrappedMethod(event, filePaths, outputPath, delimiter, splitOptions);
      
      log.info(`${operation} operation completed successfully`);
      return result;

    } catch (error) {
      // Convert to standardized error if not already
      if (!error.code || !errorHandler.errorCodes[error.code]) {
        const standardError = errorHandler.createError(
          errorHandler.errorCodes.PROCESSING_ERROR,
          `File processing failed: ${error.message}`,
          error,
          { operation, fileCount: filePaths.length }
        );
        return errorHandler.errorToResult(standardError);
      }
      
      return errorHandler.errorToResult(error);
    }
  }

  async mergeFiles(event, filePaths, outputPath, delimiter) {
    let mergedData = [];
    let processedFiles = 0;
    
    for (const filePath of filePaths) {
      try {
        const data = await this.parseFileContent(filePath, delimiter);
        mergedData = mergedData.concat(data);
        
        processedFiles++;
        this.updateProgress(event, processedFiles, filePaths.length);
      } catch (error) {
        log.error(`Error processing file ${filePath}:`, error);
        throw error;
      }
    }
    
    if (mergedData.length > 0) {
      await this.writeFile(mergedData, outputPath, delimiter);
    }
    
    return { 
      success: true, 
      message: `${filePaths.length} arquivos mesclados com sucesso!`,
      totalRows: mergedData.length
    };
  }

  async convertFiles(event, filePaths, outputPath, delimiter) {
    let processedFiles = 0;
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        const data = await this.parseFileContent(filePath, delimiter);
        
        const baseName = path.basename(filePath, path.extname(filePath));
        const outputDir = path.dirname(outputPath);
        const outputExt = path.extname(outputPath);
        const individualOutputPath = path.join(outputDir, `${baseName}_converted${outputExt}`);
        
        await this.writeFile(data, individualOutputPath, delimiter);
        
        results.push({
          input: path.basename(filePath),
          output: path.basename(individualOutputPath),
          rows: data.length
        });
        
        processedFiles++;
        this.updateProgress(event, processedFiles, filePaths.length);
      } catch (error) {
        log.error(`Error converting file ${filePath}:`, error);
        throw error;
      }
    }
    
    return { 
      success: true, 
      message: `${filePaths.length} arquivos convertidos com sucesso!`,
      results: results
    };
  }

  async splitFiles(event, filePaths, outputPath, delimiter, splitOptions) {
    let processedFiles = 0;
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        const data = await this.parseFileContent(filePath, delimiter);
        const baseName = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);
        
        let chunks = [];
        if (splitOptions.type === 'lines') {
          chunks = this.splitDataByLines(data, parseInt(splitOptions.value));
        } else if (splitOptions.type === 'files') {
          chunks = this.splitDataByFiles(data, parseInt(splitOptions.value));
        }
        
        const chunkResults = [];
        for (let i = 0; i < chunks.length; i++) {
          if (chunks[i].length > 0) {
            const chunkPath = path.join(outputPath, 
              `${baseName}_part_${(i + 1).toString().padStart(3, '0')}${ext}`);
            await this.writeFile(chunks[i], chunkPath, delimiter);
            
            chunkResults.push({
              chunk: i + 1,
              path: chunkPath,
              rows: chunks[i].length
            });
          }
        }
        
        results.push({
          file: path.basename(filePath),
          chunks: chunkResults,
          totalChunks: chunks.length
        });
        
        processedFiles++;
        this.updateProgress(event, processedFiles, filePaths.length);
      } catch (error) {
        log.error(`Error splitting file ${filePath}:`, error);
        throw error;
      }
    }
    
    return { 
      success: true, 
      message: `${filePaths.length} arquivos divididos com sucesso!`,
      results: results
    };
  }

  async parseFileContent(filePath, delimiter = null) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      const detectedDelimiter = delimiter || this.detectDelimiterSync(content);
      
      const parsed = Papa.parse(content, {
        header: true,
        delimiter: detectedDelimiter,
        skipEmptyLines: true,
        transformHeader: header => header.trim()
      });
      
      return parsed.data;
    }
  }

  async writeFile(data, outputPath, delimiter = ',') {
    const ext = path.extname(outputPath).toLowerCase();
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (ext === '.xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, outputPath);
    } else {
      const csv = Papa.unparse(data, { delimiter });
      fs.writeFileSync(outputPath, csv, 'utf8');
    }
  }

  splitDataByLines(data, linesPerFile) {
    const chunks = [];
    
    for (let i = 0; i < data.length; i += linesPerFile) {
      chunks.push(data.slice(i, i + linesPerFile));
    }
    
    return chunks;
  }

  splitDataByFiles(data, numberOfFiles) {
    const chunks = [];
    const chunkSize = Math.ceil(data.length / numberOfFiles);
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  detectDelimiterSync(content) {
    const delimiters = [',', ';', '\t', '|', ':'];
    const sampleLines = content.split('\n').slice(0, 5).join('\n');
    
    let bestDelimiter = ',';
    let maxColumns = 0;
    
    delimiters.forEach(delimiter => {
      const parsed = Papa.parse(sampleLines, { delimiter });
      if (parsed.data && parsed.data[0]) {
        const columnCount = parsed.data[0].length;
        if (columnCount > maxColumns) {
          maxColumns = columnCount;
          bestDelimiter = delimiter;
        }
      }
    });
    
    return bestDelimiter;
  }

  async detectDelimiter(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const delimiter = this.detectDelimiterSync(content);
      
      const parsed = Papa.parse(content, {
        header: true,
        delimiter,
        preview: 5
      });
      
      const totalLines = content.split('\n').length - 1;
      
      return {
        delimiter,
        preview: parsed.data,
        fields: parsed.meta.fields || [],
        totalLines
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const data = await this.parseFileContent(filePath);
      
      return {
        size: stats.size,
        totalRows: data.length,
        columns: Object.keys(data[0] || {}).length,
        lastModified: stats.mtime
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async analyzeFile(filePath) {
    return await this.getFileStats(filePath);
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

module.exports = FileProcessor;