import os

path = r'd:\NeoCity\frontend\src\app\admin\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'const { readContract, getBlockNumber, getLogs }' in line:
        new_lines.append(line.replace('getLogs', 'getPublicClient'))
    elif 'const logs = await getLogs(config, {' in line:
        # We need to define client first.
        # But we can define it inline? No, async.
        # Better to define it before.
        # But here we are inside the loop iterating lines.
        # We can prepend the client definition.
        # "const client = getPublicClient(config);"
        indent = line[:len(line) - len(line.lstrip())]
        new_lines.append(indent + 'const client = getPublicClient(config);\n')
        new_lines.append(line.replace('getLogs(config,', 'client.getLogs('))
    else:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
