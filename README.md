File Manager Tool v3.0 - Project Structure
📁 Complete Directory Structure
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
📋 File Categories
🔧 Core Application Files

main.js - Main Electron process with v3.0 modular architecture
package.json - Enhanced NPM configuration with auto-update dependencies
Makefile - Comprehensive build automation system

🧩 Modular Components (v3.0)

modules/file-processor.js - Standard file processing (< 50MB files)
modules/streaming-processor.js - Large file streaming processor (> 50MB)
modules/theme-manager.js - Dark/Light/Auto theme management
modules/update-manager.js - GitHub-based auto-update system
modules/settings-manager.js - User preferences persistence
modules/error-handler.js - Centralized error handling

🎨 User Interface

src/ui.html - Enhanced main interface with dark mode support
src/styles.css - Advanced CSS with theme variables and animations
src/scripts/ - Modular UI logic and event handlers
src/components/ - Reusable UI components

⚙️ Configuration

config/ - Runtime configuration files (auto-generated)
app-update.yml - Production auto-update configuration
dev-app-update.yml - Development auto-update configuration
electron-builder.json - Build configuration

📦 Build Output

dist/ - Compiled executables and installers
latest*.yml - Auto-update metadata files

🎯 Resources & Assets

assets/ - Application icons and images
resources/ - Installer resources, translations, templates

🧪 Testing & Development

tests/ - Comprehensive test suite
scripts/ - Build and utility scripts
.github/ - CI/CD workflows and GitHub templates

🔗 Key Relationships
mermaidgraph TD
    A[main.js] --> B[modules/file-processor.js]
    A --> C[modules/streaming-processor.js]
    A --> D[modules/theme-manager.js]
    A --> E[modules/update-manager.js]
    
    F[src/ui.html] --> G[src/styles.css]
    F --> H[src/scripts/main-ui.js]
    F --> I[src/scripts/theme-handler.js]
    
    J[package.json] --> K[electron-builder.json]
    J --> L[app-update.yml]
    J --> M[Makefile]
🚀 Auto-Generated Directories
These directories are created automatically:

dist/ - Created during build process (make build)
logs/ - Created at runtime for application logging
temp/ - Created during file processing operations
config/ - Created on first run for user settings
node_modules/ - Created by NPM (npm install)

🛠️ Setup Instructions

Initialize Project Structure:
bashmake v3-setup

Individual Setup Steps:
bashmake install           # Install dependencies
make modules          # Create module directories
make setup-auto-update # Configure auto-updates
make validate         # Validate configuration

Development Workflow:
bashmake dev              # Start development server
make build            # Build for all platforms
make publish          # Build and publish with auto-update


📐 Architecture Principles
Modular Design

Each major functionality is isolated in separate modules
Clean separation between UI and business logic
Reusable components for maintainability

Scalability

Streaming architecture for large files
Efficient memory management
Progressive enhancement approach

Cross-Platform

Unified build system for Windows, macOS, and Linux
Platform-specific optimizations
Consistent user experience across platforms

Maintainability

Clear file organization
Comprehensive documentation
Automated testing and deployment

This structure supports the v3.0 goal of handling large files (300MB+), providing seamless auto-updates, and delivering a modern, maintainable codebase.

🗂️ File Manager Tool v3.0
Uma ferramenta desktop avançada para processamento de arquivos grandes (300MB+) com sistema de atualizações automáticas e interface moderna com modo escuro.
Mostrar Imagem
Mostrar Imagem
Mostrar Imagem
Mostrar Imagem
📋 Índice

Novidades v3.0
Recursos Principais
Instalação
Como Usar
Arquitetura v3.0
Build e Deployment
Configuração de Auto-Update
Sistema de Temas
Processamento de Arquivos Grandes
Estrutura do Projeto
Desenvolvimento
Contribuição
Roadmap

🆕 Novidades v3.0
🚀 Suporte a Arquivos Grandes (300MB+)

Processamento Streaming: Detecção automática e streaming para arquivos > 50MB
Otimização de Memória: Previne overflow de memória com processamento por chunks
Progresso em Tempo Real: Acompanhamento detalhado para operações com arquivos grandes

🔄 Sistema de Auto-Update

