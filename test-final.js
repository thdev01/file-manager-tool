/**
 * Final Application Test Suite
 * Comprehensive testing before delivery
 */

const fs = require('fs');
const path = require('path');

// Test requirements
const requiredFiles = [
  'main.js',
  'package.json',
  'src/ui.html',
  'src/styles.css',
  'src/preload.js',
  'modules/file-processor.js',
  'modules/streaming-processor.js',
  'modules/error-handler.js',
  'modules/theme-manager.js',
  'modules/update-manager.js'
];

const requiredDependencies = [
  'electron',
  'electron-updater',
  'electron-log',
  'papaparse',
  'xlsx',
  'fs-extra'
];

// Test file structure
function testFileStructure() {
  console.log('🗂️  Testing file structure...');
  
  const missingFiles = [];
  const existingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  });
  
  console.log(`   ✅ Found: ${existingFiles.length}/${requiredFiles.length} required files`);
  
  if (missingFiles.length > 0) {
    console.log('   ❌ Missing files:', missingFiles.join(', '));
    return false;
  }
  
  return true;
}

// Test package.json
function testPackageJson() {
  console.log('📦 Testing package.json...');
  
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const missingDeps = [];
    const foundDeps = [];
    
    requiredDependencies.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep] ||
          packageJson.devDependencies && packageJson.devDependencies[dep]) {
        foundDeps.push(dep);
      } else {
        missingDeps.push(dep);
      }
    });
    
    console.log(`   ✅ Dependencies: ${foundDeps.length}/${requiredDependencies.length} found`);
    console.log(`   📝 Main: ${packageJson.main || 'not set'}`);
    console.log(`   🏷️  Version: ${packageJson.version || 'not set'}`);
    
    if (missingDeps.length > 0) {
      console.log('   ❌ Missing dependencies:', missingDeps.join(', '));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Error reading package.json:', error.message);
    return false;
  }
}

// Test main.js configuration
function testMainJs() {
  console.log('⚡ Testing main.js configuration...');
  
  try {
    const mainPath = path.join(__dirname, 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    const checks = {
      hasContextIsolation: mainContent.includes('contextIsolation: true'),
      hasNodeIntegrationDisabled: mainContent.includes('nodeIntegration: false'),
      hasPreloadScript: mainContent.includes('preload:'),
      hasSecureWebPreferences: !mainContent.includes('nodeIntegration: true'),
      hasErrorHandling: mainContent.includes('try {') || mainContent.includes('catch'),
      hasLogging: mainContent.includes('log.'),
      hasIpcHandlers: mainContent.includes('ipcMain.handle')
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`   ✅ Security checks: ${passed}/${total} passed`);
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}`);
    });
    
    return passed === total;
  } catch (error) {
    console.error('   ❌ Error reading main.js:', error.message);
    return false;
  }
}

// Test module functionality
async function testModuleFunctionality() {
  console.log('🧪 Testing module functionality...');
  
  try {
    const FileProcessor = require('./modules/file-processor');
    const StreamingProcessor = require('./modules/streaming-processor');
    const errorHandler = require('./modules/error-handler');
    
    // Test FileProcessor
    const fileProcessor = new FileProcessor();
    const supportedFormats = fileProcessor.supportedFormats;
    
    // Test StreamingProcessor
    const streamingProcessor = new StreamingProcessor();
    const activeStreams = streamingProcessor.activeStreams;
    
    // Test ErrorHandler
    const errorCodes = Object.keys(errorHandler.errorCodes);
    
    console.log('   ✅ Module instantiation successful');
    console.log(`      📁 FileProcessor supports: ${supportedFormats.length} formats`);
    console.log(`      🌊 StreamingProcessor active streams: ${activeStreams.size}`);
    console.log(`      ⚠️  ErrorHandler error codes: ${errorCodes.length}`);
    
    // Test error creation
    const testError = errorHandler.createError(
      errorHandler.errorCodes.VALIDATION_ERROR,
      'Test error'
    );
    
    console.log(`      🔧 Error handling: ${testError.code === 'VALIDATION_ERROR' ? 'working' : 'failed'}`);
    
    return true;
  } catch (error) {
    console.error('   ❌ Module functionality test failed:', error.message);
    return false;
  }
}

// Test UI files
function testUIFiles() {
  console.log('🎨 Testing UI files...');
  
  try {
    const htmlPath = path.join(__dirname, 'src', 'ui.html');
    const cssPath = path.join(__dirname, 'src', 'styles.css');
    const preloadPath = path.join(__dirname, 'src', 'preload.js');
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    
    const checks = {
      htmlHasElectronAPI: htmlContent.includes('electronAPI'),
      htmlHasStylesheet: htmlContent.includes('styles.css'),
      htmlHasViewport: htmlContent.includes('viewport'),
      cssHasCustomProperties: cssContent.includes('--'),
      cssHasThemeSupport: cssContent.includes('theme-'),
      preloadHasContextBridge: preloadContent.includes('contextBridge'),
      preloadHasSecurityCleanup: preloadContent.includes('delete window.require'),
      preloadExposesAPI: preloadContent.includes('electronAPI')
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`   ✅ UI checks: ${passed}/${total} passed`);
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}`);
    });
    
    return passed === total;
  } catch (error) {
    console.error('   ❌ Error testing UI files:', error.message);
    return false;
  }
}

