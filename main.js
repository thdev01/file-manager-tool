const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Import modular components
const FileProcessor = require('./modules/file-processor');
const ThemeManager = require('./modules/theme-manager');
const UpdateManager = require('./modules/update-manager');
const StreamingProcessor = require('./modules/streaming-processor');
const errorHandler = require('./modules/error-handler');

let mainWindow;
let fileProcessor;
let themeManager;
let updateManager;
let streamingProcessor;

// Configure logging
log.transports.file.level = "info";
log.transports.console.level = "debug";
autoUpdater.logger = log;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'src', 'preload.js'),
      sandbox: false, // Disable sandbox to allow preload script access
      spellcheck: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'File Manager Pro v3.0 - Large File Support',
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'src/ui.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Initialize modules
    initializeModules();
    
    // Check for updates on startup
    setTimeout(() => {
      updateManager.checkForUpdates();
    }, 3000);
  });
  
  // Development tools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function initializeModules() {
  fileProcessor = new FileProcessor();
  themeManager = new ThemeManager(mainWindow);
  updateManager = new UpdateManager(mainWindow);
  streamingProcessor = new StreamingProcessor();
  
  log.info('All modules initialized successfully');
}

app.whenReady().then(() => {
  createWindow();
  
  // Set up auto-updater
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    updateManager = new UpdateManager(mainWindow);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Input validation utilities
function validateString(value, maxLength = 1000) {
  return typeof value === 'string' && value.length <= maxLength && value.trim().length > 0;
}

function validateArray(value, maxItems = 100) {
  return Array.isArray(value) && value.length <= maxItems;
}

function validateFilePath(filePath) {
  if (!validateString(filePath, 500)) return false;
  
  // Basic path traversal protection
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes('..') && 
         !normalizedPath.startsWith('/') && 
         !normalizedPath.match(/^[a-zA-Z]:\\/);
}

// IPC Handlers with validation
ipcMain.handle('select-files', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Arquivos Suportados', extensions: ['csv', 'xlsx', 'xls', 'txt'] },
        { name: 'CSV', extensions: ['csv'] },
        { name: 'Excel', extensions: ['xlsx', 'xls'] },
        { name: 'Texto', extensions: ['txt'] },
        { name: 'Todos', extensions: ['*'] }
      ]
    });
    
    log.info('File selection dialog completed', { fileCount: result.filePaths?.length || 0 });
    return result;
  } catch (error) {
    log.error('Error in select-files handler:', error);
    return { canceled: true, filePaths: [] };
  }
});

ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    log.info('Folder selection dialog completed');
    return result;
  } catch (error) {
    log.error('Error in select-folder handler:', error);
    return { canceled: true, filePaths: [] };
  }
});

ipcMain.handle('save-file', async (event, options = {}) => {
  try {
    // Validate options
    if (options && typeof options !== 'object') {
      log.warn('Invalid options provided to save-file handler');
      options = {};
    }
    
    const defaultPath = validateString(options.defaultPath, 255) ? options.defaultPath : 'output';
    
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'CSV', extensions: ['csv'] },
        { name: 'Excel', extensions: ['xlsx'] },
        { name: 'Texto', extensions: ['txt'] }
      ],
      defaultPath
    });
    
    log.info('Save file dialog completed');
    return result;
  } catch (error) {
    log.error('Error in save-file handler:', error);
    return { canceled: true, filePath: '' };
  }
});

// Enhanced file processing with streaming support and validation
ipcMain.handle('process-files', async (event, options) => {
  try {
    // Comprehensive input validation
    if (!options || typeof options !== 'object') {
      log.error('Invalid options provided to process-files');
      return { success: false, message: 'Parâmetros inválidos fornecidos' };
    }

    // Validate file paths
    if (!validateArray(options.filePaths, 50)) {
      log.error('Invalid filePaths array');
      return { success: false, message: 'Lista de arquivos inválida' };
    }

    // Validate each file path
    for (const filePath of options.filePaths) {
      if (!validateString(filePath, 500)) {
        log.error('Invalid file path detected:', filePath);
        return { success: false, message: 'Caminho de arquivo inválido detectado' };
      }
    }

    // Validate operation type
    const validOperations = ['merge', 'convert', 'split'];
    if (!validOperations.includes(options.operation)) {
      log.error('Invalid operation type:', options.operation);
      return { success: false, message: 'Tipo de operação inválido' };
    }

    // Validate output path
    if (!validateString(options.outputPath, 500)) {
      log.error('Invalid output path:', options.outputPath);
      return { success: false, message: 'Caminho de saída inválido' };
    }

    // Validate delimiter
    if (options.delimiter && (!validateString(options.delimiter, 5) || options.delimiter.length > 3)) {
      log.error('Invalid delimiter:', options.delimiter);
      return { success: false, message: 'Delimitador inválido' };
    }

    const fileSize = await fileProcessor.getTotalFileSize(options.filePaths);
    
    // Use streaming for files > 50MB
    if (fileSize > 50 * 1024 * 1024) {
      log.info(`Large files detected (${fileSize} bytes), using streaming processor`);
      return await streamingProcessor.processFiles(event, options);
    } else {
      log.info(`Regular processing for files (${fileSize} bytes)`);
      return await fileProcessor.processFiles(event, options);
    }
  } catch (error) {
    log.error('Error processing files:', error);
    
    // Handle standardized errors
    if (error.code && errorHandler.errorCodes[error.code]) {
      return errorHandler.errorToResult(error);
    }
    
    // Create standardized error for unknown errors
    const standardError = errorHandler.createError(
      errorHandler.errorCodes.PROCESSING_ERROR,
      `File processing error: ${error.message}`,
      error,
      { operation: options.operation, fileCount: options.filePaths?.length }
    );
    
    return errorHandler.errorToResult(standardError);
  }
});

