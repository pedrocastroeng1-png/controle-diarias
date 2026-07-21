const fs = require('fs');
let code = fs.readFileSync('database_sync.sql', 'utf8');

const triggerSql = `
-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_medical_certificates_updated_at ON public.medical_certificates;
CREATE TRIGGER update_medical_certificates_updated_at
    BEFORE UPDATE ON public.medical_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communications_updated_at ON public.communications;
CREATE TRIGGER update_communications_updated_at
    BEFORE UPDATE ON public.communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

code = code + '\n' + triggerSql;
fs.writeFileSync('database_sync.sql', code);
