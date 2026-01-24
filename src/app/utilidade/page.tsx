'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import { Phone, MapPin, Heart, Ambulance, Activity, Pill, Building2 } from 'lucide-react';

interface ContactItem {
    name: string;
    phone: string;
    phone2?: string;
    sub?: string;
    isMobile?: boolean;
    icon?: React.ReactNode;
}

interface Category {
    category: string;
    icon: React.ReactNode;
    items: ContactItem[];
}

export default function UtilityPage() {
    const ctrl = useAppControllerContext();
    const { user, systemSettings } = ctrl;

    const contacts: Category[] = [
        {
            category: "Emergência & Hospitais",
            icon: <Ambulance className="w-6 h-6 text-red-600" />,
            items: [
                { name: "Pronto Atendimento", phone: "(34) 3824-0140", sub: "24 Horas" },
                { name: "Hosp. Dr Bininho", phone: "(34) 3824-2352", phone2: "(34) 3824-2563" },
                { name: "CISALP", phone: "(34) 3080-0315", phone2: "(34) 3824-1710" },
            ]
        },
        {
            category: "Secretaria & Gestão",
            icon: <Building2 className="w-6 h-6 text-blue-600" />,
            items: [
                { name: "Sec. de Saúde", phone: "(34) 3824-2259" },
                { name: "Vigilância Sanitária", phone: "(34) 99961-9137", isMobile: true },
                { name: "CEM", phone: "(34) 3824-1181" },
            ]
        },
        {
            category: "Especialidades",
            icon: <Activity className="w-6 h-6 text-emerald-600" />,
            items: [
                { name: "CEO (Odontologia)", phone: "(34) 3824-1723" },
                { name: "CAPS", phone: "(34) 3824-0191" },
                { name: "Clínica de Fisioterapia", phone: "(34) 3824-0501" },
                { name: "Farmacinha", phone: "(34) 3824-1473", icon: <Pill className="w-4 h-4" /> },
                { name: "Academia da Saúde", phone: "(34) 3824-0250" },
            ]
        },
        {
            category: "PSF - Unidades de Saúde",
            icon: <Heart className="w-6 h-6 text-rose-500" />,
            items: [
                { name: "PSF Sebastião Gontijo", phone: "(34) 3824-1581" },
                { name: "PSF Lázaro Mundim", phone: "(34) 3824-2310" },
                { name: "PSF Evandro dos Reis", phone: "(34) 3824-2015" },
                { name: "PSF Alzira Borges", phone: "(34) 3824-2311" },
                { name: "PSF Beatriz Garcia", phone: "(34) 3824-2692" },
                { name: "PSF Limeira de Minas", phone: "(34) 99839-384?", isMobile: true }, // Mantido conforme original, verificar último dígito
            ]
        }
    ];

    const handleCall = (number: string) => {
        const cleanNumber = number.replace(/\D/g, '');
        window.open(`tel:${cleanNumber}`, '_self');
    };

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
            />

            <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
                        Utilidade <span className="text-red-600">Pública</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Números úteis amigos da saúde (Lagoa Formosa MG)</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {contacts.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50/50 border-b border-gray-100 p-4 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    {cat.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">{cat.category}</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {cat.items.map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-red-50/30 transition-colors flex items-center justify-between group">
                                        <div>
                                            <p className="font-bold text-gray-700">{item.name}</p>
                                            {item.sub && <p className="text-xs text-red-500 font-bold uppercase tracking-wide mt-0.5">{item.sub}</p>}
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => handleCall(item.phone)}
                                                className="flex items-center gap-2 bg-gray-100 hover:bg-green-500 hover:text-white text-gray-600 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                            >
                                                <Phone className="w-3 h-3 fill-current" />
                                                <span className="font-mono font-bold text-sm tracking-tighter">{item.phone}</span>
                                            </button>
                                            {item.phone2 && (
                                                <button
                                                    onClick={() => handleCall(item.phone2!)}
                                                    className="flex items-center gap-2 bg-gray-100 hover:bg-green-500 hover:text-white text-gray-600 px-3 py-1.5 rounded-lg transition-all active:scale-95 mt-2"
                                                >
                                                    <Phone className="w-3 h-3 fill-current" />
                                                    <span className="font-mono font-bold text-sm tracking-tighter">{item.phone2}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-800 font-medium text-sm">
                        ⚠️ Em caso de emergência médica grave, ligue sempre para <span className="font-black text-lg">190</span> ou <span className="font-black text-lg">193</span>.
                    </p>
                </div>
            </main>

            <Footer settings={systemSettings} />
        </div>
    );
}
