
/**
 * SERVIÇO DE INTEGRAÇÃO GOOGLE DRIVE
 * Responsável por upload e gestão de permissões para links diretos
 */

export const uploadFileToDrive = async (file: File, accessToken: string) => {
  if (!accessToken) throw new Error("Acesso ao Google não autorizado.");

  // 1. Metadados do Arquivo
  const metadata = {
    name: `lfnm_${Date.now()}_${file.name}`,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  // 2. Upload Multipart
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  });

  if (!response.ok) throw new Error("Falha no upload para o Drive.");
  const data = await response.json();
  const fileId = data.id;

  // 3. Tornar o arquivo público (necessário para o site exibir)
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: new Headers({ 
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
    }),
  });

  // 4. Retorna link de renderização direta (lh3)
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};
