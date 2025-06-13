/**
 * Quick UI Current State Test
 * Tests the current UI loading state
 */

const fs = require('fs');
const path = require('path');

function testCurrentUIState() {
  console.log('🔍 Testing current UI state...');
  
  // Test 1: Check if HTML loads the correct CSS
  const htmlPath = path.join(__dirname, 'src', 'ui.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const cssLink = htmlContent.match(/<link rel="stylesheet" href="([^"]+)"/);
  console.log(`   📄 CSS Link: ${cssLink ? cssLink[1] : 'NOT FOUND'}`);
  
  if (cssLink) {
    const cssPath = path.join(__dirname, 'src', cssLink[1]);
    const cssExists = fs.existsSync(cssPath);
    console.log(`   📁 CSS File exists: ${cssExists ? 'YES' : 'NO'}`);
    
    if (cssExists) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      const hasImports = cssContent.includes('@import');
      console.log(`   📦 Has CSS imports: ${hasImports ? 'YES' : 'NO'}`);
      
      if (hasImports) {
        const imports = cssContent.match(/@import\s+['"]([^'"]+)['"]/g);
        console.log(`   📋 Number of imports: ${imports ? imports.length : 0}`);
        
        if (imports) {
          let allImportsExist = true;
          imports.forEach(importLine => {
            const importFile = importLine.match(/@import\s+['"]([^'"]+)['"]/)[1];
            const importPath = path.join(path.dirname(cssPath), importFile);
            const importExists = fs.existsSync(importPath);
            console.log(`      ${importExists ? '✅' : '❌'} ${importFile}`);
            if (!importExists) allImportsExist = false;
          });
          console.log(`   ✅ All imports exist: ${allImportsExist ? 'YES' : 'NO'}`);
        }
      }
    }
  }
  
  // Test 2: Check critical CSS classes
  const criticalClasses = ['.active', '.selected', '.disabled', '.progress-bar', '.theme-light', '.theme-dark'];
  console.log('\n   🎨 Critical CSS classes:');
  
  criticalClasses.forEach(className => {
    try {
      const result = require('child_process').execSync(
        `grep -r "${className}" /mnt/c/Users/Usuario/Desktop/FMM/fmm2/src/css/ || echo "NOT_FOUND"`,
        { encoding: 'utf8' }
      );
      const found = !result.includes('NOT_FOUND') && result.trim().length > 0;
      console.log(`      ${found ? '✅' : '❌'} ${className}`);
    } catch (error) {
      console.log(`      ❌ ${className} (error checking)`);
    }
  });
  
  // Test 3: Check JavaScript functionality setup
  console.log('\n   🧩 JavaScript setup:');
  const hasElectronAPI = htmlContent.includes('window.electronAPI');
  const hasEventListeners = htmlContent.includes('addEventListener');
  const hasAsyncFunctions = htmlContent.includes('async function');
  const hasDOMContentLoaded = htmlContent.includes('DOMContentLoaded');
  
  console.log(`      ${hasElectronAPI ? '✅' : '❌'} Electron API usage`);
  console.log(`      ${hasEventListeners ? '✅' : '❌'} Event listeners`);
  console.log(`      ${hasAsyncFunctions ? '✅' : '❌'} Async functions`);
  console.log(`      ${hasDOMContentLoaded ? '✅' : '❌'} DOM ready handler`);
  
  // Test 4: Check if main.js loads the correct file
  const mainPath = path.join(__dirname, 'main.js');
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  const loadFileMatch = mainContent.match(/loadFile\(['"]([^'"]+)['"]\)/);
  console.log(`\n   🎯 Main.js loads: ${loadFileMatch ? loadFileMatch[1] : 'NOT FOUND'}`);
  
  const loadedFilePath = loadFileMatch ? path.join(__dirname, loadFileMatch[1]) : null;
  if (loadedFilePath) {
    const loadedFileExists = fs.existsSync(loadedFilePath);
    console.log(`   📁 Loaded file exists: ${loadedFileExists ? 'YES' : 'NO'}`);
  }
  
  return true;
}

testCurrentUIState();