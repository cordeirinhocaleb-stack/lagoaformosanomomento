
import { SystemSettings, AdPricingConfig } from '@/types';

export const DEFAULT_SETTINGS: SystemSettings = {
    jobsModuleEnabled: true,
    maintenanceMode: false,
    registrationEnabled: true,
    enableOmnichannel: true,
    footer: {
        phone: '(34) 99999-0000',
        email: 'pauta@lfnm.com.br',
        socialLinks: {
            instagram: 'https://instagram.com/lagoaformosanomomento',
            facebook: '',
            whatsapp: '',
            youtube: ''
        }
    },
    supabase: {
        url: 'https://xlqyccbnlqahyxhfswzh.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio'
    },
    socialWebhookUrl: '',
    cloudinary: {
        images: {
            cloudName: '',
            uploadPreset: ''
        },
        videos: {
            cloudName: '',
            uploadPreset: ''
        }
    }
};

export const INITIAL_AD_CONFIG: AdPricingConfig = {
    plans: [
        {
            id: 'master',
            name: 'Master',
            prices: { daily: 50, weekly: 300, monthly: 1200, quarterly: 3000, semiannual: 5500, yearly: 10000 },
            description: 'Domínio total do portal',
            cashbackPercent: 15,
            features: {
                placements: ['master_carousel', 'sidebar', 'standard_list'],
                canCreateJobs: true,
                maxProducts: 0,
                socialVideoAd: true,
                videoLimit: 4,
                socialFrequency: 'daily',
                allowedSocialNetworks: ['instagram', 'facebook', 'whatsapp', 'linkedin', 'tiktok'],
                hasInternalPage: true
            },
            isPopular: true
        }
    ],
    promoText: 'Assine agora e impulsione seu negócio!',
    active: true,
    promoBanners: [
        {
            id: '1',
            type: 'image',
            images: ['https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png'],
            image: 'https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png',
            layout: 'classic',
            align: 'left',
            overlayOpacity: 50,
            tag: 'Cobertura Exclusiva',
            title: 'LAGOA FORMOSA <br /><span class="text-red-600">CONECTADA</span> COM VOCÊ',
            description: 'Informação de verdade, com a credibilidade de quem conhece cada canto da nossa terra.',
            buttonText: 'Seguir @lagoaformosanomomento',
            link: 'https://instagram.com/lagoaformosanomomento',
            buttonConfig: {
                label: 'Seguir @lagoaformosanomomento',
                link: 'https://instagram.com/lagoaformosanomomento',
                style: 'solid',
                size: 'md',
                rounded: 'none',
                effect: 'none'
            },
            textConfig: {
                titleSize: 'xl',
                titleShadow: 'soft',
                descriptionVisible: true,
                fontFamily: 'Inter',
                customColor: '#ffffff'
            },
            active: true
        }
    ]
};
