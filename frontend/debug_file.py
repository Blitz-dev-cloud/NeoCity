import os

path = r'd:\NeoCity\frontend\src\app\traffic\page.tsx'

try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'getAllZones' in line:
            print(f"Line {i+1}: {repr(line)}")

except Exception as e:
    print(f"Error: {e}")
