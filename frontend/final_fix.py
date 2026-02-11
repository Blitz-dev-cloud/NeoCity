import os

path = r'd:\NeoCity\frontend\src\app\grievance\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Remove unused disable at line 112 (approx)
    # Be strict: if line is exactly the comment and next line is readContract, skip it?
    # Or just remove it if found?
    # Using content match is safer.
    if '// eslint-disable-next-line @typescript-eslint/no-explicit-any' in line:
        # Check if next line is readContract
        if i+1 < len(lines) and 'const grievanceData = (await readContract' in lines[i+1]:
            print(f"Removing unused disable at line {i+1}")
            continue # Skip adding this line

    # Fix fetchedGrievances
    if 'const fetchedGrievances: any[] = [];' in line:
        if 'eslint-disable' not in line: # Avoid double disable if any
             indent = line[:len(line) - len(line.lstrip())]
             new_lines.append(indent + '// eslint-disable-next-line @typescript-eslint/no-explicit-any\n')
             print(f"Adding disable for fetchedGrievances at line {i+1}")
    
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
