import re

with open("frontend/src/services/chatService.ts", "r") as f:
    chat = f.read()
chat = chat.replace("context_json?: { citations?: Citation[] };", "context_json?: { citations?: Citation[], traces?: any[] };")
with open("frontend/src/services/chatService.ts", "w") as f:
    f.write(chat)
