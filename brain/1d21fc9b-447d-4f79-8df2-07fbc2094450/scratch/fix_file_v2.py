import sys

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Indices to remove (adjusted for previous insertions if I use line numbers)
# 896, 1286, 1360

new_lines = []
for i, line in enumerate(lines):
    if i + 1 == 896:
        continue
    if i + 1 == 1286:
        continue
    if i + 1 == 1360:
        continue
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
