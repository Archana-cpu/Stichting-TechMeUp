#!/usr/bin/env node

// ============================================================================
// SEQUENCES - CROSS-PLATFORM ONE COMMAND STARTER
// ============================================================================

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const rootDir = path.resolve(__dirname, '..');

function log(emoji, message, color = '') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color] || ''}${emoji} ${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      stdio: 'pipe',
      ...options,
    }).toString().trim();
  } catch (error) {
    return null;
  }
}

function startDockerDesktop() {
  if (!isWindows) {
    log('❌', 'Auto-start Docker Desktop is only supported on Windows', 'red');
    return false;
  }

  log('🐳', 'Starting Docker Desktop...', 'cyan');

  // Common Docker Desktop paths on Windows
  const dockerPaths = [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Docker', 'Docker', 'Docker Desktop.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Docker', 'Docker Desktop.exe'),
  ];

  const dockerExe = dockerPaths.find(p => fs.existsSync(p));

  if (!dockerExe) {
    log('❌', 'Docker Desktop executable not found', 'red');
    return false;
  }

  try {
    // Start Docker Desktop
    const child = spawn(dockerExe, [], { 
      detached: true, 
      stdio: 'ignore',
      shell: false 
    });
    child.unref();
    
    log('⏳', 'Waiting for Docker to start (max 120 seconds)...', 'yellow');
    
    // Wait for Docker to be ready
    const maxWait = 120;
    for (let i = 0; i < maxWait; i++) {
      sleep(1);
      
      const dockerInfo = exec('docker info');
      if (dockerInfo) {
        console.log(''); // New line after waiting message
        log('✅', 'Docker Desktop is now running!', 'green');
        return true;
      }
      
      process.stdout.write(`   Still waiting... ${i + 1}/${maxWait} seconds\r`);
    }
    
    console.log(''); // New line after waiting message
    log('❌', 'Docker Desktop took too long to start', 'red');
    return false;
  } catch (error) {
    console.log(''); // New line after waiting message
    log('❌', `Failed to start Docker Desktop: ${error.message}`, 'red');
    return false;
  }
}

function installDockerInstructions() {
  console.log('');
  log('📦', 'Docker Installation Guide', 'cyan');
  console.log('');
  
  if (isWindows) {
    log('🪟', 'Windows Installation:', 'yellow');
    console.log('   1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop');
    console.log('   2. Run the installer');
    console.log('   3. Restart your computer');
    console.log('   4. Run this command again: pnpm start');
    console.log('');
    log('⚡', 'Quick Install (PowerShell as Admin):', 'cyan');
    console.log('   winget install Docker.DockerDesktop');
  } else if (os.platform() === 'darwin') {
    log('🍎', 'macOS Installation:', 'yellow');
    console.log('   1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop');
    console.log('   2. Drag Docker.app to Applications');
    console.log('   3. Open Docker from Applications');
    console.log('   4. Run this command again: pnpm start');
    console.log('');
    log('⚡', 'Quick Install (Homebrew):', 'cyan');
    console.log('   brew install --cask docker');
  } else {
    log('🐧', 'Linux Installation:', 'yellow');
    console.log('   1. Visit: https://docs.docker.com/engine/install/');
    console.log('   2. Follow instructions for your distribution');
    console.log('   3. Run this command again: pnpm start');
    console.log('');
    log('⚡', 'Quick Install (Ubuntu/Debian):', 'cyan');
    console.log('   curl -fsSL https://get.docker.com -o get-docker.sh');
    console.log('   sudo sh get-docker.sh');
  }
  console.log('');
}

function checkDocker() {
  const dockerVersion = exec('docker --version');
  if (!dockerVersion) {
    log('❌', 'Docker is not installed!', 'red');
    installDockerInstructions();
    process.exit(1);
  }

  const dockerRunning = exec('docker info');
  if (!dockerRunning) {
    log('⚠️', 'Docker is not running. Attempting to start Docker Desktop...', 'yellow');
    
    const started = startDockerDesktop();
    if (!started) {
      log('❌', 'Failed to start Docker Desktop automatically.', 'red');
      console.log('');
      log('💡', 'Please start Docker Desktop manually and try again.', 'yellow');
      process.exit(1);
    }
  } else {
    log('✅', 'Docker is available', 'green');
  }
}

function createEnvFile() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    log('✅', '.env file exists', 'green');
    return;
  }

  log('📝', 'Creating .env file...', 'yellow');
  
  const randomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const envContent = `# Auth
AUTH_SECRET=${randomString(32)}
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Google OAuth (optional for development)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Database (handled by Docker)
DATABASE_URL=postgresql://sequences:sequences@localhost:5432/sequences
DIRECT_URL=postgresql://sequences:sequences@localhost:5432/sequences
`;

  fs.writeFileSync(envPath, envContent);
  log('✅', '.env file created', 'green');
}

