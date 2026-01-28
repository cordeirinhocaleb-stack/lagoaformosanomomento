
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import ReactMarkdown from 'react-markdown';
import { getTermsOfServiceContent, getPrivacyPolicyContent, TERMS_VERSION, TERMS_LAST_UPDATED } from '@/constants/termsOfService';
import { Shield, FileText, Lock, ChevronRight } from 'lucide-react';

export default function PoliticasPage() {
    const ctrl = useAppControllerContext();
    const privacyContent = getPrivacyPolicyContent();

    return (
        <div className="w-full flex flex-col min-h-screen bg-white">
            <Header
                onAdminClick={() => ctrl.updateHash('/admin')}
                onHomeClick={() => ctrl.updateHash('/')}
                latestNews={ctrl.tickerNews}
                externalNews={ctrl.marqueeNews}
                user={ctrl.user}
                onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                selectedCategory={ctrl.selectedCategory}
                onSelectCategory={ctrl.handleCategorySelection}
                selectedRegion={ctrl.selectedRegion}
                onSelectRegion={ctrl.handleRegionSelection}
            />

            <main className="flex-grow w-full max-w-[1000px] mx-auto px-4 py-12 md:py-24 animate-fadeIn">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Sidebar Nav */}
                    <aside className="w-full md:w-64 shrink-0 space-y-2 sticky top-32">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Legal</h3>
                            <nav className="space-y-1">
                                <a href="/termos" className="flex items-center justify-between p-3 rounded-xl text-gray-500 hover:bg-gray-100 font-black uppercase text-[10px] tracking-widest transition-all">
                                    <span>Termos de Uso</span>
                                    <ChevronRight className="w-3 h-3" />
                                </a>
                                <a href="/politicas" className="flex items-center justify-between p-3 rounded-xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20">
                                    <span>Privacidade</span>
                                    <ChevronRight className="w-3 h-3" />
                                </a>
                                <a href="/exclusao" className="flex items-center justify-between p-3 rounded-xl text-gray-500 hover:bg-gray-100 font-black uppercase text-[10px] tracking-widest transition-all">
                                    <span>Exclusão</span>
                                    <ChevronRight className="w-3 h-3" />
                                </a>
                            </nav>
                        </div>

                        <div className="px-6">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Versão {TERMS_VERSION}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Atualizado em: {TERMS_LAST_UPDATED}</p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl p-8 md:p-16 relative overflow-hidden">
                        <div className="inline-flex items-center gap-3 text-red-600 mb-8">
                            <Lock className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Dados & Segurança</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-12 border-b border-gray-100 pb-8">
                            Política de <br /><span className="text-red-600">Privacidade</span>
                        </h1>

                        <div className="prose prose-red max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900">
                            <ReactMarkdown>
                                {privacyContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Em caso de dúvidas, entre em contato: <span className="text-red-600">{ctrl.systemSettings.footer?.email || 'contato@lfnm.com.br'}</span>
                    </p>
                </div>
            </main>

            <Footer settings={ctrl.systemSettings} />
        </div>
    );
}
