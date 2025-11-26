# Commit Message Generator

Generate meaningful, structured commit messages automatically based on your Git changes. This VS Code extension analyzes your staged files and creates conventional commit messages following best practices.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.80.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🎯 **Smart Commit Generation** - Automatically generates commit messages based on file changes
- 📝 **Conventional Commits** - Follows the [Conventional Commits](https://www.conventionalcommits.org/) specification
- 🔍 **Auto-Detection** - Intelligently suggests commit type based on changed files
- 🎨 **Multiple Styles** - Support for conventional, semantic, descriptive, and brief styles
- 📊 **File Categorization** - Groups changes by components, API routes, tests, etc.
- ⚙️ **Configurable** - Customize commit style, scope, and footer preferences
- 🚀 **One-Click Generation** - Generate commit messages with a single click from the Source Control panel

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install commit-message-generator`
4. Press Enter

### From Source
1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` to open Extension Development Host

## 🚀 Usage

### Quick Start

1. Make changes to your files
2. Stage your changes (`git add`)
3. Click the **sparkle icon (✨)** in the Source Control panel
4. Select commit type from the dropdown
5. Optionally add issue number
6. Your commit message is generated and ready!

### Command Palette

Press `Ctrl+Shift+P` / `Cmd+Shift+P` and type:
```
Generate Commit Message
```

### Keyboard Shortcut (Optional)

Add to your `keybindings.json`:
```json
{
  "key": "ctrl+shift+n",
  "command": "commitGenerator.generate",
  "when": "scmProvider == git"
}
```

## 📋 Commit Message Structure

The extension generates commit messages in this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Example Outputs

#### Single File Change
```
feat(auth): add login component

Modified:
  - src/components/Login.tsx
```

#### Multiple Files (Same Category)
```
refactor(components): update components

Modified:
  - src/components/Header.tsx
  - src/components/Footer.tsx
  - src/components/Button.tsx
  - src/components/Input.tsx
  - src/components/Modal.tsx
```

#### Mixed Changes
```
feat(api): implement new feature

Added:
  - src/api/auth.ts
  - src/api/middleware/validate.ts
Modified:
  - src/api/index.ts
  - src/api/routes.ts

Closes #123
```

#### Many Files (15+)
```
refactor: refactor code structure

Changes: 8 added, 10 modified, 2 deleted
```

## ⚙️ Configuration

Access settings via `File > Preferences > Settings` or `Ctrl+,` / `Cmd+,`

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `commitGenerator.commitStyle` | string | `conventional` | Commit message style |
| `commitGenerator.includeScope` | boolean | `true` | Include scope in commits |
| `commitGenerator.includeFooter` | boolean | `false` | Prompt for footer/issue number |
| `commitGenerator.maxFilesInBody` | number | `20` | Max files to list in body |
| `commitGenerator.maxDiffLines` | number | `500` | Max diff lines to analyze |

### Commit Types

The extension supports these commit types:

| Type | Icon | Description |
|------|------|-------------|
| `feat` | ✨ | A new feature |
| `fix` | 🐛 | A bug fix |
| `docs` | 📚 | Documentation changes |
| `style` | 💎 | Code style/formatting |
| `refactor` | ♻️ | Code refactoring |
| `test` | 🧪 | Adding tests |
| `chore` | 🔧 | Build/dependencies |
| `perf` | ⚡ | Performance improvements |

### Auto-Detection Rules

The extension automatically suggests commit types based on:

- **test** - Files matching `test`, `spec`, `__tests__`
- **chore** - `package.json`, `package-lock.json` changes
- **docs** - `README.md` or `.md` files
- **style** - Only `.css`, `.scss`, `.less` files

### Scope Detection

Scopes are automatically detected from:
- First directory name (e.g., `src/components/` → scope: `components`)
- File patterns (e.g., all API files → scope: `api`)

### File Categories

Files are intelligently categorized:
- **components** - Component files
- **API routes** - API/route files
- **utilities** - Utils/helpers
- **styles** - CSS/SCSS files
- **tests** - Test files
- **configuration** - Config files
- **types** - TypeScript types
- **documentation** - Docs/README

## 🎨 Customization

### Custom Commit Styles

Add to your `settings.json`:

```json
{
  "commitGenerator.commitStyle": "conventional",
  "commitGenerator.includeScope": true,
  "commitGenerator.includeFooter": true,
  "commitGenerator.maxFilesInBody": 25
}
```

### Example Configurations

#### Minimal Style
```json
{
  "commitGenerator.commitStyle": "brief",
  "commitGenerator.includeScope": false,
  "commitGenerator.maxFilesInBody": 5
}
```

#### Detailed Style
```json
{
  "commitGenerator.commitStyle": "conventional",
  "commitGenerator.includeScope": true,
  "commitGenerator.includeFooter": true,
  "commitGenerator.maxFilesInBody": 20
}
```

## 📖 Examples

### Example 1: Adding New Feature
**Changes:**
- Added `src/auth/Login.tsx`
- Added `src/auth/Register.tsx`

**Generated:**
```
feat(auth): add auth

Added:
  - src/auth/Login.tsx
  - src/auth/Register.tsx
```

### Example 2: Bug Fix
**Changes:**
- Modified `src/utils/validation.ts`

**Generated:**
```
fix(utils): update validation

Modified:
  - src/utils/validation.ts
```

### Example 3: Multiple Components
**Changes:**
- Modified 5 component files

**Generated:**
```
refactor(components): update components

Modified:
  - src/components/Header.tsx
  - src/components/Footer.tsx
  - src/components/Sidebar.tsx
  - src/components/Button.tsx
  - src/components/Input.tsx
```

### Example 4: Documentation
**Changes:**
- Modified `README.md`

**Generated:**
```
docs: update documentation

Modified:
  - README.md
```

### Example 5: Test Coverage
**Changes:**
- Added multiple test files

**Generated:**
```
test: add test coverage

Added:
  - tests/auth.test.ts
  - tests/user.test.ts
  - tests/api.test.ts
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- VS Code >= 1.80.0
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/hasithaPerera2002/commit-message-generator.git
cd commit-message-generator

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch
```

### Testing
1. Press `F5` in VS Code to launch Extension Development Host
2. Open a Git repository
3. Make some changes and stage them
4. Click the sparkle icon in Source Control
5. Verify the generated commit message

### Building
```bash
# Compile
npm run compile

# Package extension
npm run package

# This creates: ai-commit-message-generator-1.0.0.vsix
```

### Publishing
```bash
# Install vsce
npm install -g @vscode/vsce

# Package
vsce package

# Publish
vsce publish
```

## 📁 Project Structure

```
commit-message-generator/
├── src/
│   └── extension.ts          # Main extension code
├── out/                       # Compiled JavaScript
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
├── CHANGELOG.md              # Version history
└── LICENSE                   # License file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Write meaningful commit messages (use this extension! 😄)
- Add tests for new features
- Update documentation as needed

## 🐛 Known Issues

- Does not support non-Git repositories
- Requires Git extension to be active
- Footer prompt appears even if cancelled (will be fixed in next version)

## 📝 Roadmap

- [ ] AI-powered commit message generation (Claude API integration)
- [ ] Support for multiple commit message templates
- [ ] Customizable commit type list
- [ ] Git hooks integration
- [ ] Multi-repository support
- [ ] Commit message history/favorites
- [ ] Emoji support in commit messages
- [ ] Branch name based commit suggestions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Conventional Commits](https://www.conventionalcommits.org/) specification
- VS Code Extension API documentation
- Git community for best practices


- **Issues**: [GitHub Issues](https://github.com/hasithaPerera2002/commit-message-generator/issues)

## ⭐ Show Your Support

If this extension helps you, please:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔀 Submit pull requests

---

**Made with ❤️ by [Hasitha Perera](https://github.com/hasithaPerera2002)**

**Happy Committing! 🚀**