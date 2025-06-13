file-manager-tool/
├── 📁 assets/                          # Application assets
│   ├── icon.png                        # Application icon (PNG)
│   ├── icon.ico                        # Windows icon
│   ├── icon.icns                       # macOS icon
│   └── screenshots/                    # Application screenshots
│       ├── main-interface.png
│       ├── dark-mode.png
│       └── processing.png
│
├── 📁 config/                          # Configuration files
│   ├── theme.json                      # Theme settings (auto-generated)
│   ├── settings.json                   # User settings (auto-generated)
│   └── app-config.json                 # Application configuration
│
├── 📁 dist/                            # Build output directory (auto-generated)
│   ├── win-unpacked/                   # Windows unpacked files
│   ├── mac/                            # macOS build files
│   ├── linux-unpacked/                 # Linux unpacked files
│   ├── File Manager Pro.exe            # Windows executable
│   ├── File Manager Pro.dmg            # macOS installer
│   ├── File Manager Pro.AppImage       # Linux AppImage
│   ├── latest.yml                      # Windows update metadata
│   ├── latest-mac.yml                  # macOS update metadata
│   └── latest-linux.yml                # Linux update metadata
│
├── 📁 docs/                            # Documentation
│   ├── README.md                       # Main documentation
│   ├── CHANGELOG.md                    # Version history
│   ├── CONTRIBUTING.md                 # Contribution guidelines
│   ├── API.md                          # API documentation
│   └── images/                         # Documentation images
│       ├── architecture.png
│       └── workflow.png
│
├── 📁 modules/                         # Modular components (v3.0)
│   ├── file-processor.js               # Standard file processing
│   ├── streaming-processor.js          # Large file streaming processor
│   ├── theme-manager.js                # Theme management system
│   ├── update-manager.js               # Auto-update functionality
│   ├── settings-manager.js             # Settings persistence
│   ├── error-handler.js                # Centralized error handling
│   └── utils/                          # Utility modules
│       ├── file-utils.js               # File operation utilities
│       ├── format-utils.js             # Format conversion utilities
│       └── validation-utils.js         # Input validation utilities
│
├── 📁 src/                             # Source files
│   ├── ui.html                         # Main UI (enhanced for v3.0)
│   ├── styles.css                      # Enhanced CSS with dark mode
│   ├── scripts/                        # UI scripts
│   │   ├── main-ui.js                  # Main UI logic
│   │   ├── theme-handler.js            # Theme switching logic
│   │   ├── file-manager.js             # File management UI
│   │   └── update-ui.js                # Update interface logic
│   └── components/                     # Reusable UI components
│       ├── modal.js                    # Modal component
│       ├── progress-bar.js             # Progress bar component
│       └── file-card.js                # File card component
│
├── 📁 tests/                           # Test files
│   ├── unit/                           # Unit tests
│   │   ├── file-processor.test.js      # File processor tests
│   │   ├── streaming-processor.test.js # Streaming tests
│   │   ├── theme-manager.test.js       # Theme manager tests
│   │   └── update-manager.test.js      # Update manager tests
│   ├── integration/                    # Integration tests
│   │   ├── file-operations.test.js     # File operation tests
│   │   └── ui-integration.test.js      # UI integration tests
│   ├── fixtures/                       # Test data
│   │   ├── sample.csv                  # Sample CSV file
│   │   ├── large-sample.csv            # Large CSV for streaming tests
│   │   ├── sample.xlsx                 # Sample Excel file
│   │   └── sample.txt                  # Sample text file
│   └── setup/                          # Test setup
│       ├── test-helper.js              # Test utilities
│       └── mock-data.js                # Mock data generators
│
├── 📁 scripts/                         # Build and utility scripts
│   ├── build.js                        # Custom build script
│   ├── setup.js                        # Project setup script
│   ├── release.js                      # Release automation
│   ├── clean.js                        # Cleanup script
│   └── validate.js                     # Configuration validation
│
├── 📁 .github/                         # GitHub specific files
│   ├── workflows/                      # GitHub Actions
│   │   ├── build.yml                   # Build workflow
│   │   ├── release.yml                 # Release workflow
│   │   ├── test.yml                    # Test workflow
│   │   └── auto-update.yml             # Auto-update workflow
│   ├── ISSUE_TEMPLATE/                 # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── support.md
│   └── PULL_REQUEST_TEMPLATE.md        # PR template
│
├── 📁 resources/                       # Additional resources
│   ├── installer/                      # Installer resources
│   │   ├── icon.ico
│   │   ├── license.txt
│   │   └── installer-banner.bmp
│   ├── locales/                        # Internationalization
│   │   ├── en.json                     # English translations
│   │   ├── pt-BR.json                  # Portuguese translations
│   │   └── es.json                     # Spanish translations
│   └── templates/                      # File templates
│       ├── csv-template.csv
│       └── xlsx-template.xlsx
│
├── 📁 logs/                            # Application logs (auto-generated)
│   ├── main.log                        # Main application log
│   ├── error.log                       # Error log
│   └── update.log                      # Update process log
│
├── 📁 temp/                            # Temporary files (auto-generated)
│   ├── processing/                     # Temporary processing files
│   └── updates/                        # Update downloads
│
├── 📄 main.js                          # Main Electron process (enhanced v3.0)
├── 📄 package.json                     # NPM package configuration (v3.0)
├── 📄 package-lock.json                # NPM lock file (auto-generated)
├── 📄 Makefile                         # Enhanced build commands (v3.0)
├── 📄 README.md                        # Main project documentation
├── 📄 CHANGELOG.md                     # Version history
├── 📄 LICENSE                          # MIT License
├── 📄 .gitignore                       # Git ignore rules
├── 📄 .eslintrc.js                     # ESLint configuration
├── 📄 .prettierrc                      # Prettier configuration
├── 📄 electron-builder.json            # Electron Builder config
├── 📄 app-update.yml                   # Auto-update configuration
├── 📄 dev-app-update.yml               # Development update config
└── 📄 tsconfig.json                    # TypeScript configuration (optional)