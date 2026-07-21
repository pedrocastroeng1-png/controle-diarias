const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

const newTypes = `
export type TargetAudience = 'ALL' | 'SPECIFIC';
export type Priority = 'NORMAL' | 'MANDATORY';
export type CommunicationType = 'INFO' | 'ATTENTION' | 'URGENT' | 'EMPLOYEE' | 'WORKSITE' | 'MATERIAL' | 'MEDICAL_CERTIFICATE';

export interface Communication {
  id: string;
  title: string;
  message: string;
  type: CommunicationType;
  priority: Priority;
  expiration_date?: string;
  target_audience: TargetAudience;
  target_operator_id?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: Usuario;
  target_operator?: Usuario;
}

export interface CommunicationRead {
  id: string;
  communication_id: string;
  operator_id: string;
  read_at: string;
  operator?: Usuario;
}
`;

code = code + '\n' + newTypes;
fs.writeFileSync('src/lib/types.ts', code);
