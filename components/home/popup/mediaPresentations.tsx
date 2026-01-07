
import React, { useState, useEffect } from 'react';
import { PopupImagePresentation } from '../../../types';

interface PresentationProps {
    images: string[];
    className?: string; // Classe base (filtros, efeitos) passada pelo renderizador pai
}

// --- 1. HERO SINGLE ---
// Apresenta uma única imagem em destaque total.
const HeroSingle: React.FC<PresentationProps> = ({ images, className }) => {
    if (images.length === 0) {return null;}
    return (
        <img 
            src={images[0]} 
            alt="Destaque" 
            className={`w-full h-full object-cover ${className || ''}`} 
        />
    );
};

// --- 2. SPLIT 2 COLUMNS ---
// Divide o espaço em duas colunas verticais.
// Fallback: Se 1 imagem -> HeroSingle.
const Split2Col: React.FC<PresentationProps> = ({ images, className }) => {
    if (images.length < 2) {return <HeroSingle images={images} className={className} />;}
    
    return (
        <div className="grid grid-cols-2 h-full w-full">
            <div className="h-full overflow-hidden border-r border-white/20">
                <img src={images[0]} className={`w-full h-full object-cover ${className || ''}`} alt="1" />
            </div>
            <div className="h-full overflow-hidden">
                <img src={images[1]} className={`w-full h-full object-cover ${className || ''}`} alt="2" />
            </div>
        </div>
    );
};

// --- 3. COLLAGE 3 ---
// Layout de mosaico: 1 imagem grande à esquerda, 2 menores à direita.
// Fallback: 2 imagens -> Split2Col, 1 imagem -> HeroSingle.
const Collage3: React.FC<PresentationProps> = ({ images, className }) => {
    if (images.length < 2) {return <HeroSingle images={images} className={className} />;}
    if (images.length === 2) {return <Split2Col images={images} className={className} />;}

    return (
        <div className="grid grid-cols-2 h-full w-full">
            <div className="h-full overflow-hidden border-r border-white/20">
                <img src={images[0]} className={`w-full h-full object-cover ${className || ''}`} alt="Destaque" />
            </div>
            <div className="grid grid-rows-2 h-full">
                <div className="h-full overflow-hidden border-b border-white/20">
                    <img src={images[1]} className={`w-full h-full object-cover ${className || ''}`} alt="Secundária 1" />
                </div>
                <div className="h-full overflow-hidden">
                    <img src={images[2]} className={`w-full h-full object-cover ${className || ''}`} alt="Secundária 2" />
                </div>
            </div>
        </div>
    );
};

// --- 4. STACK CARDS ---
// Imagens empilhadas com leve rotação para efeito de "baralho".
// Fallback: 1 imagem -> HeroSingle.
const StackCards: React.FC<PresentationProps> = ({ images, className }) => {
    if (images.length === 0) {return null;}
    if (images.length === 1) {return <HeroSingle images={images} className={className} />;}

    return (
        <div className="relative w-full h-full flex items-center justify-center p-8 bg-gray-50/10">
            {images.map((img, idx) => {
                // Cálculos de rotação e offset baseados no índice
                const rotate = idx === 0 ? '-6deg' : idx === 1 ? '0deg' : '6deg';
                const zIndex = idx * 10;
                const scale = idx === 2 ? '1' : idx === 1 ? '0.95' : '0.9';
                
                return (
                    <div 
                        key={idx}
                        className="absolute w-[70%] h-[80%] rounded-xl shadow-xl overflow-hidden border-4 border-white transition-all duration-500 hover:scale-105 hover:z-50 hover:rotate-0"
                        style={{ 
                            transform: `rotate(${rotate}) scale(${scale})`, 
                            zIndex 
                        }}
                    >
                        <img src={img} className={`w-full h-full object-cover ${className || ''}`} alt={`Card ${idx}`} />
                    </div>
                );
            })}
        </div>
    );
};

// --- 5. MINI SLIDER ---
// Carrossel simples com fade automático.
// Fallback: 1 imagem -> HeroSingle (estático).
const MiniSlider: React.FC<PresentationProps> = ({ images, className }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) {return;}
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [images.length]);

    if (images.length === 0) {return null;}
    if (images.length === 1) {return <HeroSingle images={images} className={className} />;}

    return (
        <div className="relative w-full h-full overflow-hidden group">
            {images.map((img, idx) => (
                <div 
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img src={img} className={`w-full h-full object-cover ${className || ''}`} alt={`Slide ${idx}`} />
                </div>
            ))}
            
            {/* Indicadores (Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- MAIN RENDERER EXPORT ---

export const PopupMediaRenderer: React.FC<{
    mode: PopupImagePresentation;
    images: string[];
    className?: string; // Classes CSS para filtros, brilho, contraste etc.
}> = ({ mode, images, className }) => {
    // 1. Limite Global de Segurança (Max 3 Imagens)
    const safeImages = images.slice(0, 3);
    
    if (safeImages.length === 0) {return null;}

    // 2. Roteamento de Layouts
    switch (mode) {
        case 'split_2col':
            return <Split2Col images={safeImages} className={className} />;
        case 'collage_3':
            return <Collage3 images={safeImages} className={className} />;
        case 'stack_cards':
            return <StackCards images={safeImages} className={className} />;
        case 'mini_slider':
            return <MiniSlider images={safeImages} className={className} />;
        case 'hero_single':
        default:
            return <HeroSingle images={safeImages} className={className} />;
    }
};
