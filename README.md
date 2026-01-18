# CellForge - 3D Battery Pack Designer

A professional 3D battery pack design application built with React, Three.js, and Tauri. Create, analyze, and export battery pack configurations with real electrical engineering capabilities.

## Features

- **3D Design Interface**: Professional CAD-like 3D viewport with orbit controls
- **Electrical Analysis**: Real-time calculation of voltage, capacity, and current
- **Component Library**: Extensive database of battery cells and components
- **Export Capabilities**: STL and 3MF export for 3D printing
- **Cross-Platform**: Desktop app (Tauri) with web deployment option

## Deployment Options

### Desktop Application (Primary)
```bash
npm install
npm run tauri dev  # Development
npm run tauri build  # Production build
```

### Web Application (Vercel)
The application can also run as a web application with mock data:
```bash
npm install
npm run build  # Web build
npm run preview  # Preview locally
```

Deploy to Vercel:
1. Push to GitHub repository
2. Connect repository to Vercel
3. Vercel will automatically build and deploy using the `vercel.json` configuration

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
