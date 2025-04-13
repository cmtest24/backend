const { spawn } = require('child_process');
const process = require('process');

console.log('Starting NestJS server...');

// Skip Redis for development
console.log('Note: Redis is disabled for development. Using memory cache instead.');

// Run NestJS application with proper I/O redirection
const nestProcess = spawn('npx', ['ts-node-dev', '--respawn', 'src/main.ts'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

// Handle stdout and stderr properly
nestProcess.stdout.on('data', (data) => {
  console.log(`[NestJS] ${data.toString().trim()}`);
});

nestProcess.stderr.on('data', (data) => {
  console.error(`[NestJS-ERR] ${data.toString().trim()}`);
});

nestProcess.on('error', (error) => {
  console.error('Failed to start NestJS process:', error);
});

nestProcess.on('exit', (code) => {
  console.log(`NestJS process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping NestJS...');
  nestProcess.kill();
  process.exit();
});

// Keep the process running
process.stdin.resume();