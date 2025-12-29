
import React, { useState, useMemo, useEffect } from 'react';
import { Advertiser, AdPricingConfig, AdPlanConfig, AdvertiserProduct, Coupon, PromotionStyle, AdPlan, BillingCycle } from '../../types';

interface AdvertisersTabProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => void;
}

type EditorTab = 'geral' | 'vitrine' | 'produtos' | 'cupons';

const AdvertisersTab: React.FC<AdvertisersTabProps> = ({ advertisers, adConfig, onUpdateAdvertiser, onUpdateAdConfig }) => {
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'config'>('list');
  const [currentAdvertiser, setCurrentAdvertiser] = useState<Advertiser | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>('geral');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Configuração Temporária
  const [tempAdConfig, setTempAdConfig] = useState<AdPricingConfig>(adConfig);
  // Estado para edição de um plano específico dentro da config
  const [editingPlan, setEditingPlan] = useState<AdPlanConfig | null>(null);

  // States auxiliares para Produtos e Cupons
  const [newProduct, setNewProduct] = useState<Partial<AdvertiserProduct>>({ promotionStyle: 'default' });
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ active: true });

  // Sync temp config with prop
  useEffect(() => {
      setTempAdConfig(adConfig);
  }, [adConfig]);

  // --- PLAN MANAGEMENT HANDLERS ---
  
  const handleAddNewPlan = () => {
      const newPlan: AdPlanConfig = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Novo Plano',
          prices: { daily: 20, weekly: 120, monthly: 500, quarterly: 1400, semiannual: 2600, yearly: 5000 },
          description: 'Benefícios do plano...',
          features: {
              placements: ['standard_list'],
              canCreateJobs: false,
              hasInternalPage: true,
              maxProducts: 3,
              socialVideoAd: false,
              allowedSocialNetworks: [],
              videoLimit: 0,
              socialFrequency: 'monthly'
          },
          cashbackPercent: 0
      };
      setEditingPlan(newPlan);
  };

  const handleEditPlan = (plan: AdPlanConfig) => {
      setEditingPlan({...plan, prices: {...plan.prices}, features: {...plan.features, placements: [...(plan.features.placements || [])]}}); // Clone deep
  };

  const handleSavePlan = () => {
      if (!editingPlan) return;
      
      const updatedPlans = [...tempAdConfig.plans];
      const index = updatedPlans.findIndex(p => p.id === editingPlan.id);
      
      if (index >= 0) {
          updatedPlans[index] = editingPlan;
      } else {
          updatedPlans.push(editingPlan);
      }
      
      const newConfig = { ...tempAdConfig, plans: updatedPlans };
      
      // ATUALIZAÇÃO IMEDIATA
      setTempAdConfig(newConfig);
      onUpdateAdConfig(newConfig); // Salva no Banco/App imediatamente
      setEditingPlan(null);
      alert("Plano salvo e sincronizado com o sistema!");
  };

  const handleDeletePlan = (id: string) => {
      if(confirm('Tem certeza? Isso pode afetar anunciantes usando este plano.')) {
          const updatedPlans = tempAdConfig.plans.filter(p => p.id !== id);
          const newConfig = { ...tempAdConfig, plans: updatedPlans };
          
          // ATUALIZAÇÃO IMEDIATA
          setTempAdConfig(newConfig);
          onUpdateAdConfig(newConfig);
      }
  };

  // --- ADVERTISER HANDLERS ---

  const handleStartNewAdvertiser = () => {
    // Tenta pegar o primeiro plano disponível como default
    const defaultPlanId = adConfig.plans.length > 0 ? adConfig.plans[0].id : 'standard';

    setCurrentAdvertiser({
        id: '',
        name: '',
        category: '',
        plan: defaultPlanId,
        billingCycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        isActive: true,
        views: 0,
        clicks: 0,
        redirectType: 'internal',
        coupons: [],
        internalPage: { description: '', products: [] }
    });
    setEditorTab('geral');
    setViewMode('edit');
  };

  const handleEditAdvertiser = (ad: Advertiser) => {
    setCurrentAdvertiser({
        ...ad,
        billingCycle: ad.billingCycle || 'monthly', // fallback
        coupons: ad.coupons || [],
        internalPage: {
            ...ad.internalPage!,
            products: ad.internalPage?.products || []
        }
    });
    setEditorTab('geral');
    setViewMode('edit');
  };

  const handleSaveAdvertiser = () => {
    if (!currentAdvertiser || !currentAdvertiser.name) {
        alert("O nome do parceiro é obrigatório.");
        return;
    }

    const isNew = !currentAdvertiser.id;
    const finalAdvertiser = {
        ...currentAdvertiser,
        id: isNew ? Math.random().toString(36).substr(2, 9) : currentAdvertiser.id
    };

    onUpdateAdvertiser(finalAdvertiser);
    alert(isNew ? `Parceiro ${finalAdvertiser.name} criado com sucesso!` : `Dados de ${finalAdvertiser.name} atualizados.`);
    setViewMode('list');
    setCurrentAdvertiser(null);
  };

  const handleCycleChange = (cycle: BillingCycle) => {
      if(!currentAdvertiser) return;
      
      const start = new Date(currentAdvertiser.startDate);
      let end = new Date(start);

      switch(cycle) {
          case 'daily': end.setDate(end.getDate() + 1); break;
          case 'weekly': end.setDate(end.getDate() + 7); break;
          case 'monthly': end.setMonth(end.getMonth() + 1); break;
          case 'quarterly': end.setMonth(end.getMonth() + 3); break;
          case 'semiannual': end.setMonth(end.getMonth() + 6); break;
          case 'yearly': end.setFullYear(end.getFullYear() + 1); break;
      }

      setCurrentAdvertiser({
          ...currentAdvertiser,
          billingCycle: cycle,
          endDate: end.toISOString().split('T')[0]
      });
  };

  // --- SUB-HANDLERS ---
  const addProduct = () => {
      if(!currentAdvertiser || !newProduct.name) return;
      const product: AdvertiserProduct = {
          id: Math.random().toString(36).substr(2, 9),
          name: newProduct.name,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice,
          promotionStyle: newProduct.promotionStyle,
          description: newProduct.description,
          imageUrl: newProduct.imageUrl
      };
      const updatedProducts = [...(currentAdvertiser.internalPage?.products || []), product];
      setCurrentAdvertiser({
          ...currentAdvertiser,
          internalPage: { ...currentAdvertiser.internalPage!, products: updatedProducts }
      });
      setNewProduct({ promotionStyle: 'default', name: '', price: '', originalPrice: '', description: '', imageUrl: '' });
  };

  const removeProduct = (id: string) => {
      if(!currentAdvertiser) return;
      const updatedProducts = currentAdvertiser.internalPage?.products.filter(p => p.id !== id) || [];
      setCurrentAdvertiser({
          ...currentAdvertiser,
          internalPage: { ...currentAdvertiser.internalPage!, products: updatedProducts }
      });
  };

  const addCoupon = () => {
      if(!currentAdvertiser || !newCoupon.code) return;
      const coupon: Coupon = {
          id: Math.random().toString(36).substr(2, 9),
          code: newCoupon.code.toUpperCase(),
          discount: newCoupon.discount || '',
          description: newCoupon.description || '',
          active: true
      };
      const updatedCoupons = [...(currentAdvertiser.coupons || []), coupon];
      setCurrentAdvertiser({ ...currentAdvertiser, coupons: updatedCoupons });
      setNewCoupon({ active: true, code: '', discount: '', description: '' });
  };

  const removeCoupon = (id: string) => {
      if(!currentAdvertiser) return;
      const updatedCoupons = currentAdvertiser.coupons?.filter(c => c.id !== id) || [];
      setCurrentAdvertiser({ ...currentAdvertiser, coupons: updatedCoupons });
  };

  // --- CALCULATORS ---
  const estimatedCost = useMemo(() => {
     if (!currentAdvertiser) return 0;
     
     const plan = adConfig.plans.find(p => p.id === currentAdvertiser.plan);
     if (!plan) return 0;

     // Cost depends on cycle
     switch(currentAdvertiser.billingCycle) {
         case 'daily': 
            const start = new Date(currentAdvertiser.startDate);
            const end = new Date(currentAdvertiser.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays * plan.prices.daily;
         case 'weekly': return plan.prices.weekly;
         case 'monthly': return plan.prices.monthly;
         case 'quarterly': return plan.prices.quarterly;
         case 'semiannual': return plan.prices.semiannual;
         case 'yearly': return plan.prices.yearly;
         default: return 0;
     }
  }, [currentAdvertiser, adConfig]);

  const filteredAdvertisers = useMemo(() => {
      return advertisers.filter(ad => ad.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [advertisers, searchTerm]);

  const getPlanName = (planId: string) => {
      const plan = adConfig.plans.find(p => p.id === planId);
      return plan ? plan.name : planId;
  };

  // --- RENDERERS ---

  const renderList = () => (
    <div className="animate-fadeIn w-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">GESTÃO DE <span className="text-red-600">PARCEIROS</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Campanhas, vitrines e performance</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setViewMode('config')} className="bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors shadow-sm">
                    <i className="fas fa-cogs mr-2"></i> Configurar Planos
                </button>
                <button 
                    onClick={handleStartNewAdvertiser}
                    className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
                >
                    <i className="fas fa-plus"></i> Novo Parceiro
                </button>
            </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input type="text" placeholder="Buscar anunciante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 pl-10 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm" />
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest pl-8">Parceiro</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Plano</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest hidden md:table-cell">Vigência</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right pr-8">Ação</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {filteredAdvertisers.length > 0 ? filteredAdvertisers.map(ad => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleEditAdvertiser(ad)}>
                        <td className="p-6 pl-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden relative shadow-sm border border-gray-200 flex items-center justify-center">
                                    {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" /> : <i className={`fas ${ad.logoIcon || 'fa-store'} text-gray-400`}></i>}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm leading-none">{ad.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{ad.category}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                {getPlanName(ad.plan)}
                            </span>
                        </td>
                        <td className="p-6 hidden md:table-cell">
                            <p className="text-xs font-bold text-gray-600">{new Date(ad.endDate).toLocaleDateString()}</p>
                            <p className="text-[9px] text-gray-400 uppercase">Renovação {ad.billingCycle}</p>
                        </td>
                        <td className="p-6 text-center">
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${ad.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {ad.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                        </td>
                        <td className="p-6 text-right pr-8">
                            <button className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm flex items-center justify-center">
                                <i className="fas fa-pen text-xs"></i>
                            </button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-400 text-xs font-bold uppercase">Nenhum anunciante encontrado.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderEditor = () => {
      if (!currentAdvertiser) return null;

      return (
        <div className="animate-fadeIn w-full max-w-5xl mx-auto pb-20">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">{currentAdvertiser.id ? `Editando: ${currentAdvertiser.name}` : 'Novo Parceiro'}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preencha os detalhes da campanha</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('list')} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSaveAdvertiser} className="bg-black text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-600 shadow-lg">Salvar Dados</button>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-gray-50 p-6 border-r border-gray-100 flex flex-col gap-2">
                    {[
                        { id: 'geral', label: 'Geral & Contrato', icon: 'fa-file-contract' },
                        { id: 'vitrine', label: 'Marca & Vitrine', icon: 'fa-image' },
                        { id: 'produtos', label: 'Produtos', icon: 'fa-box-open' },
                        { id: 'cupons', label: 'Cupons', icon: 'fa-ticket-alt' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setEditorTab(tab.id as EditorTab)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${editorTab === tab.id ? 'bg-white shadow-md text-black border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editorTab === tab.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                                <i className={`fas ${tab.icon} text-xs`}></i>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                    
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="bg-black/5 p-4 rounded-xl">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Custo Estimado</span>
                            <span className="text-xl font-black text-gray-900 block">R$ {estimatedCost.toFixed(2)}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase mt-1 block">Ciclo: {currentAdvertiser.billingCycle}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    {editorTab === 'geral' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Nome Fantasia</label>
                                    <input type="text" value={currentAdvertiser.name} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black" placeholder="Ex: Mercado Central" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Categoria</label>
                                    <input type="text" value={currentAdvertiser.category} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black" placeholder="Ex: Varejo" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Plano</label>
                                    <select value={currentAdvertiser.plan} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, plan: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-black">
                                        {adConfig.plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Ciclo de Cobrança</label>
                                    <select value={currentAdvertiser.billingCycle} onChange={(e) => handleCycleChange(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-black">
                                        <option value="daily">Diário</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="quarterly">Trimestral</option>
                                        <option value="semiannual">Semestral</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Status</label>
                                    <select value={currentAdvertiser.isActive ? 'true' : 'false'} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, isActive: e.target.value === 'true'})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-black">
                                        <option value="true">Ativo</option>
                                        <option value="false">Pausado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Início da Campanha</label>
                                    <input type="date" value={currentAdvertiser.startDate} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Fim da Campanha</label>
                                    <input type="date" value={currentAdvertiser.endDate} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="text-[9px] font-bold uppercase text-gray-400 mb-2 block">Tipo de Redirecionamento</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${currentAdvertiser.redirectType === 'internal' ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                        <input type="radio" name="redirectType" className="hidden" checked={currentAdvertiser.redirectType === 'internal'} onChange={() => setCurrentAdvertiser({...currentAdvertiser, redirectType: 'internal'})} />
                                        <div className="text-center">
                                            <i className="fas fa-mobile-alt text-2xl mb-2"></i>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Página Interna (App)</p>
                                        </div>
                                    </label>
                                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${currentAdvertiser.redirectType === 'external' ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                        <input type="radio" name="redirectType" className="hidden" checked={currentAdvertiser.redirectType === 'external'} onChange={() => setCurrentAdvertiser({...currentAdvertiser, redirectType: 'external'})} />
                                        <div className="text-center">
                                            <i className="fas fa-external-link-alt text-2xl mb-2"></i>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Link Externo</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {currentAdvertiser.redirectType === 'external' ? (
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">URL de Destino</label>
                                    <input type="text" value={currentAdvertiser.externalUrl || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, externalUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black" placeholder="https://..." />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Descrição da Página</label>
                                        <textarea value={currentAdvertiser.internalPage?.description || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, internalPage: {...currentAdvertiser.internalPage!, description: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black h-24 resize-none" placeholder="Sobre o negócio..." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">WhatsApp (Ex: 5534999999999)</label>
                                            <input type="text" value={currentAdvertiser.internalPage?.whatsapp || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, internalPage: {...currentAdvertiser.internalPage!, whatsapp: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="5534..." />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Instagram (@perfil)</label>
                                            <input type="text" value={currentAdvertiser.internalPage?.instagram || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, internalPage: {...currentAdvertiser.internalPage!, instagram: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="@..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Endereço / Localização</label>
                                        <input type="text" value={currentAdvertiser.internalPage?.location || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, internalPage: {...currentAdvertiser.internalPage!, location: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" placeholder="Rua X, Centro" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {editorTab === 'vitrine' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-gray-400 mb-2 block">Logo da Marca (URL)</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                                        {currentAdvertiser.logoUrl ? <img src={currentAdvertiser.logoUrl} className="w-full h-full object-cover" /> : <i className={`fas ${currentAdvertiser.logoIcon || 'fa-store'} text-2xl text-gray-400`}></i>}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input type="text" value={currentAdvertiser.logoUrl || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, logoUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" placeholder="https://..." />
                                        <input type="text" value={currentAdvertiser.logoIcon || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, logoIcon: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" placeholder="Ícone FontAwesome (ex: fa-store)" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[9px] font-bold uppercase text-gray-400 mb-2 block">Banner de Capa (URL)</label>
                                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-2 group">
                                    {currentAdvertiser.bannerUrl ? <img src={currentAdvertiser.bannerUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">SEM CAPA</div>}
                                </div>
                                <input type="text" value={currentAdvertiser.bannerUrl || ''} onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, bannerUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" placeholder="https://..." />
                            </div>
                        </div>
                    )}

                    {editorTab === 'produtos' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-black uppercase text-gray-900 mb-3">Adicionar Produto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Nome do Produto" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                    <input type="text" placeholder="Preço (Ex: R$ 99,90)" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                    <input type="text" placeholder="Preço Original (opcional)" value={newProduct.originalPrice || ''} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                    <select value={newProduct.promotionStyle || 'default'} onChange={e => setNewProduct({...newProduct, promotionStyle: e.target.value as any})} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none">
                                        <option value="default">Padrão</option>
                                        <option value="sale">Promoção</option>
                                        <option value="flash">Relâmpago</option>
                                        <option value="bogo">Leve + Pague -</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="URL da Imagem" value={newProduct.imageUrl || ''} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 outline-none" />
                                <textarea placeholder="Descrição curta" value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 outline-none resize-none h-16" />
                                <button onClick={addProduct} className="w-full bg-black text-white py-2 rounded-lg text-xs font-black uppercase hover:bg-gray-800">Adicionar à Vitrine</button>
                            </div>

                            <div className="space-y-2">
                                {currentAdvertiser.internalPage?.products.map(product => (
                                    <div key={product.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-900">{product.name}</p>
                                            <p className="text-[10px] text-gray-500">{product.price} {product.originalPrice && <span className="line-through opacity-50 ml-1">{product.originalPrice}</span>}</p>
                                        </div>
                                        <button onClick={() => removeProduct(product.id)} className="text-red-500 hover:text-red-700 p-2"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                                {(!currentAdvertiser.internalPage?.products || currentAdvertiser.internalPage.products.length === 0) && (
                                    <p className="text-center text-[10px] text-gray-400 uppercase font-bold py-4">Nenhum produto cadastrado.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {editorTab === 'cupons' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                <h4 className="text-xs font-black uppercase text-yellow-800 mb-3">Criar Cupom</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Código (Ex: WELIX10)" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="bg-white border border-yellow-200 rounded-lg px-3 py-2 text-xs font-black uppercase outline-none text-yellow-900" />
                                    <input type="text" placeholder="Desconto (Ex: 10% OFF)" value={newCoupon.discount || ''} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} className="bg-white border border-yellow-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                </div>
                                <input type="text" placeholder="Descrição da Regra (Ex: Válido para primeira compra)" value={newCoupon.description || ''} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-xs mb-3 outline-none" />
                                <button onClick={addCoupon} className="w-full bg-yellow-500 text-white py-2 rounded-lg text-xs font-black uppercase hover:bg-yellow-600 shadow-md">Criar Cupom</button>
                            </div>

                            <div className="space-y-2">
                                {currentAdvertiser.coupons?.map(coupon => (
                                    <div key={coupon.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-mono font-black text-xs border border-yellow-200 tracking-wider">
                                            {coupon.code}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-900">{coupon.discount}</p>
                                            <p className="text-[9px] text-gray-500">{coupon.description}</p>
                                        </div>
                                        <button onClick={() => removeCoupon(coupon.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                                {(!currentAdvertiser.coupons || currentAdvertiser.coupons.length === 0) && (
                                    <p className="text-center text-[10px] text-gray-400 uppercase font-bold py-4">Nenhum cupom ativo.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  };

  const renderConfig = () => (
    <div className="animate-fadeIn max-w-5xl mx-auto w-full pb-20">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Configuração de Planos</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Defina preços e permissões</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setViewMode('list')} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-gray-50">Voltar</button>
                <button onClick={() => { onUpdateAdConfig(tempAdConfig); setViewMode('list'); alert("Configurações Globais Salvas!"); }} className="bg-black text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-600 shadow-lg">Salvar Configs Globais</button>
            </div>
        </header>

        {/* Global Settings */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Texto Promocional (Banner Principal)</label>
            <input type="text" value={tempAdConfig.promoText} onChange={(e) => setTempAdConfig({...tempAdConfig, promoText: e.target.value})} className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-yellow-500" />
        </div>

        {/* Plan List & Editor */}
        <div className="flex flex-col lg:flex-row gap-8">
            {/* List of Plans */}
            <div className="w-full lg:w-1/3 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black uppercase text-gray-400">Planos Ativos</h3>
                    <button onClick={handleAddNewPlan} className="text-[10px] font-black uppercase bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"><i className="fas fa-plus mr-1"></i> Criar</button>
                </div>
                {tempAdConfig.plans.map(plan => (
                    <div key={plan.id} onClick={() => handleEditPlan(plan)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${editingPlan?.id === plan.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-gray-200 hover:border-red-300'}`}>
                        <div className="flex justify-between items-center">
                            <span className="font-black text-sm uppercase">{plan.name}</span>
                            <span className={`text-xs font-bold ${editingPlan?.id === plan.id ? 'text-yellow-400' : 'text-green-600'}`}>R$ {plan.prices.monthly}/mês</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {plan.features.placements.map(p => (
                                <span key={p} className="text-[8px] uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{p.replace('_', ' ')}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Editor Form */}
            <div className="w-full lg:w-2/3">
                {editingPlan ? (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl animate-fadeIn">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Editando: {editingPlan.name}</h3>
                            <button onClick={() => handleDeletePlan(editingPlan.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Nome do Plano</label>
                                    <input type="text" value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Cashback (%)</label>
                                    <input type="number" value={editingPlan.cashbackPercent || 0} onChange={(e) => setEditingPlan({...editingPlan, cashbackPercent: Number(e.target.value)})} className="w-full bg-green-50 text-green-700 border border-green-200 rounded-xl px-3 py-2 text-sm font-bold" />
                                </div>
                            </div>
                            
                            {/* Prices Config */}
                            <div>
                                <h4 className="text-xs font-black uppercase text-green-600 mb-4 tracking-widest"><i className="fas fa-dollar-sign mr-2"></i> Tabela de Preços</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { key: 'daily', label: 'Diário' },
                                        { key: 'weekly', label: 'Semanal' }, // Opção Semanal Adicionada
                                        { key: 'monthly', label: 'Mensal' },
                                        { key: 'quarterly', label: 'Trimestral' },
                                        { key: 'semiannual', label: 'Semestral' },
                                        { key: 'yearly', label: 'Anual' }
                                    ].map(cycle => (
                                        <div key={cycle.key}>
                                            <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">{cycle.label} (R$)</label>
                                            <input 
                                                type="number" 
                                                value={editingPlan.prices[cycle.key as keyof typeof editingPlan.prices]} 
                                                onChange={(e) => setEditingPlan({
                                                    ...editingPlan, 
                                                    prices: { ...editingPlan.prices, [cycle.key]: Number(e.target.value) }
                                                })} 
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-[9px] font-bold uppercase text-gray-400 mb-1 block">Descrição Curta</label>
                                <input type="text" value={editingPlan.description || ''} onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                            </div>

                            <hr className="border-gray-100" />

                            {/* Features Config */}
                            <div>
                                <h4 className="text-xs font-black uppercase text-red-600 mb-4 tracking-widest"><i className="fas fa-sliders-h mr-2"></i> Funcionalidades & Locais</h4>
                                
                                {/* Placement Multi-Select */}
                                <div className="mb-4">
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-2 block">Locais de Banner (Múltipla Escolha)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {[
                                            {id: 'master_carousel', label: 'Carrossel Master'}, 
                                            {id: 'live_tab', label: 'Aba Ao Vivo'},
                                            {id: 'sidebar', label: 'Lateral'},
                                            {id: 'standard_list', label: 'Lista Padrão'}
                                        ].map(opt => {
                                            const isSelected = editingPlan.features.placements.includes(opt.id as any);
                                            return (
                                                <button 
                                                    key={opt.id}
                                                    onClick={() => {
                                                        const current = editingPlan.features.placements;
                                                        const updated = isSelected 
                                                            ? current.filter(p => p !== opt.id) 
                                                            : [...current, opt.id];
                                                        setEditingPlan({
                                                            ...editingPlan, 
                                                            features: {...editingPlan.features, placements: updated as any}
                                                        });
                                                    }}
                                                    className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase border transition-all flex flex-col items-center justify-center gap-1 ${isSelected ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                                >
                                                    {isSelected ? <i className="fas fa-check-circle text-lg"></i> : <i className="far fa-circle text-lg opacity-50"></i>}
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <label className="flex items-center justify-between bg-gray-50 p-3 rounded-xl cursor-pointer">
                                        <span className="text-xs font-bold text-gray-700">Sistema de Vagas</span>
                                        <input type="checkbox" checked={editingPlan.features.canCreateJobs} onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, canCreateJobs: e.target.checked}})} className="accent-red-600 w-4 h-4" />
                                    </label>
                                    <label className="flex items-center justify-between bg-gray-50 p-3 rounded-xl cursor-pointer">
                                        <span className="text-xs font-bold text-gray-700">Página Interna (App)</span>
                                        <input type="checkbox" checked={editingPlan.features.hasInternalPage} onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, hasInternalPage: e.target.checked}})} className="accent-red-600 w-4 h-4" />
                                    </label>
                                    <label className="flex items-center justify-between bg-gray-50 p-3 rounded-xl cursor-pointer">
                                        <span className="text-xs font-bold text-gray-700">Vídeo em Social Ads</span>
                                        <input type="checkbox" checked={editingPlan.features.socialVideoAd} onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, socialVideoAd: e.target.checked}})} className="accent-red-600 w-4 h-4" />
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Limite de Produtos</span>
                                        <input 
                                            type="number" 
                                            value={editingPlan.features.maxProducts} 
                                            onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, maxProducts: Number(e.target.value)}})} 
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-black"
                                            placeholder="0 = Ilimitado"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Limite de Vídeos/Mês</span>
                                        <input 
                                            type="number" 
                                            value={editingPlan.features.videoLimit || 0} 
                                            onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, videoLimit: Number(e.target.value)}})} 
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-black"
                                            placeholder="Ex: 4"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Frequência de Postagem</span>
                                        <select 
                                            value={editingPlan.features.socialFrequency || 'monthly'} 
                                            onChange={(e) => setEditingPlan({...editingPlan, features: {...editingPlan.features, socialFrequency: e.target.value as any}})} 
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold uppercase outline-none"
                                        >
                                            <option value="daily">Diária</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="biweekly">Quinzenal</option>
                                            <option value="monthly">Mensal</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Social Networks */}
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-gray-400 mb-2 block">Redes Sociais Incluídas</label>
                                    <div className="flex gap-3">
                                        {['instagram', 'facebook', 'whatsapp', 'linkedin', 'tiktok'].map(net => (
                                            <label key={net} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={editingPlan.features.allowedSocialNetworks.includes(net as any)}
                                                    onChange={(e) => {
                                                        const current = editingPlan.features.allowedSocialNetworks;
                                                        const updated = e.target.checked 
                                                            ? [...current, net] 
                                                            : current.filter(n => n !== net);
                                                        setEditingPlan({...editingPlan, features: {...editingPlan.features, allowedSocialNetworks: updated as any}});
                                                    }}
                                                    className="accent-black"
                                                />
                                                <i className={`fab fa-${net} text-lg ${editingPlan.features.allowedSocialNetworks.includes(net as any) ? 'text-black' : 'text-gray-300'}`}></i>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button onClick={() => setEditingPlan(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold uppercase text-xs">Cancelar</button>
                                <button onClick={handleSavePlan} className="flex-1 bg-black text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-green-600 transition-colors">Salvar Plano</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50 text-gray-400 flex-col p-10">
                        <i className="fas fa-edit text-4xl mb-4 opacity-50"></i>
                        <p className="font-bold uppercase text-xs">Selecione um plano para editar ou crie um novo</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full">
        {viewMode === 'list' && renderList()}
        {viewMode === 'edit' && renderEditor()}
        {viewMode === 'config' && renderConfig()}
    </div>
  );
};

export default AdvertisersTab;
