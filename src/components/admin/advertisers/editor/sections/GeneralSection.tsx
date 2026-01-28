
import React, { useState, useEffect } from 'react';
import { User, Advertiser } from '../../../../../types';
import { getUserByDocument, getUserByName } from '../../../../../services/supabaseService';
import ToggleSwitch from '../components/ToggleSwitch';
import BillingInfoPanel from './BillingInfoPanel';

interface GeneralSectionProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    user?: User | null;
    onShowQR?: () => void;
    darkMode?: boolean;
    onSave?: () => Promise<void> | void;
}

// Estilos base unificados (Constantes fora para evitar recriação)
const BASE_INPUT_CLASS = "w-full rounded-lg px-4 py-3 text-sm font-medium outline-none border transition-all duration-200 focus:ring-2 focus:ring-red-500/20";
const LIGHT_INPUT_CLASS = "bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder-gray-400";
const DARK_INPUT_CLASS = "bg-[#1A1A1A] border-zinc-800 text-gray-100 focus:border-red-500 placeholder-zinc-600";

const GeneralSection: React.FC<GeneralSectionProps> = ({ data, onChange, user, onShowQR, darkMode = false, onSave }) => {
    // Classes computadas
    const inputClass = `${BASE_INPUT_CLASS} ${darkMode ? DARK_INPUT_CLASS : LIGHT_INPUT_CLASS}`;
    const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`;
    const sectionTitleClass = `text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2 border-b flex items-center gap-2 ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-100'}`;

    const [docSearch, setDocSearch] = useState('');
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [userFoundName, setUserFoundName] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<'document' | 'name'>('document');
    const [searchResults, setSearchResults] = useState<Array<{ id: string, name: string, email: string, document?: string }>>([]);

    // State for dynamic plans
    const [availablePlans, setAvailablePlans] = useState<any[]>([]);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                // Dynamic Import to avoid cycle dependencies if any
                const { getSystemSetting } = await import('../../../../../services/content/contentService');
                const config = await getSystemSetting('ad_config');

                if (config && config.plans && Array.isArray(config.plans)) {
                    setAvailablePlans(config.plans);
                } else {
                    // Fallback com preços padrão para teste
                    setAvailablePlans([
                        {
                            id: 'basic',
                            name: 'Básico',
                            prices: { monthly: 89.90, quarterly: 250.00, semiannual: 480.00, yearly: 900.00 },
                            features: { allowedSocialNetworks: ['instagram'], socialFrequency: '1x/sem' }
                        },
                        {
                            id: 'premium',
                            name: 'Premium',
                            prices: { monthly: 149.90, quarterly: 420.00, semiannual: 800.00, yearly: 1500.00 },
                            features: { allowedSocialNetworks: ['instagram', 'facebook'], socialFrequency: '3x/sem' }
                        },
                        {
                            id: 'master',
                            name: 'Master',
                            prices: { monthly: 299.90, quarterly: 850.00, semiannual: 1600.00, yearly: 3000.00 },
                            features: { allowedSocialNetworks: ['all'], socialFrequency: 'diário' }
                        }
                    ]);
                }
            } catch (e) {
                console.error("Erro ao carregar planos", e);
            }
        };
        loadPlans();
    }, []);


    const handleChange = (field: keyof Advertiser, value: unknown) => {
        // Lógica de Atualização (com auto-fill)
        let updates: Partial<Advertiser> = { [field]: value };

        // Se mudou o Plano -> Auto-selecionar preço base do ciclo atual
        if (field === 'plan') {
            const planConfig = availablePlans.find(p => p.id === value);
            if (planConfig && planConfig.prices) {
                const currentCycle = data.billingCycle || 'monthly';
                const price = planConfig.prices[currentCycle] || 0;

                updates.billingValue = price;
                updates.billingCycle = currentCycle;
            }
        }

        // Se mudou o Ciclo -> Auto-atualizar preço base do plano atual
        if (field === 'billingCycle') {
            const planConfig = availablePlans.find(p => p.id === data.plan);
            if (planConfig && planConfig.prices) {
                const newCycle = value as string;
                const price = planConfig.prices[newCycle] || 0;
                updates.billingValue = price;
            }
        }

        // Auto-calcular duração se mudar datas
        if (field === 'startDate' || field === 'endDate') {
            const startStr = field === 'startDate' ? value as string : data.startDate;
            const endStr = field === 'endDate' ? value as string : data.endDate;

            if (startStr && endStr) {
                const start = new Date(startStr);
                const end = new Date(endStr);
                let months = (end.getFullYear() - start.getFullYear()) * 12;
                months -= start.getMonth();
                months += end.getMonth();
                if (months <= 0) months = 1;
                updates.contractDuration = months;
            }
        }

        onChange({ ...data, ...updates });
    };

    // ... (rest of search logic handles)

    const handleSearchUser = async () => {
        // ... (original content)
        if (!docSearch) return;
        setIsSearchingUser(true);
        setSearchResults([]);

        try {
            if (searchMode === 'document') {
                // Busca por documento (retorna 1 usuário)
                const user = await getUserByDocument(docSearch);
                if (user) {
                    handleChange('ownerId', user.id);
                    setUserFoundName(user.name);
                    alert(`Usuário encontrado: ${user.name} (${user.email})`);
                } else {
                    alert('Nenhum usuário encontrado com este documento (CPF/CNPJ).');
                    setUserFoundName(null);
                }
            } else {
                // Busca por nome (retorna lista)
                const users = await getUserByName(docSearch);
                if (users.length > 0) {
                    setSearchResults(users);
                } else {
                    alert('Nenhum usuário encontrado com este nome.');
                    setSearchResults([]);
                }
            }
        } catch (e) {
            alert('Erro ao buscar usuário.');
        } finally {
            setIsSearchingUser(false);
        }
    };

    const handleSelectUser = (user: { id: string, name: string, email: string }) => {
        handleChange('ownerId', user.id);
        setUserFoundName(user.name);
        setSearchResults([]);
        setDocSearch('');
    };

    return (
        <div className="animate-fadeIn max-w-6xl mx-auto py-4">
            {/* Toggle de Ativação */}
            <div className={`mb-8 p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                <ToggleSwitch
                    enabled={data.isActive}
                    onChange={(enabled) => handleChange('isActive', enabled)}
                    label="Anunciante Ativo"
                    darkMode={darkMode}
                    size="lg"
                />
                <p className={`text-xs mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    Quando desativado, este anunciante não aparecerá em nenhum lugar do site.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 animate-fadeIn">

                {/* --- LADO ESQUERDO: IDENTIDADE PÚBLICA --- */}
                <div className="space-y-8">
                    <h3 className={sectionTitleClass}>
                        <i className="fas fa-store"></i>
                        Identidade do Anúncio (Público)
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Nome do Estabelecimento *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className={inputClass}
                                placeholder="Ex: Panificadora Central"
                            />
                            <p className="text-[9px] mt-1.5 text-gray-400">Este é o nome principal que aparecerá nos cards e na página.</p>
                        </div>

                        <div>
                            <label className={labelClass}>Categoria Principal</label>
                            <div className="relative">
                                <select
                                    value={data.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    {['Comércio', 'Serviços', 'Saúde', 'Alimentação', 'Imóveis', 'Veículos', 'Agro', 'Outros'].map(c => (
                                        <option key={c} value={c} className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>{c}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Informações de Contato */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Telefone/WhatsApp</label>
                                <input
                                    type="tel"
                                    value={data.phone || ''}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    className={inputClass}
                                    placeholder="(38) 99999-9999"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    value={data.email || ''}
                                    onChange={e => handleChange('email', e.target.value)}
                                    className={inputClass}
                                    placeholder="contato@empresa.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Mensagem Automática (WhatsApp)</label>
                            <input
                                type="text"
                                value={data.internalPage?.whatsappMessage || ''}
                                onChange={e => {
                                    const currentInternal = data.internalPage || { description: '', products: [], whatsapp: '', instagram: '', location: '' };
                                    onChange({
                                        ...data,
                                        internalPage: { ...currentInternal, whatsappMessage: e.target.value }
                                    });
                                }}
                                className={inputClass}
                                placeholder="Oi eu vim pelo lagoaformosanomomento..."
                            />
                            <p className="text-[9px] mt-1.5 text-gray-400">Mensagem que aparecerá quando o cliente clicar no botão do WhatsApp.</p>
                        </div>

                        <div>
                            <label className={labelClass}>Endereço Completo</label>
                            <input
                                type="text"
                                value={data.address || ''}
                                onChange={e => handleChange('address', e.target.value)}
                                className={inputClass}
                                placeholder="Rua, número, bairro - Lagoa Formosa/MG"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>CPF/CNPJ</label>
                            <input
                                type="text"
                                value={data.cpfCnpj || ''}
                                onChange={e => handleChange('cpfCnpj', e.target.value)}
                                className={inputClass}
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            />
                        </div>
                    </div>

                    {/* Dica visual */}
                    <div className={`p-4 rounded-xl border flex gap-4 items-start ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-lightbulb text-xs"></i>
                        </div>
                        <div>
                            <h4 className={`text-xs font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Gestão de Recursos</h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                Use as abas superiores para configurar Banners na Home e Popups Promocionais exclusivos para este anunciante.
                            </p>
                        </div>
                    </div>

                    {/* Botão de Salvar Identidade */}
                    <div className="pt-4">
                        <button
                            onClick={() => onSave && onSave()}
                            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                        >
                            <i className="fas fa-save text-lg"></i>
                            Salvar Identidade do Anúncio
                        </button>
                        <p className={`text-[10px] text-center mt-3 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                            Atualiza nome, categoria e contatos públicos.
                        </p>
                    </div>
                </div>

                {/* --- LADO DIREITO: GESTÃO ADMINISTRATIVA --- */}
                <div className="space-y-8">
                    <h3 className={sectionTitleClass}>
                        <i className="fas fa-file-contract"></i>
                        Gestão de Contrato (Interno)
                    </h3>

                    <div className={`p-6 rounded-3xl border relative overflow-hidden ${darkMode ? 'bg-[#151515] border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {/* Faixa decorativa */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none`}></div>

                        <div className="space-y-6 relative z-10">

                            {/* Linha 1: Status e Plano */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer group transition-all ${data.isActive ? 'border-green-500/30 bg-green-500/5' : 'border-gray-200 bg-gray-50'}`}>
                                        <span className={`text-xs font-black uppercase ${data.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {data.isActive ? 'Ativo' : 'Pausado'}
                                        </span>
                                        <div className="relative inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={data.isActive}
                                                onChange={e => handleChange('isActive', e.target.checked)}
                                            />
                                            <div className={`w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 transition-all peer-checked:bg-green-500 bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${darkMode ? 'bg-white/10 after:bg-gray-200' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>Plano</label>
                                    <select
                                        value={data.plan}
                                        onChange={e => handleChange('plan', e.target.value)}
                                        className={`${inputClass} py-2.5 text-xs uppercase font-bold`}
                                    >
                                        <option value="" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Selecione...</option>
                                        {availablePlans.map(plan => (
                                            <option key={plan.id} value={plan.id} className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Linha 2: Ciclo e Pagamento */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Ciclo de Renovação</label>
                                    <select
                                        value={data.billingCycle}
                                        onChange={e => handleChange('billingCycle', e.target.value)}
                                        className={`${inputClass} py-2.5 text-xs uppercase font-bold`}
                                    >
                                        <option value="daily" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Diário</option>
                                        <option value="weekly" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Semanal</option>
                                        <option value="fortnightly" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Quinzenal (15 dias)</option>
                                        <option value="monthly" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Mensal</option>
                                        <option value="quarterly" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Trimestral</option>
                                        <option value="semiannual" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Semestral</option>
                                        <option value="yearly" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Anual</option>
                                        <option value="single" className={darkMode ? 'bg-zinc-900 text-white' : 'text-black'}>Pagamento à Vista (Único)</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className={labelClass}>Status de Pagamento</label>

                                    </div>
                                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer group transition-all ${data.isPaid ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
                                        <span className={`text-xs font-black uppercase ${data.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                            {data.isPaid ? '✓ Pago' : 'Pendente'}
                                        </span>
                                        <div className="relative inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={data.isPaid || false}
                                                onChange={e => handleChange('isPaid', e.target.checked)}
                                            />
                                            <div className={`w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 transition-all peer-checked:bg-green-500 bg-orange-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Linha 3: Datas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Início</label>
                                    <input
                                        type="date"
                                        value={data.startDate ? data.startDate.split('T')[0] : ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val) {
                                                handleChange('startDate', new Date(val).toISOString());
                                            }
                                        }}
                                        className={`${inputClass} py-2 text-xs`}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Fim</label>
                                    <input
                                        type="date"
                                        value={data.endDate ? data.endDate.split('T')[0] : ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val) {
                                                handleChange('endDate', new Date(val).toISOString());
                                            } else {
                                                handleChange('endDate', null);
                                            }
                                        }}
                                        className={`${inputClass} py-2 text-xs`}
                                    />
                                </div>
                            </div>



                            {/* Vínculo de Usuário */}
                            <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                                <label className={labelClass}>
                                    <i className="fas fa-users-cog mr-1"></i>
                                    Dono / Responsável (Gestão)
                                </label>

                                {data.ownerId ? (
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className={`text-xs font-bold truncate ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                                                {userFoundName || `ID: ${data.ownerId.substring(0, 8)}...`}
                                            </p>
                                            <p className={`text-[9px] ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                Usuário Vinculado
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { handleChange('ownerId', ''); setUserFoundName(null); }}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Desvincular"
                                        >
                                            <i className="fas fa-unlink"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Toggle de Modo de Busca */}
                                        <div className={`grid grid-cols-2 gap-1 p-1 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                                            <button
                                                onClick={() => { setSearchMode('document'); setSearchResults([]); }}
                                                className={`py-2 rounded-md text-[9px] font-black uppercase transition-all ${searchMode === 'document'
                                                    ? (darkMode ? 'bg-zinc-700 text-white shadow' : 'bg-gray-900 text-white shadow')
                                                    : (darkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')
                                                    }`}
                                            >
                                                <i className="fas fa-id-card mr-1"></i> CPF/CNPJ
                                            </button>
                                            <button
                                                onClick={() => { setSearchMode('name'); setSearchResults([]); }}
                                                className={`py-2 rounded-md text-[9px] font-black uppercase transition-all ${searchMode === 'name'
                                                    ? (darkMode ? 'bg-zinc-700 text-white shadow' : 'bg-gray-900 text-white shadow')
                                                    : (darkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')
                                                    }`}
                                            >
                                                <i className="fas fa-user mr-1"></i> Nome
                                            </button>
                                        </div>

                                        {/* Campo de Busca */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={docSearch}
                                                onChange={e => setDocSearch(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSearchUser()}
                                                className={`${inputClass} flex-grow`}
                                                placeholder={searchMode === 'document' ? 'Digite CPF ou CNPJ...' : 'Digite o nome do usuário...'}
                                            />
                                            <button
                                                onClick={handleSearchUser}
                                                disabled={isSearchingUser || !docSearch}
                                                className="bg-zinc-800 text-white px-4 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                {isSearchingUser ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                                            </button>
                                        </div>

                                        {/* Resultados da Busca por Nome */}
                                        {searchResults.length > 0 && (
                                            <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                                                <div className={`px-3 py-2 text-[9px] font-bold uppercase ${darkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-gray-50 text-gray-600'}`}>
                                                    {searchResults.length} usuário(s) encontrado(s)
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => handleSelectUser(user)}
                                                            className={`w-full p-3 text-left border-b transition-colors ${darkMode
                                                                ? 'border-zinc-800 hover:bg-zinc-900'
                                                                : 'border-gray-100 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <p className={`text-xs font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                                        {user.name}
                                                                    </p>
                                                                    <p className={`text-[10px] truncate ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                                                                        {user.email}
                                                                    </p>
                                                                    <p className={`text-[9px] font-mono ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                                                                        ID: {user.id.substring(0, 8)}...
                                                                    </p>
                                                                </div>
                                                                <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-[9px] text-gray-400">
                                            {searchMode === 'document'
                                                ? 'Digite o documento (CPF/CNPJ) do usuário para vincular automaticamente.'
                                                : 'Digite o nome do usuário para buscar. Você verá o ID de cada resultado.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Botão de Salvar Contrato */}
                    <div className="pt-4 mt-auto">
                        <button
                            onClick={() => onSave && onSave()}
                            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r ${darkMode ? 'from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-green-100' : 'from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'}`}
                        >
                            <i className="fas fa-file-signature text-lg"></i>
                            Salvar Gestão de Contrato
                        </button>
                        <p className={`text-[10px] text-center mt-3 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                            Atualiza status, planos, ciclos e gera recálculos financeiros.
                        </p>
                    </div>

                </div>

            </div>

            <div className="mt-12 pt-12 border-t border-dashed">
                <BillingInfoPanel data={data} onChange={onChange} user={user} darkMode={darkMode} />
            </div>
        </div>
    );
};

export default GeneralSection;
