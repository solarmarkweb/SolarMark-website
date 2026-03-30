import requests
import json

try:
    response = requests.get("http://localhost:8001/api/site-photos")
    if response.status_code == 200:
        photos = response.json()
        print(f"Total photos: {len(photos)}")
        for p in photos:
            print(f"Category: {p.get('category')}, URL: {p.get('url')}")
    else:
        print(f"Failed with status: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
