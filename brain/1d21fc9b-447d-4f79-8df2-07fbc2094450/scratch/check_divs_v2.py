import re

with open('d:/SolarMark-website/frontend/src/app/profile/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Filter out self-closing divs
opens = re.findall(r'<div(?![^>]*/>)', content)
closes = re.findall(r'</div>', content)

print(f"Opens: {len(opens)}")
print(f"Closes: {len(closes)}")

# Find indices of all tags
tags = []
for m in re.finditer(r'<(div(?![^>]*/>)|/div)>', content):
    tag = m.group(1)
    if tag.startswith('div'):
        tags.append(('open', m.start()))
    else:
        tags.append(('close', m.start()))

stack = []
for type, pos in tags:
    if type == 'open':
        stack.append(pos)
    else:
        if stack:
            stack.pop()
        else:
            line = content.count('\n', 0, pos) + 1
            print(f"Extra closing tag at line {line}")

for pos in stack:
    line = content.count('\n', 0, pos) + 1
    print(f"Unclosed opening tag at line {line}")
