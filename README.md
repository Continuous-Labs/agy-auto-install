# Antigravity 2.0 Linux Suite Installer

A highly aesthetic, premium, and unified installation assistant designed to deploy and update the **Google Antigravity 2.0 Suite** (Core Hub, agentic IDE, and terminal-first CLI) seamlessly on Linux environments.

This installer provides a dual-interface delivery:
1. **Interactive Glassmorphism Web Dashboard**: Serves an environment auto-detection screen and streams real-time bash logs via Server-Sent Events (SSE) inside a glowing retro terminal CRT window.
2. **Standalone Portable Shell Script (`install.sh`)**: A portable command-line script matching modern standards, supporting flexible directories, scopes, and high-fidelity offline fallback mocks.

---

## ✨ Features

* **Real-Time Dynamic Version Scraper**: Automatically crawls the official `antigravity.google/download` portal and extracts the absolute latest stable versions of the Core and IDE suites in real-time from the production frontend bundle (falling back to stable pinned versions `2.0.6` and `2.0.3` in offline or sandboxed scenarios).
* **Official CLI Integration**: Dynamically executes the official cloud bootstrapper (`https://antigravity.google/cli/install.sh`) and handles folder overrides cleanly without disrupting user path configurations.
* **Official Branding Icons**: Automatically retrieves official, high-resolution branding assets from the Google project CDN to style launchers and integrations natively in Linux desktop menus.
* **Auto-Environment Detection**: Audits processor architectures (`x86_64` vs `arm64`), CPU models, usernames, and flags if installation target directories are absent from the shell `PATH` variable.
* **High-Fidelity Offline Simulator**: Automatically generates fully interactive local mock binaries in offline environments so you can test agentic CLI commands (`agy status`, `agy plan`) safely in sandboxed environments.
* **Glassmorphic UI**: High-end cyberpunk theme featuring blurred frosted-glass backdrops, neon glow highlights, micro-animated vector SVG badges, and CRT console window panels.

---

## 🚀 Setup & Execution

### Method A: Start the Interactive Web Dashboard (Recommended)

To launch the glowing installer dashboard in your local browser:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Express server**:
   ```bash
   npm start
   ```

3. **Open the browser**:
   Navigate to **[http://localhost:3000](http://localhost:3000)**. 
   
   *Select the components you want, choose your scope, and click **Install / Update Suite** to view real-time compilation pipes!*

---

### Method B: Standalone Terminal Execution

You can run the portable installer directly from your terminal session without firing up the Express server:

```bash
# 1. Make the engine script executable
chmod +x install.sh

# 2. Deploy all components locally
./install.sh --components all --scope local

# 3. Deploy specific components to a custom applications directory
./install.sh --components "core,ide" --scope local --dir "$HOME/Applications"
```

#### Available CLI Options:
* `--components <list>`: Comma-separated components to install (`core`, `ide`, `cli`, or `all`).
* `--scope <scope>`: Installation scope: `local` (default, no root credentials required) or `system` (installs to `/usr/local` and requires `sudo`).
* `--dir <path>`: Override the destination installation directory.
* `--simulated`: Skip network calls and force a high-fidelity offline mock sandbox installation.
* `-h, --help`: Display the script manual.

---

## 📁 System Integration Directories

When utilizing the recommended `--scope local` scope, the installer writes to standard Linux user folders:
* **Executables**: `~/.local/bin/` (contains `antigravity`, `antigravity-ide`, `antigravity-cli`, and `agy`).
* **Desktop Launchers**: `~/.local/share/applications/` (registers `antigravity.desktop` and `antigravity-ide.desktop` natively in your applications search menu).
* **Official Branding Assets**: `~/.local/share/antigravity/icons/` (holds color/white logo PNGs).

---

## 🛠️ Post-Installation Shell Configuration

If you install to a local directory (like `~/.local/bin` or a custom Applications folder) that is not in your current system path, append it to your active terminal profile:

```bash
# Append local binary directory to PATH in bash profile
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.bashrc
source ~/.bashrc

# For Zsh sessions:
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.zshrc
source ~/.zshrc
```
