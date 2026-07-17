import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

change_status_regex = re.compile(r"  const handleActionChangeStatus = \(\) => \{[\s\S]*?showToast\('✅ Status alterado', 'success'\);\n  \};")

new_change_status = """  const handleActionChangeStatus = async () => {
    if (!actionMenuFuncId) return;
    const isCurrentlyPresent = presencas[actionMenuFuncId] || false;
    const newStatus = !isCurrentlyPresent;
    
    // Optimistic UI update
    setPresencas(prev => ({ ...prev, [actionMenuFuncId]: newStatus }));
    
    // If it's already a saved record, update the backend immediately
    if (isAdmin && savedRecords[actionMenuFuncId]) {
      try {
        setSaving(true);
        const now = new Date().toISOString();
        await api.salvarPresencas([{
          funcionario_id: actionMenuFuncId,
          obra_id: funcionarios.find(f => f.id === actionMenuFuncId)?.obra_id,
          data: selectedDate,
          presente: newStatus,
          photo_taken_at: now,
          photo_taken_by: usuario?.id || null
        }]);
      } catch (err: any) {
        // Revert on error
        setPresencas(prev => ({ ...prev, [actionMenuFuncId]: isCurrentlyPresent }));
        setErro('Erro ao alterar status no servidor.');
        showToast('❌ Erro ao alterar status', 'error');
        setSaving(false);
        setActionMenuFuncId(null);
        return;
      } finally {
        setSaving(false);
      }
    }
    
    setSavedSuccess(false);
    setActionMenuFuncId(null);
    showToast('✅ Status atualizado', 'success');
  };"""

content = change_status_regex.sub(new_change_status, content)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
