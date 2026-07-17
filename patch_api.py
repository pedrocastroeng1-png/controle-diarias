import re

with open('src/lib/api.ts', 'r') as f:
    content = f.read()

new_import = "import { supabase } from './supabase';\nimport bcrypt from 'bcryptjs';\n"
content = content.replace("import { supabase } from './supabase';", new_import)

new_login = """  login: async (usuario: string, senha: string): Promise<Usuario | null> => {
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
  },"""

content = re.sub(r'  login: async \(usuario: string, senha: string\): Promise<Usuario \| null> => \{.*?    return data;\n  \},', new_login, content, flags=re.DOTALL)

with open('src/lib/api.ts', 'w') as f:
    f.write(content)
