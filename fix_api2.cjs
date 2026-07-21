const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(/communication_reads/g, 'communication_recipients');
code = code.replace(/getCommunicationReads/g, 'getCommunicationRecipients');

fs.writeFileSync('src/lib/api.ts', code);
