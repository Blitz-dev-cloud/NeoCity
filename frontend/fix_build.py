import os

path = r'd:\NeoCity\frontend\src\app\traffic\page.tsx'

try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed = False
    for i, line in enumerate(lines):
        if 'functionName: "getAllZones" as any' in line:
            # Check if likely already fixed to avoid double insert
            # Look ahead a few lines
            next_lines = ''.join(lines[i+1:i+5])
            if '}))' in next_lines:
                print("Likely already fixed.")
                break
            
            print(f"Found target at line {i+1}")
            # Insert the closing tokens
            # maintain indentation of 'const zones' which is 8 spaces
            indent = ' ' * 8
            lines.insert(i+1, indent + '})) as any;\n')
            fixed = True
            break

    if fixed:
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("File updated successfully.")
    else:
        print("Target line not found or already fixed.")

except Exception as e:
    print(f"Error: {e}")
