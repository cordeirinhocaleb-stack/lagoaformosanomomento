
import { VideoFramePresetId } from '../../../types';

export interface VideoFrameDef {
    id: VideoFramePresetId;
    label: string;
    wrapperClass: string;
    innerClass: string;
    icon: string;
}

export const VIDEO_FRAMES: VideoFrameDef[] = [
    {
        id: 'clean_border',
        label: 'Borda Limpa',
        wrapperClass: 'p-1 bg-white rounded-xl shadow-md border border-gray-200',
        innerClass: 'rounded-lg',
        icon: 'fa-square'
    },
    {
        id: 'clean_shadow',
        label: 'Sombra Suave',
        wrapperClass: 'shadow-2xl rounded-2xl',
        innerClass: 'rounded-2xl',
        icon: 'fa-cloud'
    },
    {
        id: 'glass_card',
        label: 'Glass Card',
        wrapperClass: 'p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl',
        innerClass: 'rounded-xl shadow-inner',
        icon: 'fa-gem'
    },
    {
        id: 'floating_glow',
        label: 'Glow Flutuante',
        wrapperClass: 'rounded-2xl shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] ring-1 ring-white/20 scale-[0.98]',
        innerClass: 'rounded-2xl',
        icon: 'fa-lightbulb'
    },
    {
        id: 'editorial_frame',
        label: 'Editorial',
        wrapperClass: 'p-3 bg-white border-2 border-black rounded-none shadow-[8px_8px_0_#000]',
        innerClass: 'rounded-none border border-black',
        icon: 'fa-newspaper'
    },
    {
        id: 'rounded_modern',
        label: 'Super Redondo',
        wrapperClass: 'rounded-[2rem] overflow-hidden shadow-lg border-4 border-white',
        innerClass: 'rounded-[1.7rem]',
        icon: 'fa-circle-notch'
    },
    {
        id: 'bold_border',
        label: 'Borda Bold',
        wrapperClass: 'p-1 bg-black rounded-lg border-2 border-black',
        innerClass: 'rounded-md',
        icon: 'fa-bold'
    },
    {
        id: 'minimal_corner',
        label: 'Minimalista',
        wrapperClass: 'rounded-lg border-l-4 border-red-600 pl-0.5',
        innerClass: 'rounded-r-lg',
        icon: 'fa-crop-simple'
    }
];

export const getVideoFrameById = (id: string | undefined): VideoFrameDef => {
    return VIDEO_FRAMES.find(t => t.id === id) || VIDEO_FRAMES[0];
};