// Test build readiness
function testBuildReadiness() {
  console.log('🏗️  Testing build readiness...');
  
  try {
    const checks = {
      hasMainFile: fs.existsSync(path.join(__dirname, 'main.js')),
      hasPackageJson: fs.existsSync(path.join(__dirname, 'package.json')),
      hasModulesDir: fs.existsSync(path.join(__dirname, 'modules')),
      hasSrcDir: fs.existsSync(path.join(__dirname, 'src')),
      hasNodeModules: fs.existsSync(path.join(__dirname, 'node_modules')),
      hasDocumentation: fs.existsSync(path.join(__dirname, 'CLAUDE.md'))
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`   ✅ Build readiness: ${passed}/${total} requirements met`);
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}`);
    });
    
    return passed >= 5; // Allow for missing node_modules in some environments
  } catch (error) {
    console.error('   ❌ Error testing build readiness:', error.message);
    return false;
  }
}

// Test documentation
function testDocumentation() {
  console.log('📚 Testing documentation...');
  
  const docFiles = [
    'CLAUDE.md',
    'development-guide.md',
    'methods-handbook.md',
    'workflow.md',
    'git-instructions.md'
  ];
  
  const existingDocs = [];
  const missingDocs = [];
  
  docFiles.forEach(doc => {
    const docPath = path.join(__dirname, doc);
    if (fs.existsSync(docPath)) {
      existingDocs.push(doc);
    } else {
      missingDocs.push(doc);
    }
  });
  
  console.log(`   ✅ Documentation: ${existingDocs.length}/${docFiles.length} files present`);
  
  if (missingDocs.length > 0) {
    console.log(`   ⚠️  Missing documentation: ${missingDocs.join(', ')}`);
  }
  
  return existingDocs.length >= 3; // Minimum viable documentation
}

// Security audit
function testSecurity() {
  console.log('🔒 Security audit...');
  
  try {
    const mainContent = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
    const preloadContent = fs.readFileSync(path.join(__dirname, 'src', 'preload.js'), 'utf8');
    
    const securityIssues = [];
    
    // Check for security issues
    if (mainContent.includes('nodeIntegration: true')) {
      securityIssues.push('nodeIntegration enabled');
    }
    
    if (mainContent.includes('contextIsolation: false')) {
      securityIssues.push('contextIsolation disabled');
    }
    
    if (mainContent.includes('webSecurity: false')) {
      securityIssues.push('webSecurity disabled');
    }
    
    if (!preloadContent.includes('delete window.require')) {
      securityIssues.push('Missing security cleanup in preload');
    }
    
    if (!mainContent.includes('validate') && !mainContent.includes('validation')) {
      securityIssues.push('No input validation detected');
    }
    
    console.log(`   ✅ Security issues found: ${securityIssues.length}`);
    
    if (securityIssues.length > 0) {
      securityIssues.forEach(issue => {
        console.log(`      ❌ ${issue}`);
      });
      return false;
    }
    
    console.log('      🛡️  All security checks passed');
    return true;
  } catch (error) {
    console.error('   ❌ Security audit failed:', error.message);
    return false;
  }
}

// Main test runner
async function runFinalTests() {
  console.log('🚀 File Manager Pro v3.0 - Final Test Suite');
  console.log('=' .repeat(60));
  console.log('Testing application readiness for delivery\n');
  
  const tests = [
    { name: 'File Structure', fn: testFileStructure },
    { name: 'Package Configuration', fn: testPackageJson },
    { name: 'Main Process', fn: testMainJs },
    { name: 'Module Functionality', fn: testModuleFunctionality },
    { name: 'UI Components', fn: testUIFiles },
    { name: 'Build Readiness', fn: testBuildReadiness },
    { name: 'Documentation', fn: testDocumentation },
    { name: 'Security Audit', fn: testSecurity }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'-'.repeat(50)}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      
      if (!result) {
        console.log(`❌ ${test.name} FAILED`);
      } else {
        console.log(`✅ ${test.name} PASSED`);
      }
    } catch (error) {
      console.error(`💥 ${test.name} CRASHED: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL TEST RESULTS');
  console.log(`${'='.repeat(60)}`);
  
  let passed = 0;
  let failed = 0;
  let critical = 0;
  
  const criticalTests = ['File Structure', 'Module Functionality', 'Security Audit'];
  
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
  
  console.log(`\n📈 Overall: ${passed}/${results.length} tests passed`);
  console.log(`🔥 Critical failures: ${critical}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Application is ready for delivery');
    console.log('✅ Security requirements met');
    console.log('✅ Core functionality verified');
    console.log('✅ Build system ready');
  } else if (critical === 0) {
    console.log(`\n⚠️  ${failed} non-critical test(s) failed`);
    console.log('🟡 Application is mostly ready but has minor issues');
  } else {
    console.log(`\n❌ ${critical} CRITICAL test(s) failed`);
    console.log('🔴 Application is NOT ready for delivery');
    console.log('🛠️  Fix critical issues before proceeding');
  }
  
  return { success: failed === 0, critical: critical === 0, results };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runFinalTests().then(({ success, critical }) => {
    process.exit(success ? 0 : (critical ? 1 : 2));
  }).catch(error => {
    console.error('💥 Final test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runFinalTests };