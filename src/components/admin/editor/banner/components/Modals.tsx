import React from 'react';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm?: () => void;
}

export const RemovalWarningModal: React.FC<ModalProps> = ({ visible, onClose }) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-red-600 animate-scaleIn">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 border-2 border-red-100">
                    <i className="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-xl font-black text-center uppercase tracking-tighter mb-4">Aviso de Limpeza</h3>
                <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-8">
                    Ao mudar para <span className="text-red-600 font-bold">Cine Studio</span>, suas imagens atuais da galeria serão removidas para dar lugar ao vídeo. Deseja continuar?
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                    <button onClick={onClose} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-red-600/20">Entendido</button>
                </div>
            </div>
        </div>
    );
};

export const GalleryConfirmationModal: React.FC<ModalProps> = ({ visible, onClose, onConfirm }) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-amber-500 animate-scaleIn">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 border-2 border-amber-100">
                    <i className="fas fa-images text-2xl"></i>
                </div>
                <h3 className="text-xl font-black text-center uppercase tracking-tighter mb-4">Mudar para Galeria</h3>
                <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-8">
                    Isso removerá o vídeo atual para permitir o upload de imagens. Confirmar transição?
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">Manter Vídeo</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-amber-500/20">Mudar Agora</button>
                </div>
            </div>
        </div>
    );
};
