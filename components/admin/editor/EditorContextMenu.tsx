// Version: 1.107 - Corrigido bug de duplicação de botão e aumentado z-index para 99999
import React, { useEffect, useRef } from 'react';

interface EditorContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string, value?: string) => void;
  currentType?: string;
}

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-between gap-1 p-2 border-b border-white/10 last:border-0">
    {children}
  </div>
);

interface BtnProps {
  icon: string;
  action: string;
  val?: string;
  label: string;
  active?: boolean;
  color?: string;
  onAction: (action: string, value?: string) => void;
}

const Btn: React.FC<BtnProps> = ({ icon, action, val, label, active, color, onAction }) => (
  <button
    onClick={() => onAction(action, val)}
    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/20 ${active ? 'bg-red-600 text-white' : (color || 'text-zinc-400')}`}
    title={label}
  >
    <i className={`fas ${icon} text-xs`}></i>
  </button>
);

const EditorContextMenu: React.FC<EditorContextMenuProps> = ({ x, y, onClose, onAction, currentType }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Ajusta posição se sair da tela
  const style = {
    top: Math.min(y, window.innerHeight - 450),
    left: Math.min(x, window.innerWidth - 280),
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-[99999] w-72 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl animate-fadeIn overflow-hidden flex flex-col"
    >
      <div className="bg-black/40 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/10 flex justify-between items-center">
        <span>Ferramentas de Texto</span>
        <span className="text-red-600"><i className="fas fa-pen-nib"></i></span>
      </div>

      {/* AÇÕES PRINCIPAIS */}
      <div className="p-2 border-b border-white/10">
        <button onClick={() => onAction('openInspector')} className="w-full text-left px-3 py-2 text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-3 transition-colors shadow-lg group">
          <i className="fas fa-sliders-h text-xs w-4 text-center group-hover:rotate-180 transition-transform"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Editar Bloco</span>
        </button>
      </div>

      {/* 1. ESTILO BÁSICO */}
      <Row>
        <Btn icon="fa-bold" action="format" val="bold" label="Negrito" onAction={onAction} />
        <Btn icon="fa-italic" action="format" val="italic" label="Itálico" onAction={onAction} />
        <Btn icon="fa-underline" action="format" val="underline" label="Sublinhado" onAction={onAction} />
        <Btn icon="fa-strikethrough" action="format" val="strikethrough" label="Riscado" onAction={onAction} />
        <Btn icon="fa-eraser" action="format" val="removeFormat" label="Limpar Estilo" color="text-red-400" onAction={onAction} />
      </Row>

      {/* 2. AVANÇADO & LINKS */}
      <Row>
        <Btn icon="fa-subscript" action="format" val="subscript" label="Subscrito" onAction={onAction} />
        <Btn icon="fa-superscript" action="format" val="superscript" label="Sobrescrito" onAction={onAction} />
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <Btn icon="fa-link" action="link" label="Inserir Link" color="text-blue-400" onAction={onAction} />
        <Btn icon="fa-image" action="triggerImage" label="Inserir Imagem" color="text-green-400" onAction={onAction} />
        <Btn icon="fa-unlink" action="format" val="unlink" label="Remover Link" onAction={onAction} />
      </Row>

      {/* 3. LISTAS E RECUO */}
      <Row>
        <Btn icon="fa-list-ul" action="format" val="insertUnorderedList" label="Lista com Marcadores" onAction={onAction} />
        <Btn icon="fa-list-ol" action="format" val="insertOrderedList" label="Lista Numerada" onAction={onAction} />
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <Btn icon="fa-indent" action="format" val="indent" label="Aumentar Recuo" onAction={onAction} />
        <Btn icon="fa-outdent" action="format" val="outdent" label="Diminuir Recuo" onAction={onAction} />
      </Row>

      {/* 4. ALINHAMENTO */}
      <Row>
        <Btn icon="fa-align-left" action="align" val="left" label="Esquerda" onAction={onAction} />
        <Btn icon="fa-align-center" action="align" val="center" label="Centro" onAction={onAction} />
        <Btn icon="fa-align-right" action="align" val="right" label="Direita" onAction={onAction} />
        <Btn icon="fa-align-justify" action="align" val="justify" label="Justificar" onAction={onAction} />
      </Row>

      {/* 5. CORES DE DESTAQUE */}
      <div className="p-3 border-b border-white/10">
        <p className="text-[7px] font-black uppercase text-zinc-600 mb-2">Cor do Texto</p>
        <div className="flex justify-between gap-2">
          {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff'].map(c => (
            <button
              key={c}
              onClick={() => onAction('foreColor', c)}
              className="w-5 h-5 rounded-full border border-white/10 hover:scale-125 transition-transform shadow-sm"
              style={{ backgroundColor: c }}
            />
          ))}
          <button onClick={() => onAction('foreColor', '#000000')} className="w-5 h-5 rounded-full border border-zinc-700 bg-black flex items-center justify-center text-[7px] text-white" title="Preto/Padrão">
            <i className="fas fa-undo"></i>
          </button>
        </div>
      </div>

      {/* 6. TRANSFORMAÇÃO DE BLOCO */}
      <div className="p-2 border-b border-white/10">
        <button onClick={() => onAction('convert', 'heading')} className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
          <i className="fas fa-heading text-xs w-4 text-center"></i>
          <span className="text-[9px] font-bold uppercase">Converter para Título</span>
        </button>
        <button onClick={() => onAction('convert', 'paragraph')} className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
          <i className="fas fa-paragraph text-xs w-4 text-center"></i>
          <span className="text-[9px] font-bold uppercase">Converter para Texto</span>
        </button>
        <button onClick={() => onAction('convert', 'quote')} className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
          <i className="fas fa-quote-right text-xs w-4 text-center"></i>
          <span className="text-[9px] font-bold uppercase">Converter para Citação</span>
        </button>
      </div>

      {/* 7. AÇÕES DESTRUTIVAS */}
      <div className="p-2 bg-red-900/10">
        <button onClick={() => onAction('delete')} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center gap-3 transition-colors group">
          <i className="fas fa-trash-alt text-xs w-4 text-center group-hover:animate-bounce"></i>
          <span className="text-[9px] font-black uppercase">Excluir Bloco</span>
        </button>
      </div>
    </div>
  );
};

export default EditorContextMenu;