Integração GitHub: Integração perfeita com GitHub Releases
Updates Silenciosos: Download em background com notificações ao usuário
Progresso de Download: Informações em tempo real de velocidade e tamanho
Rollback Seguro: Processo de atualização seguro com capacidade de rollback

🎨 Sistema de Temas Avançado

Modo Escuro/Claro/Automático: Sistema completo de troca de temas
Integração com Sistema: Segue as preferências de tema do sistema
Configurações Persistentes: Preferências de tema salvas e restauradas
Transições Suaves: Efeitos de transição CSS para mudanças de tema

🧩 Arquitetura Modular

Separação de Responsabilidades: Cada funcionalidade principal em módulos separados
Design Não-Invasivo: Preserva código funcional existente
Componentes Reutilizáveis: Design modular para fácil manutenção e extensão

✨ Recursos Principais
🔗 Merge de Arquivos

Combina múltiplos arquivos CSV, XLSX ou TXT em um único arquivo
Preserva cabeçalhos e estrutura de dados
NOVO: Suporte otimizado para arquivos grandes com streaming
Interface visual com cards informativos

🔄 Conversão de Formatos

CSV ↔ XLSX: Conversão bidirecional entre planilhas
CSV ↔ TXT: Conversão com delimitadores personalizáveis
XLSX ↔ TXT: Conversão direta de planilhas para texto
NOVO: Seleção de formato de saída para todos os métodos
Processamento em lote para múltiplos arquivos

✂️ Divisão de Arquivos

Por Linhas: Divide arquivos grandes por número específico de linhas
Por Arquivos: Distribui dados em quantidade específica de arquivos
NOVO: Salvamento correto de caminhos no método de divisão
NOVO: Suporte a múltiplos formatos de saída
Nomenclatura automática sequencial (arquivo_part_001, etc.)

🎯 Detecção Inteligente de Delimitadores

Automática: Detecta automaticamente vírgula, ponto e vírgula, tab, pipe, etc.
Manual: Seleção de delimitadores pré-definidos
Personalizada: Inserção de delimitadores customizados
Preview em tempo real dos dados detectados

👁️ Preview Avançado dos Dados

Visualização prévia dos dados antes do processamento
Estatísticas de arquivo (linhas, colunas, tamanho)
NOVO: Detecção de modo de processamento (Streaming/Padrão)
NOVO: Análise avançada para arquivos grandes
Interface responsiva e moderna

🛠️ Instalação
Opção 1: Download Pré-Compilado (Recomendado)
Windows:
bash# Download do arquivo .exe
File Manager Pro.exe
macOS:
bash# Download do arquivo .dmg
File Manager Pro.dmg
Linux:
bash# Download do AppImage
File Manager Pro.AppImage
chmod +x File Manager Pro.AppImage
./File Manager Pro.AppImage
Opção 2: Compilação a partir do Código
bash# Clonar o repositório
git clone https://github.com/your-username/file-manager-tool.git
cd file-manager-tool

# Setup completo v3.0
make v3-setup

# Ou comandos individuais
make install      # Instalar dependências
make modules      # Criar estrutura modular
make dev          # Executar em modo desenvolvimento
🚀 Como Usar
Interface Moderna v3.0
1. Aba Arquivos

Clique em "➕ Adicionar Arquivos"
Escolha um ou múltiplos arquivos (CSV, XLSX, XLS, TXT)
NOVO: Visualize informações detalhadas incluindo modo de processamento
NOVO: Identificação automática de arquivos grandes (>50MB)
Configure delimitadores automaticamente ou manualmente

2. Aba Operações

🔗 Merge: Combinar todos os arquivos em um só
🔄 Conversão: Converter cada arquivo individualmente
✂️ Divisão: Dividir arquivos grandes em partes menores
NOVO: Seleção de formato de saída (CSV, XLSX, TXT)
NOVO: Informações de modo de processamento em tempo real

3. Configurações Avançadas v3.0

NOVO: Sistema de temas (Claro/Escuro/Automático)
NOVO: Configuração de limite para streaming (padrão: 50MB)
NOVO: Auto-detecção de encoding
NOVO: Estatísticas detalhadas de arquivo

4. Sistema de Atualizações

