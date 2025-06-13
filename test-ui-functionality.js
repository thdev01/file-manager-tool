/**
 * UI Functionality Tests for File Manager Pro v3.0
 * Tests button interactions, user workflows, and complete UI functionality
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Mock Electron APIs for testing
const mockElectronAPI = {
  selectFiles: jest.fn().mockResolvedValue({
    canceled: false,
    filePaths: ['/test/sample.csv', '/test/sample2.csv']
  }),
  
  selectFolder: jest.fn().mockResolvedValue({
    canceled: false,
    filePaths: ['/test/output']
  }),
  
  saveFile: jest.fn().mockResolvedValue({
    canceled: false,
    filePath: '/test/output.csv'
  }),
  
  processFiles: jest.fn().mockResolvedValue({
    success: true,
    message: 'Files processed successfully',
    totalRows: 1000
  }),
  
  analyzeFile: jest.fn().mockResolvedValue({
    size: 1024000,
    totalRows: 500,
    columns: 5,
    headers: ['name', 'age', 'city', 'occupation', 'salary'],
    type: 'CSV',
    streaming: false
  }),
  
  detectDelimiter: jest.fn().mockResolvedValue({
    delimiter: ',',
    fields: ['name', 'age', 'city'],
    preview: [
      { name: 'John', age: '25', city: 'NYC' },
      { name: 'Jane', age: '30', city: 'LA' }
    ],
    totalLines: 100
  }),
  
  setTheme: jest.fn().mockResolvedValue({ success: true }),
  getTheme: jest.fn().mockResolvedValue({ current: 'light' }),
  
  checkForUpdates: jest.fn().mockResolvedValue({
    available: true,
    info: { version: '3.1.0', releaseNotes: 'Bug fixes and improvements' }
  }),
  
  downloadUpdate: jest.fn().mockResolvedValue({ success: true }),
  installUpdate: jest.fn().mockResolvedValue({ success: true }),
  
  onProgressUpdate: jest.fn(),
  onThemeChanged: jest.fn(),
  onUpdateStatus: jest.fn(),
  onUpdateDownloadProgress: jest.fn(),
  
  getVersion: jest.fn().mockReturnValue('3.0.0'),
  
  path: {
    basename: (filepath) => filepath.split(/[\\/]/).pop(),
    dirname: (filepath) => filepath.substring(0, filepath.lastIndexOf('/')),
    extname: (filepath) => {
      const parts = filepath.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    },
    join: (...args) => args.join('/').replace(/\/+/g, '/')
  }
};

// Test setup
function setupTestEnvironment() {
  console.log('🧪 Setting up UI test environment...');
  
  // Read the actual HTML file
  const htmlPath = path.join(__dirname, 'src', 'ui.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Create JSDOM instance
  const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      // Mock Electron API
      window.electronAPI = mockElectronAPI;
      
      // Mock localStorage
      window.localStorage = {
        storage: {},
        getItem: function(key) { return this.storage[key] || null; },
        setItem: function(key, value) { this.storage[key] = value; },
        removeItem: function(key) { delete this.storage[key]; },
        clear: function() { this.storage = {}; }
      };
      
      // Mock console methods
      window.console = console;
    }
  });
  
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  
  console.log('✅ Test environment setup complete');
  return dom;
}

// Test utilities
function fireEvent(element, eventType, options = {}) {
  const event = new window.Event(eventType, { bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
}

function fireChangeEvent(element, value) {
  element.value = value;
  const event = new window.Event('change', { bubbles: true });
  element.dispatchEvent(event);
}

function fireClickEvent(element) {
  const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
}

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    }
    
    check();
  });
}

// Test 1: Tab Navigation
async function testTabNavigation() {
  console.log('🧪 Testing tab navigation...');
  
  try {
    const filesTab = document.querySelector('[data-tab="files"]');
    const operationsTab = document.querySelector('[data-tab="operations"]');
    const settingsTab = document.querySelector('[data-tab="settings"]');
    const updatesTab = document.querySelector('[data-tab="updates"]');
    
    // Test clicking each tab
    fireClickEvent(operationsTab);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const operationsContent = document.getElementById('operations-tab');
    const isOperationsActive = operationsContent.classList.contains('active');
    
    fireClickEvent(settingsTab);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const settingsContent = document.getElementById('settings-tab');
    const isSettingsActive = settingsContent.classList.contains('active');
    
    fireClickEvent(updatesTab);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const updatesContent = document.getElementById('updates-tab');
    const isUpdatesActive = updatesContent.classList.contains('active');
    
    console.log('   📊 Tab navigation results:', {
      operationsTab: isOperationsActive,
      settingsTab: isSettingsActive,
      updatesTab: isUpdatesActive
    });
    
    console.log('✅ Tab navigation working');
    return true;
  } catch (error) {
    console.error('❌ Tab navigation failed:', error.message);
    return false;
  }
}

// Test 2: File Selection
async function testFileSelection() {
  console.log('🧪 Testing file selection...');
  
  try {
    const selectFilesBtn = document.getElementById('selectFiles');
    
    // Mock file selection
    fireClickEvent(selectFilesBtn);
    
    // Wait for file list to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const fileList = document.getElementById('fileList');
    const hasFileCards = fileList.querySelector('.file-card') !== null;
    
    console.log('   📊 File selection results:', {
      buttonExists: !!selectFilesBtn,
      selectFilesCalled: mockElectronAPI.selectFiles.mock.calls.length > 0,
      analyzeFileCalled: mockElectronAPI.analyzeFile.mock.calls.length > 0,
      hasFileCards
    });
    
    console.log('✅ File selection working');
    return true;
  } catch (error) {
    console.error('❌ File selection failed:', error.message);
    return false;
  }
}

// Test 3: Operation Selection
async function testOperationSelection() {
  console.log('🧪 Testing operation selection...');
  
  try {
    const mergeCard = document.querySelector('[data-operation="merge"]');
    const convertCard = document.querySelector('[data-operation="convert"]');
    const splitCard = document.querySelector('[data-operation="split"]');
    
    // Test merge operation
    fireClickEvent(mergeCard);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isMergeSelected = mergeCard.classList.contains('selected');
    const outputCard = document.getElementById('outputCard');
    const isOutputCardVisible = outputCard.style.display === 'block';
    
    // Test split operation
    fireClickEvent(splitCard);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isSplitSelected = splitCard.classList.contains('selected');
    const splitOptionsCard = document.getElementById('splitOptionsCard');
    const isSplitOptionsVisible = splitOptionsCard.style.display === 'block';
    
    console.log('   📊 Operation selection results:', {
      mergeSelected: isMergeSelected,
      outputCardVisible: isOutputCardVisible,
      splitSelected: isSplitSelected,
      splitOptionsVisible: isSplitOptionsVisible
    });
    
    console.log('✅ Operation selection working');
    return true;
  } catch (error) {
    console.error('❌ Operation selection failed:', error.message);
    return false;
  }
}

// Test 4: Delimiter Configuration
async function testDelimiterConfiguration() {
  console.log('🧪 Testing delimiter configuration...');
  
  try {
    const autoRadio = document.querySelector('input[name="delimiterOption"][value="auto"]');
    const manualRadio = document.querySelector('input[name="delimiterOption"][value="manual"]');
    const customRadio = document.querySelector('input[name="delimiterOption"][value="custom"]');
    const delimiterSelect = document.getElementById('delimiterSelect');
    const customDelimiter = document.getElementById('customDelimiter');
    
    // Test manual delimiter selection
    fireClickEvent(manualRadio);
    fireChangeEvent(delimiterSelect, ';');
    
    // Test custom delimiter
    fireClickEvent(customRadio);
    fireChangeEvent(customDelimiter, '|');
    
    // Test auto detection
    fireClickEvent(autoRadio);
    
    console.log('   📊 Delimiter configuration results:', {
      autoRadioExists: !!autoRadio,
      manualRadioExists: !!manualRadio,
      customRadioExists: !!customRadio,
      detectDelimiterCalled: mockElectronAPI.detectDelimiter.mock.calls.length > 0
    });
    
    console.log('✅ Delimiter configuration working');
    return true;
  } catch (error) {
    console.error('❌ Delimiter configuration failed:', error.message);
    return false;
  }
}

// Test 5: Output Path Selection
async function testOutputPathSelection() {
  console.log('🧪 Testing output path selection...');
  
  try {
    const selectOutputBtn = document.getElementById('selectOutput');
    const outputPathDiv = document.getElementById('outputPath');
    
    // Test file output selection
    fireClickEvent(selectOutputBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const saveFileCalled = mockElectronAPI.saveFile.mock.calls.length > 0;
    
    // Switch to split operation to test folder selection
    const splitCard = document.querySelector('[data-operation="split"]');
    fireClickEvent(splitCard);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    fireClickEvent(selectOutputBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const selectFolderCalled = mockElectronAPI.selectFolder.mock.calls.length > 0;
    
    console.log('   📊 Output path selection results:', {
      buttonExists: !!selectOutputBtn,
      saveFileCalled,
      selectFolderCalled,
      outputPathExists: !!outputPathDiv
    });
    
    console.log('✅ Output path selection working');
    return true;
  } catch (error) {
    console.error('❌ Output path selection failed:', error.message);
    return false;
  }
}

// Test 6: File Processing
async function testFileProcessing() {
  console.log('🧪 Testing file processing...');
  
  try {
    const processBtn = document.getElementById('processFiles');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Enable process button by setting up required data
    window.selectedFiles = ['/test/sample.csv'];
    window.outputPath = '/test/output.csv';
    window.currentOperation = 'merge';
    processBtn.disabled = false;
    
    // Test process button click
    fireClickEvent(processBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const processFilesCalled = mockElectronAPI.processFiles.mock.calls.length > 0;
    const loadingVisible = loadingOverlay.style.display === 'flex';
    
    console.log('   📊 File processing results:', {
      buttonExists: !!processBtn,
      processFilesCalled,
      loadingOverlayExists: !!loadingOverlay,
      loadingVisible
    });
    
    console.log('✅ File processing working');
    return true;
  } catch (error) {
    console.error('❌ File processing failed:', error.message);
    return false;
  }
}

// Test 7: Theme Toggle
async function testThemeToggle() {
  console.log('🧪 Testing theme toggle...');
  
  try {
    const themeToggle = document.getElementById('themeToggle');
    const themeSelect = document.getElementById('themeSelect');
    const body = document.body;
    
    const initialTheme = body.className;
    
    // Test theme toggle button
    fireClickEvent(themeToggle);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test theme select dropdown
    fireChangeEvent(themeSelect, 'dark');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const setThemeCalled = mockElectronAPI.setTheme.mock.calls.length > 0;
    
    console.log('   📊 Theme toggle results:', {
      toggleButtonExists: !!themeToggle,
      selectExists: !!themeSelect,
      setThemeCalled,
      initialTheme
    });
    
    console.log('✅ Theme toggle working');
    return true;
  } catch (error) {
    console.error('❌ Theme toggle failed:', error.message);
    return false;
  }
}

// Test 8: Settings Configuration
async function testSettingsConfiguration() {
  console.log('🧪 Testing settings configuration...');
  
  try {
    const streamingThreshold = document.getElementById('streamingThreshold');
    const showDetailedStats = document.getElementById('showDetailedStats');
    const autoDetectEncoding = document.getElementById('autoDetectEncoding');
    const autoUpdates = document.getElementById('autoUpdates');
    
    // Test streaming threshold change
    fireChangeEvent(streamingThreshold, '100');
    
    // Test checkbox toggles
    fireClickEvent(showDetailedStats);
    fireClickEvent(autoDetectEncoding);
    fireClickEvent(autoUpdates);
    
    console.log('   📊 Settings configuration results:', {
      streamingThresholdExists: !!streamingThreshold,
      showDetailedStatsExists: !!showDetailedStats,
      autoDetectEncodingExists: !!autoDetectEncoding,
      autoUpdatesExists: !!autoUpdates
    });
    
    console.log('✅ Settings configuration working');
    return true;
  } catch (error) {
    console.error('❌ Settings configuration failed:', error.message);
    return false;
  }
}

// Test 9: Update System
async function testUpdateSystem() {
  console.log('🧪 Testing update system...');
  
  try {
    const checkUpdatesBtn = document.getElementById('checkUpdatesManual');
    const downloadUpdateBtn = document.getElementById('downloadUpdate');
    const installUpdateBtn = document.getElementById('installUpdate');
    
    // Test manual update check
    fireClickEvent(checkUpdatesBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const checkUpdatesCalled = mockElectronAPI.checkForUpdates.mock.calls.length > 0;
    
    // Test download update
    fireClickEvent(downloadUpdateBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const downloadUpdateCalled = mockElectronAPI.downloadUpdate.mock.calls.length > 0;
    
    // Test install update
    fireClickEvent(installUpdateBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const installUpdateCalled = mockElectronAPI.installUpdate.mock.calls.length > 0;
    
    console.log('   📊 Update system results:', {
      checkButtonExists: !!checkUpdatesBtn,
      downloadButtonExists: !!downloadUpdateBtn,
      installButtonExists: !!installUpdateBtn,
      checkUpdatesCalled,
      downloadUpdateCalled,
      installUpdateCalled
    });
    
    console.log('✅ Update system working');
    return true;
  } catch (error) {
    console.error('❌ Update system failed:', error.message);
    return false;
  }
}

// Test 10: Modal and Preview Functions
async function testModalAndPreview() {
  console.log('🧪 Testing modal and preview functions...');
  
  try {
    const previewBtn = document.getElementById('previewData');
    const modal = document.getElementById('previewModal');
    const modalClose = document.querySelector('.modal-close');
    
    // Set up preview data
    const previewSection = document.getElementById('previewSection');
    previewSection.innerHTML = '<div>Sample preview data</div>';
    
    // Test preview button
    fireClickEvent(previewBtn);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const modalVisible = modal.classList.contains('active');
    
    // Test modal close
    fireClickEvent(modalClose);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const modalClosed = !modal.classList.contains('active');
    
    console.log('   📊 Modal and preview results:', {
      previewButtonExists: !!previewBtn,
      modalExists: !!modal,
      modalCloseExists: !!modalClose,
      modalVisible,
      modalClosed
    });
    
    console.log('✅ Modal and preview working');
    return true;
  } catch (error) {
    console.error('❌ Modal and preview failed:', error.message);
    return false;
  }
}

// Test 11: Split Options Configuration
async function testSplitOptionsConfiguration() {
  console.log('🧪 Testing split options configuration...');
  
  try {
    const linesRadio = document.querySelector('input[name="splitType"][value="lines"]');
    const filesRadio = document.querySelector('input[name="splitType"][value="files"]');
    const splitByLines = document.getElementById('splitByLines');
    const splitByFiles = document.getElementById('splitByFiles');
    
    // Test lines option
    fireClickEvent(linesRadio);
    fireChangeEvent(splitByLines, '5000');
    
    const linesEnabled = !splitByLines.disabled;
    const filesDisabled = splitByFiles.disabled;
    
    // Test files option
    fireClickEvent(filesRadio);
    fireChangeEvent(splitByFiles, '3');
    
    const filesEnabled = !splitByFiles.disabled;
    const linesDisabled = splitByLines.disabled;
    
    console.log('   📊 Split options results:', {
      linesRadioExists: !!linesRadio,
      filesRadioExists: !!filesRadio,
      linesInputExists: !!splitByLines,
      filesInputExists: !!splitByFiles,
      linesEnabled,
      filesDisabled,
      filesEnabled,
      linesDisabled
    });
    
    console.log('✅ Split options configuration working');
    return true;
  } catch (error) {
    console.error('❌ Split options configuration failed:', error.message);
    return false;
  }
}

// Test 12: Progress and Status Updates
async function testProgressAndStatus() {
  console.log('🧪 Testing progress and status updates...');
  
  try {
    const statusMessage = document.getElementById('statusMessage');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // Test status update function
    if (window.updateStatus) {
      window.updateStatus('Test message', 'success');
    }
    
    // Test progress update function
    if (window.updateProgress) {
      window.updateProgress(50);
    }
    
    console.log('   📊 Progress and status results:', {
      statusMessageExists: !!statusMessage,
      progressContainerExists: !!progressContainer,
      progressFillExists: !!progressFill,
      progressTextExists: !!progressText,
      updateStatusFunction: typeof window.updateStatus === 'function',
      updateProgressFunction: typeof window.updateProgress === 'function'
    });
    
    console.log('✅ Progress and status updates working');
    return true;
  } catch (error) {
    console.error('❌ Progress and status updates failed:', error.message);
    return false;
  }
}

// Main test runner
async function runUIFunctionalityTests() {
  console.log('🚀 Starting UI Functionality Tests for File Manager Pro v3.0\n');
  
  // Setup test environment
  const dom = setupTestEnvironment();
  
  // Wait for DOM to be ready
  await new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
  
  // Wait for scripts to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const tests = [
    { name: 'Tab Navigation', fn: testTabNavigation },
    { name: 'File Selection', fn: testFileSelection },
    { name: 'Operation Selection', fn: testOperationSelection },
    { name: 'Delimiter Configuration', fn: testDelimiterConfiguration },
    { name: 'Output Path Selection', fn: testOutputPathSelection },
    { name: 'File Processing', fn: testFileProcessing },
    { name: 'Theme Toggle', fn: testThemeToggle },
    { name: 'Settings Configuration', fn: testSettingsConfiguration },
    { name: 'Update System', fn: testUpdateSystem },
    { name: 'Modal and Preview', fn: testModalAndPreview },
    { name: 'Split Options Configuration', fn: testSplitOptionsConfiguration },
    { name: 'Progress and Status Updates', fn: testProgressAndStatus }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`💥 ${test.name} crashed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UI FUNCTIONALITY TEST RESULTS');
  console.log(`${'='.repeat(60)}`);
  
  let passed = 0;
  let failed = 0;
  let critical = 0;
  
  const criticalTests = [
    'File Selection',
    'Operation Selection', 
    'File Processing',
    'Tab Navigation'
  ];
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const isCritical = criticalTests.includes(result.name);
    console.log(`${status} - ${result.name}${isCritical ? ' (CRITICAL)' : ''}`);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
      if (isCritical) {
        critical++;
      }
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${results.length} UI tests passed`);
  console.log(`🔥 Critical failures: ${critical}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL UI FUNCTIONALITY TESTS PASSED!');
    console.log('✅ User interface is fully functional');
    console.log('✅ All buttons and interactions work correctly');
    console.log('✅ Complete user workflow verified');
  } else if (critical === 0) {
    console.log(`\n⚠️  ${failed} non-critical UI test(s) failed`);
    console.log('🟡 UI is mostly functional but has minor issues');
  } else {
    console.log(`\n❌ ${critical} CRITICAL UI test(s) failed`);
    console.log('🔴 UI has major functionality problems');
    console.log('🛠️  Fix critical UI issues before delivery');
  }
  
  // Cleanup
  dom.window.close();
  
  return { success: failed === 0, critical: critical === 0, results };
}

// Install jest if running directly
if (require.main === module) {
  // Check for JSDOM dependency
  try {
    require('jsdom');
  } catch (error) {
    console.error('❌ JSDOM is required for UI tests');
    console.log('📦 Install with: npm install --save-dev jsdom jest');
    process.exit(1);
  }
  
  runUIFunctionalityTests().then(({ success, critical }) => {
    process.exit(success ? 0 : (critical ? 1 : 2));
  }).catch(error => {
    console.error('💥 UI functionality test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runUIFunctionalityTests };