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
  funcao?: Funcao;
  obra?: Obra;
}

export interface Presenca {
  id: string;
  funcionario_id: string;
  obra_id: string;
  data: string;
  presente: boolean;
  funcionario?: Funcionario;
}

export interface RelatorioPresenca {
  id: string;
  funcionario_id: string;
  obra_id: string;
  data: string;
  presente: boolean;
  funcionario_nome: string;
  funcao_nome: string;
  valor_diaria: number;
  obra_nome: string;
}