// Theme management with validation
ipcMain.handle('set-theme', async (event, theme) => {
  try {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(theme)) {
      log.error('Invalid theme provided:', theme);
      return { success: false, message: 'Tema inválido' };
    }
    
    const result = await themeManager.setTheme(theme);
    log.info('Theme updated successfully:', theme);
    return result;
  } catch (error) {
    log.error('Error setting theme:', error);
    return { success: false, message: 'Erro ao alterar tema' };
  }
});

ipcMain.handle('get-theme', async () => {
  try {
    return await themeManager.getTheme();
  } catch (error) {
    log.error('Error getting theme:', error);
    return { current: 'light', available: ['light', 'dark', 'auto'] };
  }
});

// File analysis with validation for large files
ipcMain.handle('analyze-file', async (event, filePath) => {
  try {
    if (!validateString(filePath, 500)) {
      log.error('Invalid file path for analysis:', filePath);
      return { error: 'Caminho de arquivo inválido' };
    }

    if (streamingProcessor) {
      return await streamingProcessor.analyzeFile(filePath);
    }
    return await fileProcessor.analyzeFile(filePath);
  } catch (error) {
    log.error('Error analyzing file:', error);
    return { error: `Erro na análise: ${error.message}` };
  }
});

// Delimiter detection with validation
ipcMain.handle('detect-delimiter', async (event, filePath) => {
  try {
    if (!validateString(filePath, 500)) {
      log.error('Invalid file path for delimiter detection:', filePath);
      return { error: 'Caminho de arquivo inválido' };
    }
    
    return await fileProcessor.detectDelimiter(filePath);
  } catch (error) {
    log.error('Error detecting delimiter:', error);
    return { error: `Erro na detecção: ${error.message}` };
  }
});

// File stats with validation
ipcMain.handle('get-file-stats', async (event, filePath) => {
  try {
    if (!validateString(filePath, 500)) {
      log.error('Invalid file path for stats:', filePath);
      return { error: 'Caminho de arquivo inválido' };
    }
    
    return await fileProcessor.getFileStats(filePath);
  } catch (error) {
    log.error('Error getting file stats:', error);
    return { error: `Erro nas estatísticas: ${error.message}` };
  }
});

// Update handlers with validation and error handling
ipcMain.handle('check-for-updates', async () => {
  try {
    if (updateManager) {
      log.info('Checking for updates...');
      return await updateManager.checkForUpdates();
    }
    log.warn('Update manager not available');
    return { available: false, error: 'Gerenciador de atualizações não disponível' };
  } catch (error) {
    log.error('Error checking for updates:', error);
    return { available: false, error: `Erro na verificação: ${error.message}` };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (updateManager) {
      log.info('Downloading update...');
      return await updateManager.downloadUpdate();
    }
    log.warn('Update manager not available for download');
    return { success: false, error: 'Gerenciador de atualizações não disponível' };
  } catch (error) {
    log.error('Error downloading update:', error);
    return { success: false, error: `Erro no download: ${error.message}` };
  }
});

ipcMain.handle('install-update', async () => {
  try {
    if (updateManager) {
      log.info('Installing update...');
      return await updateManager.installUpdate();
    }
    log.warn('Update manager not available for installation');
    return { success: false, error: 'Gerenciador de atualizações não disponível' };
  } catch (error) {
    log.error('Error installing update:', error);
    return { success: false, error: `Erro na instalação: ${error.message}` };
  }
});