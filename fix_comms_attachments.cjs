const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

// Add selectedFiles state
code = code.replace(
  "const [form, setForm] = useState({",
  "const [selectedFiles, setSelectedFiles] = useState<File[]>([]);\n  const [uploading, setUploading] = useState(false);\n  const [form, setForm] = useState({"
);

// Reset files on open modal
code = code.replace(
  "setModalOpen(true);",
  "setSelectedFiles([]);\n    setModalOpen(true);"
);

// Update save logic
const saveLogic = `
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    
    setSaving(true);
    setUploading(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
        expiration_date: form.expiration_date || null,
        target_audience: form.target_audience,
        target_operator_id: form.target_audience === 'SPECIFIC' ? form.target_operator_id : null,
        is_active: form.is_active,
        created_by: usuario?.id
      };

      let commId = editingId;

      if (editingId) {
        if (!isLocked) {
           await api.updateCommunication(editingId, payload);
        } else {
           // Can only update is_active if locked
           await api.updateCommunication(editingId, { is_active: form.is_active });
        }
      } else {
        const created = await api.createCommunication(payload);
        commId = created.id;
      }

      // Handle file uploads
      if (selectedFiles.length > 0 && commId) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = \`comm_\${commId}_\${Date.now()}.\${fileExt}\`;
          
          const filePath = await api.uploadPhoto('communication-files', file, fileName);
          
          await api.createCommunicationAttachment({
            communication_id: commId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type || 'application/octet-stream'
          });
        }
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar comunicação. ' + (err as any).message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };
`;
code = code.replace(/const handleSave = async \(e: React\.FormEvent\) => \{[\s\S]*?const handleDelete = async/m, saveLogic.trim() + "\n\n  const handleDelete = async");

// File input UI
const fileInputUI = `
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anexos (Opcional - Imagens ou PDF)</label>
                        <input
                          type="file"
                          multiple
                          disabled={isLocked}
                          accept="image/*,application/pdf"
                          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {selectedFiles.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            {selectedFiles.length} arquivo(s) selecionado(s)
                          </div>
                        )}
                      </div>
                      
                      <div className="sm:col-span-2">
                        <div className="flex items-center mt-4">
`;
code = code.replace(/<div className="flex items-center mt-4">/g, fileInputUI);

fs.writeFileSync('src/pages/admin/Communications.tsx', code);