NOVO: Verificação automática de atualizações
NOVO: Download e instalação em background
NOVO: Log detalhado de atualizações
NOVO: Controle manual de atualizações

🏗️ Arquitetura v3.0
Componentes Principais
main.js (Processo Principal)
├── modules/file-processor.js        # Processamento padrão
├── modules/streaming-processor.js   # Processamento streaming
├── modules/theme-manager.js         # Gerenciamento de temas
├── modules/update-manager.js        # Sistema de atualizações
└── modules/settings-manager.js      # Persistência de configurações

src/ui.html (Interface)
├── src/styles.css                   # CSS com suporte a temas
├── src/scripts/main-ui.js          # Lógica principal da UI
├── src/scripts/theme-handler.js    # Manipulação de temas
└── src/scripts/update-ui.js        # Interface de atualizações
Fluxo de Processamento v3.0
mermaidgraph TD
    A[Seleção de Arquivos] --> B[Análise de Tamanho]
    B --> C{Arquivo > 50MB?}
    C -->|Sim| D[Streaming Processor]
    C -->|Não| E[File Processor]
    D --> F[Processamento por Chunks]
    E --> G[Processamento em Memória]
    F --> H[Resultado Final]
    G --> H
🔨 Build e Deployment
Comandos Principais v3.0
bash# Setup inicial completo
make v3-setup

# Desenvolvimento
make dev                    # Modo desenvolvimento
make test                   # Executar testes

# Build
make build                  # Build para todas as plataformas
make win                    # Build para Windows
make mac                    # Build para macOS
make linux                  # Build para Linux

# Auto-Update
make setup-auto-update      # Configurar auto-update
make publish               # Build e publicar com auto-update
make release               # Criar release com metadados

# Manutenção
make clean                 # Limpar artifacts
make validate              # Validar configuração
make info                  # Informações do projeto
Configuração de Auto-Update
1. Configurar GitHub Repository:
yaml# app-update.yml
provider: github
owner: your-username
repo: file-manager-tool
2. Build com Auto-Update:
bashmake setup-auto-update
make publish
3. Verificar Metadados:
bashls dist/latest*.yml  # Arquivos de metadados de update
🎨 Sistema de Temas
Configuração de Temas
Temas Disponíveis:

Claro: Interface tradicional clara
Escuro: Interface moderna escura
Automático: Segue configuração do sistema

Implementação:
javascript// Mudança programática
await ipcRenderer.invoke('set-theme', 'dark');

// CSS com variáveis de tema
:root {
  --primary-color: #6366f1;
  --bg-primary: #ffffff;
}

.theme-dark {
  --primary-color: #818cf8;
  --bg-primary: #1e293b;
}
📊 Processamento de Arquivos Grandes
Recursos de Streaming v3.0
Detecção Automática:

Arquivos > 50MB automaticamente usam streaming
Configurável via interface (10MB - 1GB)
Indicação visual do modo de processamento

Otimizações:

Processamento por chunks para evitar overflow de memória
Progress tracking em tempo real
Suporte a arquivos de até 300MB+

Comparação de Performance:
Arquivo 100MB:
├── Modo Padrão:    ❌ Falha de memória
├── Modo Streaming: ✅ ~45 segundos
└── Progresso:      ✅ Tempo real
📁 Estrutura do Projeto
Veja STRUCTURE.md para a estrutura completa do projeto.
Principais Diretórios:
file-manager-tool/
├── modules/           # Componentes modulares v3.0
├── src/               # Interface e UI
├── config/            # Configurações
├── assets/            # Recursos visuais
├── tests/             # Testes automatizados
└── scripts/           # Scripts de build
💻 Desenvolvimento
Pré-requisitos

Node.js 16 ou superior
npm (incluído com Node.js)
Git (para clonagem)
Make (para comandos automatizados)

Setup de Desenvolvimento
bash# Clone e configure
git clone https://github.com/your-username/file-manager-tool.git
cd file-manager-tool
make v3-setup

# Desenvolvimento
make dev              # Inicia servidor de desenvolvimento
make test             # Executa testes
make lint             # Executa linter
Testando Auto-Update
bash# Configurar ambiente de teste
make setup-auto-update

# Criar release de teste
make draft-release

# Testar update localmente
make dev
🤝 Contribuição
Como Contribuir

