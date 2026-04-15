import re

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def check_range(start_line, end_line):
    content = "".join(lines[start_line-1:end_line])
    opens = re.findall(r'<div(?![^>]*/>)', content)
    closes = re.findall(r'</div>', content)
    return len(opens), len(closes)

print(f"Dashboard (796-897): {check_range(796, 897)}")
print(f"Reports (898-1005): {check_range(898, 1005)}")
print(f"Bookings (1006-1288): {check_range(1006, 1288)}")
print(f"Contact (1290-1362): {check_range(1290, 1362)}")
print(f"Upload (1363-1494): {check_range(1363, 1494)}")
