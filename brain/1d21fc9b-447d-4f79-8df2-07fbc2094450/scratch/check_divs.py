import re

def count_tags(content):
    # This is a very simple counter, doesn't handle strings correctly but might give a hint
    div_opens = len(re.findall(r'<div\b', content))
    div_closes = len(re.findall(r'</div\b', content))
    return div_opens, div_closes

with open('d:/SolarMark-website/frontend/src/app/profile/page.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Find all <div or </div
    matches = re.finditer(r'<(div|/div)\b', line)
    for m in matches:
        tag = m.group(1)
        if tag == 'div' and not line[m.start():].strip().startswith('<div />') and '/>' not in line[m.start():m.end()+10]:
            # This is flawed but let's try
            stack.append((i+1, tag))
        elif tag == '/div':
            if stack:
                stack.pop()
            else:
                print(f"Extra closing tag at line {i+1}")

print("Unclosed tags:")
for line_num, tag in stack:
    print(f"Unclosed {tag} from line {line_num}")