Fork o projeto
Crie uma branch (git checkout -b feature/nova-funcionalidade)
Commit suas mudanças (git commit -m 'Adiciona nova funcionalidade')
Push para a branch (git push origin feature/nova-funcionalidade)
Abra um Pull Request

Áreas para Contribuição
v3.0 Enhancements:

✅ Suporte a mais formatos (JSON, XML, Parquet)
✅ Filtros e transformações de dados avançadas
✅ Validação de dados em tempo real
✅ Interface móvel/responsiva
✅ Processamento em background

Funcionalidades Futuras:

✅ Drag & drop de arquivos
✅ Histórico de operações
✅ Templates de processamento
✅ API REST opcional
✅ Plugins personalizados

🗺️ Roadmap
✅ Versão 3.0 (Atual)

✅ Suporte a arquivos grandes (300MB+)
✅ Sistema de auto-update
✅ Tema escuro/claro/automático
✅ Arquitetura modular
✅ Seleção de formato de saída
✅ Interface moderna e responsiva

🚧 Versão 3.1 (Em Desenvolvimento)

🔄 API REST integrada
🔄 Suporte a JSON e XML
🔄 Filtros personalizados
🔄 Transformações de dados
🔄 Histórico de operações

📋 Versão 3.2 (Planejado)

📅 Interface web complementar
📅 Processamento em nuvem
📅 Colaboração em tempo real
📅 Machine learning para detecção de padrões
📅 Suporte a Big Data

🔮 Versão 4.0 (Futuro)

🌟 Arquitetura de microserviços
🌟 Processamento distribuído
🌟 Interface mobile nativa
🌟 Integração com serviços de nuvem
🌟 IA para otimização automática

📊 Estatísticas do Projeto

Linguagens: JavaScript, HTML, CSS
Plataformas: Windows, macOS, Linux
Formatos: CSV, XLSX, XLS, TXT
Capacidade: Arquivos até 300MB+
Auto-Update: GitHub Releases
Temas: Claro, Escuro, Automático

🔧 Tecnologias Utilizadas
Core Technologies

Electron 28.3.3 - Framework desktop multiplataforma
Node.js 16+ - Runtime JavaScript
Inter Font - Tipografia moderna

v3.0 Dependencies

electron-updater 6.3.9 - Sistema de auto-update
electron-log 5.2.0 - Sistema de logging
papaparse 5.5.3 - Parser CSV com streaming
xlsx 0.18.5 - Processamento Excel
fs-extra 11.2.0 - Operações de arquivo avançadas

Build & Development

electron-builder 24.13.3 - Build multiplataforma
Make - Automação de build
GitHub Actions - CI/CD
ESLint & Prettier - Qualidade de código

🆘 Suporte e Solução de Problemas
Problemas Comuns v3.0
Erro de Memória com Arquivos Grandes:
bash# Solução: O v3.0 usa streaming automático
# Verifique se o arquivo está sendo processado em modo streaming
# Configurável em Settings > Limite para Streaming
Auto-Update Não Funciona:
bash# Verificar configuração
make validate

# Reconfigurar auto-update
make setup-auto-update

# Verificar conectividade
make info
Tema Não Salva:
bash# Verificar permissões do diretório config/
ls -la config/

# Recriar configuração
rm -rf config/
make dev  # Recria configurações
Canais de Suporte

🐛 Bugs: GitHub Issues
💬 Discussões: GitHub Discussions
📧 Email: support@filemanager.com
📖 Documentação: docs/

📄 Licença
Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.
🙏 Agradecimentos

Comunidade Electron por ferramentas incríveis
Contribuidores do PapaParse por suporte a streaming
Usuários beta que testaram o v3.0
Comunidade open source por feedback valioso


Desenvolvido com ❤️ usando Electron, Node.js e tecnologias modernas
Repositório: https://github.com/your-username/file-manager-tool
Comandos Rápidos v3.0:
bash# Setup completo
git clone https://github.com/your-username/file-manager-tool.git
cd file-manager-tool
make v3-setup

# Desenvolvimento
make dev

# Build para produção
make build

# Publicar com auto-update
make publish
File Manager Pro v3.0 - Sua solução completa para processamento de arquivos grandes com atualizações automáticas e interface moderna! 🚀