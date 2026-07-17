import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

salvar_func = """
  const handleConfirmSalvar = async () => {
    setShowConfirm(false);
    setSaving(true);
    setErro('');
    
    try {
      const now = new Date().toISOString();
      const userId = usuario?.id || null;
      
      const registrosToSave = await Promise.all(funcionarios.map(async (f) => {
        let photo_path = undefined;
        let photo_taken_at = undefined;
        let photo_taken_by = undefined;
        
        if (presencas[f.id]) {
           if (!capturedFotos[f.id]) {
              throw new Error(`Falta foto de presença para ${f.nome}`);
           }
           photo_path = await api.uploadAttendancePhoto(capturedFotos[f.id], f.id);
           photo_taken_at = now;
           photo_taken_by = userId;
        }
        
        return {
          funcionario_id: f.id,
          obra_id: f.obra_id,
          data: selectedDate,
          presente: presencas[f.id] || false,
          ...(photo_path && { photo_path, photo_taken_at, photo_taken_by })
        };
      }));

      await api.salvarPresencas(registrosToSave);
      setShowSuccessDialog(true);
    } catch (error: any) {
      setErro(error.message || 'Ocorreu um erro ao salvar a lista de presenças.');
    } finally {
      setSaving(false);
    }
  };
"""

content = re.sub(r'const handleConfirmSalvar = async \(\) => \{.*?finally \{\n      setSaving\(false\);\n    \}\n  \};', salvar_func, content, flags=re.DOTALL)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
