export type Perfil = 'ADMIN' | 'OPERADOR';

export interface Usuario {
  id: string;
  usuario: string;
  senha?: string;
  perfil: Perfil;
}

export interface Obra {
  id: string;
  nome: string;
}

export interface Funcao {
  id: string;
  nome: string;
  valor_diaria: number;
}

export interface Funcionario {
  id: string;
  nome: string;
  funcao_id: string;
  obra_id: string;
  ativo?: boolean;
  photo_path?: string;
  funcao?: Funcao;
  obra?: Obra;
}

export interface Presenca {
  id: string;
  funcionario_id: string;
  obra_id: string;
  data: string;
  presente: boolean;
  photo_path?: string;
  photo_taken_at?: string;
  photo_taken_by?: string;

  funcionario?: Funcionario;
}

export interface AtestadoMedico {
  id: string;
  employee_id: string;
  start_date: string;
  days: number;
  end_date: string;
  description?: string;
  photo_path?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  funcionario?: Funcionario;
}

export interface RelatorioPresenca {
  id: string;
  data: string;
  status: string;
  funcionario: string;
  funcao: string;
  valor_diaria: number;
  obra: string;
}


export type TargetAudience = 'ALL' | 'SPECIFIC';
export type Priority = 'NORMAL' | 'URGENT';
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
  attachments?: CommunicationAttachment[];
}

export interface CommunicationRecipient {
  id: string;
  communication_id: string;
  operator_id: string;
  read_at: string;
  operator?: Usuario;
}

export interface CommunicationAttachment {
  id: string;
  communication_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}
