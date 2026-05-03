import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def print_header(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def make_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Token {token}"
    
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        start_time = time.time()
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            elapsed = time.time() - start_time
            print(f"[SUCCESS] {method} {endpoint} ({status}) [{elapsed:.2f}s]")
            if body:
                print(json.dumps(json.loads(body), indent=2))
            return json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"[FAILURE] {method} {endpoint} ({e.code})")
        if body:
            try:
                print(json.dumps(json.loads(body), indent=2))
            except json.JSONDecodeError:
                print(body)
        return None
    except urllib.error.URLError as e:
        print(f"[ERROR] Could not connect to server: {e.reason}")
        return None
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return None

def main():
    print_header("1. Testing Login & Getting Token")
    login_data = {
        "username": "eshan",
        "password": "12345678"
    }
    login_resp = make_request("POST", "/login/", data=login_data)
    
    if not login_resp or "token" not in login_resp:
        print("\n[FAILED] Failed to get auth token. Stopping tests.")
        return
        
    token = login_resp["token"]
    print(f"\n[INFO] Token acquired: {token}")
    
    print_header("2. Testing /api/me/")
    make_request("GET", "/me/", token=token)
    
    print_header("3. Testing /api/history/ (Before Generation)")
    make_request("GET", "/history/", token=token)
    
    print_header("4. Testing /api/generate/")
    generate_data = {
        "prompt": "Explain AI in simple words"
    }
    make_request("POST", "/generate/", data=generate_data, token=token)
    
    print_header("5. Testing /api/history/ (After Generation)")
    make_request("GET", "/history/", token=token)

if __name__ == "__main__":
    main()
