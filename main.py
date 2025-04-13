import os
import sys
import requests
import subprocess
from flask import Flask, request, jsonify, redirect

app = Flask(__name__)

# Start NestJS server
def start_nest_server():
    try:
        # Start Redis
        subprocess.Popen(['redis-server', '--daemonize', 'yes'])
        print("Redis server started")
    except Exception as e:
        print(f"Error starting Redis: {e}")

    try:
        # Start NestJS using ts-node-dev in a separate process
        process = subprocess.Popen(['node', 'nest-entrypoint.js'])
        print(f"Started NestJS server with PID {process.pid}")
    except Exception as e:
        print(f"Error starting NestJS server: {e}")

# Define API endpoint
NEST_API_URL = "http://localhost:8000"

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "name": "Đông Y Pharmacy API",
        "version": "1.0.0",
        "description": "API backend cho hệ thống Đông Y Pharmacy",
        "api": "/api",
        "docs": "/api/docs"
    })

@app.route('/api/docs', methods=['GET'])
def api_docs():
    return redirect(f"{NEST_API_URL}/api/docs")

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy_api(path):
    try:
        # Forward the request to the NestJS server
        url = f"{NEST_API_URL}/api/{path}"
        
        # Forward all headers
        headers = {key: value for key, value in request.headers if key != 'Host'}
        
        # Forward the request with the same method, headers, and body
        resp = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.get_data(),
            cookies=request.cookies,
            params=request.args,
            allow_redirects=False,
        )
        
        # Return the response from the NestJS server
        response_headers = [(name, value) for name, value in resp.headers.items()]
        return resp.content, resp.status_code, response_headers
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "NestJS service unavailable", "message": "API server is starting up or not responding"}), 503

if __name__ == '__main__':
    start_nest_server()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))