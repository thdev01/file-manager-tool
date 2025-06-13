const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');
const path = require('path');

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateAvailable = false;
    this.updateDownloaded = false;
    this.updateInfo = null;
    
    this.initializeUpdater();
  }

  initializeUpdater() {
    // Configure auto-updater
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
    
    // Check for updates every 10 minutes
    autoUpdater.checkForUpdatesAndNotify();
    
    // Set up update interval
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 10 * 60 * 1000); // 10 minutes

    // Event listeners
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.sendStatusToWindow('Verificando atualizações...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.updateAvailable = true;
      this.updateInfo = info;
      this.sendStatusToWindow('Atualização disponível');
      this.notifyUpdateAvailable(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
      this.updateAvailable = false;
      this.sendStatusToWindow('Aplicativo está atualizado');
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err);
      this.sendStatusToWindow('Erro ao verificar atualizações');
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      log.info(logMessage);
      
      this.sendStatusToWindow(`Baixando atualização: ${Math.round(progressObj.percent)}%`);
      this.sendDownloadProgress(progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.updateDownloaded = true;
      this.sendStatusToWindow('Atualização baixada');
      this.notifyUpdateDownloaded(info);
    });

    log.info('Auto-updater initialized');
  }

  async checkForUpdates() {
    try {
      log.info('Manual update check initiated');
      const result = await autoUpdater.checkForUpdates();
      
      return {
        available: this.updateAvailable,
        info: this.updateInfo,
        result: result
      };
    } catch (error) {
      log.error('Error checking for updates:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }

  async downloadUpdate() {
    try {
      if (!this.updateAvailable) {
        return { success: false, message: 'Nenhuma atualização disponível' };
      }

      log.info('Starting update download');
      await autoUpdater.downloadUpdate();
      
      return { success: true, message: 'Download iniciado' };
    } catch (error) {
      log.error('Error downloading update:', error);
      return { success: false, message: error.message };
    }
  }

  async installUpdate() {
    try {
      if (!this.updateDownloaded) {
        return { success: false, message: 'Atualização não foi baixada' };
      }

      log.info('Installing update and restarting');
      autoUpdater.quitAndInstall();
      
      return { success: true, message: 'Instalando atualização...' };
    } catch (error) {
      log.error('Error installing update:', error);
      return { success: false, message: error.message };
    }
  }

  notifyUpdateAvailable(info) {
    const options = {
      type: 'info',
      title: 'Atualização Disponível',
      message: `Uma nova versão (${info.version}) está disponível!`,
      detail: 'Deseja baixar a atualização agora?',
      buttons: ['Baixar Agora', 'Lembrar Mais Tarde', 'Pular Esta Versão'],
      defaultId: 0,
      cancelId: 1
    };

    dialog.showMessageBox(this.mainWindow, options).then((result) => {
      if (result.response === 0) {
        // Download now
        this.downloadUpdate();
      } else if (result.response === 2) {
        // Skip this version
        log.info(`User skipped version ${info.version}`);
      }
    });
  }

  notifyUpdateDownloaded(info) {
    const options = {
      type: 'info',
      title: 'Atualização Pronta',
      message: `Versão ${info.version} foi baixada com sucesso!`,
      detail: 'A atualização será instalada quando você reiniciar o aplicativo. Deseja reiniciar agora?',
      buttons: ['Reiniciar Agora', 'Reiniciar Mais Tarde'],
      defaultId: 0,
      cancelId: 1
    };

    dialog.showMessageBox(this.mainWindow, options).then((result) => {
      if (result.response === 0) {
        // Restart now
        this.installUpdate();
      }
    });
  }

  sendStatusToWindow(text) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('update-status', text);
    }
  }

  sendDownloadProgress(progressObj) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('update-download-progress', {
        percent: Math.round(progressObj.percent),
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      });
    }
  }

  getUpdateStatus() {
    return {
      available: this.updateAvailable,
      downloaded: this.updateDownloaded,
      info: this.updateInfo,
      checking: false
    };
  }
}

module.exports = UpdateManager;