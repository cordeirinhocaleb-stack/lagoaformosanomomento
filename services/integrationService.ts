
import { NewsItem, WebhookPayload, SystemSettings } from '../types';

/**
 * --------------------------------------------------------------------------------------
 * [MÓDULO DE INTEGRAÇÃO] "Postar em todas as redes de uma vez"
 * --------------------------------------------------------------------------------------
 * 
 * Este serviço é o "cérebro" da distribuição Omnichannel.
 * Agora ele busca a URL configurada no painel de Ajustes para fazer o disparo real.
 */

export const dispatchSocialWebhook = async (news: NewsItem) => {
  // Recupera configurações salvas
  const settingsStr = localStorage.getItem('lfnm_system_settings');
  const settings: SystemSettings = settingsStr ? JSON.parse(settingsStr) : {};
  const targetUrl = settings.socialWebhookUrl;

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

  // [LOG] Para depuração
  console.group('🚀 [Webhook Dispatcher] Enviando para Automação Externa...');
  console.log('Target URL:', targetUrl || '(Modo Simulação - URL não configurada)');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();

  // [IMPLEMENTAÇÃO REAL]
  if (targetUrl) {
      try {
          // Tenta enviar com no-cors primeiro se for URL simples, ou cors normal
          await fetch(targetUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'no-cors' // Muitas vezes necessário para Webhooks simples que não retornam headers CORS
          });
          console.log("✅ Webhook disparado com sucesso para a URL configurada.");
          return true;
      } catch (error) {
          console.error("❌ Erro ao disparar Webhook:", error);
          // Retorna true mesmo com erro para não travar a UI, mas loga o erro
          return false;
      }
  } else {
      console.warn("⚠️ URL do Webhook não configurada em Ajustes. Operando em modo de simulação.");
      return true; // Simula sucesso
  }
};

/**
 * Envia um payload de teste para verificar a conexão
 */
export const testSocialWebhook = async (targetUrl: string) => {
  const payload: WebhookPayload = {
    event: 'post_published',
    timestamp: new Date().toISOString(),
    data: {
      id: 'TEST_ID_123',
      title: 'Teste de Integração - Lagoa Formosa no Momento',
      url: 'https://lagoaformosanomomento.com.br',
      imageUrl: 'https://lh3.googleusercontent.com/d/1C1WhdivmBnt1z23xZGOJw0conC1jtq4i',
      socialText: 'Este é um teste de verificação do Webhook de automação. Se você recebeu isso, a conexão está funcionando!',
      author: 'Admin'
    }
  };

  try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      return true;
  } catch (error) {
      console.error("Erro no teste do webhook:", error);
      return false;
  }
};

/**
 * Simula o envio individual para uma rede social (para feedback visual na UI)
 */
export const mockPostToNetwork = (platform: string): Promise<boolean> => {
    return new Promise((resolve) => {
        // Tempo aleatório entre 1s e 2.5s para parecer processamento real de API
        const delay = Math.floor(Math.random() * 1500) + 1000;
        setTimeout(() => {
            console.log(`[Social API] Enviado com sucesso para: ${platform}`);
            resolve(true);
        }, delay);
    });
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
