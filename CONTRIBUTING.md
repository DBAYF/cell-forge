# Contributing to CellForge

Thank you for your interest in contributing to CellForge! We welcome contributions from the battery engineering community and the broader open-source ecosystem.

## 🚀 **Ways to Contribute**

### **Code Contributions**
- **Bug Fixes**: Fix issues and improve stability
- **Feature Enhancements**: Add new capabilities to the platform
- **Performance Improvements**: Optimize rendering, calculations, or memory usage
- **UI/UX Improvements**: Enhance the user experience and interface design

### **Non-Code Contributions**
- **Documentation**: Improve guides, tutorials, and API documentation
- **Testing**: Write tests and report bugs
- **Translations**: Help localize the interface
- **Community Support**: Help other users in discussions and issues

### **Research & Development**
- **Battery Data**: Contribute cell specifications and manufacturer data
- **Algorithm Improvements**: Enhance electrical calculations and simulations
- **Integration Development**: Build connectors for other engineering tools

## 🛠️ **Development Setup**

### **Prerequisites**
- **Node.js 18+** and **npm**
- **Rust** (for Tauri development)
- **Git** for version control

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/cellforge/cellforge.git
cd cellforge

# Install dependencies
npm install

# Start development server
npm run dev

# For desktop app development
npm run tauri dev
```

### **Project Structure**
```
src/
├── components/          # React components
│   ├── mobile/         # Mobile-specific components
│   ├── panels/         # Desktop panels
│   ├── ui/            # Reusable UI components
│   └── viewport/      # 3D viewport and controls
├── hooks/             # Custom React hooks
├── lib/              # Utilities and helpers
├── stores/           # Zustand state management
└── types/            # TypeScript type definitions
```

## 📝 **Development Guidelines**

### **Code Style**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Automated code linting
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### **Branching Strategy**
- `main`: Production-ready code
- `develop`: Development integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical fixes

### **Pull Request Process**
1. **Fork** the repository
2. **Create** a feature branch from `develop`
3. **Make** your changes with tests
4. **Test** thoroughly (unit, integration, e2e)
5. **Update** documentation if needed
6. **Submit** a pull request to `develop`

### **Commit Message Format**
```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 **Testing**

### **Running Tests**
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all
```

### **Test Coverage**
- **Unit Tests**: Component and utility functions
- **Integration Tests**: Feature workflows
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Rendering and calculation benchmarks

## 📚 **Documentation**

### **Code Documentation**
- **JSDoc**: Function and component documentation
- **TypeScript**: Self-documenting type definitions
- **README**: Component usage examples

### **User Documentation**
- **User Guide**: Feature tutorials and workflows
- **API Docs**: Integration and extension guides
- **Video Tutorials**: Visual learning resources

## 🔧 **Tools & Technologies**

### **Core Technologies**
- **React 18** - Component architecture
- **TypeScript** - Type safety
- **Three.js** - 3D rendering
- **Tauri** - Desktop framework
- **Tailwind CSS** - Styling

### **Development Tools**
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message validation

## 🎯 **Feature Requests**

### **Submitting Ideas**
1. **Check Existing Issues**: Search for similar requests
2. **Use Templates**: Fill out the feature request template
3. **Provide Context**: Describe your use case and requirements
4. **Technical Details**: Include implementation suggestions

### **Evaluation Criteria**
- **User Impact**: How many users would benefit?
- **Technical Feasibility**: Can it be implemented with current architecture?
- **Maintenance Cost**: Long-term support and complexity
- **Strategic Alignment**: Does it fit our product vision?

## 🐛 **Bug Reports**

### **Reporting Bugs**
1. **Reproduce**: Provide steps to reproduce the issue
2. **Environment**: Include OS, browser, and version information
3. **Logs**: Attach console logs and error messages
4. **Screenshots**: Visual evidence of the problem

### **Bug Priority**
- **Critical**: App crashes or data loss
- **High**: Major functionality broken
- **Medium**: Feature partially broken
- **Low**: Minor annoyances or edge cases

## 📞 **Getting Help**

### **Community Support**
- **GitHub Discussions**: General questions and community chat
- **Discord**: Real-time community support
- **Stack Overflow**: Technical questions (tag: `cellforge`)

### **Professional Support**
- **Enterprise Support**: Priority response for commercial users
- **Custom Development**: Bespoke features and integrations
- **Training**: Professional training and consulting

## 📋 **Code of Conduct**

### **Our Standards**
- **Respectful Communication**: Be kind and constructive
- **Inclusive Language**: Welcome all contributors
- **Professional Discourse**: Keep discussions technical and focused
- **Collaborative Spirit**: Help others learn and grow

### **Unacceptable Behavior**
- Harassment or discrimination
- Offensive language or content
- Personal attacks or threats
- Spam or off-topic content

## 📄 **License**

By contributing to CellForge, you agree that your contributions will be licensed under the same MIT License that covers the project.

## 🙏 **Acknowledgment**

Contributors will be acknowledged in:
- **CHANGELOG.md**: Release notes and credits
- **Contributors File**: GitHub's contributor insights
- **Documentation**: Special mentions for major contributions

---

**Thank you for contributing to CellForge!** Together, we're building the future of battery design. 🔋⚡