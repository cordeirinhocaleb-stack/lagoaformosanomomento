
/**
 * SERVIÇO DE INTEGRAÇÃO CLOUDINARY (OTIMIZADO)
 */

import { SystemSettings } from '../types';
import {
  emitActivity,
  makeId,
  getCurrentUserNameSafe
} from './activityNotifications';
import { loadCloudinarySettings } from './settingsService';
import { getSupabase } from './core/supabaseClient';

// Credenciais de Fallback (Apenas para evitar crash, mas geralmente falham para uploads reais se não configuradas)
const DEFAULT_CLOUD_NAME = 'demo';
const DEFAULT_UPLOAD_PRESET = 'docs_upload_example_us_preset';

export const uploadToCloudinary = async (
  file: File,
  folderPath?: string,
  uploadContext: string = 'geral'
): Promise<string> => {
  // 1. Tenta carregar configurações do banco de dados (com fallback para localStorage)
  const cloudinaryConfig = await loadCloudinarySettings();

  // Fallback: tenta localStorage se o banco não retornou nada
  let settings: SystemSettings | null = null;
  if (!cloudinaryConfig) {
    const savedSettings = localStorage.getItem('lfnm_system_settings');
    try { if (savedSettings) { settings = JSON.parse(savedSettings); } } catch (e) { }
  }

  const isVideo = file.type.startsWith('video/');

  // 2. Define credenciais (Prioridade: Banco > localStorage > Padrão)
  let cloudName = DEFAULT_CLOUD_NAME;
  let uploadPreset = DEFAULT_UPLOAD_PRESET;

  // Usa configurações do banco se disponíveis
  if (cloudinaryConfig) {
    if (isVideo && cloudinaryConfig.videos?.cloudName && cloudinaryConfig.videos?.uploadPreset) {
      cloudName = cloudinaryConfig.videos.cloudName;
      uploadPreset = cloudinaryConfig.videos.uploadPreset;
    } else if (!isVideo && cloudinaryConfig.images?.cloudName && cloudinaryConfig.images?.uploadPreset) {
      cloudName = cloudinaryConfig.images.cloudName;
      uploadPreset = cloudinaryConfig.images.uploadPreset;
    } else {
      // Fallback para legacy se específico não existir
      cloudName = cloudinaryConfig.cloudName || DEFAULT_CLOUD_NAME;
      uploadPreset = cloudinaryConfig.uploadPreset || DEFAULT_UPLOAD_PRESET;
    }
  } else if (settings?.cloudinary) {
    // Fallback para localStorage se banco não disponível
    if (isVideo && settings.cloudinary.videos?.cloudName && settings.cloudinary.videos?.uploadPreset) {
      cloudName = settings.cloudinary.videos.cloudName;
      uploadPreset = settings.cloudinary.videos.uploadPreset;
    } else if (!isVideo && settings.cloudinary.images?.cloudName && settings.cloudinary.images?.uploadPreset) {
      cloudName = settings.cloudinary.images.cloudName;
      uploadPreset = settings.cloudinary.images.uploadPreset;
    } else {
      cloudName = settings.cloudinary.cloudName || DEFAULT_CLOUD_NAME;
      uploadPreset = settings.cloudinary.uploadPreset || DEFAULT_UPLOAD_PRESET;
    }
  }

  const activityId = makeId('upload');
  const userName = getCurrentUserNameSafe();
  const startTime = Date.now();
  const fileTypeLabel = isVideo ? 'vídeo' : 'imagem';

  // Gera ID público limpo e organizado
  const cleanUserName = userName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanContext = uploadContext.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const uniqueSuffix = Date.now().toString().slice(-4);
  const customPublicId = `${cleanUserName}_${dateStr}_${cleanContext}_${uniqueSuffix}`;

  const safeFolder = (folderPath || 'lfnm_cms/geral').toLowerCase();

  // Emite notificação inicial
  emitActivity({
    id: activityId, kind: 'upload', status: 'pending', userName,
    action: `Upload de ${fileTypeLabel}`, detail: `${uploadContext} • ${file.name}`,
    timestamp: startTime, progress: 0, elapsedMs: 0
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;

    xhr.open('POST', url);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('public_id', customPublicId);
    formData.append('folder', safeFolder);

    // Monitoramento de Progresso
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        emitActivity({
          id: activityId, kind: 'upload', status: 'pending', userName,
          action: `Upload de ${fileTypeLabel}`, detail: `${uploadContext} • ${file.name}`,
          timestamp: startTime, progress: percent, elapsedMs: Date.now() - startTime
        });
      }
    };

    // Função de tratamento de erro centralizada
    const handleError = (msg: string) => {
      let finalMessage = msg;

      console.error(`❌ Cloudinary Upload Error: ${msg} | CloudName: ${cloudName} | Preset: ${uploadPreset}`);

      // Tradução de erros comuns do Cloudinary
      if (msg.toLowerCase().includes('upload_preset') || msg.toLowerCase().includes('preset') || msg.includes('401')) {
        finalMessage = `ERRO DE PERMISSÃO (${isVideo ? 'Vídeos' : 'Imagens'}): Verifique o "Upload Preset" em Admin > Sistema. Deve ser "Unsigned". (Preset usado: ${uploadPreset})`;
      } else if (msg.toLowerCase().includes('cloud name') || msg.includes('404')) {
        finalMessage = `ERRO DE CONTA (${isVideo ? 'Vídeos' : 'Imagens'}): "Cloud Name" incorreto ou conta suspensa. (Cloud Name: ${cloudName})`;
      } else if (msg.toLowerCase().includes('file size')) {
        finalMessage = 'ARQUIVO MUITO GRANDE: O limite do seu plano Cloudinary foi excedido.';
      } else if (msg.toLowerCase().includes('cors') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('conexão')) {
        finalMessage = `ERRO DE REDE/CORS: Verifique se o "Cloud Name" (${cloudName}) está correto e se o "Upload Preset" (${uploadPreset}) permite uploads não assinados (Unsigned). Erros de CORS geralmente indicam configuração errada no Cloudinary.`;
      }

      emitActivity({
        id: activityId, kind: 'upload', status: 'error', userName,
        action: `Upload de ${fileTypeLabel}`, detail: finalMessage,
        timestamp: startTime, progress: 0, elapsedMs: Date.now() - startTime
      });
      reject(new Error(finalMessage));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            emitActivity({
              id: activityId, kind: 'upload', status: 'success', userName,
              action: `Upload de ${fileTypeLabel}`, detail: `${uploadContext} • Concluído`,
              timestamp: startTime, progress: 100, elapsedMs: Date.now() - startTime
            });
            resolve(response.secure_url);
          } else {
            throw new Error('URL segura não retornada pelo servidor.');
          }
        } catch (e) {
          handleError('Falha ao processar resposta do servidor.');
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          handleError(errData.error?.message || `Erro HTTP ${xhr.status}`);
        } catch {
          handleError(`Falha de upload (Status: ${xhr.status}) - Verifique Console para detalhes CORS.`);
        }
      }
    };

    xhr.onerror = () => handleError('Falha de conexão com a internet ou Bloqueio CORS/AdBlock.');

    xhr.send(formData);
  });
};

