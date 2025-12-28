
import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1600',
    tag: 'Cobertura Exclusiva',
    title: 'LAGOA FORMOSA <br /><span className="text-red-600">CONECTADA</span> COM VOCÊ',
    description: 'Informação de verdade, com a credibilidade de quem conhece cada canto da nossa terra. Siga nosso Instagram para bastidores inéditos.',
    buttonText: 'Seguir @lagoaformosanomomento',
    link: 'https://instagram.com/lagoaformosanomomento'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&q=80&w=1600',
    tag: 'Espaço Premium',
    title: 'ANUNCIE SUA <span className="text-red-600">MARCA</span> <br />PARA TODA A REGIÃO',
    description: 'Alcance milhares de leitores diariamente. O Portal Lagoa Formosa no Momento é a vitrine ideal para o seu negócio crescer.',
    buttonText: 'Anunciar Agora',
    link: '#'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1600',
    tag: 'Agronegócio',
    title: 'O <span className="text-red-600">CAMPO</span> É O NOSSO <br />FORTE E ORGULHO',
    description: 'Acompanhe cotações, tecnologias e o dia a dia do produtor rural de Lagoa Formosa e Patos de Minas com Welix Duarte.',
    buttonText: 'Ver Notícias Agro',
    link: '#'
  }
];

const FullWidthPromo: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(timer);
  }, []);

  return (
    /* AJUSTE MOBILE: my-4 para reduzir o espaço no mobile, md:my-12 para desktop */
    <section className="w-full h-[400px] md:h-[550px] bg-black relative overflow-hidden my-4 md:my-12 group">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagem de Fundo */}
          <img 
            src={slide.image} 
            alt={slide.tag} 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          />
          
          {/* Overlay de Gradiente Panorâmico */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-20">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-4 animate-fadeInLeft">
                  <div className="h-1 w-12 bg-red-600"></div>
                  <span className="text-white text-xs md:text-sm font-black uppercase tracking-[0.4em]">
                    {slide.tag}
                  </span>
                </div>
                
                <h2 
                  className="text-white text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6 animate-fadeInUp"
                  dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                
                <p className="text-gray-300 text-sm md:text-xl font-medium max-w-xl mb-8 leading-relaxed animate-fadeInUp delay-100">
                  {slide.description}
                </p>
                
                <div className="flex flex-wrap gap-4 animate-fadeInUp delay-200">
                  <a 
                    href={slide.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white hover:text-red-600 transition-all flex items-center gap-3 shadow-2xl"
                  >
                    {slide.id === 1 && <i className="fab fa-instagram text-lg"></i>}
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Indicadores de Slide */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 transition-all rounded-full ${
              index === currentSlide ? 'w-10 bg-red-600' : 'w-4 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Badge Flutuante Fixo */}
      <div className="absolute top-10 right-10 hidden lg:flex flex-col items-end z-20">
        <div className="bg-red-600 text-white px-6 py-2 font-black uppercase italic tracking-tighter text-2xl skew-x-[-15deg] shadow-xl">
          AO VIVO
        </div>
        <div className="bg-black text-white px-4 py-1 font-bold text-[10px] uppercase tracking-widest mt-1">
          REDE WELIX DUARTE
        </div>
      </div>

      {/* Navegação Lateral (Seta) */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </section>
  );
};

export default FullWidthPromo;
