import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

content = content.replace("funcionario_id: cameraModalFuncId,", "funcionario_id: cameraModalFuncId,\n                              obra_id: funcionarios.find(f => f.id === cameraModalFuncId)?.obra_id,")

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
