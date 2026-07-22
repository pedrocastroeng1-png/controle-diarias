const fs = require('fs');
let code = fs.readFileSync('src/components/CommunicationViewer.tsx', 'utf8');

code = code.replace(/MANDATORY/g, 'URGENT');

fs.writeFileSync('src/components/CommunicationViewer.tsx', code);
