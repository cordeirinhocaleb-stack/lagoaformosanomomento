'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import { Store, Search } from 'lucide-react';

export default function ServicesPage() {
    const ctrl = useAppControllerContext();
    const { user, systemSettings, advertisers } = ctrl;
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Advertisers
    const filteredAdvertisers = advertisers.filter(ad =>
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header
                onAdminClick={() => { if (user) { if (user.role === 'Leitor') { ctrl.modals.setShowProfileModal(true); } else { ctrl.updateHash('/admin'); } } else { ctrl.modals.setShowLoginModal(true); } }}
                onHomeClick={() => ctrl.updateHash('/')}
                latestNews={ctrl.tickerNews}
                externalNews={ctrl.marqueeNews}
                user={user} onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                selectedRegion={ctrl.selectedRegion} onSelectRegion={ctrl.handleRegionSelection}
                onComingSoon={ctrl.modals.openComingSoonModal}
            />

            <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 py-8">

                {/* Content Area */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl min-h-[500px] overflow-hidden">

                    {/* ADVERTISERS CONTENT (Guia Comercial) */}
                    <div className="p-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Store className="text-red-600" /> Catálogo de Parceiros
                            </h2>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar empresa ou categoria..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-red-200 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                            {filteredAdvertisers.map(ad => {
                                const pageData = ad.internalPage;
                                const hasWhatsapp = ad.redirectType === 'whatsapp' || pageData?.whatsapp;
                                const hasInstagram = ad.redirectType === 'instagram' || pageData?.instagram;
                                const hasLocation = pageData?.location || ad.address;
                                const hasPhone = ad.phone;
                                const hasEmail = ad.email;

                                return (
                                    <div
                                        key={ad.id}
                                        className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-2xl transition-all flex flex-col relative"
                                    >
                                        {/* Full Image Section */}
                                        <div className="w-full aspect-[4/3] bg-gray-50 p-4 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                            <img
                                                src={(ad as any).logo || (ad as any).logoUrl || 'https://via.placeholder.com/300'}
                                                alt={ad.name}
                                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 z-0"
                                            />
                                            {/* Status Indicator */}
                                            <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${ad.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                {ad.isActive ? 'Aberto' : 'Fechado'}
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col flex-grow">
                                            <div className="mb-4">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-1 block">{ad.category}</span>
                                                <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-2">{ad.name}</h3>
                                            </div>

                                            {/* Contact Info List with Text */}
                                            <div className="space-y-2 mt-auto">

                                                {/* WhatsApp */}
                                                {hasWhatsapp && (
                                                    <button
                                                        onClick={() => {
                                                            const phone = pageData?.whatsapp?.replace(/\D/g, '') || '';
                                                            window.open(`https://wa.me/55${phone}`, '_blank');
                                                        }}
                                                        className="w-full flex items-center p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-500 hover:text-white transition-all group/btn"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-green-200 text-green-700 flex items-center justify-center mr-2 group-hover/btn:bg-white group-hover/btn:text-green-600 transition-colors shrink-0">
                                                            <i className="fab fa-whatsapp text-sm"></i>
                                                        </div>
                                                        <div className="text-left overflow-hidden">
                                                            <span className="block text-[9px] font-bold uppercase opacity-70">WhatsApp</span>
                                                            <span className="block text-xs font-bold truncate">Chamar Agora</span>
                                                        </div>
                                                    </button>
                                                )}

                                                {/* Location */}
                                                {hasLocation && (
                                                    <button
                                                        onClick={() => {
                                                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hasLocation || '')}`, '_blank');
                                                        }}
                                                        className="w-full flex items-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white transition-all group/btn"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-700 flex items-center justify-center mr-2 group-hover/btn:bg-white group-hover/btn:text-blue-600 transition-colors shrink-0">
                                                            <i className="fas fa-map-marker-alt text-sm"></i>
                                                        </div>
                                                        <div className="text-left overflow-hidden w-full">
                                                            <span className="block text-[9px] font-bold uppercase opacity-70">Endereço</span>
                                                            <span className="block text-xs font-bold truncate w-full">{hasLocation}</span>
                                                        </div>
                                                    </button>
                                                )}

                                                {/* Instagram */}
                                                {hasInstagram && (
                                                    <button
                                                        onClick={() => {
                                                            const user = pageData?.instagram?.replace('@', '').trim() || '';
                                                            window.open(`https://instagram.com/${user}`, '_blank');
                                                        }}
                                                        className="w-full flex items-center p-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-500 hover:text-white transition-all group/btn"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-pink-200 text-pink-700 flex items-center justify-center mr-2 group-hover/btn:bg-white group-hover/btn:text-pink-600 transition-colors shrink-0">
                                                            <i className="fab fa-instagram text-sm"></i>
                                                        </div>
                                                        <div className="text-left overflow-hidden">
                                                            <span className="block text-[9px] font-bold uppercase opacity-70">Instagram</span>
                                                            <span className="block text-xs font-bold truncate">{pageData?.instagram || 'Ver Perfil'}</span>
                                                        </div>
                                                    </button>
                                                )}

                                                {/* Phone / Email */}
                                                {(hasPhone || hasEmail) && (
                                                    <button
                                                        onClick={() => hasPhone
                                                            ? window.open(`tel:${ad.phone?.replace(/\D/g, '')}`, '_self')
                                                            : window.open(`mailto:${ad.email}`, '_self')
                                                        }
                                                        className="w-full flex items-center p-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-black hover:text-white transition-all group/btn"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center mr-2 group-hover/btn:bg-white group-hover/btn:text-black transition-colors shrink-0">
                                                            <i className={`fas ${hasPhone ? 'fa-phone' : 'fa-envelope'} text-sm`}></i>
                                                        </div>
                                                        <div className="text-left overflow-hidden">
                                                            <span className="block text-[9px] font-bold uppercase opacity-70">{hasPhone ? 'Telefone' : 'Email'}</span>
                                                            <span className="block text-xs font-bold truncate">{hasPhone || ad.email}</span>
                                                        </div>
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>

            <Footer settings={systemSettings} />
        </div>
    );
}

// Add simple CSS animation for fade in
const style = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`;
