const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  
  // File processing
  processFiles: (options) => ipcRenderer.invoke('process-files', options),
  analyzeFile: (filePath) => ipcRenderer.invoke('analyze-file', filePath),
  detectDelimiter: (filePath) => ipcRenderer.invoke('detect-delimiter', filePath),
  getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
  
  // Theme management
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // Update management
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // Event listeners for renderer
  onProgressUpdate: (callback) => {
    ipcRenderer.on('progress-update', (event, data) => callback(data));
  },
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (event, data) => callback(data));
  },
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, message) => callback(message));
  },
  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, data) => callback(data));
  },
  
  // Remove listeners (cleanup)
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // Utility functions (safer implementation)
  getVersion: () => {
    try {
      const packageJson = require('../package.json');
      return packageJson.version || '3.0.0';
    } catch (error) {
      console.warn('Could not read package.json version');
      return '3.0.0';
    }
  },
  
  // Node.js path utilities (safer implementations)
  path: {
    basename: (filepath) => {
      try {
        return require('path').basename(filepath);
      } catch (error) {
        return filepath.split(/[\\/]/).pop();
      }
    },
    dirname: (filepath) => {
      try {
        return require('path').dirname(filepath);
      } catch (error) {
        return filepath.substring(0, filepath.lastIndexOf('/'));
      }
    },
    extname: (filepath) => {
      try {
        return require('path').extname(filepath);
      } catch (error) {
        const parts = filepath.split('.');
        return parts.length > 1 ? '.' + parts.pop() : '';
      }
    },
    join: (...args) => {
      try {
        return require('path').join(...args);
      } catch (error) {
        return args.join('/').replace(/\/+/g, '/');
      }
    }
  }
});

// Security: Remove the require function from the global scope
delete window.require;
delete window.exports;
delete window.module;