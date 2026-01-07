
/**
 * SERVIÇO DE INTEGRAÇÃO GOOGLE DRIVE API V3
 * Upload e gestão de permissões para renderização pública de imagens
 */

export const uploadFileToDrive = async (file: File, accessToken: string) => {
  if (!accessToken) {throw new Error("Acesso ao Google não autorizado.");}

  // 1. Metadados do Arquivo
  const metadata = {
    name: `lfnm_img_${Date.now()}_${file.name}`,
    mimeType: file.type,
    description: 'Imagem enviada via Portal Lagoa Formosa No Momento'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  // 2. Executar Upload
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Falha no upload para o Drive.");
  }
  
  const data = await response.json();
  const fileId = data.id;

  // 3. Definir Permissão Pública (Essencial para que a imagem apareça no site para os leitores)
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

  // 4. Retorna link direto via proxy do Google que evita bloqueios de Cross-Origin
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};
