with open('src/lib/types.ts', 'r') as f:
    c = f.read()
c = c.replace("  photo_device?: string;\n  photo_uploaded?: boolean;", "")
with open('src/lib/types.ts', 'w') as f:
    f.write(c)
