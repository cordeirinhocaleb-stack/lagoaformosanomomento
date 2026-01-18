import React from 'react';

const ContactInfo: React.FC = () => {
    return (
        <div className="flex flex-col gap-3 p-5 rounded-[2.5rem] bg-zinc-900 border border-white/10 relative overflow-hidden group animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-paper-plane text-sm"></i>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-widest leading-none">Contato Direto</span>
                    <h3 className="text-white text-xs md:text-sm font-bold uppercase tracking-tight">MANTENHA-SE <span className="text-red-500">CONECTADO</span></h3>
                </div>
            </div>

            <p className="text-zinc-500 text-[10px] md:text-[11px] leading-relaxed font-bold">
                Dúvidas, sugestões ou parcerias? Nossa equipe está pronta para te atender agora mesmo.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <a href="https://wa.me/5534999999999" target="_blank" className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-2xl flex flex-col items-center gap-1 transition-all">
                    <i className="fab fa-whatsapp text-green-500 text-sm"></i>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase">WhatsApp</span>
                </a>
                <a href="mailto:contato@lfnm.com.br" className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-2xl flex flex-col items-center gap-1 transition-all">
                    <i className="fas fa-envelope text-red-500 text-sm"></i>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase">E-mail</span>
                </a>
            </div>
        </div>
    );
};

export default ContactInfo;
