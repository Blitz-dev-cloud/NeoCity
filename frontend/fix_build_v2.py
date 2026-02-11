import os

path = r'd:\NeoCity\frontend\src\app\traffic\page.tsx'

try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed = False
    for i, line in enumerate(lines):
        if 'getAllZones' in line:
            print(f"Checking line {i+1}: {line.strip()[:50]}...")
            if 'functionName' in line:
                # Check neighbors
                next_slice = lines[i+1:i+5]
                next_text = ''.join(next_slice)
                if '}))' in next_text:
                    print("Already closed with }))")
                    continue
                
                print(f"Found target at line {i+1}. Inserting fix.")
                
                indent = ' ' * 8 
                lines.insert(i+1, indent + '})) as string[];\n\n')
                fixed = True
                break

    if fixed:
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("File updated successfully.")
    else:
        print("Target not found or no fix needed.")

except Exception as e:
    print(f"Error: {e}")
