const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

code = code.replace(
  "export type Priority = 'NORMAL' | 'MANDATORY';",
  "export type Priority = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'MANDATORY';"
);

if (!code.includes('CommunicationAttachment')) {
  code += `\nexport interface CommunicationAttachment {
  id: string;
  communication_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}\n`;

  // Update Communication interface to include attachments
  code = code.replace(
    "  target_operator?: Usuario;\n}",
    "  target_operator?: Usuario;\n  attachments?: CommunicationAttachment[];\n}"
  );
}

fs.writeFileSync('src/lib/types.ts', code);
