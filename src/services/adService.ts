
import { Advertiser, AdPlan } from '../types';

/**
 * 2.2 O Algoritmo de Anúncios (Ad Rotation Logic)
 */

/**
 * Filtra e ordena anúncios baseados no slot (Plano), Data e Status.
 * Simula a query de backend.
 */
export const getActiveAdsForSlot = (advertisers: Advertiser[], slotPlan: AdPlan): Advertiser[] => {
  const now = new Date();

  return advertisers
    .filter(ad => {
      // 1. Verifica se está ativo manualmente
      if (!ad.isActive) {return false;}

      // 2. Regra de Expiração (Workflow Diário)
      const endDate = new Date(ad.endDate);
      if (now > endDate) {
        // Em um backend real, aqui dispararíamos um update para isActive = false
        console.warn(`Anúncio ${ad.name} expirado (Fim: ${ad.endDate}). Removido da rotação.`);
        return false;
      }

      // 3. Regra de Slot (Master vs Premium)
      if (ad.plan !== slotPlan) {return false;}

      // 4. Verifica Data de Início
      const startDate = new Date(ad.startDate);
      if (now < startDate) {return false;}

      return true;
    })
    .sort(() => Math.random() - 0.5); // Rotação Aleatória (Pode ser alterado para peso)
};

/**
 * Registra visualização (Analytics)
 */
export const trackAdView = (adId: string) => {
  // Simulação de chamada de API para incrementar contador
  console.log(`[Analytics] View registrada para Ad ID: ${adId}`);
};

/**
 * Registra clique (Analytics)
 */
export const trackAdClick = (adId: string) => {
  // Simulação de chamada de API para incrementar contador
  console.log(`[Analytics] Click registrado para Ad ID: ${adId}`);
};
