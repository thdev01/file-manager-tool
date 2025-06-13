const log = require('electron-log');

/**
 * Standardized Error Handling Module
 * Provides consistent error handling patterns across all modules
 */

class ErrorHandler {
  constructor() {
    this.errorCodes = {
      FILE_NOT_FOUND: 'FILE_NOT_FOUND',
      INVALID_FORMAT: 'INVALID_FORMAT',
      MEMORY_ERROR: 'MEMORY_ERROR',
      PERMISSION_ERROR: 'PERMISSION_ERROR',
      PROCESSING_ERROR: 'PROCESSING_ERROR',
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      NETWORK_ERROR: 'NETWORK_ERROR',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    };

    this.userFriendlyMessages = {
      [this.errorCodes.FILE_NOT_FOUND]: 'Arquivo não encontrado ou inacessível',
      [this.errorCodes.INVALID_FORMAT]: 'Formato de arquivo não suportado ou inválido',
      [this.errorCodes.MEMORY_ERROR]: 'Memória insuficiente para processar o arquivo',
      [this.errorCodes.PERMISSION_ERROR]: 'Permissão negada para acessar o arquivo',
      [this.errorCodes.PROCESSING_ERROR]: 'Erro durante o processamento do arquivo',
      [this.errorCodes.VALIDATION_ERROR]: 'Dados inválidos fornecidos',
      [this.errorCodes.NETWORK_ERROR]: 'Erro de conectividade',
      [this.errorCodes.UNKNOWN_ERROR]: 'Erro interno inesperado'
    };
  }

  /**
   * Create a standardized error object
   * @param {string} code - Error code from this.errorCodes
   * @param {string} message - Technical message for logging
   * @param {Error} originalError - Original error object if available
   * @param {object} context - Additional context information
   * @returns {object} Standardized error object
   */
  createError(code, message, originalError = null, context = {}) {
    const error = {
      code,
      message,
      userMessage: this.userFriendlyMessages[code] || this.userFriendlyMessages[this.errorCodes.UNKNOWN_ERROR],
      timestamp: new Date().toISOString(),
      context,
      originalError: originalError ? {
        message: originalError.message,
        stack: originalError.stack,
        name: originalError.name
      } : null
    };

    // Log the error with appropriate level
    this.logError(error);

    return error;
  }

  /**
   * Handle file system errors with appropriate error codes
   * @param {Error} error - Original file system error
   * @param {string} filePath - File path that caused the error
   * @param {string} operation - Operation being performed
   * @returns {object} Standardized error object
   */
  handleFileSystemError(error, filePath = '', operation = '') {
    const context = { filePath, operation };

    if (error.code === 'ENOENT') {
      return this.createError(
        this.errorCodes.FILE_NOT_FOUND,
        `File not found: ${filePath}`,
        error,
        context
      );
    }

    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return this.createError(
        this.errorCodes.PERMISSION_ERROR,
        `Permission denied: ${filePath}`,
        error,
        context
      );
    }

