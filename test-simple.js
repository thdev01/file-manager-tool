/**
 * Simple Integration Tests
 * Basic functionality tests without streaming
 */

const fs = require('fs');
const path = require('path');
const FileProcessor = require('./modules/file-processor');

// Create test directory
const testDir = path.join(__dirname, 'test-files-simple');
const outputDir = path.join(__dirname, 'test-output-simple');

// Sample data
const sampleCSVData = `name,age,city
John,25,NYC
Jane,30,LA
Bob,35,Chicago`;

function setupTestFiles() {
  console.log('📁 Setting up test files...');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(testDir, 'test.csv'), sampleCSVData);
  console.log('✅ Test files created');
  return true;
}

async function testBasicFunctionality() {
  console.log('🧪 Testing basic functionality...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    // Test file parsing
    const testFile = path.join(testDir, 'test.csv');
    const data = await fileProcessor.parseFileContent(testFile);
    
    console.log('   📊 Parsed data:', {
      rows: data.length,
      firstRow: data[0],
      columns: Object.keys(data[0] || {})
    });
    
    // Test delimiter detection
    const delimiterResult = await fileProcessor.detectDelimiter(testFile);
    console.log('   🔍 Delimiter detection:', delimiterResult.delimiter);
    
    // Test file stats
    const stats = await fileProcessor.getFileStats(testFile);
    console.log('   📈 File stats:', {
      size: stats.size,
      rows: stats.totalRows,
      columns: stats.columns
    });
    
    console.log('✅ Basic functionality working');
    return true;
  } catch (error) {
    console.error('❌ Basic functionality failed:', error.message);
    return false;
  }
}

async function testFileWriting() {
  console.log('🧪 Testing file writing...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    const testData = [
      { name: 'Test1', value: 100 },
      { name: 'Test2', value: 200 }
    ];
    
    const outputFile = path.join(outputDir, 'output.csv');
    await fileProcessor.writeFile(testData, outputFile);
    
    const exists = fs.existsSync(outputFile);
    const content = exists ? fs.readFileSync(outputFile, 'utf8') : '';
    
    console.log('   📄 Write result:', {
      exists,
      contentLength: content.length,
      lines: content.split('\n').length
    });
    
    console.log('✅ File writing working');
    return exists && content.length > 0;
  } catch (error) {
    console.error('❌ File writing failed:', error.message);
    return false;
  }
}

async function testMergeOperation() {
  console.log('🧪 Testing merge operation...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    // Create second test file
    const testData2 = `name,age,city
Alice,28,Boston
Charlie,32,Seattle`;
    
    const testFile2 = path.join(testDir, 'test2.csv');
    fs.writeFileSync(testFile2, testData2);
    
    const filePaths = [
      path.join(testDir, 'test.csv'),
      testFile2
    ];
    
    const outputPath = path.join(outputDir, 'merged.csv');
    
    // Mock event
    const mockEvent = {
      sender: {
        send: (channel, data) => {
          console.log(`   📡 Progress: ${data.percentage}%`);
        }
      }
    };
    
    const result = await fileProcessor.mergeFiles(mockEvent, filePaths, outputPath, ',');
    
    const outputExists = fs.existsSync(outputPath);
    const outputContent = outputExists ? fs.readFileSync(outputPath, 'utf8') : '';
    
    console.log('   📄 Merge result:', {
      success: result.success,
      outputExists,
      outputLines: outputContent.split('\n').length
    });
    
    console.log('✅ Merge operation working');
    return result.success && outputExists;
  } catch (error) {
    console.error('❌ Merge operation failed:', error.message);
    return false;
  }
}

function cleanup() {
  console.log('🧹 Cleaning up...');
  
  try {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    console.log('✅ Cleanup complete');
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    return false;
  }
}

async function runSimpleTests() {
  console.log('🚀 Starting Simple Integration Tests\n');
  
  const tests = [
    { name: 'Setup', fn: setupTestFiles },
    { name: 'Basic Functionality', fn: testBasicFunctionality },
    { name: 'File Writing', fn: testFileWriting },
    { name: 'Merge Operation', fn: testMergeOperation },
    { name: 'Cleanup', fn: cleanup }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`${'='.repeat(50)}`);
    try {
      const result = await test.fn();
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${test.name}\n`);
      
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ CRASH - ${test.name}: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log(`${'='.repeat(50)}`);
  console.log(`📈 Results: ${passed}/${tests.length} tests passed`);
  
  if (failed === 0) {
    console.log('🎉 All simple tests passed! Core functionality is working.');
  } else {
    console.log(`⚠️  ${failed} test(s) failed.`);
  }
  
  return failed === 0;
}

if (require.main === module) {
  runSimpleTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runSimpleTests };