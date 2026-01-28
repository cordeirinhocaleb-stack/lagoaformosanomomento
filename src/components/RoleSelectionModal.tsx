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
        confirmPassword: '',
        email: _email || ''
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
            if (!formData.username || !formData.birthDate || (!isSocialLogin && !formData.email)) {
                return setNotice({ message: "Preencha os campos obrigatórios.", type: 'warning' });
            }
            if (!isSocialLogin && formData.email && !formData.email.includes('@')) {
                return setNotice({ message: "E-mail inválido.", type: 'warning' });
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
            // Verificação de segurança (Turnstile) desabilitada no frontend
            // if (!isSocialLogin && !captchaToken) {
            //     return setNotice({ message: "Por favor, complete a verificação de segurança.", type: 'warning' });
            // }
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
        <div className="fixed inset-0 z-[10020] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto custom-scrollbar">

            {/* Exit Button */}
            <button
                onClick={onCancel}
                className="fixed top-6 right-6 z-[10030] w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-black hover:text-white transition-all hover:rotate-90 flex items-center justify-center font-bold"
                title="Sair"
            >
                <i className="fas fa-times text-lg"></i>
            </button>

            {/* Main Card */}
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">

                {/* Sidebar / Progress (Desktop) */}
                <div className="hidden md:flex w-[35%] bg-gray-50 border-r border-gray-100 p-10 flex-col relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600/5 rounded-full blur-3xl"></div>

                    <div className="mb-12 relative z-10">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                            <i className="fas fa-id-card-alt text-xl"></i>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
                            Novo <br /><span className="text-red-600">Cadastro</span>
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Passo {steps.indexOf(step) + 1} de {steps.length}
                        </p>
                    </div>

                    <div className="space-y-0 relative z-10 w-full pl-2">
                        {steps.map((s, idx) => {
                            const isActive = s === step;
                            const isCompleted = steps.indexOf(step) > idx;

                            return (
                                <div key={s} className="relative pb-8 last:pb-0">
                                    {/* Line Connector */}
                                    {idx !== steps.length - 1 && (
                                        <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${isCompleted ? 'bg-black' : 'bg-gray-200'}`}></div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 transition-all z-10 ${isActive
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30 ring-4 ring-red-50'
                                            : isCompleted
                                                ? 'bg-black border-black text-white'
                                                : 'bg-white border-gray-200 text-gray-400'
                                            }`}>
                                            {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                                        </div>
                                        <div className={`pt-1.5 transition-all duration-500 ${isActive ? 'translate-x-2' : ''}`}>
                                            <span className={`block text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isActive ? 'text-red-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {s === 'role' && 'Perfil'}
                                                {s === 'personal' && 'Dados Pessoais'}
                                                {s === 'address' && 'Endereço'}
                                                {s === 'specifics' && 'Detalhes'}
                                                {s === 'security' && 'Segurança'}
                                            </span>
                                            {isActive && (
                                                <span className="text-[9px] text-gray-500 font-bold block animate-fadeIn">
                                                    Preencha as informações
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center gap-2 text-gray-300 opacity-60 grayscale hover:grayscale-0 transition-all">
                            <Logo />
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Mobile Only) */}
                <div className="md:hidden w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-20 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                <i className="fas fa-user-plus text-xs"></i>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-tighter">Criar Conta</h4>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Etapa {steps.indexOf(step) + 1}</p>
                            </div>
                        </div>
                        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="flex gap-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="bg-red-600 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${((steps.indexOf(step) + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 p-6 md:p-12 flex flex-col overflow-y-auto custom-scrollbar relative bg-white">
                    {/* Header Controls (Desktop Hidden) */}
                    <div className="mb-8 flex justify-between items-center">
                        <div className="md:hidden w-full"></div> {/* Spacer for mobile */}
                        <div className="hidden md:block">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {step === 'role' && 'Qual seu objetivo?'}
                                {step === 'personal' && 'Quem é você?'}
                                {step === 'address' && 'Onde você está?'}
                                {step === 'specifics' && 'Mais detalhes'}
                                {step === 'security' && 'Segurança final'}
                            </h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {step === 'role' && 'Escolha o perfil ideal para você'}
                                {step === 'personal' && 'Precisamos de alguns dados básicos'}
                                {step === 'address' && 'Para personalizar sua experiência local'}
                                {step === 'specifics' && 'Informações específicas do seu perfil'}
                                {step === 'security' && 'Defina uma senha forte para proteção'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1">
                        {step === 'role' && (
                            <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                                {[
                                    { id: 'Leitor', icon: 'fa-book-reader', title: 'Leitor', desc: 'Quero ler notícias, comentar e compartilhar.' },
                                    { id: 'Prestador de Serviço', icon: 'fa-tools', title: 'Prestador', desc: 'Quero oferecer meus serviços e encontrar clientes.' },
                                    { id: 'Empresa', icon: 'fa-building', title: 'Empresa', desc: 'Quero divulgar minha marca, produtos ou vagas.' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setRole(option.id as UserRole)}
                                        className={`group relative overflow-hidden rounded-2xl p-6 text-left border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${role === option.id
                                            ? 'bg-red-600 border-red-600 shadow-red-600/30'
                                            : 'bg-white border-gray-100 hover:border-red-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors ${role === option.id ? 'bg-white text-red-600' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600'
                                                }`}>
                                                <i className={`fas ${option.icon}`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-base font-black uppercase tracking-tight transition-colors ${role === option.id ? 'text-white' : 'text-gray-900'
                                                    }`}>{option.title}</h3>
                                                <p className={`text-xs font-medium mt-1 transition-colors ${role === option.id ? 'text-red-100' : 'text-gray-500'
                                                    }`}>{option.desc}</p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${role === option.id ? 'bg-white border-white text-red-600 scale-110' : 'border-gray-200 text-transparent group-hover:border-red-200'
                                                }`}>
                                                <i className="fas fa-check text-xs"></i>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 'personal' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => updateField('username', e.target.value.toUpperCase())}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-300"
                                        placeholder="Seu nome aqui"
                                    />
                                </div>

                                {!isSocialLogin && !_email && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value.toLowerCase())}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-300"
                                            placeholder="seu@modal.com"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nascimento</label>
                                        <input
                                            type="text"
                                            value={formData.birthDate}
                                            onChange={handleDateChange}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-300 text-center"
                                            placeholder="DD/MM/AAAA"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF/CNPJ (Opcional)</label>
                                        <input
                                            type="text"
                                            value={formData.document}
                                            onChange={(e) => updateField('document', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-300 text-center"
                                            placeholder="Números"
                                        />
                                    </div>
                                </div>
                                {formData.document && !isValidCPF(formData.document) && !isValidCNPJ(formData.document) && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                                        <i className="fas fa-exclamation-circle"></i> Documento Inválido
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 'address' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CEP</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="00000-000"
                                            value={formData.zipCode}
                                            onChange={(e) => updateField('zipCode', e.target.value)}
                                            onBlur={handleCepBlur}
                                            disabled={isLoadingCep}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-300 disabled:opacity-50"
                                        />
                                        {isLoadingCep && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <i className="fas fa-circle-notch fa-spin text-red-600"></i>
                                            </div>
                                        )}
                                    </div>
                                    {formData.zipCode && !isValidCEP(formData.zipCode) && (
                                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1 ml-1">CEP Inválido</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => updateField('city', e.target.value)}
                                            disabled={!manualAddressEntry && !formData.city}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white disabled:opacity-60 disabled:bg-gray-100"
                                            placeholder="Cidade"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UF</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => updateField('state', e.target.value)}
                                            disabled={!manualAddressEntry && !formData.state}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white text-center disabled:opacity-60 disabled:bg-gray-100"
                                            placeholder="UF"
                                        />
                                    </div>
                                </div>

                                {role === 'Empresa' && (
                                    <div className="grid grid-cols-4 gap-4 animate-fade-in">
                                        <div className="col-span-3 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço</label>
                                            <input
                                                type="text"
                                                value={formData.street}
                                                onChange={(e) => updateField('street', e.target.value)}
                                                disabled={!manualAddressEntry && !formData.street}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white disabled:opacity-60 disabled:bg-gray-100"
                                                placeholder="Logradouro"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nº</label>
                                            <input type="text" value={formData.number} onChange={(e) => updateField('number', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white text-center" placeholder="Nº" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'specifics' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input type="text" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-green-500 focus:bg-white transition-colors" placeholder="(34) 99999-9999" />
                                    {formData.phone && !isValidPhone(formData.phone) && (
                                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1 ml-1">Número Inválido</p>
                                    )}
                                </div>

                                {role === 'Prestador de Serviço' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Profissão</label>
                                            <input type="text" placeholder="Ex: Eletricista, Encanador..." value={formData.profession} onChange={(e) => updateField('profession', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Disponibilidade</label>
                                            <select value={formData.availability} onChange={e => updateField('availability', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white">
                                                <option value="freelance">Disponível para Bicos</option>
                                                <option value="full_time">Disponível Tempo Integral</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {role === 'Empresa' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                                            <input type="text" placeholder="Nome da sua Empresa" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ramo de Atividade</label>
                                            <select value={formData.businessType} onChange={e => updateField('businessType', e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white">
                                                <option value="">Selecione...</option>
                                                <option value="Comércio">Comércio</option>
                                                <option value="Serviços">Serviços</option>
                                                <option value="Agro">Agro / Indústria</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'security' && (
                            <div className="space-y-6 animate-fade-in-up">

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            placeholder="Crie uma senha forte"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 pr-12 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>

                                    {/* Strength Meter */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${passwordStrength >= 100 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase ${passwordStrength >= 80 ? 'text-green-500' : 'text-gray-400'}`}>
                                            {passwordStrength >= 100 ? 'Excelente' : passwordStrength >= 50 ? 'Média' : 'Fraca'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirme a Senha</label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                                            placeholder="Digite novamente"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 pr-12 text-gray-900 font-bold outline-none focus:border-red-600 focus:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2 flex gap-4">
                        {step !== 'role' && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-4 rounded-xl border-2 border-gray-100 hover:border-black text-black font-black uppercase text-xs tracking-widest transition-all"
                            >
                                Voltar
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={(!role && step === 'role') || loading}
                            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${((!role && step === 'role') || loading)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-red-600 text-white hover:bg-black hover:scale-[1.02]'
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
                    <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-scaleIn">

                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${notice.type === 'error' ? 'bg-red-50 text-red-500' :
                            notice.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                                'bg-blue-50 text-blue-500'
                            }`}>
                            <i className={`fas ${notice.type === 'error' ? 'fa-exclamation-circle' :
                                notice.type === 'warning' ? 'fa-exclamation-triangle' :
                                    'fa-info-circle'
                                } text-3xl`}></i>
                        </div>

                        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter text-center mb-2">
                            {notice.type === 'error' ? 'Algo deu errado' : 'Atenção'}
                        </h4>

                        <p className="text-gray-500 text-sm font-medium text-center leading-relaxed mb-8">
                            {notice.message}
                        </p>

                        <button
                            onClick={() => setNotice(null)}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
                        >
                            Voltar e Corrigir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelectionModal;
