const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Helper: Check if file exists and is executable
function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK | fs.constants.X_OK);
    return true;
  } catch (e) {
    return false;
  }
}

// 1. System Info API Endpoint
app.get('/api/system-info', (req, res) => {
  const homeDir = os.homedir();
  const localBin = path.join(homeDir, '.local', 'bin');
  
  const status = {
    os: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    cpu: os.cpus()[0]?.model || 'Unknown CPU',
    username: os.userInfo().username,
    home: homeDir,
    pathEnv: process.env.PATH,
    binInPath: process.env.PATH?.includes(localBin) || false,
    components: {
      core: {
        installed: isExecutable(path.join(localBin, 'antigravity')),
        path: path.join(localBin, 'antigravity')
      },
      ide: {
        installed: isExecutable(path.join(localBin, 'antigravity-ide')),
        path: path.join(localBin, 'antigravity-ide')
      },
      cli: {
        installed: isExecutable(path.join(localBin, 'agy')) || isExecutable(path.join(localBin, 'antigravity-cli')),
        path: path.join(localBin, 'agy')
      }
    }
  };
  
  res.json(status);
});

// 2. Real-Time SSE Log Streaming Endpoint
app.get('/api/install/stream', (req, res) => {
  const { components, scope, simulated } = req.query;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx, etc.)

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  logMessage('Initialising installation process...');
  
  // Build arguments
  const args = [];
  if (components) {
    args.push('--components', components);
  }
  if (scope) {
    args.push('--scope', scope);
  }
  if (simulated === 'true') {
    args.push('--simulated');
  }

  logMessage(`Spawning command: ./install.sh ${args.join(' ')}`);

  const installScript = path.join(__dirname, 'install.sh');
  if (!fs.existsSync(installScript)) {
    sendEvent('error', { message: 'Installation engine install.sh not found!' });
    res.end();
    return;
  }

  // Spawn the bash installer script
  const child = spawn('/bin/bash', [installScript, ...args], {
    cwd: __dirname,
    env: { ...process.env, FORCE_COLOR: '1' } // Force color triggers
  });

  function logMessage(msg, isError = false) {
    sendEvent('log', { message: msg, error: isError });
  }

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (!line) return;
      logMessage(line);

      // Parse step markers and send structural progress events to the client
      if (line.includes('Detecting system environment')) {
        sendEvent('step', { id: 'env', status: 'active', percent: 10 });
      } else if (line.includes('Architecture detected')) {
        sendEvent('step', { id: 'env', status: 'done', percent: 20 });
      } else if (line.includes('Fetching official brand guidelines') || line.includes('releases API')) {
        sendEvent('step', { id: 'resolve', status: 'active', percent: 30 });
      } else if (line.includes('Official brand icons downloaded') || line.includes('Latest available version')) {
        sendEvent('step', { id: 'resolve', status: 'done', percent: 45 });
      } else if (line.includes('Downloading')) {
        sendEvent('step', { id: 'download', status: 'active', percent: 60 });
      } else if (line.includes('Download complete')) {
        sendEvent('step', { id: 'download', status: 'done', percent: 75 });
      } else if (line.includes('Extracting') || line.includes('Copying')) {
        sendEvent('step', { id: 'extract', status: 'active', percent: 80 });
      } else if (line.includes('Extraction complete') || line.includes('installed successfully')) {
        sendEvent('step', { id: 'extract', status: 'done', percent: 90 });
      } else if (line.includes('Integrating desktop application')) {
        sendEvent('step', { id: 'shortcut', status: 'active', percent: 95 });
      } else if (line.includes('desktop shortcuts registered')) {
        sendEvent('step', { id: 'shortcut', status: 'done', percent: 98 });
      } else if (line.includes('Installation Completed')) {
        sendEvent('step', { id: 'finish', status: 'done', percent: 100 });
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line) {
        logMessage(line, true);
      }
    });
  });

  child.on('close', (code) => {
    logMessage(`Installer process exited with code ${code}`);
    sendEvent('exit', { code });
    res.end();
  });

  // If client closes the request, kill the installation script
  req.on('close', () => {
    if (!child.killed) {
      logMessage('Client disconnected. Terminating installation process.');
      child.kill('SIGTERM');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` Antigravity Installation Server Started!`);
  console.log(` Access dashboard at: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
