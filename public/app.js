// Antigravity Installer Client Controller
document.addEventListener('DOMContentLoaded', () => {
  
  // State Storage
  const state = {
    os: 'Linux',
    arch: 'x64',
    scope: 'local',
    installedStatus: { cli: false }
  };

  // DOM Elements
  const sections = {
    welcome: document.getElementById('step-welcome'),
    config: document.getElementById('step-config'),
    installing: document.getElementById('step-installing'),
    completed: document.getElementById('step-completed')
  };

  const welcomeBtns = {
    toConfig: document.getElementById('btn-to-config')
  };

  const configBtns = {
    back: document.getElementById('btn-back-to-welcome'),
    trigger: document.getElementById('btn-trigger-install')
  };

  const activeControls = {
    chkCli: document.getElementById('chk-cli'),
    abort: document.getElementById('btn-abort-install'),
    restart: document.getElementById('btn-restart'),
    copyCode: document.getElementById('btn-copy-code')
  };

  const sseElements = {
    terminal: document.getElementById('terminal-logs'),
    clearTerm: document.getElementById('btn-term-clear'),
    progressBar: document.getElementById('master-progress'),
    progressText: document.getElementById('progress-text'),
    progressPercent: document.getElementById('progress-percent'),
    profileCodeBlock: document.getElementById('profile-code-block')
  };

  let eventSource = null;

  // --- 1. Inline Icons Injection ---
  injectIcons();

  // --- 2. Environment Auto-detection ---
  querySystemEnvironment();

  // --- 3. Setup Navigation & Button Handlers ---
  welcomeBtns.toConfig.addEventListener('click', () => {
    transitionStep('config');
  });

  configBtns.back.addEventListener('click', () => {
    transitionStep('welcome');
  });

  configBtns.trigger.addEventListener('click', () => {
    triggerInstallationPipeline();
  });

  activeControls.abort.addEventListener('click', () => {
    abortInstallationPipeline();
  });

  activeControls.restart.addEventListener('click', () => {
    location.reload();
  });

  activeControls.copyCode.addEventListener('click', () => {
    copyCodeToClipboard();
  });

  sseElements.clearTerm.addEventListener('click', () => {
    sseElements.terminal.innerHTML = '<div class="terminal-line system-line">[SYSTEM] Terminal logs cleared.</div>';
  });

  // Setup Scope Selectors
  document.querySelectorAll('.scope-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.scope-selector button').forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');
      state.scope = activeBtn.dataset.scope;
      
      // Update PATH display block dynamically based on selection
      updatePathCodeBlock();
    });
  });

  // --- 4. Logic Implementations ---
  
  function injectIcons() {
    // Inject brand SVGs
    const cliIconContainer = document.getElementById('icon-cli');
    if (cliIconContainer) {
      cliIconContainer.innerHTML = Icons.cli;
    }
    
    // Inject list indicator base SVGs
    const indicators = ['env', 'download', 'extract'];
    indicators.forEach(id => {
      const el = document.getElementById(`ind-${id}`);
      if (el) el.innerHTML = Icons.sync;
    });
  }

  function transitionStep(targetStep) {
    Object.keys(sections).forEach(key => {
      sections[key].classList.remove('active');
    });
    sections[targetStep].classList.add('active');
  }

  function updatePathCodeBlock() {
    let pathCmd = `echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.bashrc\nsource ~/.bashrc`;
    if (state.scope === 'system') {
      pathCmd = `# System binaries are installed in /usr/local/bin (usually in PATH by default)\n# No actions required!`;
    }
    sseElements.profileCodeBlock.innerText = pathCmd;
  }

  async function querySystemEnvironment() {
    try {
      const response = await fetch('/api/system-info');
      const data = await response.json();
      
      // Update Welcome screen values
      document.getElementById('sys-os').innerText = data.os || 'Linux';
      document.getElementById('sys-arch').innerText = data.arch || 'x64';
      document.getElementById('sys-cpu').innerText = truncateText(data.cpu, 30);
      document.getElementById('sys-user').innerText = data.username || 'felix';

      state.os = data.os;
      state.arch = data.arch;

      // Update Step 2 Card status badges
      updateStatusBadge('cli', data.components.cli.installed);

      // Cache status
      state.installedStatus.cli = data.components.cli.installed;
      
    } catch (e) {
      console.error('Failed to query system configuration:', e);
      // Fallback display
      document.getElementById('sys-os').innerText = 'Linux';
      document.getElementById('sys-arch').innerText = 'x86_64';
      document.getElementById('sys-cpu').innerText = 'Intel(R) Core(TM) i7 / AMD Ryzen';
      document.getElementById('sys-user').innerText = 'Linux User';
    }
  }

  function updateStatusBadge(comp, isInstalled) {
    const badge = document.getElementById(`badge-${comp}`);
    if (badge) {
      if (isInstalled) {
        badge.innerText = 'Installed';
        badge.className = 'status-badge installed';
      } else {
        badge.innerText = 'Available';
        badge.className = 'status-badge missing';
      }
    }
  }

  function truncateText(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  }

  // Clean ANSI terminal styling characters
  function cleanAnsiColors(text) {
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return text.replace(ansiRegex, '');
  }

  // --- 5. Log Pipeline Streaming Execution ---
  
  function triggerInstallationPipeline() {
    // Reset Progress & Steps UI
    sseElements.progressBar.style.width = '0%';
    sseElements.progressPercent.innerText = '0%';
    sseElements.progressText.innerText = 'Establishing logs pipeline...';
    sseElements.terminal.innerHTML = '<div class="terminal-line system-line">[SYSTEM] Initialising real-time installer execution stream...</div>';
    
    const indicators = ['env', 'download', 'extract'];
    indicators.forEach(id => {
      const item = document.getElementById(`step-${id}`);
      const ind = document.getElementById(`ind-${id}`);
      if (item) item.className = 'check-item';
      if (ind) ind.innerHTML = Icons.sync;
    });

    transitionStep('installing');

    // Build URL parameters (legacy compatibility, only install cli component)
    const comps = 'cli';
    const scope = state.scope;
    const streamUrl = `/api/install/stream?components=${comps}&scope=${scope}`;

    // Establish EventSource pipeline
    eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('log', (e) => {
      const payload = JSON.parse(e.data);
      appendTerminalLine(payload.message, payload.error);
    });

    eventSource.addEventListener('step', (e) => {
      const payload = JSON.parse(e.data);
      updateStepIndicator(payload.id, payload.status, payload.percent);
    });

    eventSource.addEventListener('error', (e) => {
      const payload = JSON.parse(e.data);
      appendTerminalLine(`[CLIENT STREAM ERROR] ${payload.message || 'Unknown network stream fault'}`, true);
    });

    eventSource.addEventListener('exit', (e) => {
      const payload = JSON.parse(e.data);
      eventSource.close();
      eventSource = null;

      if (payload.code === 0) {
        // Success completion
        setTimeout(() => {
          transitionStep('completed');
        }, 1200);
      } else {
        // Failed process
        appendTerminalLine(`\n[FATAL] Installation halted with exit code ${payload.code}. Check log details above.`, true);
        sseElements.progressText.innerText = 'Process Aborted / Failed';
        sseElements.progressBar.style.background = 'var(--color-red)';
        sseElements.progressBar.style.boxShadow = '0 0 12px rgba(255, 51, 102, 0.4)';
      }
    });
  }

  function abortInstallationPipeline() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      appendTerminalLine('\n[CLIENT USER ACTION] Connection closed. Installation aborted by client.', true);
      sseElements.progressText.innerText = 'Process Cancelled';
      sseElements.progressBar.style.width = '0%';
      setTimeout(() => {
        transitionStep('config');
      }, 1000);
    }
  }

  function appendTerminalLine(text, isError = false) {
    const rawLine = cleanAnsiColors(text);
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line';

    // Assign text styling class based on text contents
    if (isError || rawLine.includes('[ERROR]') || rawLine.includes('Fatal:')) {
      lineDiv.classList.add('error-line');
    } else if (rawLine.includes('[SUCCESS]') || rawLine.includes('✓')) {
      lineDiv.classList.add('success-line');
    } else if (rawLine.includes('[WARNING]') || rawLine.includes('Notice:')) {
      lineDiv.classList.add('warn-line');
    } else if (rawLine.includes('[INFO]')) {
      lineDiv.classList.add('info-line');
    }

    lineDiv.innerText = rawLine;
    sseElements.terminal.appendChild(lineDiv);
    
    // Auto scroll console to bottom
    sseElements.terminal.scrollTop = sseElements.terminal.scrollHeight;
  }

  function updateStepIndicator(stepId, status, percent) {
    // Map resolve/shortcut steps to relevant CLI steps for backward compatibility with installer outputs
    let mappedStepId = stepId;
    if (stepId === 'resolve') mappedStepId = 'download';
    if (stepId === 'shortcut' || stepId === 'finish') mappedStepId = 'extract';

    const item = document.getElementById(`step-${mappedStepId}`);
    const ind = document.getElementById(`ind-${mappedStepId}`);
    
    if (item && ind) {
      if (status === 'active') {
        item.className = 'check-item active';
        ind.innerHTML = Icons.sync;
      } else if (status === 'done') {
        item.className = 'check-item done';
        ind.innerHTML = Icons.check;
      }
    }

    // Set Master progress fill bar
    sseElements.progressBar.style.width = `${percent}%`;
    sseElements.progressPercent.innerText = `${percent}%`;
    
    // Update active label status
    let label = 'Processing pipeline...';
    if (mappedStepId === 'env') label = 'Validating system target environments...';
    else if (mappedStepId === 'download') label = 'Downloading official CLI bootstrapper...';
    else if (mappedStepId === 'extract') label = 'Extracting binaries and placing executables...';
    
    sseElements.progressText.innerText = label;
  }

  // --- 6. Clipboard & Extra Utilities ---
  
  function copyCodeToClipboard() {
    const code = sseElements.profileCodeBlock.innerText;
    navigator.clipboard.writeText(code).then(() => {
      activeControls.copyCode.innerText = 'Copied!';
      activeControls.copyCode.style.borderColor = 'var(--color-green)';
      activeControls.copyCode.style.color = 'var(--color-green)';
      
      setTimeout(() => {
        activeControls.copyCode.innerText = 'Copy';
        activeControls.copyCode.style.borderColor = 'var(--border-color)';
        activeControls.copyCode.style.color = 'var(--text-secondary)';
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

});