function checkContainersRunning() {
  const result = exec('docker compose ps --format json');
  if (!result) return false;
  
  try {
    const containers = result.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    const allRunning = containers.length > 0 && containers.every(c => c.State === 'running');
    return allRunning;
  } catch {
    return false;
  }
}

function stopExistingContainers() {
  const running = checkContainersRunning();
  if (running) {
    log('🔄', 'Containers already running, restarting...', 'yellow');
  } else {
    log('🛑', 'Stopping existing containers...', 'yellow');
  }
  exec('docker compose down --remove-orphans');
}

function startServices() {
  // Check if containers are already running
  const alreadyRunning = checkContainersRunning();
  
  if (alreadyRunning) {
    log('✅', 'Containers already running!', 'green');
    log('💡', 'Use "pnpm restart" to rebuild, or "pnpm stop" to stop', 'cyan');
    return;
  }
  
  // Check if images exist
  const imagesExist = exec('docker images sequences-web -q');
  
  if (imagesExist) {
    log('🚀', 'Starting services (using existing images)...', 'yellow');
    try {
      execSync('docker compose up -d', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      log('❌', 'Failed to start services, trying rebuild...', 'yellow');
      buildAndStart();
    }
  } else {
    log('🔨', 'Building and starting services (first time)...', 'yellow');
    buildAndStart();
  }
}

function buildAndStart() {
  try {
    execSync('docker compose up -d --build', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch (error) {
    log('❌', 'Failed to start Docker services', 'red');
    process.exit(1);
  }
}

function sleep(seconds) {
  try {
    if (isWindows) {
      execSync(`powershell -Command "Start-Sleep -Seconds ${seconds}"`, { stdio: 'ignore' });
    } else {
      execSync(`sleep ${seconds}`, { stdio: 'ignore' });
    }
  } catch (e) {
    // Fallback to busy wait
    const start = Date.now();
    while (Date.now() - start < seconds * 1000) {}
  }
}

function waitForDatabase() {
  log('⏳', 'Waiting for database...', 'yellow');
  
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    const result = exec('docker compose exec -T db pg_isready -U sequences');
    if (result && result.includes('accepting connections')) {
      console.log(''); // New line
      log('✅', 'Database is ready', 'green');
      return;
    }
    retries++;
    process.stdout.write(`   Attempt ${retries}/${maxRetries}\r`);
    sleep(1);
  }
  
  console.log(''); // New line
  log('⚠️', 'Database health check timed out', 'yellow');
}

function runMigrations() {
  log('🗃️', 'Running migrations and seeding database...', 'yellow');
  
  try {
    execSync('docker compose exec -T web sh -c "npx prisma db push --accept-data-loss && npx prisma db seed"', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch {
    log('⚠️', 'Migration might have already been applied', 'yellow');
  }
}

function waitForApp() {
  log('🏥', 'Checking application health...', 'yellow');
  
  const maxRetries = 60;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = exec('curl -s http://localhost:3000/api/health');
      if (result && result.includes('healthy')) {
        console.log(''); // New line
        log('✅', 'Application is healthy', 'green');
        return;
      }
    } catch {}
    
    retries++;
    process.stdout.write(`   Waiting for app... ${retries}/${maxRetries}\r`);
    sleep(2);
  }
  
  console.log(''); // New line
  log('⚠️', 'Health check timed out, app may still be starting', 'yellow');
}

function openBrowser() {
  const url = 'http://localhost:3000';
  const command = isWindows ? `start ${url}` : os.platform() === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  
  try {
    exec(command);
  } catch {}
}

function showSuccess() {
  console.log('');
  log('✅', '==============================================', 'green');
  log('✅', 'Sequences is running!', 'green');
  log('✅', '==============================================', 'green');
  console.log('');
  log('🌐', 'App:      http://localhost:3000', 'cyan');
  log('📊', 'Database: postgresql://sequences:sequences@localhost:5432/sequences', 'cyan');
  console.log('');
  log('📚', 'Commands:', 'yellow');
  console.log('   docker compose logs -f    # View logs');
  console.log('   docker compose down       # Stop all services');
  console.log('   docker compose restart    # Restart services');
  console.log('');
}

async function main() {
  console.log('');
  log('🚀', 'Starting Sequences...', 'cyan');
  console.log('');

  checkDocker();
  createEnvFile();
  
  // Check if already running
  const alreadyRunning = checkContainersRunning();
  
  if (alreadyRunning) {
    log('✅', 'Services are already running!', 'green');
    
    // Quick health check
    const healthCheck = exec('curl -s http://localhost:3000/api/health');
    if (healthCheck && healthCheck.includes('healthy')) {
      showSuccess();
      openBrowser();
      return;
    } else {
      log('⚠️', 'Services running but app not healthy, restarting...', 'yellow');
      stopExistingContainers();
    }
  } else {
    stopExistingContainers();
  }
  
  startServices();
  waitForDatabase();
  runMigrations();
  waitForApp();
  showSuccess();
  openBrowser();
}

main().catch((error) => {
  log('❌', `Error: ${error.message}`, 'red');
  process.exit(1);
});
