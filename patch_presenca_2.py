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
      const device = navigator.userAgent;
      
      const registrosToSave = await Promise.all(funcionarios.map(async (f) => {
        let photo_path = undefined;
        let photo_taken_at = undefined;
        let photo_taken_by = undefined;
        let photo_uploaded = true;
        
        if (presencas[f.id] && capturedFotos[f.id]) {
           try {
             photo_path = await api.uploadAttendancePhoto(capturedFotos[f.id], f.id);
             photo_taken_at = now;
             photo_taken_by = userId;
           } catch (uploadError) {
             console.error('Falha ao fazer upload da foto:', uploadError);
             photo_uploaded = false;
           }
        }
        
        return {
          funcionario_id: f.id,
          obra_id: f.obra_id,
          data: selectedDate,
          presente: presencas[f.id] || false,
          ...(photo_path && { photo_path, photo_taken_at, photo_taken_by }),
          photo_device: device,
          photo_uploaded: photo_uploaded
        };
      }));

      await api.salvarPresencas(registrosToSave);
      setShowSuccessDialog(true);
    } catch (error) {
      setErro('Ocorreu um erro ao salvar a lista de presenças.');
    } finally {
      setSaving(false);
    }
  };
"""

content = re.sub(r'const handleConfirmSalvar = async \(\) => \{.*?finally \{\n      setSaving\(false\);\n    \}\n  \};', salvar_func, content, flags=re.DOTALL)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
