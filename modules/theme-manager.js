const fs = require('fs-extra');
const path = require('path');
const { nativeTheme } = require('electron');
const log = require('electron-log');
const errorHandler = require('./error-handler');

class ThemeManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.configPath = path.join(__dirname, '..', 'config', 'theme.json');
    this.currentTheme = 'light';
    
    this.initializeTheme();
  }

  async initializeTheme() {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      
      // Load saved theme
      const savedTheme = await this.loadTheme();
      if (savedTheme) {
        this.currentTheme = savedTheme;
      }
      
      // Apply theme
      await this.applyTheme(this.currentTheme);
      
      // Listen for system theme changes
      nativeTheme.on('updated', () => {
        if (this.currentTheme === 'auto') {
          this.applySystemTheme();
        }
      });
      
      log.info(`Theme initialized: ${this.currentTheme}`);
    } catch (error) {
      log.error('Error initializing theme:', error);
    }
  }

  async loadTheme() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const config = await fs.readJson(this.configPath);
        return config.theme || 'light';
      }
    } catch (error) {
      log.error('Error loading theme config:', error);
    }
    return null;
  }

  async saveTheme(theme) {
    try {
      await fs.writeJson(this.configPath, { theme }, { spaces: 2 });
      log.info(`Theme saved: ${theme}`);
    } catch (error) {
      log.error('Error saving theme config:', error);
    }
  }

  async setTheme(theme) {
    try {
      this.currentTheme = theme;
      await this.saveTheme(theme);
      await this.applyTheme(theme);
      
      return { success: true, theme: theme };
    } catch (error) {
      log.error('Error setting theme:', error);
      return { success: false, error: error.message };
    }
  }

  async getTheme() {
    return {
      current: this.currentTheme,
      system: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      available: ['light', 'dark', 'auto']
    };
  }

  async applyTheme(theme) {
    let actualTheme = theme;
    
    if (theme === 'auto') {
      actualTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    }
    
    // Send theme to renderer
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('theme-changed', {
        theme: actualTheme,
        auto: theme === 'auto'
      });
    }
    
    // Apply native theme
    nativeTheme.themeSource = theme;
    
    log.info(`Theme applied: ${actualTheme} (requested: ${theme})`);
  }

  applySystemTheme() {
    const systemTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('theme-changed', {
        theme: systemTheme,
        auto: true
      });
    }
    
    log.info(`System theme applied: ${systemTheme}`);
  }

  getThemeCSS(themeName) {
    const themes = {
      light: {
        '--primary-color': '#6366f1',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8fafc',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b'
      },
      dark: {
        '--primary-color': '#818cf8',
        '--bg-primary': '#1e293b',
        '--bg-secondary': '#0f172a',
        '--text-primary': '#f1f5f9',
        '--text-secondary': '#cbd5e1'
      }
    };
    
    return themes[themeName] || themes.light;
  }
}

module.exports = ThemeManager;