
import React from 'react';
import { PopupEffectConfig } from '@/types';

interface SpecialEffectsRendererProps {
    config: PopupEffectConfig;
}

export const SpecialEffectsRenderer: React.FC<SpecialEffectsRendererProps> = ({ config }) => {
    if (!config.enabled || config.type === 'none') return null;

    const { type, intensity, opacity, direction = 'top_bottom', color } = config;

    // Calcular multiplicadores baseados na intensidade
    const countMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 2 : 1;
    const speedMultiplier = intensity === 'low' ? 1.5 : intensity === 'high' ? 0.5 : 1; // Menor é mais rápido em 's'

    // Helper para gerar estilo de partícula com direção
    const getDirectionalAnimation = (baseDuration: number) => {
        switch (direction) {
            case 'bottom_top': return { name: 'fx-rise', duration: baseDuration };
            case 'left_right': return { name: 'fx-slide-right', duration: baseDuration };
            case 'right_left': return { name: 'fx-slide-left', duration: baseDuration };
            case 'random': return { name: 'fx-float-random', duration: baseDuration * 1.5 };
            case 'top_bottom':
            default: return { name: 'fx-fall', duration: baseDuration };
        }
    };

    // Gerador de partículas aleatórias
    const generateParticles = (baseCount: number, content: string | React.ReactNode, baseDuration: number) => {
        const count = Math.ceil(baseCount * countMultiplier);
        const anim = getDirectionalAnimation(baseDuration);
        
        return Array.from({ length: count }).map((_, i) => {
            const duration = (anim.duration + Math.random() * 5) * speedMultiplier;
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                top: direction === 'left_right' || direction === 'right_left' ? `${Math.random() * 100}%` : undefined,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${duration}s`,
                opacity: Math.random(),
                color: color // Aplica cor se for texto/icone
            };
            
            return (
                <div key={i} className={`absolute ${anim.name} pointer-events-none select-none`} style={style}>
                    {/* Se for elemento HTML e tiver cor configurada, tenta clonar e aplicar style */}
                    {React.isValidElement(content) && color 
                        ? React.cloneElement(content as React.ReactElement<{ style?: React.CSSProperties }>, { style: { ...((content.props as any).style || {}), backgroundColor: color, color: color } })
                        : content
                    }
                </div>
            );
        });
    };

    const containerStyle = {
        opacity: opacity / 100
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]" style={containerStyle}>
            {/* STYLES FOR ANIMATIONS */}
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(600px) translateX(20px) rotate(360deg); opacity: 0; }
                }
                @keyframes rise {
                    0% { transform: translateY(100%) scale(0.5); opacity: 0; }
                    20% { opacity: 0.8; }
                    100% { transform: translateY(-50%) scale(1.2); opacity: 0; }
                }
                @keyframes slide-right {
                    0% { transform: translateX(-20px) translateY(0px); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateX(120%) translateY(20px); opacity: 0; }
                }
                @keyframes slide-left {
                    0% { transform: translateX(120%) translateY(0px); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateX(-20px) translateY(20px); opacity: 0; }
                }
                @keyframes float-random {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(10px, 10px); }
                    50% { transform: translate(0, 20px); }
                    75% { transform: translate(-10px, 10px); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                @keyframes flash {
                    0%, 90%, 100% { opacity: 0; }
                    92% { opacity: 0.6; }
                    93% { opacity: 0; }
                    96% { opacity: 0.3; }
                }
                @keyframes clouds-move {
                    0% { transform: translateX(-10%); }
                    100% { transform: translateX(10%); }
                }
                @keyframes gradient-wave {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .fx-fall { animation: fall linear infinite; }
                .fx-rise { animation: rise ease-out infinite; }
                .fx-slide-right { animation: slide-right linear infinite; }
                .fx-slide-left { animation: slide-left linear infinite; }
                .fx-float-random { animation: float-random ease-in-out infinite; }
                .fx-twinkle { animation: twinkle ease-in-out infinite; }
                .fx-scanline { animation: scanline 3s linear infinite; }
                .fx-flash { animation: flash 4s infinite; }
                .fx-clouds { animation: clouds-move 20s ease-in-out infinite alternate; }
                .fx-gradient { background-size: 200% 200%; animation: gradient-wave 5s ease infinite; }
            `}</style>

            {/* NEVE (Snow) */}
            {type === 'snow' && generateParticles(20, <div className="w-2 h-2 bg-white rounded-full blur-[1px]"></div>, 3)}

            {/* CHUVA (Rain) */}
            {type === 'rain' && generateParticles(40, <div className="w-0.5 h-4 bg-blue-200/50 rounded-full"></div>, 1)}

            {/* CORAÇÕES (Hearts) */}
            {type === 'hearts' && generateParticles(12, <span className="text-xl">❤️</span>, 3)}

            {/* CONFETE (Confetti) */}
            {type === 'confetti' && generateParticles(30, 
                <div className="w-1.5 h-3" style={{ backgroundColor: !color ? ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][Math.floor(Math.random() * 4)] : color }}></div>, 
                3
            )}

            {/* ABÓBORAS (Pumpkins) */}
            {type === 'pumpkins' && generateParticles(8, <span className="text-2xl opacity-50">🎃</span>, 4)}

            {/* BRILHOS (Sparkles) */}
            {type === 'sparkles' && Array.from({ length: Math.ceil(15 * countMultiplier) }).map((_, i) => (
                <div 
                    key={i} 
                    className="absolute text-lg fx-twinkle" 
                    style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        color: color || '#facc15'
                    }}
                >
                    ✨
                </div>
            ))}

            {/* MATRIX */}
            {type === 'matrix' && (
                <div 
                    className="absolute inset-0 bg-[url('https://fontmeme.com/permalink/241230/matrix_bg.png')] opacity-10 animate-pulse" 
                    style={{ 
                        animationDuration: intensity === 'high' ? '0.5s' : '2s',
                        filter: color ? `sepia(1) hue-rotate(180deg) saturate(3)` : 'none' // Hack simples para colorir matrix image
                    }}
                ></div>
            )}

            {/* SCANLINE (CRT) */}
            {type === 'scanline' && (
                <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none">
                    <div 
                        className="absolute inset-0 h-[5%] fx-scanline" 
                        style={{ 
                            backgroundColor: color ? `${color}40` : 'rgba(255,255,255,0.2)',
                            animationDuration: intensity === 'high' ? '1s' : '3s' 
                        }}
                    ></div>
                </div>
            )}

            {/* CAMERA FLASH */}
            {type === 'camera_flash' && (
                <div 
                    className="absolute inset-0 pointer-events-none fx-flash mix-blend-overlay" 
                    style={{ 
                        backgroundColor: color || '#ffffff',
                        animationDuration: intensity === 'high' ? '1s' : '4s' 
                    }}
                ></div>
            )}

            {/* NOISE */}
            {type === 'noise' && (
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${intensity === 'high' ? '0.9' : '0.65'}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            )}

            {/* CLOUDS */}
            {type === 'clouds' && (
                <div className="absolute inset-0 opacity-30 pointer-events-none fx-clouds" style={{ 
                    backgroundImage: `radial-gradient(circle, ${color || '#ffffff'} 10%, transparent 10%), radial-gradient(circle, ${color || '#ffffff'} 10%, transparent 10%)`,
                    backgroundSize: '50px 50px',
                    backgroundPosition: '0 0, 25px 25px',
                    filter: 'blur(10px)',
                    animationDuration: intensity === 'high' ? '10s' : '20s'
                }}></div>
            )}

            {/* BOKEH */}
            {type === 'bokeh' && Array.from({ length: Math.ceil(8 * countMultiplier) }).map((_, i) => (
                <div 
                    key={i} 
                    className="absolute rounded-full fx-float-random blur-md"
                    style={{ 
                        backgroundColor: color ? `${color}40` : 'rgba(255,255,255,0.2)',
                        width: `${20 + Math.random() * 50}px`,
                        height: `${20 + Math.random() * 50}px`,
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${(5 + Math.random() * 5) * speedMultiplier}s`
                    }}
                ></div>
            ))}

            {/* GRADIENT WAVE */}
            {type === 'gradient_wave' && (
                <div 
                    className="absolute inset-0 opacity-30 fx-gradient mix-blend-overlay" 
                    style={{ 
                        background: color 
                            ? `linear-gradient(45deg, ${color}, transparent, ${color})`
                            : 'linear-gradient(45deg, #a855f7, #ec4899, #ef4444)',
                        animationDuration: intensity === 'high' ? '2s' : '5s' 
                    }}
                ></div>
            )}

            {/* GLITCH */}
            {type === 'glitch' && (
                <div 
                    className="absolute inset-0 opacity-20 mix-blend-color-dodge animate-pulse" 
                    style={{ 
                        backgroundColor: color || '#ef4444',
                        animationDuration: intensity === 'high' ? '0.1s' : '1s' 
                    }}
                ></div>
            )}
        </div>
    );
};
