/**
 * Integration Tests for File Manager Pro v3.0
 * Tests actual file processing operations with sample data
 */

const fs = require('fs');
const path = require('path');
const FileProcessor = require('./modules/file-processor');
const StreamingProcessor = require('./modules/streaming-processor');

// Create test directory
const testDir = path.join(__dirname, 'test-files');
const outputDir = path.join(__dirname, 'test-output');

// Sample data for testing
const sampleCSVData = `name,age,city,occupation
John Smith,25,New York,Engineer
Jane Doe,30,Los Angeles,Designer
Bob Johnson,35,Chicago,Manager
Alice Brown,28,Houston,Developer
Charlie Wilson,32,Phoenix,Analyst`;

const sampleCSVSemicolon = `name;age;city;occupation
John Smith;25;New York;Engineer
Jane Doe;30;Los Angeles;Designer
Bob Johnson;35;Chicago;Manager`;

// Setup test files
function setupTestFiles() {
  console.log('📁 Setting up test files...');
  
  // Create directories
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create sample CSV files
  fs.writeFileSync(path.join(testDir, 'sample1.csv'), sampleCSVData);
  fs.writeFileSync(path.join(testDir, 'sample2.csv'), sampleCSVSemicolon);
  
  // Create a larger file for streaming test
  let largeCSVData = 'id,name,value,timestamp\n';
  for (let i = 1; i <= 1000; i++) {
    largeCSVData += `${i},Item${i},${Math.random() * 100},2023-01-${String(i % 30 + 1).padStart(2, '0')}\n`;
  }
  fs.writeFileSync(path.join(testDir, 'large.csv'), largeCSVData);
  
  console.log('✅ Test files created successfully');
  return true;
}

// Test file analysis
async function testFileAnalysis() {
  console.log('🧪 Testing file analysis...');
  
  try {
    const fileProcessor = new FileProcessor();
    const streamingProcessor = new StreamingProcessor();
    
    const testFile = path.join(testDir, 'sample1.csv');
    
    // Test regular file analysis
    const regularStats = await fileProcessor.analyzeFile(testFile);
    console.log('   📊 Regular analysis:', {
      size: regularStats.size,
      rows: regularStats.totalRows,
      columns: regularStats.columns
    });
    
    // Test streaming file analysis
    const streamingStats = await streamingProcessor.analyzeFile(testFile);
    console.log('   📊 Streaming analysis:', {
      size: streamingStats.size,
      rows: streamingStats.totalRows,
      columns: streamingStats.columns,
      streaming: streamingStats.streaming
    });
    
    console.log('✅ File analysis working correctly');
    return true;
  } catch (error) {
    console.error('❌ File analysis failed:', error.message);
    return false;
  }
}

// Test delimiter detection
async function testDelimiterDetection() {
  console.log('🧪 Testing delimiter detection...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    // Test comma delimiter
    const commaResult = await fileProcessor.detectDelimiter(path.join(testDir, 'sample1.csv'));
    console.log('   🔍 Comma file delimiter:', commaResult.delimiter);
    
    // Test semicolon delimiter
    const semicolonResult = await fileProcessor.detectDelimiter(path.join(testDir, 'sample2.csv'));
    console.log('   🔍 Semicolon file delimiter:', semicolonResult.delimiter);
    
    const success = commaResult.delimiter === ',' && semicolonResult.delimiter === ';';
    console.log(success ? '✅ Delimiter detection working correctly' : '❌ Delimiter detection failed');
    return success;
  } catch (error) {
    console.error('❌ Delimiter detection failed:', error.message);
    return false;
  }
}

// Test file merging
async function testFileMerge() {
  console.log('🧪 Testing file merge operation...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    const filePaths = [
      path.join(testDir, 'sample1.csv'),
      path.join(testDir, 'sample2.csv')
    ];
    
    const outputPath = path.join(outputDir, 'merged.csv');
    
    // Mock event object for progress tracking
    const mockEvent = {
      sender: {
        send: (channel, data) => {
          console.log(`   📡 Progress: ${data.percentage}%`);
        }
      }
    };
    
    const result = await fileProcessor.mergeFiles(mockEvent, filePaths, outputPath, ',');
    
    // Verify output file exists
    const outputExists = fs.existsSync(outputPath);
    const outputContent = outputExists ? fs.readFileSync(outputPath, 'utf8') : '';
    const outputLines = outputContent.split('\n').filter(line => line.trim());
    
    console.log('   📄 Merge result:', {
      success: result.success,
      message: result.message,
      outputExists,
      outputLines: outputLines.length
    });
    
    const success = result.success && outputExists && outputLines.length > 0;
    console.log(success ? '✅ File merge working correctly' : '❌ File merge failed');
    return success;
  } catch (error) {
    console.error('❌ File merge failed:', error.message);
    return false;
  }
}

