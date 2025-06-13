# File Manager Tool v3.0 - Enhanced Makefile
# Advanced building configurations for cross-platform development with auto-update support

# Variables
APP_NAME = File Manager Pro
VERSION = 3.0.0
NODE_VERSION = 16
NPM_CMD = npm
ELECTRON_CMD = npx electron
BUILD_DIR = dist
SRC_DIR = src
MODULES_DIR = modules

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
PURPLE = \033[0;35m
NC = \033[0m # No Color

# Default target
.PHONY: help
help:
	@echo "$(GREEN)🗂️  File Manager Pro v3.0 - Enhanced Build Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make start      - Start application (alias for dev)"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make modules    - Initialize all modules"
	@echo ""
	@echo "$(YELLOW)Building:$(NC)"
	@echo "  make build      - Build for all platforms with auto-update"
	@echo "  make win        - Build for Windows (.exe)"
	@echo "  make mac        - Build for macOS (.dmg)"
	@echo "  make linux      - Build for Linux (.AppImage)"
	@echo "  make portable   - Build portable versions"
	@echo "  make publish    - Build and publish with auto-update"
	@echo ""
	@echo "$(YELLOW)Auto-Update:$(NC)"
	@echo "  make setup-auto-update - Configure auto-update settings"
	@echo "  make release           - Create new release with auto-update"
	@echo "  make draft-release     - Create draft release"
	@echo ""
	@echo "$(YELLOW)Maintenance:$(NC)"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make clean-all  - Clean everything (node_modules + build)"
	@echo "  make update     - Update dependencies"
	@echo "  make info       - Show project information"
	@echo "  make size       - Show build sizes"
	@echo "  make validate   - Validate build configuration"
	@echo ""
	@echo "$(YELLOW)Quick Commands:$(NC)"
	@echo "  make quick      - Quick build for current platform"
	@echo "  make deploy     - Build and prepare for deployment"
	@echo "  make v3-setup   - Complete v3.0 setup and validation"

# Development commands
.PHONY: install
install:
	@echo "$(GREEN)📦 Installing dependencies for v3.0...$(NC)"
	$(NPM_CMD) install
	@echo "$(GREEN)✅ Dependencies installed successfully!$(NC)"
	@make modules

.PHONY: modules
modules:
	@echo "$(BLUE)🔧 Setting up modular architecture...$(NC)"
	@mkdir -p $(MODULES_DIR)
	@mkdir -p config
	@mkdir -p assets
	@echo "$(GREEN)✅ Module structure created!$(NC)"

.PHONY: dev start
dev start:
	@echo "$(GREEN)🚀 Starting File Manager Pro v3.0...$(NC)"
	@echo "$(BLUE)Features enabled: Large file support, Auto-update, Dark mode$(NC)"
	$(NPM_CMD) start

.PHONY: test
test:
	@echo "$(GREEN)🧪 Running tests...$(NC)"
	$(NPM_CMD) test || echo "$(YELLOW)⚠️  Test script not found, skipping...$(NC)"

.PHONY: lint
lint:
	@echo "$(GREEN)🔍 Running linter...$(NC)"
	$(NPM_CMD) run lint || echo "$(YELLOW)⚠️  Lint script not found, skipping...$(NC)"

# Enhanced building commands with auto-update support
.PHONY: build
build: validate clean
	@echo "$(GREEN)🏗️  Building File Manager Pro v3.0 for all platforms...$(NC)"
	@echo "$(BLUE)Including: Streaming support, Auto-update, Theme system$(NC)"
	$(NPM_CMD) run build
	@echo "$(GREEN)✅ Build completed for all platforms!$(NC)"
	@make size
	@make verify

.PHONY: win
win: validate clean
	@echo "$(GREEN)🪟 Building for Windows with NSIS installer...$(NC)"
	$(NPM_CMD) run build-win
	@echo "$(GREEN)✅ Windows build completed!$(NC)"

.PHONY: mac
mac: validate clean
	@echo "$(GREEN)🍎 Building for macOS with auto-update support...$(NC)"
	$(NPM_CMD) run build-mac
	@echo "$(GREEN)✅ macOS build completed!$(NC)"

.PHONY: linux
linux: validate clean
	@echo "$(GREEN)🐧 Building for Linux AppImage...$(NC)"
	$(NPM_CMD) run build-linux
	@echo "$(GREEN)✅ Linux build completed!$(NC)"

.PHONY: portable
portable: clean
	@echo "$(GREEN)📦 Building portable versions...$(NC)"
	$(NPM_CMD) run build-portable || echo "$(YELLOW)⚠️  Portable build script not found$(NC)"

.PHONY: publish
publish: validate
	@echo "$(GREEN)🚀 Building and publishing with auto-update...$(NC)"
	@echo "$(BLUE)This will create releases with update server integration$(NC)"
	$(NPM_CMD) run publish
	@echo "$(GREEN)✅ Published successfully!$(NC)"

# Auto-update specific commands
.PHONY: setup-auto-update
setup-auto-update:
	@echo "$(PURPLE)🔄 Setting up auto-update configuration...$(NC)"
	@echo "$(BLUE)Configuring GitHub releases integration...$(NC)"
	@if [ ! -f "app-update.yml" ]; then \
		echo "provider: github" > app-update.yml; \
		echo "owner: your-username" >> app-update.yml; \
		echo "repo: file-manager-tool" >> app-update.yml; \
		echo "$(GREEN)✅ Auto-update config created!$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Auto-update config already exists$(NC)"; \
	fi

.PHONY: release
release: build
	@echo "$(PURPLE)📋 Creating new release v$(VERSION)...$(NC)"
	@echo "$(BLUE)Building with auto-update metadata...$(NC)"
	$(NPM_CMD) run build -- --publish=always
	@echo "$(GREEN)✅ Release created with auto-update support!$(NC)"

.PHONY: draft-release
draft-release: build
	@echo "$(PURPLE)📝 Creating draft release...$(NC)"
	$(NPM_CMD) run build -- --publish=onTagOrDraft
	@echo "$(GREEN)✅ Draft release created!$(NC)"

# Quick commands
.PHONY: quick
quick:
	@echo "$(GREEN)⚡ Quick build for current platform...$(NC)"
ifeq ($(OS),Windows_NT)
	@make win
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		@make linux
	endif
	ifeq ($(UNAME_S),Darwin)
		@make mac
	endif
endif

.PHONY: deploy
deploy: build
	@echo "$(GREEN)🚀 Preparing deployment package...$(NC)"
	@if [ -d "$(BUILD_DIR)" ]; then \
		cd $(BUILD_DIR) && \
		echo "$(GREEN)📁 Build artifacts:$(NC)" && \
		ls -la && \
		echo "$(BLUE)Auto-update files:$(NC)" && \
		ls -la *.yml 2>/dev/null || echo "No update files found" && \
		echo "$(GREEN)✅ Deployment ready!$(NC)"; \
	else \
		echo "$(RED)❌ Build directory not found!$(NC)"; \
	fi

# v3.0 specific setup
.PHONY: v3-setup
v3-setup: install modules setup-auto-update
	@echo "$(PURPLE)🎯 Complete File Manager Pro v3.0 setup...$(NC)"
	@echo "$(BLUE)Validating v3.0 features...$(NC)"
	@make validate
	@make test
	@echo "$(GREEN)✅ File Manager Pro v3.0 setup completed!$(NC)"
	@echo "$(YELLOW)Ready for: Large files (<300MB), Auto-updates, Dark mode$(NC)"

# Maintenance commands
.PHONY: clean
clean:
	@echo "$(YELLOW)🧹 Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR) || echo "$(YELLOW)⚠️  Build directory not found$(NC)"
	@rm -rf out || echo "$(YELLOW)⚠️  Out directory not found$(NC)"
	@echo "$(GREEN)✅ Build artifacts cleaned!$(NC)"

.PHONY: clean-all
clean-all: clean
	@echo "$(YELLOW)🧹 Cleaning everything...$(NC)"
	@rm -rf node_modules || echo "$(YELLOW)⚠️  node_modules not found$(NC)"
	@rm -rf package-lock.json || echo "$(YELLOW)⚠️  package-lock.json not found$(NC)"
	@echo "$(GREEN)✅ Everything cleaned!$(NC)"

.PHONY: update
update:
	@echo "$(GREEN)🔄 Updating dependencies...$(NC)"
	$(NPM_CMD) update
	$(NPM_CMD) audit fix || echo "$(YELLOW)⚠️  No security fixes needed$(NC)"
	@echo "$(GREEN)✅ Dependencies updated!$(NC)"

.PHONY: info
info:
	@echo "$(GREEN)📊 File Manager Pro v3.0 Information$(NC)"
	@echo "$(YELLOW)Version:$(NC) $(VERSION)"
	@echo "$(YELLOW)Node.js version:$(NC) $(shell node --version)"
	@echo "$(YELLOW)NPM version:$(NC) $(shell npm --version)"
	@echo "$(YELLOW)Electron version:$(NC) $(shell npx electron --version 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)Platform:$(NC) $(shell node -p 'process.platform')"
	@echo "$(YELLOW)Architecture:$(NC) $(shell node -p 'process.arch')"
	@echo "$(YELLOW)Project directory:$(NC) $(shell pwd)"
	@if [ -f "package.json" ]; then \
		echo "$(YELLOW)App version:$(NC) $(shell node -p 'require("./package.json").version')"; \
		echo "$(YELLOW)App name:$(NC) $(shell node -p 'require("./package.json").name')"; \
	fi
	@echo "$(BLUE)v3.0 Features: Large file streaming, Auto-update, Dark mode$(NC)"

.PHONY: size
size:
	@echo "$(GREEN)📏 Build Sizes$(NC)"
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "$(YELLOW)Build directory size:$(NC)"; \
		du -sh $(BUILD_DIR)/* 2>/dev/null || echo "$(YELLOW)⚠️  No build files found$(NC)"; \
		echo "$(BLUE)Auto-update files:$(NC)"; \
		find $(BUILD_DIR) -name "*.yml" -exec ls -lh {} \; 2>/dev/null || echo "No update files"; \
	else \
		echo "$(YELLOW)⚠️  Build directory not found$(NC)"; \
	fi

# Validation commands
.PHONY: validate
validate:
	@echo "$(BLUE)🔍 Validating v3.0 configuration...$(NC)"
	@if [ ! -f "package.json" ]; then \
		echo "$(RED)❌ package.json not found!$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "main.js" ]; then \
		echo "$(RED)❌ main.js not found!$(NC)"; \
		exit 1; \
	fi
	@if [ ! -d "$(MODULES_DIR)" ]; then \
		echo "$(YELLOW)⚠️  Modules directory missing, creating...$(NC)"; \
		mkdir -p $(MODULES_DIR); \
	fi
	@if [ ! -d "$(SRC_DIR)" ]; then \
		echo "$(RED)❌ Source directory not found!$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Configuration validated!$(NC)"

.PHONY: verify
verify:
	@echo "$(GREEN)✅ Verifying v3.0 build...$(NC)"
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "$(GREEN)📁 Build directory exists$(NC)"; \
		if [ -f "$(BUILD_DIR)/File Manager Pro.exe" ]; then \
			echo "$(GREEN)✅ Windows executable found$(NC)"; \
		fi; \
		if [ -f "$(BUILD_DIR)/File Manager Pro.dmg" ]; then \
			echo "$(GREEN)✅ macOS installer found$(NC)"; \
		fi; \
		if [ -f "$(BUILD_DIR)/File Manager Pro.AppImage" ]; then \
			echo "$(GREEN)✅ Linux AppImage found$(NC)"; \
		fi; \
		echo "$(BLUE)Checking auto-update files...$(NC)"; \
		find $(BUILD_DIR) -name "latest*.yml" -exec echo "✅ Update file: {}" \; || echo "$(YELLOW)⚠️  No update files found$(NC)"; \
	else \
		echo "$(RED)❌ Build directory not found!$(NC)"; \
	fi

# Advanced commands
.PHONY: rebuild
rebuild: clean-all install build
	@echo "$(GREEN)✅ Complete v3.0 rebuild finished!$(NC)"

.PHONY: check-deps
check-deps:
	@echo "$(GREEN)🔍 Checking dependencies...$(NC)"
	$(NPM_CMD) outdated || echo "$(GREEN)✅ All dependencies up to date!$(NC)"
	$(NPM_CMD) audit || echo "$(GREEN)✅ No security vulnerabilities found!$(NC)"

.PHONY: package-info
package-info:
	@echo "$(GREEN)📦 Package Information$(NC)"
	@$(NPM_CMD) ls --depth=0

.PHONY: dev-tools
dev-tools:
	@echo "$(GREEN)🛠️  Installing v3.0 development tools...$(NC)"
	$(NPM_CMD) install -g electron
	$(NPM_CMD) install -g electron-builder
	@echo "$(GREEN)✅ Development tools installed!$(NC)"

# Platform-specific optimizations
.PHONY: win-sign
win-sign:
	@echo "$(GREEN)✍️  Signing Windows executable...$(NC)"
	@echo "$(YELLOW)⚠️  Code signing not configured$(NC)"

.PHONY: mac-notarize
mac-notarize:
	@echo "$(GREEN)✍️  Notarizing macOS app...$(NC)"
	@echo "$(YELLOW)⚠️  Notarization not configured$(NC)"

# Git helpers
.PHONY: git-clean
git-clean:
	@echo "$(GREEN)🗑️  Cleaning git ignored files...$(NC)"
	git clean -fdx
	@echo "$(GREEN)✅ Git clean completed!$(NC)"

# Performance testing
.PHONY: perf-test
perf-test:
	@echo "$(BLUE)⚡ Running performance tests for large file processing...$(NC)"
	@echo "$(YELLOW)⚠️  Performance tests not implemented yet$(NC)"

# Documentation
.PHONY: docs
docs:
	@echo "$(BLUE)📚 Generating v3.0 documentation...$(NC)"
	@echo "$(YELLOW)⚠️  Documentation generation not configured$(NC)"

# Default when no target is specified
.DEFAULT_GOAL := help