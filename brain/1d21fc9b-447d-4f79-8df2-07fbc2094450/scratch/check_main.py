import re

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def check_range(start_line, end_line):
    content = "".join(lines[start_line-1:end_line])
    opens = re.findall(r'<div(?![^>]*/>)', content)
    closes = re.findall(r'</div>', content)
    return len(opens), len(closes)

print(f"Main Return (1496-1954): {check_range(1496, 1954)}")
