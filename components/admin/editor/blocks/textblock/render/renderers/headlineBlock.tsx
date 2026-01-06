
import React from 'react';

export const renderHeadlineBlock = (variant: string, perStyle: any, baseStyles: React.CSSProperties, Tag: any, contentRef: any, handleInput: () => void) => {
    let variantStyles: React.CSSProperties = {};
    let variantClasses = "";
    let variantPre = null;
    let variantPost = null;
    let overlayEffect = null;

    // Estilos Base para Adaptação de Largura em Títulos
    const fluidStyles: React.CSSProperties = {
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    };

    if (variant === 'hero_headline') {
        const hh = perStyle.hero_headline || { shadowDepth: 4, weight: 900, width: 'full' };
        variantStyles = { 
            ...fluidStyles,
            fontWeight: hh.weight, 
            fontSize: hh.width === 'prose' ? '2.5rem' : '4rem', 
            lineHeight: '0.95', 
            textTransform: hh.uppercase ? 'uppercase' : 'none', 
            textShadow: hh.shadowDepth ? `${hh.shadowDepth}px ${hh.shadowDepth}px 0 rgba(0,0,0,0.1)` : 'none' 
        };
        if (hh.width === 'prose') variantClasses = "max-w-prose mx-auto";
        if (hh.subtitle) variantPost = <p className="mt-4 text-zinc-400 font-black uppercase tracking-widest text-[10px] italic">{hh.subtitle}</p>;
    } 
    
    else if (variant === 'breaking_alert') {
        const ba = perStyle.breaking_alert || { bgPreset: 'red', intensity: 'strong', pulseEnabled: true, icon: 'warning', skew: true, animation: 'shimmer' };
        
        // Mapeamento de Cores de Alto Impacto
        const bgs: Record<string, string[]> = { 
            red: ['#dc2626', '#ffffff', '#ffffff'], 
            dark: ['#09090b', '#dc2626', '#ffffff'], 
            amber: ['#f59e0b', '#000000', '#000000'], 
            blue: ['#1d4ed8', '#ffffff', '#ffffff']  
        };
        
        const [bg, accent, txt] = bgs[ba.bgPreset] || ['#dc2626', '#ffffff', '#ffffff'];
        
        variantStyles = { 
            ...fluidStyles,
            backgroundColor: bg, 
            color: txt, 
            fontWeight: '900', 
            padding: ba.intensity === 'strong' ? '40px' : '24px',
            position: 'relative',
            overflow: 'hidden',
            transform: ba.skew ? 'skewX(-6deg)' : 'none',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            borderLeft: ba.bgPreset === 'dark' ? `12px solid ${accent}` : 'none'
        };

        // Badge de "Plantão" estilo LFNM
        variantPre = (
            <div className={`mb-4 flex items-center gap-3 ${ba.skew ? 'skew-x-[6deg]' : ''} flex-wrap`}>
                <div className="bg-white px-3 py-1 rounded text-[9px] font-[1000] uppercase italic tracking-tighter shrink-0" style={{ color: bg === '#ffffff' ? '#000' : bg }}>
                    {ba.icon !== 'none' && <i className={`fas fa-${ba.icon === 'warning' ? 'triangle-exclamation' : ba.icon} mr-2`}></i>}
                    PLANTÃO LFNM
                </div>
                <div className="h-[2px] flex-1 bg-white/20 min-w-[50px]"></div>
            </div>
        );

        if (ba.animation === 'shimmer') {
            overlayEffect = <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none"></div>;
        } else if (ba.animation === 'pulse') {
            variantClasses = "animate-pulse-subtle";
        }

        variantClasses += " rounded-2xl md:rounded-[2rem]";
    }

    else if (variant === 'police_siren') {
        const ps = perStyle.police_siren || { mode: 'glow', animate: true, palette: 'redBlue' };
        variantStyles = { 
            ...fluidStyles,
            border: ps.border === 'none' ? 'none' : `4px ${ps.border || 'solid'} ${ps.palette === 'redBlue' ? '#1d4ed8' : '#dc2626'}`, 
            padding: '20px', 
            backgroundColor: ps.palette === 'redBlue' ? '#eff6ff' : '#fef2f2', 
            fontWeight: '800' 
        };
        variantClasses = `${ps.mode === 'glow' ? 'siren-glow' : 'siren-tape'} ${ps.animate ? 'animate-siren' : ''} palette-${ps.palette}`;
    }

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className={`${variantClasses} transition-all duration-500 overflow-hidden group`}>
            {overlayEffect}
            <div className={`w-full ${variant === 'breaking_alert' && perStyle.breaking_alert?.skew ? 'skew-x-[6deg]' : ''}`}>
                {variantPre}
                <Tag 
                    ref={contentRef} 
                    contentEditable 
                    onInput={handleInput} 
                    className="focus:outline-none min-h-[1.5em] text-2xl md:text-4xl uppercase italic tracking-tighter leading-[0.95] relative z-10 w-full break-words" 
                    role="textbox" 
                    aria-multiline="true"
                    data-placeholder="ESCREVA O ALERTA AQUI..."
                />
                {variantPost}
            </div>
            
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }
            `}</style>
        </div>
    );
};
