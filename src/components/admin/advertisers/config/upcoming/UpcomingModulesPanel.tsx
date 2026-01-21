
import React from 'react';
import UpcomingModuleCard, { ModuleStatus } from './UpcomingModuleCard';

const MODULES = [
    {
        id: 'jobs',
        title: 'Balcão de Empregos',
        description: 'Plataforma completa para cadastro de vagas, recebimento de currículos e triagem automática de candidatos para empresas parceiras.',
        icon: 'fa-briefcase',
        status: 'development' as ModuleStatus,
        eta: 'Q2 2025'
    },
    {
        id: 'gigs',
        title: 'Módulo de Bicos',
        description: 'Marketplace de serviços rápidos (freelancers, pedreiros, eletricistas) focado em contratação local e avaliação por reputação.',
        icon: 'fa-hammer',
        status: 'soon' as ModuleStatus,
        eta: 'Q3 2025'
    },
    {
        id: 'classifieds',
        title: 'Classificados',
        description: 'Venda de veículos, imóveis e itens usados. Integração direta com WhatsApp para negociação rápida sem intermediários.',
        icon: 'fa-store',
        status: 'planned' as ModuleStatus,
        eta: 'Q4 2025'
    },
    {
        id: 'podcast',
        title: 'Podcast & Áudio',
        description: 'Hospedagem e distribuição de episódios de podcast regionais, com player nativo e slots de patrocínio em áudio.',
        icon: 'fa-podcast',
        status: 'planned' as ModuleStatus,
        eta: '2026'
    },
    {
        id: 'groups',
        title: 'Comunidades VIP',
        description: 'Gestão de grupos exclusivos de WhatsApp e Telegram para assinantes, com disparo automático de notícias urgentes.',
        icon: 'fa-users',
        status: 'planned' as ModuleStatus,
        eta: 'Sob Demanda'
    }
];

interface UpcomingModulesPanelProps {
    darkMode?: boolean;
}

const UpcomingModulesPanel: React.FC<UpcomingModulesPanelProps> = ({ darkMode = false }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Expansão do Ecossistema</h3>
                    <p className="text-sm font-medium text-gray-300 max-w-2xl">
                        O Portal Lagoa Formosa No Momento está em constante evolução. Confira abaixo os módulos que estão sendo preparados pela nossa equipe de engenharia para aumentar o valor dos planos comerciais.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map(module => (
                    <UpcomingModuleCard
                        key={module.id}
                        {...module}
                    />
                ))}
            </div>
        </div>
    );
};

export default UpcomingModulesPanel;
