const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Atestados.tsx', 'utf8');

// We need to add a state for the file
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [selectedFile, setSelectedFile] = useState<File | null>(null);\n  const [uploading, setUploading] = useState(false);"
);

// We need to reset the file in handleOpenModal
code = code.replace(
  "setModalOpen(true);",
  "setSelectedFile(null);\n    setModalOpen(true);"
);

// Modify handleSave to upload the file
const saveStart = code.indexOf("const handleSave = async (e: React.FormEvent) => {");
const saveEnd = code.indexOf("const handleDelete = async (id: string) => {");
let saveCode = code.substring(saveStart, saveEnd);

const replacementSaveCode = `
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.start_date || form.days < 1) return;
    
    setSaving(true);
    setUploading(true);
    try {
      let photo_path = form.photo_path;
      
      if (selectedFile) {
        // use standard upload flow
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = \`\${form.employee_id}_\${Date.now()}.\${fileExt}\`;
        
        // Let's assume api.uploadAtestadoPhoto doesn't exist yet, we will add it to api.ts or just use supabase inline.
        // Wait, we can't use supabase directly here easily unless we import it.
        // So we will call api.uploadAtestadoPhoto(selectedFile, form.employee_id)
        photo_path = await api.uploadPhoto('medical-certificates', selectedFile, form.employee_id);
      }
      
      const endDate = format(addDays(parseISO(form.start_date), form.days - 1), 'yyyy-MM-dd');
      const payload = {
        employee_id: form.employee_id,
        start_date: form.start_date,
        days: form.days,
        end_date: endDate,
        description: form.description,
        photo_path: photo_path
      };

      if (editingId) {
        await api.updateAtestado(editingId, payload);
      } else {
        await api.createAtestado(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };
`;

code = code.substring(0, saveStart) + replacementSaveCode.trim() + '\n\n  ' + code.substring(saveEnd);

// Now in the render logic, add the file input
const fileInputUI = `
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Atestado</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {form.photo_path && !selectedFile && (
                        <p className="mt-1 text-xs text-green-600">Um atestado já foi anexado. Envie outro para substituir.</p>
                      )}
                    </div>
`;

code = code.replace(
  "<div>\n                      <label className=\"block text-sm font-medium text-gray-700\">Observações (Opcional)</label>",
  fileInputUI + "\n                    <div>\n                      <label className=\"block text-sm font-medium text-gray-700\">Observações (Opcional)</label>"
);

fs.writeFileSync('src/pages/admin/Atestados.tsx', code);
