import re

# 1. api.ts
with open("frontend/src/lib/api.ts", "r") as f:
    api = f.read()
api = api.replace("const headers: HeadersInit = {", "const headers: Record<string, string> = {")
with open("frontend/src/lib/api.ts", "w") as f:
    f.write(api)

# 2. uiStore.ts
with open("frontend/src/store/uiStore.ts", "r") as f:
    ui = f.read()
if "workspaceMode:" not in ui.split("UIState {")[1].split("}")[0]:
    ui = ui.replace("developerMode: boolean", "developerMode: boolean\n  workspaceMode: 'empty' | 'demo' | 'live'")
with open("frontend/src/store/uiStore.ts", "w") as f:
    f.write(ui)

# 3. Check ChatPage.tsx to see if traces error is gone since we updated types/index.ts
