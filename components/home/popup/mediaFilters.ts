
import { PopupMediaFilter, PopupMediaFilterVariant } from '../../../types';

interface FilterDefinition {
    id: PopupMediaFilter;
    label: string;
    classes: {
        soft: string;
        strong: string;
    };
}

export const MEDIA_FILTERS: FilterDefinition[] = [
    {
        id: 'none',
        label: 'Normal',
        classes: { soft: '', strong: '' }
    },
    {
        id: 'grayscale',
        label: 'Preto & Branco',
        classes: { soft: 'grayscale-[50%]', strong: 'grayscale' }
    },
    {
        id: 'sepia',
        label: 'Sépia',
        classes: { soft: 'sepia-[50%]', strong: 'sepia' }
    },
    {
        id: 'saturate',
        label: 'Saturação',
        classes: { soft: 'saturate-150', strong: 'saturate-[200%]' }
    },
    {
        id: 'contrast',
        label: 'Contraste',
        classes: { soft: 'contrast-125', strong: 'contrast-150' }
    },
    {
        id: 'brightness',
        label: 'Brilho',
        classes: { soft: 'brightness-110', strong: 'brightness-125' }
    },
    {
        id: 'blur',
        label: 'Desfoque',
        classes: { soft: 'blur-[2px]', strong: 'blur-[4px]' }
    },
    {
        id: 'vintage',
        label: 'Vintage',
        classes: { 
            soft: 'sepia-[30%] contrast-110 brightness-90', 
            strong: 'sepia-[60%] contrast-125 brightness-75 grayscale-[20%]' 
        }
    }
];

export const getMediaFilterCss = (filter?: PopupMediaFilter, variant?: PopupMediaFilterVariant): string => {
    if (!filter || filter === 'none') return '';
    const def = MEDIA_FILTERS.find(f => f.id === filter);
    if (!def) return '';
    return def.classes[variant || 'soft'];
};
