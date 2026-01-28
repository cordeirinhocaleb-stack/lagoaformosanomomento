
import { AdPlanConfig } from '../../../../../types';

export const DEFAULT_PLAN: AdPlanConfig = {
    id: '',
    name: 'Novo Plano',
    description: '',
    prices: {
        single: 0,
        daily: 0,
        weekly: 0,
        fortnightly: 0,
        monthly: 0,
        quarterly: 0,
        semiannual: 0,
        yearly: 0
    },
    features: {
        placements: [],
        canCreateJobs: false,
        maxProducts: 0,
        socialVideoAd: false,
        videoLimit: 0,
        socialFrequency: 'daily',
        allowedSocialNetworks: [],
        hasInternalPage: false
    },
    cashbackPercent: 0,
    isPopular: false
};
