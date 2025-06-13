# Git Instructions - File Manager Pro v3.0

## 🔄 Git Workflow Standards

### Branching Strategy

#### Main Branches
- **main**: Production-ready code, stable releases only
- **develop**: Integration branch for new features
- **hotfix/***: Critical bug fixes for production

#### Feature Branches
- **feature/[description]**: New features and enhancements
- **fix/[description]**: Bug fixes and improvements
- **docs/[description]**: Documentation updates
- **refactor/[description]**: Code refactoring without functional changes

#### Branch Naming Convention
```bash
# Feature development
feature/streaming-processor-optimization
feature/dark-theme-enhancement
feature/api-integration

# Bug fixes
fix/memory-leak-large-files
fix/csv-delimiter-detection
fix/theme-persistence-issue

# Hotfixes
hotfix/security-vulnerability
hotfix/crash-on-startup

# Documentation
docs/api-reference-update
docs/user-manual-screenshots

# Refactoring
refactor/file-processor-modularity
refactor/css-architecture
```

## 📝 Commit Message Standards

### Commit Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]

🤖 Generated with thdev-agent
```

### Commit Types
- **feat**: New feature implementation
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools
- **security**: Security improvements or fixes

### Scope Examples
- **core**: Core application functionality
- **ui**: User interface changes
- **processor**: File processing modules
- **theme**: Theme management
- **update**: Auto-update system
- **build**: Build system and dependencies
- **config**: Configuration changes

### Commit Message Examples
```bash
# Feature additions
feat(processor): add streaming support for large CSV files
feat(ui): implement dark mode toggle with persistence
feat(core): add auto-update functionality with GitHub integration

# Bug fixes
fix(processor): resolve memory leak in streaming operations
fix(ui): correct responsive layout issues on mobile devices
fix(theme): ensure theme persistence across application restarts

# Documentation
docs(api): update file processing method documentation
docs(readme): add installation instructions for all platforms

# Performance improvements
perf(processor): optimize CSV parsing for files over 100MB
perf(ui): implement virtual scrolling for large file lists

# Security fixes
security(core): remove nodeIntegration from Electron configuration
security(ipc): implement proper input validation for all handlers

# Refactoring
refactor(processor): split file-processor into smaller modules
refactor(css): convert to CSS custom properties for theming
```

## 🚀 Development Workflow

### Feature Development Process

#### 1. Start New Feature
```bash
# Ensure you're on the latest main branch
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/descriptive-feature-name

# Make initial commit with branch setup
git commit --allow-empty -m "feat: initialize feature/descriptive-feature-name

Setting up new feature branch for [description of feature]

🤖 Generated with thdev-agent"
```

#### 2. Development Cycle
```bash
# Make incremental commits with clear messages
git add .
git commit -m "feat(scope): implement core functionality

- Add main feature logic
- Include error handling
- Update related documentation

🤖 Generated with thdev-agent"

# Push regularly to remote
git push origin feature/descriptive-feature-name
```

#### 3. Pre-merge Preparation
```bash
# Update from main to resolve any conflicts
git checkout main
git pull origin main
git checkout feature/descriptive-feature-name
git rebase main

# Run quality checks
npm run lint
npm run test
npm run build

# Final commit if needed
git add .
git commit -m "feat(scope): finalize feature implementation

- Complete all functionality
- Pass all tests
- Update documentation

🤖 Generated with thdev-agent"

# Push final changes
git push origin feature/descriptive-feature-name
```

### Bug Fix Workflow

#### 1. Hotfix for Production
```bash
# Start from main for critical issues
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-description

# Implement fix
git add .
git commit -m "fix(core): resolve critical production issue

- Fix [specific issue description]
- Add validation to prevent recurrence
- Include regression test

🤖 Generated with thdev-agent"

# Test thoroughly
npm run test
npm run build

# Merge to main and develop
git checkout main
git merge hotfix/critical-issue-description
git push origin main

git checkout develop
git merge hotfix/critical-issue-description
git push origin develop

# Clean up
git branch -d hotfix/critical-issue-description
git push origin --delete hotfix/critical-issue-description
```

#### 2. Regular Bug Fix
```bash
# Start from develop for non-critical issues
git checkout develop
git pull origin develop
git checkout -b fix/bug-description

# Implement fix with proper testing
git add .
git commit -m "fix(processor): resolve CSV parsing edge case

- Handle empty cells in CSV files
- Add validation for malformed data
- Include unit tests for edge cases

🤖 Generated with thdev-agent"
```

## 🏷️ Tagging and Releases

### Version Tagging Strategy

#### Semantic Versioning
- **MAJOR.MINOR.PATCH** (e.g., 3.1.2)
- **MAJOR**: Breaking changes or major architecture updates
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

#### Release Types
```bash
# Major release (breaking changes)
git tag -a v4.0.0 -m "Release v4.0.0: Major architecture overhaul

- Complete UI redesign
- New streaming architecture
- Breaking API changes
- Enhanced security model

🤖 Generated with thdev-agent"

# Minor release (new features)
git tag -a v3.1.0 -m "Release v3.1.0: Enhanced file processing

- Add JSON and XML support
- Implement data filtering
- Improved error handling
- Performance optimizations

🤖 Generated with thdev-agent"

# Patch release (bug fixes)
git tag -a v3.0.1 -m "Release v3.0.1: Critical bug fixes

- Fix memory leak in large file processing
- Resolve theme persistence issues
- Update security dependencies
- Improve error messages

🤖 Generated with thdev-agent"
```

### Release Process
```bash
# 1. Prepare release branch
git checkout develop
git pull origin develop
git checkout -b release/v3.1.0

# 2. Update version information
# - Update package.json version
# - Update CHANGELOG.md
# - Update README.md if needed

git add .
git commit -m "chore(release): prepare v3.1.0 release

- Update version to 3.1.0
- Update changelog with new features
- Final documentation updates

🤖 Generated with thdev-agent"

# 3. Final testing
npm run test
npm run build
npm run test-release

# 4. Merge to main and tag
git checkout main
git merge release/v3.1.0
git tag -a v3.1.0 -m "Release v3.1.0: [Release description]

🤖 Generated with thdev-agent"

# 5. Push everything
git push origin main
git push origin v3.1.0

# 6. Merge back to develop
git checkout develop
git merge main
git push origin develop

# 7. Clean up release branch
git branch -d release/v3.1.0
```

## 🔧 Git Configuration

### Initial Setup
```bash
# Configure Git identity (use thdev-agent as author)
git config --global user.name "thdev-agent"
git config --global user.email "thdev-agent@development.local"

# Configure commit template
git config --global commit.template ~/.gitmessage

# Configure default branch
git config --global init.defaultBranch main

# Enable helpful configurations
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # macOS/Linux
git config --global pull.rebase false
git config --global push.default simple
```

### Commit Message Template (~/.gitmessage)
```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# 🤖 Generated with thdev-agent
#
# Type should be one of the following:
# * feat: new feature
# * fix: bug fix
# * docs: documentation
# * style: formatting
# * refactor: code change that neither fixes a bug nor adds a feature
# * perf: code change that improves performance
# * test: adding missing tests
# * chore: changes to the build process or auxiliary tools
# * security: security improvements
#
# Scope should indicate what is changing (processor, ui, core, etc.)
#
# Subject should use imperative mood and not end with period
# Body should include motivation for the change and contrast with previous behavior
# Footer should contain any BREAKING CHANGES or issue references
```

## 📋 Pre-commit Hooks

### Setup Pre-commit Validation
```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Create pre-commit script in package.json
"scripts": {
  "pre-commit": "npm run lint && npm run test && npm run format-check"
}
```

### Pre-commit Checklist
- [ ] Code passes ESLint validation
- [ ] All tests pass
- [ ] Code formatting is consistent
- [ ] No security vulnerabilities detected
- [ ] Documentation is updated
- [ ] Commit message follows standards

## 🌿 Branch Management

### Branch Cleanup
```bash
# List all branches
git branch -a

# Delete merged feature branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Delete remote tracking branches that no longer exist
git remote prune origin

# Force delete unmerged branch (use with caution)
git branch -D feature/abandoned-feature
```

### Branch Protection Rules

#### Main Branch Protection
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict force pushes
- Restrict deletions

#### Develop Branch Protection
- Require pull request reviews (optional)
- Require status checks to pass
- Allow force pushes by administrators

## 🔍 Code Review Process

### Pull Request Template
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing (if applicable)

## Documentation
- [ ] Code documentation updated
- [ ] README updated (if applicable)
- [ ] Methods handbook updated (if applicable)

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Generated with thdev-agent
This pull request was created following the systematic development process outlined in our development guide.
```

### Review Guidelines
1. **Code Quality**: Check for clean, readable, and maintainable code
2. **Security**: Verify no security vulnerabilities are introduced
3. **Performance**: Ensure changes don't negatively impact performance
4. **Documentation**: Confirm documentation is updated appropriately
5. **Testing**: Verify adequate test coverage for changes
6. **Breaking Changes**: Identify any breaking changes and ensure proper versioning

## 📊 Git Analytics

### Useful Git Commands for Tracking
```bash
# View commit statistics
git shortlog -sn

# View file change statistics
git diff --stat main..feature-branch

# View commit history with graph
git log --oneline --graph --decorate --all

# View contributors and their contributions
git log --format='%aN <%aE>' | sort -u

# View commits by author
git log --author="thdev-agent" --oneline

# View recent activity
git log --since="1 week ago" --oneline
```

### Repository Health Checks
```bash
# Check for large files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | grep '^blob' | sort -nk3 | tail -20

# Check repository size
git count-objects -vH

# Verify repository integrity
git fsck --full
```

---

## 🎯 Best Practices Summary

### Commit Frequency
- Commit early and often with focused changes
- Each commit should represent a logical unit of work
- Avoid large commits that mix multiple concerns

### Commit Message Quality
- Use imperative mood ("Add feature" not "Added feature")
- Keep subject line under 50 characters
- Include detailed body for complex changes
- Always include "🤖 Generated with thdev-agent" footer

### Branch Management
- Keep feature branches short-lived
- Regularly sync with main/develop
- Delete merged branches promptly
- Use descriptive branch names

### Collaboration
- Review all pull requests thoroughly
- Provide constructive feedback
- Test changes locally before approval
- Maintain consistent coding standards

This git workflow ensures systematic, traceable, and high-quality development while maintaining clear attribution to thdev-agent as the development entity.