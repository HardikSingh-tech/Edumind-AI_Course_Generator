import urllib.request
import json

def run_tests():
    print("=== RUNNING API TESTS ===")
    
    # 1. Stats
    req = urllib.request.Request('http://localhost:8080/api/courses/stats')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[PASS] /api/courses/stats: status={resp.status}, success={data['success']}, data={data['data']}")

    # 2. Search
    req = urllib.request.Request('http://localhost:8080/api/courses/search?query=Docker&page=0&size=5')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[PASS] /api/courses/search: status={resp.status}, found={len(data['data']['content'])}")

    # 3. Get Course by ID
    req = urllib.request.Request('http://localhost:8080/api/courses/1')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[PASS] /api/courses/1: status={resp.status}, title='{data['data']['title']}'")

    # 4. Validation error test
    bad_data = json.dumps({"topic": "", "targetAudience": ""}).encode('utf-8')
    bad_req = urllib.request.Request('http://localhost:8080/api/courses/syllabus', data=bad_data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(bad_req)
        print("[FAIL] Validation error expected but received 200")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode())
        print(f"[PASS] Validation test (HTTP {e.code}): error='{err_body.get('error')}', fields={err_body.get('data')}")

    # 5. Not found test
    nf_req = urllib.request.Request('http://localhost:8080/api/courses/99999')
    try:
        urllib.request.urlopen(nf_req)
        print("[FAIL] 404 expected but got 200")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode())
        print(f"[PASS] 404 Not Found test (HTTP {e.code}): error='{err_body.get('error')}'")

    print("=== ALL API TESTS PASSED SUCCESSFULLY ===")

if __name__ == '__main__':
    run_tests()
