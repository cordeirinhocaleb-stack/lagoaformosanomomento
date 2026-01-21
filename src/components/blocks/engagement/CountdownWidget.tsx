import React, { useState, useEffect } from 'react';
import { WidgetProps } from './types';

export const CountdownWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { targetDate, endMessage } = block.settings;
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!targetDate) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(targetDate as string).getTime();
            const distance = target - now;

            if (distance < 0) {
                setIsFinished(true);
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                clearInterval(interval);
            } else {
                setIsFinished(false);
                setTimeLeft({
                    d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (!targetDate) return <div className="text-center text-xs opacity-50">Data não configurada</div>;

    return (
        <div className="py-4 text-center">
            {isFinished ? (
                <div className="animate-pulse">
                    <h2 className="text-2xl font-black mb-2" style={{ color: accentColor }}>{endMessage || "O evento começou!"}</h2>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { val: timeLeft?.d || 0, label: 'Dias' },
                        { val: timeLeft?.h || 0, label: 'Hrs' },
                        { val: timeLeft?.m || 0, label: 'Min' },
                        { val: timeLeft?.s || 0, label: 'Seg' }
                    ].map((item, i) => (
                        <div key={i} className={`flex flex-col items-center p-3 rounded-lg border-2 ${theme.classes.secondary}`}>
                            <span className={`text-2xl md:text-3xl font-black ${theme.classes.text}`}>{item.val.toString().padStart(2, '0')}</span>
                            <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
