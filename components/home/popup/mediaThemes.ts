
import { MediaThemeId } from '../../../types';

export interface MediaThemeDef {
    id: MediaThemeId;
    label: string;
    containerClass: string;
    overlayClass: string;
    mediaClass: string;
    icon: string;
}

export const MEDIA_THEMES: MediaThemeDef[] = [
    {
        id: 'clean_minimal',
        label: 'Clean Minimal',
        containerClass: 'rounded-2xl shadow-sm overflow-hidden border border-gray-100 bg-white',
        overlayClass: 'bg-black/0',
        mediaClass: 'brightness-105 contrast-105',
        icon: 'fa-square'
    },
    {
        id: 'premium_glass',
        label: 'Premium Glass',
        containerClass: 'rounded-xl border border-white/40 shadow-2xl backdrop-blur-md bg-white/10 overflow-hidden ring-1 ring-black/5',
        overlayClass: 'bg-gradient-to-t from-black/30 to-transparent',
        mediaClass: 'brightness-110 saturate-110',
        icon: 'fa-gem'
    },
    {
        id: 'neon_urban',
        label: 'Neon Urban',
        containerClass: 'rounded-lg border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] overflow-hidden bg-black',
        overlayClass: 'bg-purple-900/20 mix-blend-overlay',
        mediaClass: 'contrast-125 brightness-110 saturate-125',
        icon: 'fa-bolt'
    },
    {
        id: 'cinema_dark',
        label: 'Cinema Dark',
        containerClass: 'bg-black rounded-sm shadow-2xl border-y-[15px] border-black overflow-hidden',
        overlayClass: 'bg-gradient-to-b from-black/40 via-transparent to-black/40',
        mediaClass: 'brightness-100 contrast-110',
        icon: 'fa-film'
    },
    {
        id: 'newspaper_classic',
        label: 'Jornal Clássico',
        containerClass: 'rounded-none border-4 border-double border-gray-800 bg-gray-100 p-1 shadow-md',
        overlayClass: 'bg-sepia/10',
        mediaClass: 'grayscale contrast-125 brightness-90',
        icon: 'fa-newspaper'
    },
    {
        id: 'warm_local',
        label: 'Local Warm',
        containerClass: 'rounded-[2rem] shadow-xl border-4 border-white overflow-hidden',
        overlayClass: 'bg-orange-500/10 mix-blend-multiply',
        mediaClass: 'sepia-[0.3] brightness-105 contrast-105',
        icon: 'fa-mug-hot'
    },
    {
        id: 'tech_blue',
        label: 'Tech Blue',
        containerClass: 'rounded-none border-x-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-slate-900',
        overlayClass: 'bg-cyan-900/20 mix-blend-overlay',
        mediaClass: 'brightness-110 contrast-110 hue-rotate-15',
        icon: 'fa-microchip'
    },
    {
        id: 'alert_red',
        label: 'Alerta Vermelho',
        containerClass: 'rounded-xl border-4 border-red-600 shadow-2xl overflow-hidden animate-pulse-subtle',
        overlayClass: 'bg-red-600/10 mix-blend-multiply',
        mediaClass: 'contrast-125 brightness-110',
        icon: 'fa-triangle-exclamation'
    },
    {
        id: 'soft_pastel',
        label: 'Soft Pastel',
        containerClass: 'rounded-[3rem] shadow-lg border-8 border-pink-50 overflow-hidden',
        overlayClass: 'bg-pink-200/20 mix-blend-soft-light',
        mediaClass: 'brightness-110 contrast-90 saturate-90',
        icon: 'fa-ice-cream'
    },
    {
        id: 'gold_lux',
        label: 'Gold Luxury',
        containerClass: 'rounded-lg border-2 border-yellow-600/60 shadow-[0_10px_30px_rgba(234,179,8,0.2)] bg-black overflow-hidden',
        overlayClass: 'bg-gradient-to-tr from-yellow-900/40 to-transparent',
        mediaClass: 'contrast-115 brightness-105 saturate-110',
        icon: 'fa-crown'
    },
    {
        id: 'mono_editorial',
        label: 'Mono Editorial',
        containerClass: 'rounded-none border border-black shadow-[8px_8px_0_#000] overflow-hidden',
        overlayClass: 'bg-transparent',
        mediaClass: 'grayscale contrast-150 brightness-110',
        icon: 'fa-pen-nib'
    },
    {
        id: 'sports_energy',
        label: 'Sports Energy',
        containerClass: 'rounded-xl -skew-x-3 border-r-8 border-green-500 shadow-xl overflow-hidden transform',
        overlayClass: 'bg-gradient-to-r from-green-500/20 to-transparent',
        mediaClass: 'contrast-125 saturate-150 brightness-110',
        icon: 'fa-person-running'
    }
];

export const getMediaThemeById = (id: string | undefined): MediaThemeDef => {
    return MEDIA_THEMES.find(t => t.id === id) || MEDIA_THEMES[0]; // Default: Clean Minimal
};
