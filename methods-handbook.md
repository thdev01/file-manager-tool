# Methods Handbook - File Manager Pro v3.0

## 📚 System Architecture Overview

### Module Structure
```
FMM2/
├── main.js                    # Electron main process
├── modules/                   # Core business logic
│   ├── file-processor.js     # Standard file operations
│   ├── streaming-processor.js # Large file streaming
│   ├── theme-manager.js      # UI theming system
│   └── update-manager.js     # Auto-update functionality
├── src/                      # Frontend UI
│   ├── ui.html              # Main interface
│   ├── styles.css           # Enhanced CSS framework
│   └── scripts/             # UI interaction logic
└── config/                  # Runtime configuration
```

## 🔧 Core Technologies

### Frontend Stack
- **Electron**: Cross-platform desktop framework
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with custom properties
- **Vanilla JavaScript**: Native ES6+ without frameworks

### Backend Stack
- **Node.js**: Runtime environment
- **Papa Parse**: CSV processing engine
- **XLSX**: Excel file manipulation
- **Electron Updater**: Auto-update system
- **Electron Log**: Structured logging

### Development Tools
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Electron Builder**: Multi-platform packaging
- **Make**: Build automation

## 📋 Module Responsibilities

### Main Process (main.js)

#### Purpose
Central coordinator for application lifecycle and IPC communication.

#### Key Responsibilities
- Window management and initialization
- IPC handler registration
- Module orchestration
- Security configuration

#### Critical Methods
```javascript
// Window creation with security settings
createWindow()

// Module initialization
initializeModules()

// File selection dialog
ipcMain.handle('select-files', async () => {})

// Core processing dispatcher
ipcMain.handle('process-files', async (event, options) => {})
```

#### Security Concerns
- **CRITICAL**: Currently has insecure settings (nodeIntegration: true)
- **TODO**: Implement context isolation and preload scripts

### File Processor (modules/file-processor.js)

#### Purpose
Handles standard file operations for files under 50MB.

#### Key Capabilities
- Multi-format parsing (CSV, XLSX, TXT)
- File merging with header preservation
- Format conversion between supported types
- File splitting by lines or count

#### Core Methods
```javascript
// Main processing dispatcher
async processFiles(event, options)

// File content parsing with format detection
async parseFileContent(filePath, delimiter = null)

// Universal file writing with format conversion
async writeFile(data, outputPath, delimiter = ',')

// Intelligent delimiter detection
detectDelimiterSync(content)

// File analysis and statistics
async analyzeFile(filePath)
```

#### Processing Patterns
```javascript
// Standard processing flow
try {
  validateInputs();
  const data = await parseFileContent(filePath);
  await writeFile(data, outputPath);
  updateProgress(event, current, total);
  return { success: true, message: "Operation completed" };
} catch (error) {
  log.error('Processing error:', error);
  throw error;
}
```

### Streaming Processor (modules/streaming-processor.js)

#### Purpose
Optimized processing for large files (50MB+) using stream-based operations.

#### Key Capabilities
- Memory-efficient streaming for large files
- Chunk-based processing to prevent memory overflow
- Real-time progress tracking
- Support for CSV and XLSX streaming

#### Core Methods
```javascript
// Stream-based file merging
async streamMerge(event, filePaths, outputPath, delimiter)

// Large file analysis without full loading
async analyzeFile(filePath)

// Memory-efficient file splitting
async streamSplit(event, filePaths, outputPath, delimiter, splitOptions)

// Progressive format conversion
async streamConvert(event, filePaths, outputPath, delimiter)
```

#### Memory Management
```javascript
// Streaming pattern to prevent memory issues
const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
  step: (row) => {
    // Process row by row
    processRow(row.data);
  },
  complete: () => {
    // Cleanup and finalize
    finalizeOperation();
  }
});
```

### Theme Manager (modules/theme-manager.js)

#### Purpose
Manages application theming and visual preferences.