// Test file splitting
async function testFileSplit() {
  console.log('🧪 Testing file split operation...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    const filePath = path.join(testDir, 'large.csv');
    const outputPath = outputDir;
    
    // Mock event object
    const mockEvent = {
      sender: {
        send: (channel, data) => {
          console.log(`   📡 Progress: ${data.percentage}%`);
        }
      }
    };
    
    const splitOptions = {
      type: 'lines',
      value: '250'
    };
    
    const result = await fileProcessor.splitFiles(mockEvent, [filePath], outputPath, ',', splitOptions);
    
    // Check for output files
    const outputFiles = fs.readdirSync(outputDir).filter(file => file.includes('large_part_'));
    
    console.log('   📄 Split result:', {
      success: result.success,
      message: result.message,
      outputFiles: outputFiles.length
    });
    
    const success = result.success && outputFiles.length > 0;
    console.log(success ? '✅ File split working correctly' : '❌ File split failed');
    return success;
  } catch (error) {
    console.error('❌ File split failed:', error.message);
    return false;
  }
}

// Test streaming operations
async function testStreamingOperations() {
  console.log('🧪 Testing streaming operations...');
  
  try {
    const streamingProcessor = new StreamingProcessor();
    
    const filePath = path.join(testDir, 'large.csv');
    const outputPath = path.join(outputDir, 'streamed.csv');
    
    // Mock event object
    const mockEvent = {
      sender: {
        send: (channel, data) => {
          console.log(`   📡 Streaming progress: ${data.percentage}%`);
        }
      }
    };
    
    const result = await streamingProcessor.streamMerge(mockEvent, [filePath], outputPath, ',');
    
    // Verify output
    const outputExists = fs.existsSync(outputPath);
    
    console.log('   📄 Streaming result:', {
      success: result.success,
      message: result.message,
      outputExists
    });
    
    // Cleanup streams
    streamingProcessor.cleanup();
    
    const success = result.success && outputExists;
    console.log(success ? '✅ Streaming operations working correctly' : '❌ Streaming operations failed');
    return success;
  } catch (error) {
    console.error('❌ Streaming operations failed:', error.message);
    return false;
  }
}

// Test error handling integration
async function testErrorHandling() {
  console.log('🧪 Testing error handling integration...');
  
  try {
    const fileProcessor = new FileProcessor();
    
    // Test with non-existent file
    const mockEvent = { sender: { send: () => {} } };
    const result = await fileProcessor.processFiles(mockEvent, {
      filePaths: ['/nonexistent/file.csv'],
      operation: 'merge',
      outputPath: path.join(outputDir, 'error-test.csv'),
      delimiter: ','
    });
    
    console.log('   📄 Error handling result:', {
      success: result.success,
      hasError: !!result.error,
      hasMessage: !!result.message
    });
    
    const success = !result.success && result.error;
    console.log(success ? '✅ Error handling integration working correctly' : '❌ Error handling integration failed');
    return success;
  } catch (error) {
    console.error('❌ Error handling integration failed:', error.message);
    return false;
  }
}

// Cleanup test files
function cleanupTestFiles() {
  console.log('🧹 Cleaning up test files...');
  
  try {
    // Remove test directories and files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    console.log('✅ Test files cleaned up successfully');
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    return false;
  }
}

// Main integration test runner
async function runIntegrationTests() {
  console.log('🚀 Starting File Manager Pro v3.0 Integration Tests\n');
  
  const tests = [
    { name: 'Setup Test Files', fn: setupTestFiles },
    { name: 'File Analysis', fn: testFileAnalysis },
    { name: 'Delimiter Detection', fn: testDelimiterDetection },
    { name: 'File Merge', fn: testFileMerge },
    { name: 'File Split', fn: testFileSplit },
    { name: 'Streaming Operations', fn: testStreamingOperations },
    { name: 'Error Handling Integration', fn: testErrorHandling },
    { name: 'Cleanup Test Files', fn: cleanupTestFiles }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} crashed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 INTEGRATION TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
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
  
  console.log(`\n📈 Overall: ${passed}/${results.length} integration tests passed`);
  
  if (failed === 0) {
    console.log('🎉 All integration tests passed! File processing is working correctly.');
  } else {
    console.log(`⚠️  ${failed} integration test(s) failed. Review issues above.`);
  }
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Integration test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests };