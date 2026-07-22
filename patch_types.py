import re
with open("frontend/src/types/index.ts", "r") as f:
    content = f.read()
content = content.replace("citations?: Citation[]", "citations?: Citation[]\n  context_json?: { citations?: Citation[], traces?: any[] }")
with open("frontend/src/types/index.ts", "w") as f:
    f.write(content)