#### Key Capabilities
- Light/Dark/Auto theme modes
- System theme synchronization
- Theme persistence across sessions
- Real-time theme switching

#### Core Methods
```javascript
// Theme application and persistence
async setTheme(theme)

// Current theme retrieval
async getTheme()

// System theme change handling
applySystemTheme()

// CSS variable generation
getThemeCSS(themeName)
```

#### Theme Configuration
```javascript
// CSS custom properties for theming
const themes = {
  light: {
    '--primary-color': '#6366f1',
    '--bg-primary': '#ffffff',
    '--text-primary': '#1e293b'
  },
  dark: {
    '--primary-color': '#818cf8',
    '--bg-primary': '#1e293b',
    '--text-primary': '#f1f5f9'
  }
};
```

### Update Manager (modules/update-manager.js)

#### Purpose
Handles automatic application updates via GitHub releases.

#### Key Capabilities
- Automatic update checking
- Background update downloading
- User notification system
- Silent update installation

#### Core Methods
```javascript
// Manual update check
async checkForUpdates()

// Update download initiation
async downloadUpdate()

// Update installation and restart
async installUpdate()

// User notification handling
notifyUpdateAvailable(info)
```

#### Update Flow
```javascript
// Update lifecycle
checkForUpdates() → 
downloadUpdate() → 
notifyUpdateDownloaded() → 
installUpdate() → 
quitAndInstall()
```

## 🎨 UI Architecture

### Component Structure

#### Main Layout
```html
<div class="app-container">
  <aside class="sidebar">          <!-- Navigation and stats -->
  <main class="main-content">      <!-- Primary content area -->
  <div class="status-bar">         <!-- Status and progress -->
</div>
```

#### Tab System
```javascript
// Tab switching logic
function switchTab(tabId) {
  // Update navigation state
  // Switch content visibility
  // Update header information
}
```

#### Modal System
```javascript
// Reusable modal pattern
function showModal(title, content, actions) {
  // Create modal overlay
  // Insert content
  // Handle user interactions
}
```

### Event Handling Patterns

#### File Selection
```javascript
// File selection with validation
selectFilesBtn.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('select-files');
  if (!result.canceled) {
    selectedFiles = result.filePaths;
    await displayFileList();
    enableOperations();
  }
});
```

#### Progress Updates
```javascript
// Real-time progress tracking
ipcRenderer.on('progress-update', (event, data) => {
  updateProgress(data.percentage);
  updateStatus(`Processing ${data.current} of ${data.total}...`);
});
```

## 🔄 Data Flow Patterns

### File Processing Pipeline

#### 1. Input Validation
```javascript
// Validate file paths and parameters
function validateProcessingInputs(options) {
  if (!options.filePaths || options.filePaths.length === 0) {
    throw new Error('No files selected');
  }
  // Additional validation...
}
```

#### 2. Size-Based Processing Decision
```javascript
// Determine processing strategy
const totalSize = await getTotalFileSize(filePaths);
const useStreaming = totalSize > STREAMING_THRESHOLD;

if (useStreaming) {
  return await streamingProcessor.processFiles(event, options);
} else {
  return await fileProcessor.processFiles(event, options);
}
```

#### 3. Format Detection and Parsing
```javascript
// Multi-format file parsing
function parseFileContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.csv':
    case '.txt':
      return parseCSVFile(filePath);
    case '.xlsx':
    case '.xls':
      return parseExcelFile(filePath);
    default:
      throw new Error(`Unsupported format: ${ext}`);
  }
}
```

#### 4. Operation Execution
```javascript
// Operation routing
switch (operation) {
  case 'merge':
    return await mergeFiles(filePaths, outputPath);
  case 'convert':
    return await convertFiles(filePaths, outputPath);
  case 'split':
    return await splitFiles(filePaths, outputPath, splitOptions);
}
```

## ⚙️ Configuration Management