    if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      return this.createError(
        this.errorCodes.MEMORY_ERROR,
        'Too many files open',
        error,
        context
      );
    }

    return this.createError(
      this.errorCodes.PROCESSING_ERROR,
      `File system error: ${error.message}`,
      error,
      context
    );
  }

  /**
   * Handle parsing errors (CSV, XLSX, etc.)
   * @param {Error} error - Original parsing error
   * @param {string} filePath - File being parsed
   * @param {string} format - File format
   * @returns {object} Standardized error object
   */
  handleParsingError(error, filePath = '', format = '') {
    const context = { filePath, format };

    // Check for memory-related errors
    if (error.message.includes('memory') || error.message.includes('Maximum call stack')) {
      return this.createError(
        this.errorCodes.MEMORY_ERROR,
        `Memory error while parsing ${format} file: ${filePath}`,
        error,
        context
      );
    }

    // Check for format-related errors
    if (error.message.includes('Invalid') || error.message.includes('corrupt')) {
      return this.createError(
        this.errorCodes.INVALID_FORMAT,
        `Invalid ${format} format: ${filePath}`,
        error,
        context
      );
    }

    return this.createError(
      this.errorCodes.PROCESSING_ERROR,
      `Parsing error in ${format} file: ${error.message}`,
      error,
      context
    );
  }

  /**
   * Handle validation errors
   * @param {string} field - Field that failed validation
   * @param {*} value - Value that failed validation
   * @param {string} rule - Validation rule that failed
   * @returns {object} Standardized error object
   */
  handleValidationError(field, value, rule) {
    const context = { field, value, rule };

    return this.createError(
      this.errorCodes.VALIDATION_ERROR,
      `Validation failed for ${field}: ${rule}`,
      null,
      context
    );
  }

  /**
   * Handle network/update errors
   * @param {Error} error - Original network error
   * @param {string} operation - Network operation being performed
   * @returns {object} Standardized error object
   */
  handleNetworkError(error, operation = '') {
    const context = { operation };

    return this.createError(
      this.errorCodes.NETWORK_ERROR,
      `Network error during ${operation}: ${error.message}`,
      error,
      context
    );
  }

  /**
   * Wrap async functions with standardized error handling
   * @param {Function} fn - Async function to wrap
   * @param {object} errorContext - Context for error handling
   * @returns {Function} Wrapped function
   */
  wrapAsync(fn, errorContext = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        // Determine appropriate error handling based on error type
        if (error.code && error.code.startsWith('E')) {
          // File system error
          throw this.handleFileSystemError(error, errorContext.filePath, errorContext.operation);
        }

        // Re-throw if already a standardized error
        if (error.code && this.errorCodes[error.code]) {
          throw error;
        }

        // Default to processing error
        throw this.createError(
          this.errorCodes.PROCESSING_ERROR,
          `Error in ${errorContext.operation || 'operation'}: ${error.message}`,
          error,
          errorContext
        );
      }
    };
  }

  /**
   * Convert standardized error to result object
   * @param {object} error - Standardized error object
   * @returns {object} Result object with success: false
   */
  errorToResult(error) {
    return {
      success: false,
      error: error.code,
      message: error.userMessage,
      details: error.message,
      timestamp: error.timestamp
    };
  }

  /**
   * Log error with appropriate level based on error code
   * @param {object} error - Standardized error object
   */
  logError(error) {
    const logData = {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp
    };

    switch (error.code) {
      case this.errorCodes.VALIDATION_ERROR:
        log.warn('Validation Error:', logData);
        break;
      case this.errorCodes.FILE_NOT_FOUND:
        log.warn('File Not Found:', logData);
        break;
      case this.errorCodes.MEMORY_ERROR:
      case this.errorCodes.PROCESSING_ERROR:
        log.error('Processing Error:', logData);
        break;
      case this.errorCodes.PERMISSION_ERROR:
        log.error('Permission Error:', logData);
        break;
      default:
        log.error('Unknown Error:', logData);
    }

    // Log stack trace for debugging in development
    if (process.env.NODE_ENV === 'development' && error.originalError) {
      log.debug('Original Error Stack:', error.originalError.stack);
    }
  }

  /**
   * Get user-friendly message for error code
   * @param {string} code - Error code
   * @returns {string} User-friendly message
   */
  getUserMessage(code) {
    return this.userFriendlyMessages[code] || this.userFriendlyMessages[this.errorCodes.UNKNOWN_ERROR];
  }

  /**
   * Check if error is recoverable
   * @param {string} code - Error code
   * @returns {boolean} True if error is recoverable
   */
  isRecoverable(code) {
    const recoverableErrors = [
      this.errorCodes.VALIDATION_ERROR,
      this.errorCodes.NETWORK_ERROR
    ];

    return recoverableErrors.includes(code);
  }

  /**
   * Suggest action for error recovery
   * @param {string} code - Error code
   * @returns {string} Suggested action
   */
  getSuggestedAction(code) {
    const suggestions = {
      [this.errorCodes.FILE_NOT_FOUND]: 'Verifique se o arquivo existe e tente novamente',
      [this.errorCodes.INVALID_FORMAT]: 'Verifique se o formato do arquivo está correto',
      [this.errorCodes.MEMORY_ERROR]: 'Tente processar arquivos menores ou feche outros programas',
      [this.errorCodes.PERMISSION_ERROR]: 'Verifique as permissões do arquivo e execute como administrador se necessário',
      [this.errorCodes.PROCESSING_ERROR]: 'Verifique o arquivo e tente novamente',
      [this.errorCodes.VALIDATION_ERROR]: 'Corrija os dados fornecidos e tente novamente',
      [this.errorCodes.NETWORK_ERROR]: 'Verifique sua conexão com a internet e tente novamente'
    };

    return suggestions[code] || 'Tente novamente ou entre em contato com o suporte';
  }
}

// Export singleton instance
module.exports = new ErrorHandler();