export const testCloudinaryConnection = async (cloudName: string, uploadPreset: string): Promise<{ success: boolean; message: string }> => {
  if (!cloudName || !uploadPreset) { return { success: false, message: "Dados incompletos." }; }

  // Tenta upload de uma imagem minúscula (pixel transparente)
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const base64Gif = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  try {
    const bin = atob(base64Gif);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }

    const formData = new FormData();
    formData.append('file', new Blob([bytes], { type: 'image/gif' }), 'test_connection.gif');
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();

    if (!response.ok) {
      if (data.error?.message?.includes('preset')) {
        return { success: false, message: "Upload Preset inválido ou não é 'Unsigned'." };
      }
      return { success: false, message: data.error?.message || "Erro desconhecido na API Cloudinary" };
    }

    return { success: true, message: "Conexão estabelecida com sucesso!" };
  } catch (e: any) {
    return { success: false, message: e.message || "Erro de rede ao testar." };
  }
};

/**
 * Extrai o public_id de uma URL do Cloudinary
 * Ex: https://res.cloudinary.com/demo/image/upload/v1234/folder/file.jpg
 * Retorna: folder/file
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) { return null; }

  try {
    // Pattern: /upload/[version]/[public_id].[extension]
    const match = url.match(/\/upload\/(?:v\d+\/)?(.*?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      // Remove query parameters
      return match[1].split('?')[0];
    }
  } catch (e) {
    console.warn('Failed to extract public_id from URL:', url, e);
  }

  return null;
};

/**
 * Deleta uma imagem/vídeo do Cloudinary
 * NOTA: Implementação atual apenas registra a solicitação.
 * Requer Edge Function no Supabase para deleção real (API Secret necessária).
 */
export const deleteFromCloudinary = async (
  publicIdOrUrl: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; message: string }> => {
  let publicId = publicIdOrUrl;

  // Se for URL, extrai o public_id
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const extracted = extractPublicIdFromUrl(publicIdOrUrl);
    if (!extracted) {
      console.warn('⚠️ Não foi possível extrair public_id da URL:', publicIdOrUrl);
      return { success: false, message: 'URL inválida' };
    }
    publicId = extracted;
  }

  // Implementação real via Edge Function no Supabase
  try {
    const supabase = getSupabase();
    if (!supabase) { throw new Error('Supabase client not initialized'); }

    console.log(`🗑️ [CLOUDINARY DELETE] Invocando Edge Function para: ${publicId}`);

    const { data, error } = await supabase.functions.invoke('cloudinary-delete', {
      body: {
        public_id: publicId,
        resource_type: resourceType
      }
    });

    if (error) { throw error; }

    console.log('✅ Deleção concluída:', data);

    return {
      success: true,
      message: 'Imagem removida com sucesso do Cloudinary'
    };
  } catch (e: any) {
    console.error('❌ Falha ao deletar do Cloudinary:', e);

    // Fallback: Armazena em localStorage para rastreamento se falhar
    try {
      const pendingDeletions = JSON.parse(localStorage.getItem('cloudinary_pending_deletions') || '[]');
      pendingDeletions.push({
        publicId,
        resourceType,
        timestamp: new Date().toISOString(),
        url: publicIdOrUrl,
        error: e.message
      });
      localStorage.setItem('cloudinary_pending_deletions', JSON.stringify(pendingDeletions));
    } catch (storageErr) {
      console.warn('Failed to store pending deletion:', storageErr);
    }

    return {
      success: false,
      message: `Falha na deleção: ${e.message || 'Erro desconhecido'}`
    };
  }
};
