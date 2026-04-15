import sys

file_path = 'd:/SolarMark-website/frontend/src/app/profile/page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Very primitive JSX parser
tokens = []
i = 0
while i < len(content):
    if content[i] == '<':
        if content[i+1] == '/':
            # Close tag
            end = content.find('>', i)
            tag = content[i+2:end].split()[0]
            tokens.append(('close', tag, i))
            i = end + 1
        elif content[i+1] == '!':
            # Comment
            end = content.find('-->', i)
            i = end + 3
        else:
            # Open tag
            end = content.find('>', i)
            tag_content = content[i+1:end]
            if tag_content.endswith('/'):
                # Self-closing
                pass
            else:
                tag = tag_content.split()[0]
                tokens.append(('open', tag, i))
            i = end + 1
    else:
        i += 1

stack = []
for type, tag, pos in tokens:
    if type == 'open':
        stack.append((tag, pos))
    else:
        if not stack:
            line = content.count('\n', 0, pos) + 1
            print(f"Extra closing tag </{tag}> at line {line}")
        else:
            open_tag, open_pos = stack.pop()
            if open_tag != tag:
                line = content.count('\n', 0, pos) + 1
                open_line = content.count('\n', 0, open_pos) + 1
                print(f"Mismatched tag: </{tag}> at {line} closes <{open_tag}> from {open_line}")

for tag, pos in stack:
    line = content.count('\n', 0, pos) + 1
    print(f"Unclosed tag <{tag}> at line {line}")
