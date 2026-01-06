import React, { useState, useEffect } from 'react';
import { fetchDailyBreadWithLookahead } from '../../services/supabaseService';
import { DailyBreadData } from '../../types';

const FALLBACK_BREAD: DailyBreadData = {
    date: new Date().toISOString().split('T')[0],
    verse: "O Senhor é o meu pastor, nada me faltará.",
    reference: "Salmos 23:1",
    reflection: "Deus cuida de cada detalhe da sua vida em nossa querida Lagoa Formosa.",
    wordOfDay: "CUIDADO",
    theme: "Fé"
};

const DailyBread: React.FC = () => {
  const [data, setData] = useState<DailyBreadData | null>(null);
  const [upcoming, setUpcoming] = useState<DailyBreadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
        try {
            const { today, upcoming } = await fetchDailyBreadWithLookahead();
            if (isMounted) {
                setData(today || FALLBACK_BREAD);
                setUpcoming(upcoming || []);
            }
        } catch (e) {
            console.error("Falha ao carregar Pão Diário", e);
            if (isMounted) setData(FALLBACK_BREAD);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    loadContent();
    return () => { isMounted = false; };
  }, []);

  if (loading && !data) {
      return (
          <div className="w-full h-64 flex items-center justify-center bg-[#f8f5f2] border-t border-gray-200">
              <div className="flex flex-col items-center gap-4">
                  <i className="fas fa-dove animate-bounce text-[#d4c4a8] text-4xl"></i>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Preparando Mensagem Diária...</p>
              </div>
          </div>
      );
  }

  // Se após carregar ainda não tiver dados (raro), usa o fallback final
  const bread = data || FALLBACK_BREAD;

  return (
    <section className="w-full bg-[#f8f5f2] py-16 px-4 md:px-10 overflow-hidden relative border-t-8 border-double border-[#d4c4a8] group animate-fadeIn">
      
      {/* Pattern de Fundo Sutil */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header: Temas dos Próximos Dias */}
        {upcoming.length > 0 && (
            <div className="flex justify-center mb-10 overflow-x-auto scrollbar-hide">
                <div className="bg-white/80 backdrop-blur-sm border border-[#e5e0d8] rounded-full px-2 py-2 flex gap-2 md:gap-4 shadow-sm items-center whitespace-nowrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#8c7b6e] pl-2 hidden md:inline">Próximos Temas:</span>
                    {upcoming.map((item, idx) => (
                        <div key={idx} className="bg-[#f0ece9] px-4 py-1.5 rounded-full flex items-center gap-2">
                            <span className="text-[8px] font-bold uppercase text-[#a89b90] tracking-wider">
                                {new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className="text-[9px] font-black uppercase text-[#5c5046] tracking-tight">{item.theme}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Card Principal */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#a89b90]/20 border border-[#e5e0d8] p-8 md:p-14 text-center relative overflow-hidden transform transition-transform duration-700 hover:scale-[1.01]">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d4c4a8] via-[#8c7b6e] to-[#d4c4a8]"></div>
            
            <div className="absolute -top-10 -right-10 text-[10rem] text-[#f8f5f2] rotate-12 pointer-events-none">
                <i className="fas fa-bible"></i>
            </div>

            <div className="mb-8">
                <div className="inline-flex items-center gap-3 bg-black text-white px-5 py-2 rounded-full mb-6 shadow-lg">
                    <i className="fas fa-dove text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pão Diário</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-black text-[#2c241b] leading-tight italic">
                    "{bread.verse}"
                </h2>
                <div className="mt-6 flex justify-center">
                    <span className="border-b-2 border-red-600 pb-1 text-sm font-black uppercase tracking-widest text-red-700">
                        {bread.reference}
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-[#f8f5f2] p-6 rounded-2xl border border-[#e5e0d8] mb-8 relative">
                <i className="fas fa-quote-left absolute -top-3 -left-2 text-2xl text-[#d4c4a8] bg-white rounded-full p-1"></i>
                <p className="text-[#5c5046] font-medium text-sm md:text-base leading-relaxed italic">
                    {bread.reflection}
                </p>
            </div>

            <div className="border-t border-[#f0ece9] pt-8 flex flex-col items-center gap-2">
                <span className="text-[8px] font-black uppercase text-[#a89b90] tracking-[0.4em]">Palavra Chave</span>
                <span className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#2c241b] to-[#8c7b6e]">
                    {bread.wordOfDay}
                </span>
            </div>
        </div>

        <div className="text-center mt-8">
            <p className="text-[9px] font-bold text-[#8c7b6e] uppercase tracking-widest">
                Rede Welix Duarte • Alimentando a Alma
            </p>
        </div>
      </div>
    </section>
  );
};

export default DailyBread;