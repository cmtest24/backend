import os
import sys
import subprocess
import logging
import time
from flask import Flask, request, jsonify, redirect

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Start NestJS server
def start_nest_server():
    logger.info("Starting NestJS backend server...")
    
    try:
        # Set PORT environment variable for NestJS
        nestjs_env = os.environ.copy()
        nestjs_env['PORT'] = '8000'
        
        # Log database environment variables (not their values)
        logger.debug("Database environment variables passed to NestJS:")
        for key in ['PGHOST', 'DATABASE_URL', 'PGPASSWORD', 'PGUSER', 'PGPORT', 'PGDATABASE']:
            if key in nestjs_env:
                logger.debug(f"  {key}: [secret]")
        
        logger.debug("Starting NestJS via Node.js")
        process = subprocess.Popen(
            ['node', 'start-nest.js'], 
            env=nestjs_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        logger.info(f"Started NestJS server with PID {process.pid}")
        
        # Create a logging function that runs in a separate thread
        import threading
        def log_output():
            while process.poll() is None:  # While process is running
                stdout_line = process.stdout.readline() if process.stdout else ""
                if stdout_line:
                    logger.info(f"[NestJS] {stdout_line.strip()}")
                stderr_line = process.stderr.readline() if process.stderr else ""
                if stderr_line:
                    logger.error(f"[NestJS-ERR] {stderr_line.strip()}")
            
            # Log exit code when process terminates
            exit_code = process.poll()
            logger.warning(f"NestJS process exited with code {exit_code}")
            
            # Capture any remaining output
            remaining_stdout, remaining_stderr = process.communicate()
            if remaining_stdout:
                logger.info(f"[NestJS-Final] {remaining_stdout}")
            if remaining_stderr:
                logger.error(f"[NestJS-Final-ERR] {remaining_stderr}")
        
        # Start logging in a separate thread
        log_thread = threading.Thread(target=log_output)
        log_thread.daemon = True
        log_thread.start()
        
        # Wait a bit for NestJS to start
        logger.info("Waiting for NestJS server to initialize...")
        time.sleep(5)
    except Exception as e:
        logger.exception(f"Error starting NestJS server: {e}")

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

@app.route('/api', defaults={'path': ''})
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy_api(path):
    try:
        # Forward the request to the NestJS server
        url = f"{NEST_API_URL}/api/{path}"
        logger.debug(f"Proxying request to: {url}")
        
        # Forward all headers
        import requests
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
            timeout=10,  # Add timeout to avoid hanging requests
        )
        
        logger.debug(f"NestJS response: status={resp.status_code}")
        
        # Return the response from the NestJS server
        response_headers = [(name, value) for name, value in resp.headers.items()]
        return resp.content, resp.status_code, response_headers
    except requests.exceptions.ConnectionError:
        logger.error("Connection error when connecting to NestJS server")
        return jsonify({
            "error": "NestJS service unavailable", 
            "message": "API server is starting up or not responding",
            "status": "error"
        }), 503
    except requests.exceptions.Timeout:
        logger.error("Timeout when connecting to NestJS server")
        return jsonify({
            "error": "Request timeout", 
            "message": "API server took too long to respond",
            "status": "error"
        }), 504
    except Exception as e:
        logger.exception(f"Error proxying request: {str(e)}")
        return jsonify({
            "error": "Proxy error", 
            "message": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    start_nest_server()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))