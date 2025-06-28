import requests

# ScreenConnect API configuration
SCREENCONNECT_URL = "https://buckeyeit.screenconnect.com"
API_KEY = "736793fd-468c-4a6d-a11a-7c00ad0173a5"

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Accept': 'application/json',
}

def test_rest_api():
    print("=== ScreenConnect REST API Test ===\n")
    # 1. List session groups
    print("1. Listing session groups...")
    try:
        url = f"{SCREENCONNECT_URL}/api/v1/session-groups"
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"   Status Code: {resp.status_code}")
        if resp.status_code == 200:
            groups = resp.json()
            print(f"   ✅ Found {len(groups)} session groups:")
            for g in groups[:5]:
                print(f"      - {g.get('name', 'Unknown')} (ID: {g.get('id', 'N/A')})")
            if len(groups) > 5:
                print(f"      ... and {len(groups)-5} more")
        else:
            print(f"   ❌ Error: {resp.text}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    # 2. List sessions
    print("\n2. Listing sessions...")
    try:
        url = f"{SCREENCONNECT_URL}/api/v1/sessions"
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"   Status Code: {resp.status_code}")
        if resp.status_code == 200:
            sessions = resp.json()
            print(f"   ✅ Found {len(sessions)} sessions:")
            for s in sessions[:5]:
                print(f"      - {s.get('name', 'Unknown')} (Group: {s.get('sessionGroupName', 'N/A')})")
            if len(sessions) > 5:
                print(f"      ... and {len(sessions)-5} more")
        else:
            print(f"   ❌ Error: {resp.text}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_rest_api() 