/**
 * Application Testing Script
 * Tests basic functionality and module loading
 */

const fs = require('fs');
const path = require('path');

// Test module imports
function testModuleImports() {
  console.log('🧪 Testing module imports...');
  
  try {
    const FileProcessor = require('./modules/file-processor');
    const StreamingProcessor = require('./modules/streaming-processor');
    const errorHandler = require('./modules/error-handler');
    
    // Test Electron-dependent modules only if in Electron context
    let electronModulesLoaded = 0;
    
    try {
      const ThemeManager = require('./modules/theme-manager');
      electronModulesLoaded++;
    } catch (error) {
      console.log('   ⚠️  ThemeManager requires Electron context (normal in tests)');
    }
    
    try {
      const UpdateManager = require('./modules/update-manager');
      electronModulesLoaded++;
    } catch (error) {
      console.log('   ⚠️  UpdateManager requires Electron context (normal in tests)');
    }
    
    console.log('✅ Core modules imported successfully');
    console.log(`   - Electron modules loaded: ${electronModulesLoaded}/2`);
    return true;
  } catch (error) {
    console.error('❌ Module import failed:', error.message);
    return false;
  }
}

// Test module instantiation
function testModuleInstantiation() {
  console.log('🧪 Testing module instantiation...');
  
  try {
    const FileProcessor = require('./modules/file-processor');
    const StreamingProcessor = require('./modules/streaming-processor');
    const errorHandler = require('./modules/error-handler');
    
    const fileProcessor = new FileProcessor();
    const streamingProcessor = new StreamingProcessor();
    
    console.log('✅ Modules instantiated successfully');
    console.log(`   - FileProcessor supports: ${fileProcessor.supportedFormats.join(', ')}`);
    console.log(`   - StreamingProcessor has ${streamingProcessor.activeStreams.size} active streams`);
    console.log(`   - ErrorHandler has ${Object.keys(errorHandler.errorCodes).length} error codes`);
    
    return true;
  } catch (error) {
    console.error('❌ Module instantiation failed:', error.message);
    return false;
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('🧪 Testing error handling...');
  
  try {
    const errorHandler = require('./modules/error-handler');
    
    // Test error creation
    const testError = errorHandler.createError(
      errorHandler.errorCodes.VALIDATION_ERROR,
      'Test validation error',
      null,
      { field: 'test' }
    );
    
    console.log('✅ Error handling working correctly');
    console.log(`   - Error code: ${testError.code}`);
    console.log(`   - User message: ${testError.userMessage}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

// Test file operations (with mock data)
async function testFileOperations() {
  console.log('🧪 Testing file operations...');
  
  try {
    const FileProcessor = require('./modules/file-processor');
    const fileProcessor = new FileProcessor();
    
    // Test delimiter detection
    const testContent = 'name,age,city\nJohn,25,NYC\nJane,30,LA';
    const delimiter = fileProcessor.detectDelimiterSync(testContent);
    
    console.log('✅ File operations working correctly');
    console.log(`   - Detected delimiter: "${delimiter}"`);
    
    return true;
  } catch (error) {
    console.error('❌ File operations test failed:', error.message);
    return false;
  }
}

// Test CSS files exist
function testCSSFiles() {
  console.log('🧪 Testing CSS files...');
  
  try {
    const cssPath = path.join(__dirname, 'src', 'styles.css');
    const newCSSPath = path.join(__dirname, 'src', 'css', 'main.css');
    
    const originalExists = fs.existsSync(cssPath);
    const newExists = fs.existsSync(newCSSPath);
    
    console.log('✅ CSS files status:');
    console.log(`   - Original styles.css: ${originalExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`   - New modular CSS: ${newExists ? 'EXISTS' : 'MISSING'}`);
    
    return originalExists;
  } catch (error) {
    console.error('❌ CSS file test failed:', error.message);
    return false;
  }
}

// Test HTML file
function testHTMLFile() {
  console.log('🧪 Testing HTML file...');
  
  try {
    const htmlPath = path.join(__dirname, 'src', 'ui.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for key elements
    const hasElectronAPI = htmlContent.includes('electronAPI');
    const hasStylesheet = htmlContent.includes('stylesheet');
    const hasInterFont = htmlContent.includes('Inter');
    
    console.log('✅ HTML file analysis:');
    console.log(`   - Contains electronAPI: ${hasElectronAPI}`);
    console.log(`   - Has stylesheet link: ${hasStylesheet}`);
    console.log(`   - Uses Inter font: ${hasInterFont}`);
    
    return hasElectronAPI && hasStylesheet;
  } catch (error) {
    console.error('❌ HTML file test failed:', error.message);
    return false;
  }
}

// Test preload script
function testPreloadScript() {
  console.log('🧪 Testing preload script...');
  
  try {
    const preloadPath = path.join(__dirname, 'src', 'preload.js');
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    
    // Check for key elements
    const hasContextBridge = preloadContent.includes('contextBridge');
    const hasElectronAPI = preloadContent.includes('electronAPI');
    const hasSecurityCleanup = preloadContent.includes('delete window.require');
    
    console.log('✅ Preload script analysis:');
    console.log(`   - Uses contextBridge: ${hasContextBridge}`);
    console.log(`   - Exposes electronAPI: ${hasElectronAPI}`);
    console.log(`   - Has security cleanup: ${hasSecurityCleanup}`);
    
    return hasContextBridge && hasElectronAPI && hasSecurityCleanup;
  } catch (error) {
    console.error('❌ Preload script test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting File Manager Pro v3.0 Tests\n');
  
  const tests = [
    { name: 'Module Imports', fn: testModuleImports },
    { name: 'Module Instantiation', fn: testModuleInstantiation },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'File Operations', fn: testFileOperations },
    { name: 'CSS Files', fn: testCSSFiles },
    { name: 'HTML File', fn: testHTMLFile },
    { name: 'Preload Script', fn: testPreloadScript }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(50)}`);
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${results.length} tests passed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Application is ready for use.');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review issues above.`);
  }
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };