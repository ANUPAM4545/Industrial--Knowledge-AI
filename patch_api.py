with open("frontend/src/lib/api.ts", "r") as f:
    api = f.read()

# Revert to HeadersInit
api = api.replace("const headers: Record<string, string> = {", "const headers: HeadersInit = {")
api = api.replace("headers['Authorization']", "(headers as Record<string, string>)['Authorization']")
api = api.replace("headers['X-Workspace-ID']", "(headers as Record<string, string>)['X-Workspace-ID']")

with open("frontend/src/lib/api.ts", "w") as f:
    f.write(api)
