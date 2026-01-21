
import React, { useState, useMemo } from 'react';
import { Job } from '@/types';
import { generateWhatsAppLink } from '@/services/integrationService';
import Logo from '@/components/common/Logo';

interface JobsProps {
  jobs: Job[];
  onBack: () => void;
  isEnabled: boolean;
}

const Jobs: React.FC<JobsProps> = ({ jobs, onBack, isEnabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'todos' || job.type === filterType;
      return matchesSearch && matchesType && job.isActive;
    });
  }, [jobs, searchTerm, filterType]);

  // SVG Pattern para o fundo "Em Construção"
  const constructionPattern = `data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fill='%23f59e0b' font-family='Arial' font-weight='900' font-size='24' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 150 150)' opacity='0.15'%3EEM CONSTRUÇÃO %E2%80%A2 EM OBRAS%3C/text%3E%3C/svg%3E`;

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fadeIn font-['Caveat']">

        {/* Fundo com Texto Repetido "EM CONSTRUÇÃO" */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url("${constructionPattern}")` }}></div>

        {/* Video Container Clean (Sem borda preta grossa) */}
        <div className="absolute inset-0 z-0 p-8 md:p-12">
          <div className="w-full h-full relative rounded-[3rem] overflow-hidden shadow-2xl group border border-white/5">
            <div className="w-full h-full bg-black relative">
              <iframe
                src="https://player.vimeo.com/video/1150718999?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0"
                className="w-full h-full absolute inset-0 pointer-events-none scale-[1.5]"
                frameBorder="0"
                loading="eager"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Maintenance Video"
              ></iframe>
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-black hover:text-white flex items-center gap-2 text-xl font-bold transition-colors z-50 bg-[#f3e5ab] hover:bg-black px-6 py-2 rounded-full shadow-lg"
        >
          Vortá pra trás
        </button>

        <div className="text-center relative z-10 max-w-4xl bg-black/80 backdrop-blur-md p-12 md:p-20 rounded-[3rem] border-2 border-[#f3e5ab]/50 shadow-2xl">

          <h1 className="text-6xl md:text-9xl font-bold text-[#f3e5ab] mb-4 leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transform -rotate-2">
            Uai trem,<br /> tu q issu?
          </h1>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 drop-shadow-md">
            Uai ce quer trabaia?
          </h2>

          <div className="w-full h-1.5 bg-[#f3e5ab]/20 rounded-full overflow-hidden max-w-xs mx-auto mb-10 border border-[#f3e5ab]/30">
            <div className="h-full bg-[#f3e5ab] w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>

          <p className="text-white font-bold text-3xl md:text-5xl leading-relaxed drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
            "Calma ai soh, tamu ajeitanu."
          </p>
        </div>

        <style>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
                100% { transform: translateX(300%); }
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <button
            onClick={onBack}
            className="mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i> Voltar ao Portal
          </button>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
            Balcão de <span className="text-red-600">Empregos</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-xl">
            Conectando talentos às melhores oportunidades de Lagoa Formosa e região. Encontre sua próxima conquista profissional aqui.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por cargo ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-xl border border-transparent focus:border-red-200 outline-none transition-all font-medium text-gray-700"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['todos', 'CLT', 'PJ', 'Estágio'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-red-50"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block ${job.type === 'CLT' ? 'bg-blue-50 text-blue-600' :
                          job.type === 'PJ' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                        }`}>
                        {job.type}
                      </span>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight mb-1">{job.title}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <i className="fas fa-map-marker-alt text-red-500 w-5"></i>
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <i className="fas fa-money-bill-wave text-green-500 w-5"></i>
                        {job.salary}
                      </div>
                    )}
                    <p className="text-gray-500 text-sm leading-relaxed mt-4 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-300 uppercase">
                      Postado em {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={generateWhatsAppLink(job.whatsapp, 'job_application', job.title, job.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
                    >
                      Candidatar-se <i className="fab fa-whatsapp text-lg"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full relative py-32 rounded-[3rem] overflow-hidden group font-['Caveat'] shadow-2xl bg-black border border-white/10">
              {/* Fundo com Texto Repetido */}
              <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url("${constructionPattern}")` }}></div>

              <div className="absolute inset-0 z-0 bg-black">
                <iframe
                  src="https://player.vimeo.com/video/1150718999?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0"
                  className="w-full h-full absolute inset-0 pointer-events-none scale-[1.5]"
                  frameBorder="0"
                  loading="eager"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Background Video"
                ></iframe>
                <div className="absolute inset-0 bg-black/60"></div>
              </div>

              <div className="relative z-10 text-center p-8">
                <h2 className="text-6xl md:text-8xl font-bold text-[#f3e5ab] mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                  Uai trem, tu q issu?
                </h2>
                <p className="text-white font-bold text-3xl md:text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                  "Uai ce quer trabaia? Calma ai soh, tamu ajeitanu."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
