// AXIOM BOOTLOADER v1.2 (Auto-Generated)
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '>>> AXIOM SYSTEMS INITIALIZING...');
const root = __dirname;
const backend = path.join(root, 'backend');

// CLEAN PORTS
try {
    execSync('for /f "tokens=5" %a in (\'netstat -aon ^| find ":3001" ^| find "LISTENING"\') do taskkill /f /pid %a >nul 2>&1');
    execSync('for /f "tokens=5" %a in (\'netstat -aon ^| find ":3000" ^| find "LISTENING"\') do taskkill /f /pid %a >nul 2>&1');
} catch (e) {}

// INSTALL CONCURRENTLY
if (!fs.existsSync(path.join(root, 'node_modules', 'concurrently'))) {
    console.log('>>> Installing Task Runner...');
    execSync('npm install concurrently --no-save', { stdio: 'ignore' });
}

// FIX PRISMA
console.log('\x1b[33m%s\x1b[0m', '>>> REPAIRING NEURAL PATHWAYS...');
try {
    // Generate the client to the new valid location
    execSync('npx prisma generate', { cwd: backend, stdio: 'inherit' });
    execSync('npx prisma db push --accept-data-loss', { cwd: backend, stdio: 'inherit' });
} catch (e) {
    console.error('!!! PRISMA FAILURE !!!'); process.exit(1);
}

// LAUNCH
console.log('\x1b[32m%s\x1b[0m', '>>> SYSTEM IGNITION...');
const runner = path.join(root, 'node_modules', '.bin', 'concurrently');
const axiom = spawn(runner, [
    '--kill-others', '--prefix', 'none', '--names', 'BRAIN,VISUAL', '--prefix-colors', 'cyan,magenta',
    `"cd backend && npm run dev"`, `"npm run dev"`
], { shell: true, stdio: 'inherit' });