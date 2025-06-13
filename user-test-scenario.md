
# File Manager Pro v3.0 - User Test Scenario

## Test Scenario: Complete File Processing Workflow

### Prerequisites
1. Launch File Manager Pro v3.0
2. Ensure you have test CSV files ready (small and large files)

### Test Steps

#### 1. File Selection (Files Tab)
- [ ] Click "Adicionar Arquivos" button
- [ ] Select multiple CSV files (both comma and semicolon delimited)
- [ ] Verify files appear in the file list with correct statistics
- [ ] Verify processing mode is automatically determined (Standard/Streaming)

#### 2. Delimiter Configuration
- [ ] Verify automatic delimiter detection works
- [ ] Test manual delimiter selection
- [ ] Test custom delimiter input
- [ ] Click "Preview" to see data preview

#### 3. Operation Selection (Operations Tab)
- [ ] Click on "Merge de Arquivos" operation
- [ ] Verify operation card becomes selected (highlighted)
- [ ] Try "Conversão de Formato" operation
- [ ] Try "Divisão de Arquivos" operation
- [ ] For split: configure split options (by lines/files)

#### 4. Output Configuration
- [ ] Click "Escolher Local de Destino"
- [ ] Select output path and format
- [ ] Verify output path is displayed correctly

#### 5. File Processing
- [ ] Click "Processar Arquivos" button
- [ ] Verify loading overlay appears
- [ ] Monitor progress bar updates
- [ ] Wait for completion message
- [ ] Verify output files are created correctly

#### 6. Theme and Settings (Settings Tab)
- [ ] Toggle between light and dark themes
- [ ] Adjust streaming threshold setting
- [ ] Toggle various checkboxes
- [ ] Verify settings are preserved

#### 7. Update System (Updates Tab)
- [ ] Click "Verificar Agora" for updates
- [ ] Verify update status is displayed
- [ ] Check update log entries

### Expected Results
- ✅ All buttons respond to clicks
- ✅ File selection works properly
- ✅ Operations complete successfully
- ✅ Progress is shown during processing
- ✅ Output files are generated correctly
- ✅ UI is responsive and user-friendly
- ✅ Error messages are clear and helpful
- ✅ Theme switching works smoothly

### Success Criteria
- [ ] Complete workflow works without errors
- [ ] All UI interactions are responsive
- [ ] File processing produces correct results
- [ ] Application handles errors gracefully
- [ ] User experience is smooth and intuitive

### Troubleshooting
If any step fails:
1. Check the status bar for error messages
2. Look for console errors (if in dev mode)
3. Verify file permissions and paths
4. Restart the application if needed

## Performance Test
- [ ] Test with files >50MB (should use streaming mode)
- [ ] Process 1000+ rows (should complete in reasonable time)
- [ ] Monitor memory usage during large file operations
