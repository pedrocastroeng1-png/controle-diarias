const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

code = code.replace(/getCommunicationReads/g, 'getCommunicationRecipients');
code = code.replace(/CommunicationRead/g, 'CommunicationRecipient');

fs.writeFileSync('src/pages/admin/Communications.tsx', code);
