
import React from 'react';

interface EditorMobileDockProps {
    onCancel: () => void;
    onAddClick: () => void;
    onPublish: () => void;
    onInspectorToggle: () => void;
    onFormattingToggle: () => void;
    isFormattingOpen: boolean;
    isInspectorOpen: boolean;
    isLibraryOpen: boolean;
    isTextBlockSelected: boolean;
    selectedBlockId: string | null;
}

const EditorMobileDock: React.FC<EditorMobileDockProps> = ({
    onCancel, onAddClick, onPublish, onInspectorToggle, onFormattingToggle,
    isFormattingOpen, isInspectorOpen, isLibraryOpen, isTextBlockSelected, selectedBlockId
}) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-[1800] flex justify-between items-center px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all animate-slideUp">
            {/* Left Group */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={onCancel}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Voltar"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                
                {isTextBlockSelected && (
                    <button 
                      onClick={onFormattingToggle}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFormattingOpen ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <i className="fas fa-font"></i>
                    </button>
                )}
            </div>

            {/* Center Action - Floating - HIDES when formatting is open to prevent overlap */}
            <div className={`absolute left-1/2 -top-6 -translate-x-1/2 transition-all duration-300 ${isFormattingOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <button 
                  onClick={onAddClick}
                  className={`w-16 h-16 rounded-full text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center border-[6px] border-[#f4f4f7] hover:scale-110 active:scale-95 transition-all ${isLibraryOpen ? 'bg-white text-red-600' : 'bg-red-600'}`}
                >
                    <i className={`fas ${isLibraryOpen ? 'fa-times' : 'fa-plus'} text-2xl`}></i>
                </button>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={onInspectorToggle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isInspectorOpen ? 'bg-white text-black' : (selectedBlockId ? 'text-blue-400' : 'text-zinc-400 hover:text-white hover:bg-white/10')}`}
                >
                    <i className="fas fa-sliders-h"></i>
                </button>
                
                <button 
                  onClick={onPublish}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-green-500 hover:text-white hover:bg-green-600/20 transition-all"
                  title="Publicar"
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

export default EditorMobileDock;
