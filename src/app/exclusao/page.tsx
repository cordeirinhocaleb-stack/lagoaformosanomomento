
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import { Trash2, ShieldCheck, Mail, AlertTriangle, ChevronRight } from 'lucide-react';

export default function ExclusaoPage() {
    const ctrl = useAppControllerContext();

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
                                <a href="/politicas" className="flex items-center justify-between p-3 rounded-xl text-gray-500 hover:bg-gray-100 font-black uppercase text-[10px] tracking-widest transition-all">
                                    <span>Privacidade</span>
                                    <ChevronRight className="w-3 h-3" />
                                </a>
                                <a href="/exclusao" className="flex items-center justify-between p-3 rounded-xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20">
                                    <span>Exclusão</span>
                                    <ChevronRight className="w-3 h-3" />
                                </a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-2xl relative overflow-hidden">
                        {/* Background Icon */}
                        <Trash2 className="absolute -bottom-10 -right-10 w-64 h-64 text-gray-200/50 -rotate-12 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 text-red-600 font-black uppercase text-[10px] tracking-[0.3em] mb-6">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Segurança do Usuário</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8">
                                Exclusão de <span className="text-red-600">Dados</span>
                            </h1>

                            <div className="space-y-10">
                                <section>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs">1</span>
                                        Como solicitar a exclusão
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed font-medium pl-11">
                                        Você tem o direito total de solicitar a remoção permanente de todos os seus dados pessoais do portal **Lagoa Formosa No Momento**. Para isso, basta enviar um e-mail para:
                                    </p>
                                    <div className="mt-4 ml-11 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm inline-flex items-center gap-4 group hover:border-red-600 transition-all cursor-pointer">
                                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                            <Mail className="w-6 h-6 text-red-600 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail para suporte</p>
                                            <p className="text-lg font-black text-gray-900 lowercase">{ctrl.systemSettings.footer?.email || 'contato@lagoaformosanomomento.com.br'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs">2</span>
                                        Prazo de Processamento
                                    </h2>
                                    <div className="ml-11 bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                                        <p className="text-amber-900 text-sm font-bold leading-relaxed">
                                            Após a solicitação, sua conta entrará em um período de quarentena de **30 dias**. Durante este tempo, seus dados permanecem inativos. Após este prazo, a exclusão é **definitiva e irreversível**.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs">3</span>
                                        O que será excluído?
                                    </h2>
                                    <ul className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            'Perfil e foto de usuário',
                                            'E-mail e telefone de contato',
                                            'Histórico de navegação interno',
                                            'Logs de atividade pessoal',
                                            'Assinaturas e preferências',
                                            'Vínculos com redes sociais'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-500 uppercase">
                                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Em conformidade com a LGPD e políticas de plataformas parceiras (Meta/Facebook).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer settings={ctrl.systemSettings} />
        </div>
    );
}
