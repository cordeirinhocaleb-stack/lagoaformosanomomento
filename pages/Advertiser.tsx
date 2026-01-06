
import React from 'react';
import { Advertiser } from '../types';
import Logo from '../components/common/Logo';
import { generateWhatsAppLink } from '../services/integrationService';
import PromoPopup from '../components/home/PromoPopup'; // Importado Legado

interface AdvertiserPageProps {
  advertiser: Advertiser;
  onBack: () => void;
}

const AdvertiserPage: React.FC<AdvertiserPageProps> = ({ advertiser, onBack }) => {
  const pageData = advertiser.internalPage;
  
  const contactLink = generateWhatsAppLink(
    pageData?.whatsapp, 
    'advertiser_contact', 
    advertiser.name, 
    advertiser.id
  );

  // Configuração do Popup Legado específica para esta página
  // Força o target para 'advertiser_page' para que o PromoPopup aceite exibir aqui
  const popupConfig = advertiser.popup ? {
      ...advertiser.popup,
      targetPages: ['advertiser_page'] as any
  } : undefined;

  return (
    <div className="bg-gray-50 min-h-screen animate-fadeIn pb-24">
      
      {/* POPUP EXCLUSIVO DO ANUNCIANTE (SISTEMA DUPLO) */}
      <PromoPopup config={popupConfig} />
      {/* PromoPopupHost movido para App.tsx para cobertura global */}

      <div className="relative w-full h-64 md:h-96 bg-gray-900 overflow-hidden">
        {advertiser.bannerUrl ? (
          <img 
            src={advertiser.bannerUrl} 
            alt={advertiser.name}
            loading="lazy"
            width="1600"
            height="600"
            className="w-full h-full object-cover object-center opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
            <i className={`fas ${advertiser.logoIcon || 'fa-store'} text-9xl text-white/10`}></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/60"></div>

        <button 
          onClick={onBack}
          className="absolute top-6 left-4 bg-white/90 backdrop-blur text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="absolute -bottom-12 left-6 md:left-20">
          <div className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-3xl shadow-2xl p-2 flex items-center justify-center border-4 border-white">
            {advertiser.logoUrl ? (
              <img src={advertiser.logoUrl} alt="Logo" loading="lazy" width="200" height="200" className="w-full h-full object-contain rounded-xl" />
            ) : (
              <i className={`fas ${advertiser.logoIcon || 'fa-store'} text-4xl md:text-6xl text-red-600`}></i>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-16 md:pt-20 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">
                {advertiser.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Aberto Agora
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black uppercase text-gray-900 tracking-tighter mb-4">
              {advertiser.name}
            </h1>
            {pageData?.location && (
              <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-red-600"></i> {pageData.location}
              </p>
            )}
          </div>

          <div className="flex gap-3">
             {pageData?.whatsapp && (
               <a 
                 href={contactLink}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-200"
               >
                 <i className="fab fa-whatsapp text-lg"></i> Chamar
               </a>
             )}
             {pageData?.instagram && (
               <a 
                 href={`https://instagram.com/${pageData.instagram.replace('@','')}`}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-pink-200"
               >
                 <i className="fab fa-instagram text-lg"></i> Perfil
               </a>
             )}
          </div>
        </div>

        {pageData?.description && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Sobre o Parceiro</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {pageData.description}
            </p>
          </div>
        )}

        {pageData?.products && pageData.products.length > 0 && (
          <div className="mb-20">
             <h3 className="text-xl md:text-2xl font-black uppercase text-gray-900 tracking-tight mb-8 flex items-center gap-3">
               <i className="fas fa-tag text-red-600"></i> Ofertas & Destaques
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageData.products.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all group">
                    <div className="h-48 overflow-hidden relative bg-gray-100">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} loading="lazy" width="600" height="600" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <i className="fas fa-image text-4xl"></i>
                        </div>
                      )}
                      {product.price && (
                        <div className="absolute bottom-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg font-black text-sm shadow-lg">
                          {product.price}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">{product.name}</h4>
                      {product.description && (
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex gap-2">
                        <a 
                          href={generateWhatsAppLink(pageData?.whatsapp, 'classified_buy', product.name, product.id)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-green-50 text-green-700 py-2 rounded-lg text-xs font-black uppercase hover:bg-green-600 hover:text-white transition-colors border border-green-200"
                        >
                          <i className="fab fa-whatsapp mr-1"></i> Tenho Interesse
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserPage;
