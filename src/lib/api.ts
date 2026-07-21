import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

import { Usuario, Obra, Funcao, Funcionario, Presenca, AtestadoMedico } from './types';

export const api = {

  // Communications
  getCommunications: async (): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario), target_operator:usuarios!target_operator_id(id, usuario)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getUnreadMandatoryCommunications: async (operatorId: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const today = new Date().toISOString().split('T')[0];
    
    // Get all mandatory communications that are active, not expired, and target this operator or ALL
    const { data: comms, error: commsError } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario)')
      .eq('is_active', true)
      .eq('priority', 'MANDATORY');
      
    if (commsError) throw commsError;
    
    const validComms = (comms || []).filter(c => {
      // Check expiration
      if (c.expiration_date && c.expiration_date < today) return false;
      // Check audience
      if (c.target_audience === 'SPECIFIC' && c.target_operator_id !== operatorId) return false;
      return true;
    });
    
    if (validComms.length === 0) return [];
    
    // Now check which ones have been read
    const { data: reads, error: readsError } = await supabase
      .from('communication_recipients')
      .select('communication_id')
      .eq('operator_id', operatorId)
      .in('communication_id', validComms.map(c => c.id));
      
    if (readsError) throw readsError;
    
    const readIds = new Set((reads || []).map(r => r.communication_id));
    return validComms.filter(c => !readIds.has(c.id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  
  getCommunicationRecipients: async (communicationId: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communication_recipients')
      .select('*, operator:usuarios!operator_id(id, usuario)')
      .eq('communication_id', communicationId)
      .order('read_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createCommunication: async (payload: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateCommunication: async (id: string, payload: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteCommunication: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  markCommunicationAsRead: async (communicationId: string, operatorId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('communication_recipients')
      .insert([{ communication_id: communicationId, operator_id: operatorId }]);
    if (error) throw error;
  },

  getOperators: async (): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario')
      .eq('perfil', 'OPERADOR')
      .eq('ativo', true);
    if (error) throw error;
    return data || [];
  },

  // Usuarios
  login: async (usuario: string, senha: string): Promise<Usuario | null> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario, perfil, senha')
      .eq('usuario', usuario)
      .eq('ativo', true)
      .single();

    if (error || !data) {
      throw new Error('Usuário ou senha inválidos.');
    }

    const { senha: passwordHash, ...userData } = data;
    
    let isValid = false;
    if (passwordHash && (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$'))) {
      isValid = await bcrypt.compare(senha, passwordHash);
    } else {
      isValid = senha === passwordHash;
    }

    if (!isValid) {
      throw new Error('Usuário ou senha inválidos.');
    }

    return userData;
  },

  // Obras
  getObras: async (): Promise<Obra[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('obras').select('*').eq('ativo', true).order('nome');
    if (error) throw error;
    return data;
  },
  createObra: async (obra: Omit<Obra, 'id'>): Promise<Obra> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('obras').insert([obra]).select().single();
    if (error) throw error;
    return data;
  },
  updateObra: async (id: string, obra: Partial<Obra>): Promise<Obra> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('obras').update(obra).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteObra: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.from('obras').update({ ativo: false }).eq('id', id);
    if (error) throw error;
  },

  // Funcoes
  getFuncoes: async (): Promise<Funcao[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('funcoes').select('*').eq('ativo', true).order('nome');
    if (error) throw error;
    return data;
  },
  createFuncao: async (funcao: Omit<Funcao, 'id'>): Promise<Funcao> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('funcoes').insert([funcao]).select().single();
    if (error) throw error;
    return data;
  },
  updateFuncao: async (id: string, funcao: Partial<Funcao>): Promise<Funcao> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('funcoes').update(funcao).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteFuncao: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.from('funcoes').update({ ativo: false }).eq('id', id);
    if (error) throw error;
  },

  // Funcionarios
  getFuncionarios: async (status: 'ativos' | 'inativos' | 'todos' = 'ativos'): Promise<Funcionario[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    let query = supabase
      .from('funcionarios')
      .select(`*, funcao:funcoes(*), obra:obras(*)`)
      .order('nome');

    if (status === 'ativos') {
      query = query.eq('ativo', true);
    } else if (status === 'inativos') {
      query = query.eq('ativo', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as any;
  },
  createFuncionario: async (funcionario: Omit<Funcionario, 'id' | 'funcao' | 'obra'>): Promise<Funcionario> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('funcionarios').insert([funcionario]).select().single();
    if (error) throw error;
    return data as any;
  },
  updateFuncionario: async (id: string, funcionario: Partial<Funcionario>): Promise<Funcionario> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.from('funcionarios').update(funcionario).eq('id', id).select().single();
    if (error) throw error;
    return data as any;
  },
  deleteFuncionario: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.from('funcionarios').update({ ativo: false }).eq('id', id);
    if (error) throw error;
  },
  getFuncionariosPorObra: async (obra_id: string): Promise<Funcionario[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('funcionarios')
      .select(`*, funcao:funcoes(*), obra:obras(*)`)
      .eq('obra_id', obra_id)
      .eq('ativo', true)
      .order('nome');
    if (error) throw error;
    return data as any;
  },

  // Presencas
  getPresencas: async (data: string, obra_id?: string): Promise<Presenca[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    let query = supabase
      .from('presencas')
      .select(`*, funcionario:funcionarios!inner(*, funcao:funcoes(*), obra:obras(*))`)
      .eq('data', data);
      
    if (obra_id) {
      query = query.eq('obra_id', obra_id);
    }
    
    const { data: presencas, error } = await query;
    if (error) throw error;
    return presencas as any;
  },
  deletePresencaFuncionario: async (funcionario_id: string, data: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.from('presencas').delete().eq('funcionario_id', funcionario_id).eq('data', data);
    if (error) throw error;
  },

  salvarPresencas: async (presencas: Array<any>): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('presencas')
      .upsert(presencas, { onConflict: 'funcionario_id,data' });
    if (error) throw error;
  },

  getRelatorio: async (dataInicial?: string, dataFinal?: string, obraId?: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    let query = supabase
      .from('vw_relatorio_presencas')
      .select('*')
      .order('data', { ascending: false });

    if (dataInicial) {
      query = query.gte('data', dataInicial);
    }
    if (dataFinal) {
      query = query.lte('data', dataFinal);
    }
    if (obraId) {
      // Obras are filtered by name since the view has 'obra' column
      query = query.eq('obra', obraId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data as any;
  },

  // Storage
  
  uploadPhoto: async (bucket: string, file: File | Blob, prefix: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${prefix}_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) {
       console.error("Storage upload error:", error);
       throw error;
    }
    return data.path;
  },

  uploadEmployeePhoto: async (file: File, employeeId: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file, { upsert: true });

    if (error) {
       console.error("Storage upload error:", error);
       throw error;
    }
    return data.path;
  },

  uploadAttendancePhoto: async (file: Blob, employeeId: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${employeeId}_${timestamp}.jpg`;
    const { data, error } = await supabase.storage
      .from('attendance-photos')
      .upload(fileName, file, { contentType: 'image/jpeg' });

    if (error) throw error;
    return data.path;
  },

  getPhotoUrl: async (bucket: 'employee-photos' | 'attendance-photos' | 'medical-certificates', path: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  // Auditoria
  getAuditoriaPresencas: async (funcionario_id: string): Promise<Presenca[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    
    // Get presences from last 15 days with photo
    const quinzeDiasAtras = new Date();
    quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
    const dataLimite = quinzeDiasAtras.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('presencas')
      .select(`*, funcionario:funcionarios!inner(*, funcao:funcoes(*), obra:obras(*))`)
      .eq('funcionario_id', funcionario_id)
      .not('photo_path', 'is', null)
      .gte('data', dataLimite)
      .order('data', { ascending: false });

    if (error) throw error;
    return data as any;
  },


  getDashboardStats: async (hoje: string) => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { count: obrasCount } = await supabase.from('obras').select('*', { count: 'exact', head: true }).eq('ativo', true);
    const { count: funcionariosCount } = await supabase.from('funcionarios').select('*', { count: 'exact', head: true }).eq('ativo', true);
    
    const { data: presencasHoje, error } = await supabase.from('vw_relatorio_presencas').select('status, valor_diaria').eq('data', hoje);
    if (error) throw error;

    let presentesHoje = 0;
    let faltasHoje = 0;
    let valorTotalHoje = 0;

    presencasHoje?.forEach(p => {
      if (p.status === 'PRESENTE') {
        presentesHoje++;
        valorTotalHoje += Number(p.valor_diaria || 0);
      } else {
        faltasHoje++;
      }
    });

    return {
      totalObras: obrasCount || 0,
      totalFuncionarios: funcionariosCount || 0,
      presentesHoje,
      faltasHoje,
      valorTotalHoje
    };
  },

  // Atestados
  getAtestados: async (): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('medical_certificates')
      .select('*, funcionario:funcionarios(*)');
    if (error) throw error;
    return data;
  },
  
  createAtestado: async (atestado: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('medical_certificates')
      .insert([atestado])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  updateAtestado: async (id: string, atestado: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('medical_certificates')
      .update(atestado)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  deleteAtestado: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('medical_certificates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  
  getActiveAtestadosForDate: async (dateStr: string): Promise<any[]> => {
    // dateStr format: YYYY-MM-DD
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('medical_certificates')
      .select('*, funcionario:funcionarios(*)')
      .lte('start_date', dateStr)
      .gte('end_date', dateStr);
    if (error) throw error;
    return data || [];
  },

};