### Runtime Configuration
```javascript
// Configuration file structure
{
  "theme": "dark",
  "streamingThreshold": 52428800,  // 50MB
  "autoUpdates": true,
  "showDetailedStats": true,
  "autoDetectEncoding": true
}
```

### Environment Variables
```javascript
// Development vs Production
if (process.env.NODE_ENV === 'development') {
  // Enable debug features
  mainWindow.webContents.openDevTools();
}
```

## 📊 Performance Optimization

### Memory Management
```javascript
// Large file processing without memory overflow
function processLargeFile(filePath) {
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      // Process chunk immediately
      processChunk(chunk);
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}
```

### Progress Tracking
```javascript
// Consistent progress reporting
function updateProgress(event, current, total, message) {
  const percentage = Math.round((current / total) * 100);
  event.sender.send('progress-update', {
    current,
    total,
    percentage,
    message
  });
}
```

## 🛡️ Error Handling Strategy

### Error Classification
```javascript
// Error types and handling
class ProcessingError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// User-friendly error messages
function getUserFriendlyError(error) {
  const errorMap = {
    'ENOENT': 'Arquivo não encontrado',
    'EACCES': 'Permissão negada',
    'EMFILE': 'Muitos arquivos abertos'
  };
  return errorMap[error.code] || 'Erro inesperado durante o processamento';
}
```

### Graceful Degradation
```javascript
// Fallback mechanisms
async function processWithFallback(filePath) {
  try {
    return await streamingProcessor.process(filePath);
  } catch (streamingError) {
    log.warn('Streaming failed, falling back to standard processing');
    return await fileProcessor.process(filePath);
  }
}
```

## 🔧 Development Utilities

### Logging Pattern
```javascript
// Structured logging
log.info('Operation started', {
  operation: 'merge',
  fileCount: filePaths.length,
  totalSize: totalSize
});

log.error('Operation failed', {
  error: error.message,
  stack: error.stack,
  context: { filePath, operation }
});
```

### Testing Utilities
```javascript
// Mock IPC for testing
const mockEvent = {
  sender: {
    send: (channel, data) => {
      console.log(`IPC: ${channel}`, data);
    }
  }
};
```

## 🚀 Build and Deployment

### Build Configuration
```javascript
// electron-builder.json structure
{
  "appId": "com.filemanager.tool",
  "productName": "File Manager Pro",
  "directories": { "output": "dist" },
  "files": ["main.js", "src/**/*", "modules/**/*"],
  "publish": {
    "provider": "github",
    "owner": "username",
    "repo": "repository"
  }
}
```

### Release Process
```bash
# Automated release workflow
npm run build          # Build all platforms
npm run test           # Run test suite
npm run publish        # Create GitHub release
```

## 📈 Monitoring and Analytics

### Performance Metrics
```javascript
// Performance tracking
const startTime = performance.now();
await processFiles(options);
const endTime = performance.now();
log.info(`Operation completed in ${endTime - startTime}ms`);
```

### User Analytics (Privacy-Compliant)
```javascript
// Anonymous usage statistics
const analytics = {
  operationType: operation,
  fileCount: filePaths.length,
  processingMode: useStreaming ? 'streaming' : 'standard',
  duration: processingTime
};
```

---

## 🔄 Common Patterns

### Async/Await Error Handling
```javascript
async function safeAsyncOperation() {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    log.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
}
```

### IPC Communication
```javascript
// Main process handler
ipcMain.handle('operation-name', async (event, args) => {
  return await performOperation(args);
});

// Renderer process call
const result = await ipcRenderer.invoke('operation-name', args);
```

### Progress Reporting
```javascript
// Consistent progress updates
for (let i = 0; i < items.length; i++) {
  await processItem(items[i]);
  updateProgress(event, i + 1, items.length);
}
```

This handbook serves as the authoritative reference for understanding and extending the File Manager Pro architecture. Keep it updated as new patterns and methods are developed.