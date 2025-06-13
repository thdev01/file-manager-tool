# CLAUDE.md - Persistent Development Context

## 🎯 Project Mission

**File Manager Pro v3.0** is a modern, desktop file processing application built with Electron, designed to handle large files (300MB+) with precision and efficiency. The project follows a systematic, methodical, and pragmatic development approach with clean code principles, modularity, and comprehensive documentation.

## 📋 Development Philosophy

### Core Principles
- **Clean Code & Modularity**: Single responsibility, DRY principles, SOLID architecture
- **Systematic Development**: Test-driven, incremental commits, documentation-first approach
- **Performance & Reliability**: Streaming architecture, memory management, comprehensive error handling
- **User Experience Focus**: Modern UI/UX with accessibility, cross-platform consistency

### Quality Standards
- **Security First**: No external links to Claude/Anthropic, secure IPC communication
- **Performance Targets**: Handle 300MB+ files, maintain UI responsiveness
- **Code Quality**: 80%+ test coverage, consistent naming conventions
- **Documentation**: Comprehensive guides, user-friendly error messages

## 🗂️ Project Structure

### Core Files
- **main.js**: Electron main process with security configurations
- **src/ui.html**: Modern responsive interface with dark/light themes
- **src/styles.css**: Enhanced CSS framework with custom properties
- **package.json**: Dependencies and build configuration

### Modular Architecture
- **modules/file-processor.js**: Standard file operations (< 50MB)
- **modules/streaming-processor.js**: Large file streaming operations (> 50MB)
- **modules/theme-manager.js**: Theme management and persistence
- **modules/update-manager.js**: Auto-update system via GitHub releases

### Documentation Framework
- **development-guide.md**: Philosophy and development standards
- **todo.md**: Systematic development task tracking
- **methods-handbook.md**: Technical documentation and patterns
- **git-instructions.md**: Version control workflow with thdev-agent attribution
- **workflow.md**: Systematic development process

## 🚨 Critical Issues Identified

### Security Vulnerabilities (HIGH PRIORITY)
1. **Electron Security**: Remove `nodeIntegration: true`, `contextIsolation: false`, `enableRemoteModule: true`
2. **IPC Security**: Implement proper input validation for all IPC handlers
3. **File Validation**: Add comprehensive file type and size validation

### Performance Issues (HIGH PRIORITY)
1. **Memory Leaks**: Fix streaming processor memory management
2. **Large File Handling**: Optimize chunk size calculation and memory usage
3. **UI Responsiveness**: Improve progress tracking and loading states

### Code Quality Issues (MEDIUM PRIORITY)
1. **Error Handling**: Implement consistent error patterns across modules
2. **Function Size**: Split large functions into focused, single-responsibility functions
3. **Documentation**: Add JSDoc comments to all public functions

## 🎯 Current Development Status

### Completed Tasks ✅
- ✅ Project structure analysis and documentation review
- ✅ Source code examination and issue identification
- ✅ Development guide creation with philosophy and standards
- ✅ Systematic todo list with prioritized tasks
- ✅ Methods handbook with technical documentation
- ✅ Git workflow instructions with thdev-agent attribution
- ✅ Systematic development workflow documentation

### In Progress 🔄
- 🔄 Updating CLAUDE.md with persistent context
- 🔄 Planning critical security vulnerability fixes
- 🔄 CSS/layout configuration improvements

### Next Priorities 🎯
1. **Security Fixes**: Implement secure Electron configuration
2. **Memory Optimization**: Fix streaming processor leaks
3. **Error Handling**: Standardize error patterns
4. **UI Improvements**: Enhance responsive design and accessibility

## 🛠️ Technical Stack

### Current Technologies
- **Frontend**: Electron 28.3.3, HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js 16+, Papa Parse 5.5.3, XLSX 0.18.5
- **Build**: Electron Builder 24.13.3, Make automation
- **Updates**: Electron Updater 6.3.9 with GitHub integration

### Development Tools
- **Code Quality**: ESLint, Prettier (to be configured)
- **Testing**: Jest framework (to be implemented)
- **Version Control**: Git with systematic workflow
- **Documentation**: Markdown with comprehensive guides

## 📊 Performance Targets

### File Processing
- **Large Files**: Successfully process 300MB+ files without memory issues
- **Processing Speed**: Handle 100K+ rows in under 30 seconds
- **Memory Usage**: Keep memory usage under 2GB for large operations
- **UI Responsiveness**: Maintain UI responsiveness during processing

