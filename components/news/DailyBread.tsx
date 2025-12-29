
import React, { useState, useEffect } from 'react';
import { getDailyBiblicalMessage } from '../../services/geminiService';

const DailyBread: React.FC = () => {
  const [data, setData] = useState<{verse: string, reference: string, reflection: string, wordOfDay: string} | null>(null);

  useEffect(() => {
    getDailyBiblicalMessage().then(res => setData(res));
  }, []);

  if (!data) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 px-4 md:px-10 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-5">
        <i className="fas fa-dove text-[15rem] absolute -right-10 -top-10 rotate-12"></i>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-xl font-black uppercase italic tracking-tighter text-xs md:text-lg shadow-xl z-20">
          PÃO DIÁRIO
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-1 bg-red-600 mb-6 rounded-full"></div>
          
          <div className="mb-6 relative">
            <i className="fas fa-quote-left text-red-100 text-5xl md:text-7xl absolute -top-4 -left-6 opacity-40"></i>
            <h2 className="text-xl md:text-3xl font-black text-gray-900 serif leading-snug mb-4 italic px-4 relative z-10">
              "{data.verse}"
            </h2>
            <span className="text-red-600 font-black uppercase tracking-[0.2em] text-[9px] md:text-[11px] bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
              {data.reference}
            </span>
          </div>

          <div className="max-w-2xl">
            <p className="text-gray-500 text-xs md:text-base font-medium leading-relaxed mb-6">
              {data.reflection}
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6 w-full justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Palavra de hoje</span>
              <span className="text-lg md:text-xl font-[1000] text-black uppercase tracking-tighter italic">
                {data.wordOfDay}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-6">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Alimentando a alma em Lagoa Formosa</p>
      </div>
    </section>
  );
};

export default DailyBread;
