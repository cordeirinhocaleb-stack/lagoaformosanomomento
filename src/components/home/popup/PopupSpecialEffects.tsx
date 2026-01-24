import React, { useEffect, useState } from 'react';

interface PopupSpecialEffectsProps {
    effect?: string;
}

export const PopupSpecialEffects: React.FC<PopupSpecialEffectsProps> = ({ effect }) => {
    if (!effect || effect === 'none') return null;

    // --- EFFECT: PULSE RED (Urgency) ---
    if (effect === 'pulse_red') {
        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                <div className="absolute inset-0 bg-red-600/20 animate-pulse"></div>
                <div className="absolute -inset-4 border-4 border-red-500/50 rounded-[inherit] animate-[ping_1.5s_ease-in-out_infinite] opacity-50"></div>
            </div>
        );
    }

    // --- EFFECT: SPARKLES (Luxury) ---
    if (effect === 'sparkles') {
        // Simple CSS particle system
        const particles = Array.from({ length: 12 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            scale: 0.5 + Math.random() * 0.5
        }));

        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-pulse shadow-[0_0_4px_#fde047]"
                        style={{
                            left: p.left,
                            top: p.top,
                            animationDelay: p.delay,
                            transform: `scale(${p.scale})`
                        }}
                    ></div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-500/5 to-transparent opacity-20"></div>
            </div>
        );
    }

    // --- EFFECT: HEARTS (Love) ---
    if (effect === 'hearts') {
        const hearts = Array.from({ length: 8 }).map((_, i) => ({
            left: `${10 + Math.random() * 80}%`,
            delay: `${Math.random() * 3}s`,
            duration: `${3 + Math.random() * 2}s`
        }));

        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                {hearts.map((h, i) => (
                    <div
                        key={i}
                        className="absolute text-pink-500/40 text-lg animate-[float_4s_linear_infinite]"
                        style={{
                            left: h.left,
                            bottom: '-20px',
                            animationDelay: h.delay,
                            animationDuration: h.duration
                        }}
                    >
                        ❤️
                    </div>
                ))}
                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                        20% { opacity: 0.6; }
                        100% { transform: translateY(-300px) rotate(360deg); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: SNOW (Christmas) ---
    if (effect === 'snow') {
        const flakes = Array.from({ length: 20 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 4}s`
        }));

        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                {flakes.map((f, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-80"
                        style={{
                            left: f.left,
                            top: '-10px',
                            animation: `fall ${f.duration} linear infinite`,
                            animationDelay: f.delay
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes fall {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(500px); }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: CONFETTI (Carnival) ---
    if (effect === 'confetti') {
        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
        const confetti = Array.from({ length: 25 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            bg: colors[Math.floor(Math.random() * colors.length)],
            delay: `${Math.random() * 2}s`,
            duration: `${2 + Math.random() * 1}s`
        }));

        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                {confetti.map((c, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-3 opacity-90"
                        style={{
                            left: c.left,
                            top: '-20px',
                            backgroundColor: c.bg,
                            animation: `fall-spin ${c.duration} linear infinite`,
                            animationDelay: c.delay
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes fall-spin {
                        0% { transform: translateY(0) rotate(0deg); }
                        100% { transform: translateY(500px) rotate(720deg); }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: TECH GRID (Modern) ---
    if (effect === 'matrix' || effect === 'glitch' || effect === 'scanline') {
        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit] opacity-30">
                <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-[scan_2s_linear_infinite]"></div>
                <style>{`
                    @keyframes scan {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: BOKEH / GRADIENT WAVE (Social) ---
    if (effect === 'bokeh' || effect === 'gradient_wave') {
        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 animate-[spin_10s_linear_infinite]" style={{ filter: 'blur(50px)' }}></div>
            </div>
        );
    }

    return null;
};
