import sys

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    # renderContact fix
    if i + 1 == 1357 and '</div>' in line:
        # Check if it's the right line
        if '1292' in "".join(lines[1290:1360]): 
             new_lines.insert(-1, '            </div>\n')
    # Main return fix
    if i + 1 == 1950 and '</div>' in line:
        new_lines.insert(-1, '            </div>\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
