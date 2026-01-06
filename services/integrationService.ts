
import { NewsItem, SocialDistribution, SocialPost } from '../types';

/**
 * MÓDULO DE INTEGRAÇÃO OMNICHANNEL
 * Gerencia o disparo de conteúdo para redes sociais via Webhook.
 * Envia links do Google Drive (Imagens) e YouTube (Vídeos).
 */

const PLATFORMS = [
    { id: 'instagram_feed', label: 'Instagram Feed', delay: 1500 },
    { id: 'facebook', label: 'Facebook Page', delay: 1200 },
    { id: 'whatsapp', label: 'Grupos WhatsApp', delay: 800 },
    { id: 'linkedin', label: 'LinkedIn', delay: 1000 },
    { id: 'tiktok', label: 'TikTok', delay: 1800 },
    { id: 'youtube', label: 'YouTube Shorts', delay: 2000 }
];

/**
 * Distribuição vinculada a uma Notícia do site
 */
export const dispatchSocialWebhook = async (
    news: NewsItem, 
    webhookUrl?: string,
    onProgress?: (platform: string, status: 'posting' | 'success' | 'error') => void
): Promise<boolean> => {
  console.log("🚀 Iniciando distribuição Omnichannel...", news.title);

  const mediaUrl = news.bannerMediaType === 'video' ? news.bannerVideoUrl : news.imageUrl;

  const basePayload = {
      id: news.id,
      title: news.title,
      url: `https://lagoaformosanomomento.com.br/#/news/${news.id}`,
      mediaType: news.bannerMediaType,
      mediaUrl: mediaUrl, 
      date: new Date().toISOString(),
      author: news.author,
      category: news.category,
      type: 'news_link'
  };

  for (const platform of PLATFORMS) {
      if (onProgress) onProgress(platform.id, 'posting');

      const customCaption = news.socialDistribution?.find(s => s.platform === platform.id)?.content;
      const finalCaption = customCaption || news.lead;

      const payload = {
          ...basePayload,
          targetPlatform: platform.id,
          text: finalCaption
      };

      try {
          if (webhookUrl && webhookUrl.startsWith('http')) {
              await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });
          } else {
              console.log(`[Simulação] Enviando para ${platform.label}:`, payload);
          }

          await new Promise(resolve => setTimeout(resolve, platform.delay));
          if (onProgress) onProgress(platform.id, 'success');
      } catch (error) {
          console.error(`Falha na distribuição para ${platform.label}`, error);
          if (onProgress) onProgress(platform.id, 'error');
      }
  }

  return true;
};

/**
 * Distribuição Direta (Hub Social) - Sem vínculo com matéria
 */
export const dispatchGenericSocialPost = async (
    post: SocialPost,
    webhookUrl?: string,
    onProgress?: (platform: string, status: 'posting' | 'success' | 'error') => void
): Promise<boolean> => {
    console.log("🚀 Iniciando disparo Hub Social...", post.id);

    const basePayload = {
        id: post.id,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        text: post.content,
        author: post.authorName,
        date: post.createdAt,
        type: 'direct_post'
    };

    // Apenas as plataformas selecionadas no Hub
    const selectedPlatforms = PLATFORMS.filter(p => post.platforms.includes(p.id as any));

    for (const platform of selectedPlatforms) {
        if (onProgress) onProgress(platform.id, 'posting');

        try {
            if (webhookUrl && webhookUrl.startsWith('http')) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...basePayload, targetPlatform: platform.id })
                });
            } else {
                console.log(`[Simulação Hub] Enviando para ${platform.label}:`, { ...basePayload, targetPlatform: platform.id });
            }

            await new Promise(resolve => setTimeout(resolve, platform.delay));
            if (onProgress) onProgress(platform.id, 'success');
        } catch (error) {
            if (onProgress) onProgress(platform.id, 'error');
        }
    }

    return true;
};

export const generateWhatsAppLink = (
  phone: string | undefined, 
  context: 'job_application' | 'classified_buy' | 'advertiser_contact',
  itemName: string,
  itemId?: string
): string => {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/\D/g, '');
  let message = '';
  switch (context) {
    case 'job_application': message = `Olá! Vi a vaga "${itemName}" (ID: ${itemId}) no Portal LFNM e gostaria de me candidatar.`; break;
    case 'classified_buy': message = `Olá! Tenho interesse no item "${itemName}" (ID: ${itemId}) anunciado no Portal LFNM.`; break;
    case 'advertiser_contact': message = `Olá! Vi sua página no Portal Lagoa Formosa No Momento e gostaria de mais informações.`; break;
    default: message = `Olá! Contato via Portal LFNM.`;
  }
  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
};
