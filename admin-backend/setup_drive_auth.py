import os
import json
import sys
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    if not os.path.exists('credentials.json'):
        print("Error: credentials.json not found.")
        return

    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    
    try:
        # port=0 allows the library to pick any available port
        creds = flow.run_local_server(port=0, open_browser=False)
        
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
        print("✅ token.json has been created/updated.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
