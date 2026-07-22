const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

const regex = /\/\/ Check communications if operator[\s\S]*?\} else \{\s*setReadingComms\(false\);\s*\}/;
code = code.replace(regex, "");

// Replace the getUnreadMandatoryCommunications in case it's still somewhere
code = code.replace(/api\.getUnreadMandatoryCommunications/g, "api.getUnreadCommunications");

// If readingComms is used elsewhere, let's remove it
code = code.replace(/if \(readingComms\) \{[\s\S]*?\}\s*if \(loading\)/, "if (loading)");

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
