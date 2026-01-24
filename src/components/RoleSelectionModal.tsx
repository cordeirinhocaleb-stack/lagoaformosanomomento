import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import Logo from './common/Logo';
// import MaskedInput from './forms/MaskedInput';
import { isValidCPF, isValidCNPJ, isValidPhone, isValidCEP } from '../utils/validators';
// import TurnstileWidget from './common/TurnstileWidget'; // DESABILITADO

interface RoleSelectionModalProps {
    onSelect: (role: UserRole, data: Record<string, unknown>) => void;
    onCancel: () => void;
    userName: string;
    email?: string;
    userAvatar?: string;
    isSocialLogin?: boolean;
}

type WizardStep = 'role' | 'personal' | 'address' | 'specifics' | 'security';

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ onSelect, onCancel, userName, email: _email, userAvatar: _userAvatar, isSocialLogin = true }) => {
    const [step, setStep] = useState<WizardStep>('role');

    const [role, setRole] = useState<UserRole | null>(null);
    const [notice, setNotice] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
    const [formData, setFormData] = useState({
        username: userName,
        birthDate: '',
        zipCode: '',
        state: '',
        city: '',
        street: '',
        number: '',
        phone: '',
        document: '',
        profession: '',
        education: '',
        availability: 'freelance',
        companyName: '',
        businessType: '',
        customBusinessType: '',
        hasSocialMedia: false,
        socialMediaLink: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [manualAddressEntry, setManualAddressEntry] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // Lógica de força da senha
    const passwordStrength = useMemo(() => {
        const p = formData.password;
        if (!p) { return 0; }
        let strength = 0;
        if (p.length >= 6) { strength += 20; }
        if (/[a-zA-Z]/.test(p)) { strength += 40; }
        if (/[0-9]/.test(p)) { strength += 40; }
        return strength;
    }, [formData.password]);

    useEffect(() => {
        // Carrega backup do formulário se existir
        const saved = localStorage.getItem('lfnm_registration_backup');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                if (parsed.role) { setRole(parsed.role); }
                if (parsed.step) { setStep(parsed.step); }
            } catch (e) { }
        }

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Salva dados no cache a cada alteração (apenas se tiver iniciado o processo)
    useEffect(() => {
        if (!role) return;

        localStorage.setItem('lfnm_registration_backup', JSON.stringify({
            data: formData,
            role,
            step,
            updatedAt: new Date().toISOString()
        }));
    }, [formData, role, step]);

    const updateField = (field: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) { value = value.slice(0, 8); }
        if (value.length >= 5) { value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3'); }
        else if (value.length >= 3) { value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2'); }
        updateField('birthDate', value);
    };

    const handleNext = async () => {
        if (step === 'role' && role) { setStep('personal'); }
        else if (step === 'personal') {
            if (!formData.username || !formData.birthDate) {
                return setNotice({ message: "Preencha os campos obrigatórios.", type: 'warning' });
            }
            setStep('address');
        }
        else if (step === 'address') {
            if (!formData.city || !formData.state) {
                return setNotice({ message: "Cidade e Estado são obrigatórios.", type: 'warning' });
            }
            setStep('specifics');
        }
        else if (step === 'specifics') {
            if (isSocialLogin) { await handleFinish(); }
            else { setStep('security'); }
        }
        else if (step === 'security') {
            if (passwordStrength < 100) {
                return setNotice({ message: "Sua senha precisa conter letras e números.", type: 'warning' });
            }
            await handleFinish();
        }
    };

    const handleBack = () => {
        if (step === 'personal') { setStep('role'); }
        else if (step === 'address') { setStep('personal'); }
        else if (step === 'specifics') { setStep('address'); }
        else if (step === 'security') { setStep('specifics'); }
    };

    const handleFinish = async () => {
        if (!isSocialLogin) {
            if (formData.password.length < 6) {
                return setNotice({ message: "A senha deve ter pelo menos 6 dígitos.", type: 'error' });
            }
            if (formData.password !== formData.confirmPassword) {
                return setNotice({ message: "As senhas não coincidem.", type: 'error' });
            }
        }

        if (role) {
            if (!isSocialLogin && !captchaToken) {
                return setNotice({ message: "Por favor, complete a verificação de segurança.", type: 'warning' });
            }
            setLoading(true);
            let isoBirthDate = formData.birthDate;
            if (formData.birthDate && formData.birthDate.includes('/') && formData.birthDate.length === 10) {
                const [day, month, year] = formData.birthDate.split('/');
                isoBirthDate = `${year}-${month}-${day}`;
            }

            // SALVAMENTO RESILIENTE (Enviando apenas o que importa)
            const finalData = {
                ...formData,
                birthDate: isoBirthDate,
                businessType: formData.businessType === 'Outros' ? formData.customBusinessType : formData.businessType,
                captchaToken: captchaToken
            };

            try {
                // Timeout de 20 segundos para evitar carregamento infinito
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Tempo limite excedido. Verifique sua conexão.")), 20000);
                });

                await Promise.race([
                    onSelect(role, finalData),
                    timeoutPromise
                ]);
            } catch (error: unknown) {
                console.error("Erro no onSelect:", error); // eslint-disable-line no-console
                const message = error instanceof Error ? error.message : "Erro ao finalizar cadastro. Tente novamente.";
                setNotice({
                    message,
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.zipCode.replace(/\D/g, '');
        if (cep.length === 8) {
            setIsLoadingCep(true);
            setManualAddressEntry(false); // Reseta modo manual enquanto tenta buscar

            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();

                if (!data.erro) {
                    updateField('city', data.localidade);
                    updateField('state', data.uf);
                    updateField('street', data.logradouro);
                } else {
                    // CEP não encontrado -> Libera digitação manual
                    setManualAddressEntry(true);
                    updateField('city', '');
                    updateField('state', '');
                    updateField('street', '');
                }
            } catch (e) {
                // Erro de rede/API -> Libera digitação manual
                setManualAddressEntry(true);
            } finally {
                setIsLoadingCep(false);
            }
        } else {
            // CEP inválido/incompleto -> Permite edição manual se quiser
            setManualAddressEntry(true);
        }
    };

    const steps = useMemo(() => {
        const list: WizardStep[] = ['role', 'personal', 'address', 'specifics'];
        if (!isSocialLogin) { list.push('security'); }
        return list;
    }, [isSocialLogin]);

    return (
        <div className="fixed inset-0 z-[10020] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto custom-scrollbar">
            {/* Background Logo Effect */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] transform scale-[3]">
                <Logo />
            </div>

            {/* Exit Button */}
            <button
                onClick={onCancel}
                className="fixed top-6 right-6 z-[10030] w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 shadow-lg"
                title="Sair"
            >
                <i className="fas fa-times text-sm"></i>
            </button>

            {/* Main Card */}
            <div className="w-full max-w-4xl bg-[#0F0F0F] border border-white/5 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px] max-h-[90vh] md:max-h-none">

                {/* Sidebar / Progress (Desktop) */}
                <div className="hidden md:flex w-1/3 bg-black/40 border-r border-white/5 p-8 flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-900 to-black"></div>

                    <div className="mb-10">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <i className="fas fa-id-card-alt text-xl"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cadastro Oficial</span>
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Bem-vindo, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{formData.username?.split(' ')[0] || 'Visitante'}</span>
                        </h2>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {steps.map((s, idx) => {
                            const isActive = s === step;
                            const isCompleted = steps.indexOf(step) > idx;

                            return (
                                <div key={s} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'translate-x-2' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${isActive ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' :
                                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                            'bg-transparent border-white/10 text-gray-600'
                                        }`}>
                                        {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                                            {s === 'role' && 'Perfil'}
                                            {s === 'personal' && 'Dados Pessoais'}
                                            {s === 'address' && 'Endereço'}
                                            {s === 'specifics' && 'Detalhes'}
                                            {s === 'security' && 'Segurança'}
                                        </span>
                                        {isActive && <span className="text-[8px] text-red-500 font-bold uppercase animate-pulse">Em andamento...</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto opacity-40">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Lagoa Formosa No Momento</p>
                    </div>
                </div>

                {/* Progress Bar (Mobile Only) */}
                <div className="md:hidden w-full bg-black/60 border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center text-red-600">
                            <i className="fas fa-id-card-alt text-xs"></i>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">Cadastro Oficial</h4>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Passo {steps.indexOf(step) + 1} de {steps.length}</p>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {steps.map((s, idx) => {
                            const isCompleted = steps.indexOf(step) > idx;
                            const isActive = s === step;
                            return (
                                <div
                                    key={s}
                                    className={`h-1 rounded-full transition-all duration-500 ${isActive ? 'w-6 bg-red-600' : isCompleted ? 'w-3 bg-green-500' : 'w-3 bg-white/10'
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 p-5 md:p-12 flex flex-col overflow-y-auto custom-scrollbar relative">
                    {/* Header Controls (Desktop Hidden) */}
                    <div className="mb-6 flex justify-between items-center">
                        {step !== 'role' ? (
                            <button onClick={handleBack} className="text-gray-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                                <i className="fas fa-arrow-left"></i> Voltar
                            </button>
                        ) : (
                            <div className="w-10 h-1 md:hidden" />
                        )}
                        <span className="hidden md:block text-[10px] font-black uppercase text-gray-600 tracking-widest">
                            Passo {steps.indexOf(step) + 1} de {steps.length}
                        </span>
                        <div className="md:hidden flex flex-col items-end">
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                                {step === 'role' && 'Selecione seu Perfil'}
                                {step === 'personal' && 'Dados Pessoais'}
                                {step === 'address' && 'Seu Endereço'}
                                {step === 'specifics' && 'Ajustes Finais'}
                                {step === 'security' && 'Sua Segurança'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1">
                        {step === 'role' && (
                            <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                                {[
                                    { id: 'Leitor', icon: 'fa-book-reader', title: 'Leitor', desc: 'Apenas ler e comentar notícias.' },
                                    { id: 'Prestador de Serviço', icon: 'fa-tools', title: 'Prestador', desc: 'Oferecer serviços e bicos.' },
                                    { id: 'Empresa', icon: 'fa-building', title: 'Empresa', desc: 'Anunciar e contratar pessoas.' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setRole(option.id as UserRole)}
                                        className={`group relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 text-left border transition-all duration-300 ${role === option.id
                                            ? 'bg-red-600 border-red-500 shadow-[0_10px_40px_rgba(220,38,38,0.2)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-lg transition-colors ${role === option.id ? 'bg-white text-red-600' : 'bg-black/40 text-gray-400 group-hover:text-white'
                                                }`}>
                                                <i className={`fas ${option.icon}`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-base md:text-lg font-black uppercase italic transition-colors ${role === option.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{option.title}</h3>
                                                <p className={`text-[10px] md:text-xs font-medium transition-colors ${role === option.id ? 'text-red-100' : 'text-gray-500'}`}>{option.desc}</p>
                                            </div>
                                            {role === option.id && <div className="bg-white/20 p-1.5 rounded-full"><i className="fas fa-check text-[10px] text-white"></i></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 'personal' && (
                            <div className="space-y-5 animate-fade-in-up">
                                <h3 className="text-xl font-black text-white italic uppercase mb-6">Informações Pessoais</h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => updateField('username', e.target.value.toUpperCase())}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 transition-colors text-sm md:text-base"
                                        placeholder="Seu nome aqui"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Data Nascimento</label>
                                        <input
                                            type="text"
                                            value={formData.birthDate}
                                            onChange={handleDateChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-red-600 transition-colors"
                                            placeholder="DD/MM/AAAA"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">CPF/CNPJ (Opcional)</label>
                                        <input
                                            type="text"
                                            value={formData.document}
                                            onChange={(e) => updateField('document', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 transition-colors text-sm md:text-base"
                                            placeholder="Apenas números"
                                        />
                                        {formData.document && !isValidCPF(formData.document) && !isValidCNPJ(formData.document) && (
                                            <p className="text-[9px] text-red-500 font-bold uppercase ml-2 px-1">Documento Inválido</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'address' && (
                            <div className="space-y-5 animate-fade-in-up">
                                <h3 className="text-xl font-black text-white italic uppercase mb-6">Onde te encontrar?</h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">CEP</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="00000-000"
                                            value={formData.zipCode}
                                            onChange={(e) => updateField('zipCode', e.target.value)}
                                            onBlur={handleCepBlur}
                                            disabled={isLoadingCep}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 transition-colors disabled:opacity-50 text-sm md:text-base"
                                        />
                                        {isLoadingCep && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <i className="fas fa-circle-notch fa-spin text-red-600"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center ml-2">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">CEP para buscar automaticamente.</p>
                                        {formData.zipCode && !isValidCEP(formData.zipCode) && (
                                            <p className="text-[9px] text-red-500 font-bold uppercase px-1">CEP Inválido</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Cidade</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                disabled={!manualAddressEntry && !formData.city} // Bloqueia se não for manual e estiver vazio (força busca)
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                                                placeholder={isLoadingCep ? "Buscando..." : "Cidade"}
                                            />
                                            {isLoadingCep && <div className="absolute right-4 top-1/2 -translate-y-1/2"><i className="fas fa-spinner fa-spin text-gray-400"></i></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">UF</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => updateField('state', e.target.value)}
                                                disabled={!manualAddressEntry && !formData.state}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-center disabled:opacity-50 text-sm md:text-base"
                                                placeholder={isLoadingCep ? "..." : "UF"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {role === 'Empresa' && (
                                    <div className="grid grid-cols-4 gap-4 animate-fade-in">
                                        <div className="col-span-3 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Endereço</label>
                                            <input
                                                type="text"
                                                value={formData.street}
                                                onChange={(e) => updateField('street', e.target.value)}
                                                disabled={!manualAddressEntry && !formData.street}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 disabled:opacity-50 text-sm md:text-base"
                                                placeholder={isLoadingCep ? "Carregando endereço..." : "Rua/Av"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nº</label>
                                            <input type="text" value={formData.number} onChange={(e) => updateField('number', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-center text-sm md:text-base" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'specifics' && (
                            <div className="space-y-5 animate-fade-in-up">
                                <h3 className="text-xl font-black text-white italic uppercase mb-6">
                                    {role === 'Empresa' ? 'Dados do Negócio' : role === 'Leitor' ? 'Finalizando...' : 'Profissão'}
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">WhatsApp</label>
                                    <input type="text" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-green-500 transition-colors text-sm md:text-base" placeholder="(34) 99999-9999" />
                                    {formData.phone && !isValidPhone(formData.phone) && (
                                        <p className="text-[9px] text-red-500 font-bold uppercase ml-2 px-1">Número de Celular Inválido</p>
                                    )}
                                </div>

                                {role === 'Prestador de Serviço' && (
                                    <>
                                        <input type="text" placeholder="Profissão (Ex: Eletricista)" value={formData.profession} onChange={(e) => updateField('profession', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base mb-4" />
                                        <select value={formData.availability} onChange={e => updateField('availability', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base">
                                            <option value="freelance">Disponível para Bicos</option>
                                            <option value="full_time">Disponível Tempo Integral</option>
                                        </select>
                                    </>
                                )}

                                {role === 'Empresa' && (
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Nome Fantasia" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base" />
                                        <select value={formData.businessType} onChange={e => updateField('businessType', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base">
                                            <option value="">Selecione o Ramo</option>
                                            <option value="Comércio">Comércio</option>
                                            <option value="Serviços">Serviços</option>
                                            <option value="Agro">Agro / Indústria</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'security' && (
                            <div className="space-y-5 animate-fade-in-up">
                                <h3 className="text-xl font-black text-white italic uppercase mb-6">Proteja sua Conta</h3>

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            placeholder="Nova Senha"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 pr-12 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>

                                    {/* Password Strength Meter */}
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                                        <div className={`h-full transition-all duration-500 ${passwordStrength >= 100 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{ width: `${passwordStrength}%` }}></div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase text-right">
                                        Força: {passwordStrength >= 100 ? 'Segura' : passwordStrength >= 50 ? 'Média' : 'Fraca'}
                                    </p>
                                </div>

                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                                        placeholder="Confirme a Senha"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 pr-12 text-white font-bold outline-none focus:border-red-600 text-sm md:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>

                                {/* CAPTCHA desabilitado */}
                                {/* !isSocialLogin && (
                                    <div className="pt-4 animate-fadeIn">
                                        <TurnstileWidget onVerify={setCaptchaToken} options={{ theme: 'dark' }} />
                                    </div>
                                ) */}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 sticky bottom-0 bg-[#0F0F0F] pb-4">
                        <button
                            onClick={handleNext}
                            disabled={(!role && step === 'role') || loading}
                            className={`w-full py-4 md:py-5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-3 ${((!role && step === 'role') || loading)
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-lg hover:shadow-red-600/20 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (steps.indexOf(step) === steps.length - 1 ? 'Finalizar Cadastro' : 'Continuar')}
                            {!loading && <i className="fas fa-arrow-right"></i>}
                        </button>
                    </div>
                </div>

            </div>

            {/* Premium Notice Modal Overlay */}
            {notice && (
                <div className="fixed inset-0 z-[10035] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNotice(null)}></div>
                    <div className="relative w-full max-w-sm bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-scaleIn">
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ${notice.type === 'error' ? 'bg-red-500/20 text-red-500' :
                            notice.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                                'bg-blue-500/20 text-blue-500'
                            }`}>
                            <i className={`fas ${notice.type === 'error' ? 'fa-exclamation-circle' :
                                notice.type === 'warning' ? 'fa-exclamation-triangle' :
                                    'fa-info-circle'
                                } text-3xl`}></i>
                        </div>

                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter text-center mb-4">
                            {notice.type === 'error' ? 'Erro de Validação' : 'Atenção Necessária'}
                        </h4>

                        <p className="text-zinc-400 text-sm font-bold text-center leading-relaxed mb-8">
                            {notice.message}
                        </p>

                        <button
                            onClick={() => setNotice(null)}
                            className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                            Compreendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelectionModal;
