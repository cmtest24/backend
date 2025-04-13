const { exec } = require('child_process');
const process = require('process');

// Redis server startup
exec('redis-server --daemonize yes', (error) => {
  if (error) {
    console.error('Failed to start Redis server:', error);
    return;
  }
  console.log('Redis server started successfully');
  
  // Run NestJS application
  const nestProcess = exec('npx ts-node-dev --respawn src/main.ts', {
    stdio: 'inherit'
  });
  
  nestProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  nestProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  nestProcess.on('exit', (code) => {
    console.log(`NestJS process exited with code ${code}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping Redis and NestJS...');
    exec('redis-cli shutdown');
    nestProcess.kill();
    process.exit();
  });
});