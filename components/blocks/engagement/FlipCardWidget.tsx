import React, { useState } from 'react';
import { WidgetProps } from './types';

export const FlipCardWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { frontText, backText, frontImage, backImage } = block.settings;
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!hasInteracted && !isFlipped) {
            onInteract({ value: 'flip' });
        }
    };

    return (
        <div className="flex justify-center py-6 perspective-1000" style={{ perspective: '1000px' }}>
            <div
                className={`w-full max-w-sm aspect-video relative transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={handleFlip}
            >
                {/* Frente */}
                <div className="absolute inset-0 backface-hidden rounded-2xl shadow-xl overflow-hidden bg-white border border-zinc-100 flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                    {frontImage ? (
                        <div className="flex-1 bg-cover bg-center relative" style={{ backgroundImage: `url(${frontImage})` }}>
                            {frontText && <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white font-bold">{frontText}</div>}
                        </div>
                    ) : (
                        <div className={`flex-1 flex items-center justify-center p-6 text-xl font-bold text-center ${theme.classes.text}`}>{frontText || 'Clique para virar'}</div>
                    )}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                        <i className="fas fa-sync text-white drop-shadow-md"></i>
                    </div>
                </div>

                {/* Verso */}
                <div
                    className="absolute inset-0 backface-hidden rounded-2xl shadow-xl overflow-hidden bg-zinc-900 border border-zinc-800 text-white flex flex-col rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {backImage ? (
                        <div className="flex-1 bg-cover bg-center relative" style={{ backgroundImage: `url(${backImage})` }}>
                            {backText && <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white font-bold">{backText}</div>}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6 text-xl font-bold text-center">{backText || 'Conteúdo do verso'}</div>
                    )}
                </div>
            </div>
        </div>
    );
};
