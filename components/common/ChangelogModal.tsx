
import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Zap, ShieldCheck, Globe, Info } from 'lucide-react';
import changelogData from '../../config/changelog.json';

interface UpdateItem {
    id: string;
    category: 'feature' | 'improvement' | 'fix';
    version: string;
    title: string;
    description: string;
}

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Get current version from Vite env
    const CURRENT_VERSION = import.meta.env.PACKAGE_VERSION || 'DEV';

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const updates: UpdateItem[] = useMemo(() => {
        const items: UpdateItem[] = [];
        let idCounter = 1;

        // Parse JSON from backend
        // Structure: [{ version, date, items: [{ category, title, description }] }]
        (changelogData as any[]).forEach((release) => {
            release.items.forEach((item: any) => {
                items.push({
                    id: `up-${idCounter++}`,
                    category: item.category as any,
                    version: release.version, // e.g., 0.1.0
                    title: item.title,
                    description: item.description
                });
            });
        });

        return items;
    }, []);

    const categories = {
        feature: { label: 'Novidade', color: 'bg-emerald-500', icon: <Sparkles className="w-3 h-3" /> },
        improvement: { label: 'Melhoria', color: 'bg-blue-500', icon: <Zap className="w-3 h-3" /> },
        fix: { label: 'Ajuste', color: 'bg-zinc-500', icon: <Info className="w-3 h-3" /> }
    };

    if (!isOpen && !isVisible) {return null;}

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all duration-500 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-red-600 to-red-900" />

                <div className="relative pt-6 px-6 pb-5">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-center text-center mt-2 mb-6">
                        <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-lg mb-3">
                            <CheckCircle2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-black dark:text-white leading-tight uppercase tracking-tight">
                            Central de <span className="text-red-600">Atualizações</span>
                        </h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">
                            Acompanhe as melhorias do seu portal
                        </p>
                    </div>

                    {/* Organized List Area */}
                    <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar focus:outline-none">

                        {/* Status Sections */}
                        {(['feature', 'improvement', 'fix'] as const).map(catKey => {
                            const catItems = updates.filter(u => u.category === catKey);
                            if (catItems.length === 0) {return null;}

                            return (
                                <div key={catKey} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded-full ${categories[catKey].color} text-white flex items-center gap-1.5`}>
                                            {categories[catKey].icon}
                                            <span className="text-[9px] font-black uppercase tracking-wider">{categories[catKey].label}</span>
                                        </div>
                                        <div className="flex-grow h-px bg-zinc-100 dark:bg-zinc-800" />
                                    </div>

                                    <div className="grid gap-2">
                                        {catItems.map(item => (
                                            <div
                                                key={item.id}
                                                className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50 hover:border-red-600/30 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-[12px] font-black text-zinc-900 dark:text-zinc-100 uppercase leading-snug tracking-tight group-hover:text-red-600 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <span className="text-[8px] font-bold font-mono text-zinc-400 mt-0.5">{item.version}</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-red-600/20"
                    >
                        Entendido, vamos lá!
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-zinc-400 dark:text-zinc-600 text-[8px] mt-4 uppercase tracking-[0.2em] font-black">
                        LFNM • SISTEMA v{CURRENT_VERSION}
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #dc2626;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #b91c1c;
                }
            `}} />
        </div>
    );
};

export default ChangelogModal;
