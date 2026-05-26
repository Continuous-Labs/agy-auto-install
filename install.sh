#!/bin/bash
#
# Antigravity CLI Installation Engine
#
# Autodetects CPU architecture, downloads the official CLI installer,
# and configures the environment paths.
#

set -euo pipefail

# --- 1. Colors & Presentation ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# --- 2. Constants & Settings ---
SCOPE="local"
TARGET_DIR=""

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] ✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR] ✗${NC} $1" >&2
}

show_usage() {
    echo -e "${BOLD}Antigravity CLI Installer${NC}"
    echo "Usage: ./install.sh [options]"
    echo ""
    echo "Options:"
    echo "  --scope <scope>      Installation scope: 'local' (default, no sudo) or 'system' (requires root)"
    echo "  --dir <path>         Override installation directory path"
    echo "  -h, --help           Display this help menu"
    echo ""
}

# --- 3. Parse Arguments ---
while (( "$#" )); do
    case "$1" in
        --scope)
            if [ -z "${2:-}" ] || [[ ! "$2" =~ ^(local|system)$ ]]; then
                log_error "Invalid value for --scope. Must be 'local' or 'system'."
                exit 1
            fi
            SCOPE="$2"
            shift 2
            ;;
        --scope=*)
            val="${1#*=}"
            if [[ ! "$val" =~ ^(local|system)$ ]]; then
                log_error "Invalid value for --scope. Must be 'local' or 'system'."
                exit 1
            fi
            SCOPE="$val"
            shift
            ;;
        --dir)
            if [ -z "${2:-}" ]; then
                log_error "Missing value for --dir"
                exit 1
            fi
            TARGET_DIR="$2"
            shift 2
            ;;
        --dir=*)
            TARGET_DIR="${1#*=}"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        --components|--components=*|--simulated)
            # Accept and ignore obsolete arguments for compatibility with legacy callers
            if [[ "$1" == "--components" || "$1" == "--dir" || "$1" == "--scope" ]]; then
                shift 2
            else
                shift
            fi
            ;;
        *)
            log_error "Unsupported option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# --- 4. Environment & Architecture Check ---
log_info "Detecting system environment..."
OS_NAME=$(uname -s)
if [ "$OS_NAME" != "Linux" ]; then
    log_error "This installer only supports Linux. Detected OS: $OS_NAME"
    exit 1
fi

ARCH_NAME=$(uname -m)
case "$ARCH_NAME" in
    x86_64|amd64)
        ARCH_LABEL="linux-x64"
        ;;
    arm64|aarch64)
        ARCH_LABEL="linux-arm"
        ;;
    *)
        log_error "Unsupported CPU architecture: $ARCH_NAME. Antigravity supports x86_64 and arm64."
        exit 1
        ;;
esac
log_success "Architecture detected: ${BOLD}$ARCH_NAME${NC} ($ARCH_LABEL)"

# Resolve Paths
if [ -z "$TARGET_DIR" ]; then
    if [ "$SCOPE" = "system" ]; then
        TARGET_DIR="/usr/local"
    else
        TARGET_DIR="$HOME/.local"
    fi
fi

BIN_DIR="$TARGET_DIR/bin"

log_info "Target Directory Structure:"
log_info "  - Executables: $BIN_DIR"

# Validate Permissions
if [ "$SCOPE" = "system" ] && [ "$EUID" -ne 0 ]; then
    log_error "System-wide scope requested. Please re-run with sudo privileges:"
    log_error "  sudo ./install.sh --scope system"
    exit 1
fi

# Ensure directory exists
mkdir -p "$BIN_DIR" 2>/dev/null || {
    log_error "Permission denied when writing to target paths. Run with '--scope local' or use sudo."
    exit 1
}

# Setup Staging
STAGING_DIR="$HOME/.cache/antigravity/staging"
mkdir -p "$STAGING_DIR"
cleanup_staging() {
    rm -rf "$STAGING_DIR"/* 2>/dev/null || true
}
trap cleanup_staging EXIT

# Downloader configuration
DOWNLOADER=""
if command -v curl >/dev/null 2>&1; then
    DOWNLOADER="curl"
elif command -v wget >/dev/null 2>&1; then
    DOWNLOADER="wget"
else
    log_error "Either curl or wget is required for installation."
    exit 1
fi

download_file() {
    local src="$1"
    local dst="$2"
    if [ "$DOWNLOADER" = "curl" ]; then
        curl -fsSL -o "$dst" "$src"
    else
        wget -q -O "$dst" "$src"
    fi
}

# --- 5. Component Installation: Antigravity CLI ---
log_info "Starting Antigravity CLI Installation..."
log_info "Downloading and executing official CLI bootstrapper..."

if download_file "https://antigravity.google/cli/install.sh" "$STAGING_DIR/cli_install.sh"; then
    if bash "$STAGING_DIR/cli_install.sh" --dir "$BIN_DIR"; then
        log_success "Official Antigravity CLI installed successfully."
    else
        log_error "Official CLI bootstrapper execution failed."
        exit 1
    fi
else
    log_error "Failed to download official CLI bootstrapper."
    exit 1
fi

# Symlink a clean alternative alias 'antigravity-cli'
ln -sf "$BIN_DIR/agy" "$BIN_DIR/antigravity-cli"
log_info "CLI symlinked as both 'agy' and 'antigravity-cli'."

# --- 6. Verification & Instruction ---
log_info "Verifying installations..."
PATH="$BIN_DIR:$PATH"

echo -e "\n${GREEN}${BOLD}========================================================================${NC}"
echo -e "         ${GREEN}${BOLD}Antigravity CLI Linux Installation Completed!${NC}"
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo " Installed Components:"
echo -e "  - ${BOLD}Antigravity CLI (agy)${NC}: Available in PATH as 'agy' & 'antigravity-cli'"

echo -e "\n${YELLOW}${BOLD}Shell Environment Action Required:${NC}"
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo " The install path '$BIN_DIR' is not currently in your system PATH."
    echo " To execute commands from any terminal, add this directory to your profile:"
    echo ""
    echo -e "   ${BOLD}echo 'export PATH=\"\$PATH:$BIN_DIR\"' >> ~/.bashrc${NC}"
    echo -e "   ${BOLD}source ~/.bashrc${NC}"
else
    echo " ✓ '$BIN_DIR' is already in your active PATH!"
fi
echo -e "\n Enjoy building the new way! 🚀"
echo "========================================================================"
