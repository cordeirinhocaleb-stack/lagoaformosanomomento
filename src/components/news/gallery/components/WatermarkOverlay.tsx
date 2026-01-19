import React from 'react';

export const WatermarkOverlay: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    return (
        <div className="absolute bottom-0 right-0 w-[40%] z-40 pointer-events-none select-none">
            <div className="bg-gradient-to-r from-zinc-950/95 to-zinc-950/98 backdrop-blur-lg px-4 py-2.5 flex items-center justify-end border-t border-l border-zinc-700/30">
                <span className="text-white text-[10px] font-semibold uppercase tracking-wider">
                    lagoaformosanomomento.com.br
                </span>
            </div>
        </div>
    );
};
