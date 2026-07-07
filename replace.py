import os
import glob

replacements = {
    'bg-[#0B0F19]': 'bg-[var(--bg-primary)]',
    'bg-[#080B14]': 'bg-[var(--bg-primary)]',
    'text-white': 'text-[var(--text-primary)]',
    'border-white/10': 'border-[var(--border-subtle)]',
    'border-white/5': 'border-[var(--border-subtle)]',
    'bg-white/[0.03]': 'bg-[var(--bg-glass)]',
    'bg-white/[0.02]': 'bg-[var(--bg-glass-hover)]',
    'bg-white/[0.01]': 'bg-[var(--bg-glass-hover)]',
    'text-slate-400': 'text-[var(--text-secondary)]',
    'text-slate-500': 'text-[var(--text-muted)]',
    'text-slate-300': 'text-[var(--text-primary)]',
    'bg-[#0d1117]': 'bg-[var(--bg-primary)]',
    'bg-[#161b22]': 'bg-[var(--bg-glass)]',
}

files = glob.glob('frontend/src/components/marketing/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(file, 'w') as f:
            f.write(content)
        print(f"Updated {file}")
