const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Import modular components
const FileProcessor = require('./modules/file-processor');
const ThemeManager = require('./modules/theme-manager');
const UpdateManager = require('./modules/update-manager');
const StreamingProcessor = require('./modules/streaming-processor');

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
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
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

// IPC Handlers
ipcMain.handle('select-files', async () => {
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
  return result;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('save-file', async (event, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'CSV', extensions: ['csv'] },
      { name: 'Excel', extensions: ['xlsx'] },
      { name: 'Texto', extensions: ['txt'] }
    ],
    defaultPath: options.defaultPath || 'output'
  });
  return result;
});

// Enhanced file processing with streaming support
ipcMain.handle('process-files', async (event, options) => {
  try {
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
    return { success: false, message: `Erro: ${error.message}` };
  }
});

// Theme management
ipcMain.handle('set-theme', async (event, theme) => {
  return await themeManager.setTheme(theme);
});

ipcMain.handle('get-theme', async () => {
  return await themeManager.getTheme();
});

// File analysis for large files
ipcMain.handle('analyze-file', async (event, filePath) => {
  try {
    if (streamingProcessor) {
      return await streamingProcessor.analyzeFile(filePath);
    }
    return await fileProcessor.analyzeFile(filePath);
  } catch (error) {
    log.error('Error analyzing file:', error);
    return { error: error.message };
  }
});

// Other existing handlers
ipcMain.handle('detect-delimiter', async (event, filePath) => {
  return await fileProcessor.detectDelimiter(filePath);
});

ipcMain.handle('get-file-stats', async (event, filePath) => {
  return await fileProcessor.getFileStats(filePath);
});

// Update handlers
ipcMain.handle('check-for-updates', async () => {
  if (updateManager) {
    return await updateManager.checkForUpdates();
  }
  return { available: false };
});

ipcMain.handle('download-update', async () => {
  if (updateManager) {
    return await updateManager.downloadUpdate();
  }
  return { success: false };
});

ipcMain.handle('install-update', async () => {
  if (updateManager) {
    return await updateManager.installUpdate();
  }
  return { success: false };
});