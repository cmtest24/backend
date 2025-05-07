const { exec } = require('child_process');

// Lấy port từ biến môi trường hoặc sử dụng port mặc định 8080
const PORT = process.env.PORT || 8080;

console.log(`Starting server on port ${PORT}...`);

// Chạy ứng dụng từ thư mục dist
exec(`node dist/main.js`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Server output: ${stdout}`);
});
