-- Migration para o Controle de Diárias

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario text UNIQUE NOT NULL,
  senha text NOT NULL,
  perfil text NOT NULL CHECK (perfil IN ('ADMIN', 'OPERADOR'))
);

CREATE TABLE IF NOT EXISTS obras (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL
);

CREATE TABLE IF NOT EXISTS funcoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  valor_diaria numeric(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS funcionarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  funcao_id uuid REFERENCES funcoes(id) ON DELETE RESTRICT,
  obra_id uuid REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presencas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id uuid REFERENCES funcionarios(id) ON DELETE CASCADE,
  data date NOT NULL,
  presente boolean NOT NULL DEFAULT false,
  UNIQUE(funcionario_id, data)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_funcionarios_obra ON funcionarios(obra_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data);
CREATE INDEX IF NOT EXISTS idx_presencas_funcionario ON presencas(funcionario_id);

-- Inserir usuários padrão
INSERT INTO usuarios (usuario, senha, perfil) VALUES
('Pedro', '13052008', 'ADMIN'),
('Carlos', '123456', 'OPERADOR'),
('Junior', '123456', 'OPERADOR')
ON CONFLICT (usuario) DO NOTHING;

-- Adicionando colunas de controle e soft delete
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE obras ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE obras ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE obras ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE funcoes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE funcoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE funcoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE presencas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE presencas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE presencas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Function to auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_funcoes_updated_at BEFORE UPDATE ON funcoes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_presencas_updated_at BEFORE UPDATE ON presencas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
