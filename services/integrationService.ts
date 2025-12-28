
import { NewsItem, WebhookPayload, Advertiser } from '../types';

/**
 * --------------------------------------------------------------------------------------
 * [MÓDULO DE INTEGRAÇÃO] "Postar em todas as redes de uma vez"
 * --------------------------------------------------------------------------------------
 * 
 * Este serviço é o "cérebro" da distribuição Omnichannel.
 * 
 * COMO FUNCIONA PARA O USUÁRIO:
 * 1. O usuário cria a notícia no AdminPanel.
 * 2. O Gemini Service gera automaticamente as legendas para Instagram, Facebook, etc.
 * 3. Ao clicar em PUBLICAR, a função `dispatchSocialWebhook` abaixo é chamada.
 * 
 * COMO FUNCIONA A MÁGICA (NO-CODE):
 * - Esta função envia um JSON (payload) para uma URL externa (Webhook).
 * - Ferramentas como MAKE (antigo Integromat), ZAPIER ou N8N recebem esse JSON.
 * - Lá nessas ferramentas, você configura o fluxo:
 *    Se "post_published" -> Postar Foto no Instagram + Postar Link no Facebook + Enviar no Grupo WhatsApp.
 * 
 * Isso permite escalar infinitamente sem programar cada API de rede social individualmente aqui.
 */

export const dispatchSocialWebhook = async (news: NewsItem) => {
  // [PAYLOAD] O pacote de dados que vai para o Make/Zapier
  const payload: WebhookPayload = {
    event: 'post_published', // Gatilho
    timestamp: new Date().toISOString(),
    data: {
      id: news.id,
      title: news.title,
      url: `https://lagoaformosanomomento.com.br/noticia/${news.seo.slug}`,
      imageUrl: news.imageUrl,
      // Pega o texto gerado especificamente para o Instagram, ou usa o lead como fallback
      socialText: news.socialDistribution?.find(s => s.platform === 'instagram_feed')?.content || news.lead,
      author: news.author
    }
  };

  // [LOG] Para depuração no console do navegador
  console.group('🚀 [Webhook Dispatcher] Enviando para Automação Externa...');
  console.log('Target: (Configure aqui sua URL do Make/Zapier)');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();

  // [IMPLEMENTAÇÃO REAL]
  // Para ativar, descomente a linha abaixo e coloque sua URL do Make/Zapier.
  // await fetch('https://hook.us1.make.com/SEU_ID_DO_WEBHOOK', { 
  //   method: 'POST', 
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload) 
  // });
  
  return true;
};

/**
 * [UTILITÁRIO] Gerador de Links WhatsApp Inteligentes
 * Cria links `wa.me` com mensagens pré-formatadas para facilitar o contato.
 */
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
    case 'job_application':
      message = `Olá! Vi a vaga "${itemName}" (ID: ${itemId}) no Portal Lagoa Formosa no Momento e gostaria de me candidatar.`;
      break;
    case 'classified_buy':
      message = `Olá! Tenho interesse no item "${itemName}" (ID: ${itemId}) anunciado no site. Ainda está disponível?`;
      break;
    case 'advertiser_contact':
      message = `Olá! Vi sua empresa "${itemName}" no Portal Lagoa Formosa no Momento e gostaria de mais informações.`;
      break;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
