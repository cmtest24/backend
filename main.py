import os
import subprocess
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({
        "redirect": "Đông Y Pharmacy API đang chạy với NestJS tại cổng 8000. Vui lòng truy cập /api để sử dụng API."
    })

if __name__ == "__main__":
    # Khởi động NestJS trong background
    subprocess.Popen(["npx", "ts-node-dev", "--respawn", "src/main.ts"])
    # Khởi động Flask web server
    app.run(host='0.0.0.0', port=5000)