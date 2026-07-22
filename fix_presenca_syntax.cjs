const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// The file is currently completely messed up around line 60.
// Let's replace the broken structure.
const brokenBlockRegex = /try \{\s*\} catch \(e\) \{\s*console\.error\("Error loading communications", e\);\s*setReadingComms\(false\);\s*\/\/\s*Fallback\s*\}\s*\} else \{\s*setReadingComms\(false\);\s*\}/g;

code = code.replace(brokenBlockRegex, "");

// also search for setReadingComms(false); and setUnreadComms
code = code.replace(/setReadingComms\(.*?\);/g, "");
code = code.replace(/setUnreadComms\(.*?\);/g, "");

// find other if (loading)
// Let's check what else is broken.
fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