### Quality Metrics
- **Test Coverage**: Achieve 90%+ test coverage
- **Security**: Zero critical vulnerabilities
- **Error Rate**: Less than 1% error rate in file processing
- **User Satisfaction**: Target 4.5/5 user satisfaction score

## 🔄 Development Workflow

### Systematic Process
1. **Analysis**: Review todo.md, identify priority items
2. **Planning**: Create implementation strategy using workflow.md
3. **Implementation**: Follow development-guide.md standards
4. **Documentation**: Update methods-handbook.md with new patterns
5. **Quality**: Test thoroughly and maintain code quality
6. **Integration**: Follow git-instructions.md for proper commits
7. **Updates**: Maintain all documentation files

### Commit Standards
```
<type>(<scope>): <description>

[optional body]

🤖 Generated with thdev-agent
```

### Branching Strategy
- **main**: Production-ready code
- **feature/[description]**: New features
- **fix/[description]**: Bug fixes
- **hotfix/[description]**: Critical production fixes

## 📚 Knowledge Base

### Key Patterns
- **Async Error Handling**: Try-catch with user-friendly error messages
- **Progress Tracking**: Consistent progress updates for long operations
- **Memory Management**: Streaming for large files, proper cleanup
- **IPC Communication**: Secure handler patterns with validation

### Architectural Decisions
- **Modular Design**: Separate concerns into focused modules
- **Streaming Architecture**: Handle large files without memory overflow
- **Theme System**: CSS custom properties for flexible theming
- **Auto-Updates**: GitHub-based release system

## 🎯 Future Roadmap

### Version 3.1 (Next Release)
- Enhanced file format support (JSON, XML, Parquet)
- Advanced data operations (filtering, transformation)
- Improved security model
- Performance optimizations

### Version 3.2 (Medium Term)
- API integration capabilities
- Cloud storage integration
- Collaboration features
- Advanced analytics

### Version 4.0 (Long Term)
- Microservices architecture
- Web-based interface
- Mobile companion app
- Real-time collaboration

## 🔧 Environment Context

### Development Environment
- **Working Directory**: `/mnt/c/Users/Usuario/Desktop/FMM/fmm2`
- **Platform**: WSL2 Linux (Windows host)
- **Git Status**: Clean working directory with modified files
- **Node Version**: 16+ LTS required
- **Build System**: Make + npm scripts

### File Status
- **Main Process**: main.js (needs security fixes)
- **UI**: src/ui.html, src/styles.css (functional, needs optimization)
- **Modules**: All core modules present and functional
- **Documentation**: Complete documentation framework established

## 🎯 Instructions for Continuation

### When resuming development:
1. **Read this file first** for complete context
2. **Review todo.md** for current task priorities
3. **Follow workflow.md** for systematic development process
4. **Use methods-handbook.md** for technical implementation guidance
5. **Follow git-instructions.md** for proper version control
6. **Maintain development-guide.md** standards throughout

### Key Reminders:
- Always attribute commits to "thdev-agent"
- Never include external links to Claude/Anthropic
- Follow security-first approach
- Maintain comprehensive documentation
- Test thoroughly before commits
- Update relevant documentation with changes

### Critical Next Steps:
1. Fix Electron security vulnerabilities in main.js
2. Implement proper error handling patterns
3. Optimize streaming processor memory usage
4. Enhance UI responsiveness and accessibility
5. Set up testing framework and CI/CD

## 📝 Development Session Notes

### Current Session Context
- **Session Start**: Initial project analysis and documentation setup
- **Completed**: Full documentation framework creation
- **Status**: Ready to begin critical security and performance fixes
- **Next Focus**: Implement secure Electron configuration and fix memory leaks

### Discovered Issues
- Critical security vulnerabilities in Electron configuration
- Memory leaks in streaming processor (lines 400+)
- Inconsistent error handling across modules
- Missing input validation in IPC handlers
- CSS architecture could be improved for maintainability

### Implementation Notes
- Use established patterns from methods-handbook.md
- Follow incremental development approach
- Maintain backward compatibility where possible
- Document all architectural decisions
- Test on multiple file sizes and formats

---

**This file serves as the permanent development context and should be consulted at the beginning of every development session to maintain continuity and systematic progress.**