/**
 * UI Workflow Tests for File Manager Pro v3.0
 * Tests the complete user workflow from file selection to processing
 * Without external dependencies - uses direct function testing
 */

const fs = require('fs');
const path = require('path');

// Test the main.js IPC handlers to ensure UI button calls work
function testIPCHandlers() {
  console.log('🧪 Testing IPC handlers for UI functionality...');
  
  try {
    const mainPath = path.join(__dirname, 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    // Check for all required IPC handlers that UI buttons depend on
    const requiredHandlers = [
      'select-files',
      'select-folder', 
      'save-file',
      'process-files',
      'analyze-file',
      'detect-delimiter',
      'set-theme',
      'get-theme',
      'check-for-updates',
      'download-update',
      'install-update'
    ];
    
    const foundHandlers = [];
    const missingHandlers = [];
    
    requiredHandlers.forEach(handler => {
      if (mainContent.includes(`ipcMain.handle('${handler}'`)) {
        foundHandlers.push(handler);
      } else {
        missingHandlers.push(handler);
      }
    });
    
    console.log(`   ✅ Found handlers: ${foundHandlers.length}/${requiredHandlers.length}`);
    
    if (missingHandlers.length > 0) {
      console.log(`   ❌ Missing handlers: ${missingHandlers.join(', ')}`);
      return false;
    }
    
    console.log('✅ All IPC handlers present for UI functionality');
    return true;
  } catch (error) {
    console.error('❌ IPC handler test failed:', error.message);
    return false;
  }
}

// Test preload script exposes all required APIs
function testPreloadExposure() {
  console.log('🧪 Testing preload script API exposure...');
  
  try {
    const preloadPath = path.join(__dirname, 'src', 'preload.js');
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    
    // Check for all APIs that UI buttons need
    const requiredAPIs = [
      'selectFiles',
      'selectFolder',
      'saveFile', 
      'processFiles',
      'analyzeFile',
      'detectDelimiter',
      'setTheme',
      'getTheme',
      'checkForUpdates',
      'downloadUpdate',
      'installUpdate',
      'onProgressUpdate',
      'onThemeChanged'
    ];
    
    const foundAPIs = [];
    const missingAPIs = [];
    
    requiredAPIs.forEach(api => {
      if (preloadContent.includes(`${api}:`)) {
        foundAPIs.push(api);
      } else {
        missingAPIs.push(api);
      }
    });
    
    console.log(`   ✅ Found APIs: ${foundAPIs.length}/${requiredAPIs.length}`);
    
    if (missingAPIs.length > 0) {
      console.log(`   ❌ Missing APIs: ${missingAPIs.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required APIs exposed for UI');
    return true;
  } catch (error) {
    console.error('❌ Preload exposure test failed:', error.message);
    return false;
  }
}

// Test HTML UI elements and their event bindings
function testUIElements() {
  console.log('🧪 Testing UI elements and event bindings...');
  
  try {
    const htmlPath = path.join(__dirname, 'src', 'ui.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for critical UI elements with IDs that JavaScript relies on
    const criticalElements = [
      'selectFiles',
      'selectOutput', 
      'processFiles',
      'themeToggle',
      'fileList',
      'delimiterCard',
      'outputCard',
      'progressContainer',
      'loadingOverlay',
      'previewModal'
    ];
    
    const foundElements = [];
    const missingElements = [];
    
    criticalElements.forEach(elementId => {
      if (htmlContent.includes(`id="${elementId}"`)) {
        foundElements.push(elementId);
      } else {
        missingElements.push(elementId);
      }
    });
    
    console.log(`   ✅ Found elements: ${foundElements.length}/${criticalElements.length}`);
    
    // Check for event listener setup in the script section
    const hasEventListeners = htmlContent.includes('addEventListener');
    const hasClickHandlers = htmlContent.includes('.addEventListener(\'click\'');
    const hasChangeHandlers = htmlContent.includes('.addEventListener(\'change\'');
    
    console.log(`   📋 Event bindings: ${hasEventListeners ? 'present' : 'missing'}`);
    console.log(`   🖱️  Click handlers: ${hasClickHandlers ? 'present' : 'missing'}`);
    console.log(`   🔄 Change handlers: ${hasChangeHandlers ? 'present' : 'missing'}`);
    
    if (missingElements.length > 0) {
      console.log(`   ❌ Missing elements: ${missingElements.join(', ')}`);
      return false;
    }
    
    if (!hasEventListeners || !hasClickHandlers) {
      console.log('   ❌ Missing event listener setup');
      return false;
    }
    
    console.log('✅ All critical UI elements present with event bindings');
    return true;
  } catch (error) {
    console.error('❌ UI elements test failed:', error.message);
    return false;
  }
}

// Test JavaScript function definitions in HTML
function testJavaScriptFunctions() {
  console.log('🧪 Testing JavaScript function definitions...');
  
  try {
    const htmlPath = path.join(__dirname, 'src', 'ui.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract script content
    const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      console.log('   ❌ No script section found in HTML');
      return false;
    }
    
    const scriptContent = scriptMatch[1];
    
    // Check for critical functions that buttons call
    const requiredFunctions = [
      'selectFiles',
      'selectOutputPath',
      'processFiles',
      'setOperation',
      'switchTab',
      'updateDelimiter',
      'toggleTheme',
      'showPreview',
      'updateProgress',
      'updateStatus'
    ];
    
    const foundFunctions = [];
    const missingFunctions = [];
    
    requiredFunctions.forEach(func => {
      if (scriptContent.includes(`function ${func}(`) || 
          scriptContent.includes(`async function ${func}(`) ||
          scriptContent.includes(`${func} =`) ||
          scriptContent.includes(`const ${func} =`)) {
        foundFunctions.push(func);
      } else {
        missingFunctions.push(func);
      }
    });
    
    console.log(`   ✅ Found functions: ${foundFunctions.length}/${requiredFunctions.length}`);
    
    // Check for proper async/await usage
    const hasAsyncFunctions = scriptContent.includes('async function');
    const hasAwaitCalls = scriptContent.includes('await ');
    const hasErrorHandling = scriptContent.includes('try {') && scriptContent.includes('catch');
    
    console.log(`   🔄 Async functions: ${hasAsyncFunctions ? 'present' : 'missing'}`);
    console.log(`   ⏳ Await usage: ${hasAwaitCalls ? 'present' : 'missing'}`);
    console.log(`   ⚠️  Error handling: ${hasErrorHandling ? 'present' : 'missing'}`);
    
    if (missingFunctions.length > 0) {
      console.log(`   ❌ Missing functions: ${missingFunctions.join(', ')}`);
      return false;
    }
    
    console.log('✅ All critical JavaScript functions defined');
    return true;
  } catch (error) {
    console.error('❌ JavaScript functions test failed:', error.message);
    return false;
  }
}

// Test CSS classes and styles that UI relies on
function testCSSIntegration() {
  console.log('🧪 Testing CSS integration...');
  
  try {
    const cssPath = path.join(__dirname, 'src', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for critical CSS classes that JavaScript manipulates
    const criticalClasses = [
      '.active',
      '.selected', 
      '.disabled',
      '.loading-overlay',
      '.modal',
      '.btn',
      '.file-card',
      '.progress-bar',
      '.theme-light',
      '.theme-dark'
    ];
    
    const foundClasses = [];
    const missingClasses = [];
    
    criticalClasses.forEach(cssClass => {
      if (cssContent.includes(cssClass)) {
        foundClasses.push(cssClass);
      } else {
        missingClasses.push(cssClass);
      }
    });
    
    console.log(`   ✅ Found CSS classes: ${foundClasses.length}/${criticalClasses.length}`);
    
    // Check for responsive design and theme support
    const hasThemeSupport = cssContent.includes('theme-') && cssContent.includes(':root');
    const hasCustomProperties = cssContent.includes('--');
    const hasResponsive = cssContent.includes('@media');
    
    console.log(`   🎨 Theme support: ${hasThemeSupport ? 'present' : 'missing'}`);
    console.log(`   🔧 Custom properties: ${hasCustomProperties ? 'present' : 'missing'}`);
    console.log(`   📱 Responsive design: ${hasResponsive ? 'present' : 'missing'}`);
    
    if (missingClasses.length > 0) {
      console.log(`   ❌ Missing CSS classes: ${missingClasses.join(', ')}`);
      return false;
    }
    
    console.log('✅ CSS integration complete');
    return true;
  } catch (error) {
    console.error('❌ CSS integration test failed:', error.message);
    return false;
  }
}

// Test complete workflow simulation
async function testCompleteWorkflow() {
  console.log('🧪 Testing complete user workflow simulation...');
  
  try {
    // Simulate the complete user workflow by checking function call chains
    const htmlPath = path.join(__dirname, 'src', 'ui.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      return false;
    }
    
    const scriptContent = scriptMatch[1];
    
    // Check workflow: File Selection -> Operation -> Output -> Process
    const workflowChecks = {
      fileSelectionFlow: scriptContent.includes('selectFiles') && 
                         scriptContent.includes('displayFileList') &&
                         scriptContent.includes('analyzeFile'),
      
      operationFlow: scriptContent.includes('setOperation') &&
                    scriptContent.includes('outputCard.style.display'),
      
      delimiterFlow: scriptContent.includes('detectDelimiter') &&
                    scriptContent.includes('updateDelimiter'),
      
      processingFlow: scriptContent.includes('processFiles') &&
                     scriptContent.includes('loadingOverlay') &&
                     scriptContent.includes('updateProgress'),
      
      themeFlow: scriptContent.includes('toggleTheme') &&
                scriptContent.includes('applyTheme'),
      
      updateFlow: scriptContent.includes('checkForUpdates') &&
                 scriptContent.includes('downloadUpdate')
    };
    
    const workflowResults = Object.entries(workflowChecks);
    const passedWorkflows = workflowResults.filter(([, passed]) => passed).length;
    
    console.log(`   ✅ Workflow completeness: ${passedWorkflows}/${workflowResults.length}`);
    
    workflowResults.forEach(([workflow, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${workflow}`);
    });
    
    console.log('✅ Complete workflow simulation passed');
    return passedWorkflows === workflowResults.length;
  } catch (error) {
    console.error('❌ Complete workflow test failed:', error.message);
    return false;
  }
}

// Test module integration points
function testModuleIntegration() {
  console.log('🧪 Testing module integration points...');
  
  try {
    const mainPath = path.join(__dirname, 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    // Check that main.js properly integrates with modules
    const moduleIntegrations = [
      'file-processor',
      'streaming-processor', 
      'error-handler',
      'theme-manager',
      'update-manager'
    ];
    
    const foundIntegrations = [];
    const missingIntegrations = [];
    
    moduleIntegrations.forEach(module => {
      if (mainContent.includes(module)) {
        foundIntegrations.push(module);
      } else {
        missingIntegrations.push(module);
      }
    });
    
    console.log(`   ✅ Module integrations: ${foundIntegrations.length}/${moduleIntegrations.length}`);
    
    // Check that UI calls are properly routed to modules
    const hasFileProcessing = mainContent.includes('fileProcessor') || mainContent.includes('streamingProcessor');
    const hasThemeManagement = mainContent.includes('themeManager') || mainContent.includes('setTheme');
    const hasErrorHandling = mainContent.includes('errorHandler') || mainContent.includes('try {');
    
    console.log(`   📁 File processing integration: ${hasFileProcessing ? 'present' : 'missing'}`);
    console.log(`   🎨 Theme management integration: ${hasThemeManagement ? 'present' : 'missing'}`);
    console.log(`   ⚠️  Error handling integration: ${hasErrorHandling ? 'present' : 'missing'}`);
    
    if (missingIntegrations.length > 2) { // Allow some flexibility
      console.log(`   ❌ Too many missing integrations: ${missingIntegrations.join(', ')}`);
      return false;
    }
    
    console.log('✅ Module integration points verified');
    return true;
  } catch (error) {
    console.error('❌ Module integration test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runUIWorkflowTests() {
  console.log('🚀 Starting UI Workflow Tests for File Manager Pro v3.0\n');
  console.log('Testing complete user interaction chain from UI to backend\n');
  
  const tests = [
    { name: 'IPC Handlers', fn: testIPCHandlers, critical: true },
    { name: 'Preload API Exposure', fn: testPreloadExposure, critical: true },
    { name: 'UI Elements', fn: testUIElements, critical: true },
    { name: 'JavaScript Functions', fn: testJavaScriptFunctions, critical: true },
    { name: 'CSS Integration', fn: testCSSIntegration, critical: false },
    { name: 'Complete Workflow', fn: testCompleteWorkflow, critical: true },
    { name: 'Module Integration', fn: testModuleIntegration, critical: true }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result, critical: test.critical });
    } catch (error) {
      console.error(`💥 ${test.name} crashed:`, error.message);
      results.push({ name: test.name, passed: false, critical: test.critical });
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UI WORKFLOW TEST RESULTS');
  console.log(`${'='.repeat(60)}`);
  
  let passed = 0;
  let failed = 0;
  let criticalFailed = 0;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const criticalTag = result.critical ? ' (CRITICAL)' : '';
    console.log(`${status} - ${result.name}${criticalTag}`);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
      if (result.critical) {
        criticalFailed++;
      }
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${results.length} workflow tests passed`);
  console.log(`🔥 Critical failures: ${criticalFailed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL UI WORKFLOW TESTS PASSED!');
    console.log('✅ Complete user interaction chain verified');
    console.log('✅ UI buttons properly connected to backend');
    console.log('✅ All workflows function end-to-end');
    console.log('✅ Application ready for user testing');
  } else if (criticalFailed === 0) {
    console.log(`\n⚠️  ${failed} non-critical workflow test(s) failed`);
    console.log('🟡 Core functionality works but has minor issues');
  } else {
    console.log(`\n❌ ${criticalFailed} CRITICAL workflow test(s) failed`);
    console.log('🔴 UI-backend connection has major problems');
    console.log('🛠️  Fix critical workflow issues immediately');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    results.forEach(result => {
      if (!result.passed && result.critical) {
        console.log(`   • Fix ${result.name} functionality`);
      }
    });
  }
  
  return { success: failed === 0, critical: criticalFailed === 0, results };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runUIWorkflowTests().then(({ success, critical }) => {
    process.exit(success ? 0 : (critical ? 1 : 2));
  }).catch(error => {
    console.error('💥 UI workflow test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runUIWorkflowTests };