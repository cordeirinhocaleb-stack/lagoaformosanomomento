import React from 'react';
import { createPortal } from 'react-dom';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const constructionPattern = `data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fill='%23f59e0b' font-family='Arial' font-weight='900' font-size='24' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 150 150)' opacity='0.15'%3EEM CONSTRUÇÃO • EM OBRAS%3C/text%3E%3C/svg%3E`;

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn font-['Caveat']" onClick={onClose}>
            <div className="bg-zinc-900 rounded-[2.5rem] p-1 max-w-md w-full text-center shadow-2xl relative overflow-hidden group" onClick={e => e.stopPropagation()}>
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url("${constructionPattern}")` }}></div>
                <div className="relative bg-black/50 rounded-[2.0rem] overflow-hidden h-full m-3 shadow-inner border border-white/10 backdrop-blur-sm">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <iframe
                            src="https://player.vimeo.com/video/1150718999?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0"
                            className="w-full h-full absolute inset-0 pointer-events-none scale-[1.5]"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Background Video"
                        ></iframe>
                    </div>
                    <div className="relative z-10 p-8 md:p-12 flex flex-col items-center">
                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce text-black">
                            <i className="fas fa-hard-hat text-4xl"></i>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">
                            Em Obras!
                        </h2>
                        <p className="text-white font-bold text-xl md:text-2xl leading-relaxed mb-8 drop-shadow-md">
                            "Calma ai soh, tamu ajeitanu essa parte!"
                        </p>
                        <button onClick={onClose} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-black text-lg hover:bg-white transition-colors shadow-lg uppercase tracking-widest transform hover:scale-105 font-sans">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ComingSoonModal;
