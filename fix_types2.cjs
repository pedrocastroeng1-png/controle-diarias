const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

code = code.replace(/CommunicationRead/g, 'CommunicationRecipient');

fs.writeFileSync('src/lib/types.ts', code);
