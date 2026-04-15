import sys

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    # renderDashboard fix
    if i + 1 == 896 and ');' in line:
        new_lines.insert(-1, '        </div>\n')
    # renderBookings fix
    if i + 1 == 1285 and ');' in line:
        new_lines.insert(-1, '            </div>\n')
    # renderContact fix
    if i + 1 == 1358 and ');' in line:
        new_lines.insert(-1, '            </div>\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
