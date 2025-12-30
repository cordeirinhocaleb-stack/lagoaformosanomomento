
/**
 * SERVIÇO DE INTEGRAÇÃO YOUTUBE DATA API V3
 * Responsável pelo upload de vídeos para o canal oficial da Rede Welix Duarte
 */

export const uploadVideoToYouTube = async (file: File, accessToken: string) => {
  if (!accessToken) throw new Error("Acesso ao Google não autorizado para YouTube.");

  // 1. Inicializar metadados do vídeo
  const metadata = {
    snippet: {
      title: `LFNM - Reportagem - ${new Date().toLocaleDateString()}`,
      description: 'Vídeo enviado via Painel Administrativo Lagoa Formosa No Momento.',
      categoryId: '25' // News & Politics
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false
    }
  };

  // 2. Iniciar Upload Resumível (Melhor para vídeos grandes)
  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': file.size.toString(),
      'X-Upload-Content-Type': file.type
    }),
    body: JSON.stringify(metadata)
  });

  if (!initRes.ok) throw new Error("Não foi possível iniciar o upload no YouTube.");
  
  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) throw new Error("URL de upload não fornecida pelo Google.");

  // 3. Transmissão dos bytes do vídeo
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: new Headers({ 'Content-Type': file.type }),
    body: file
  });

  if (!uploadRes.ok) throw new Error("Falha ao enviar o arquivo de vídeo.");
  
  const data = await uploadRes.json();
  const videoId = data.id;

  // 4. Retorna URL de Embed pronta para o player do site
  return `https://www.youtube.com/embed/${videoId}`;
};
