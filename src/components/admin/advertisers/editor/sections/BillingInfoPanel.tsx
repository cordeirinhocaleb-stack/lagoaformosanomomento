import React, { useState, useEffect, useRef } from 'react';
import { Advertiser, User } from '../../../../../types';
import { getSystemSetting, saveSystemSetting } from '../../../../../services/content/contentService';
import { generatePixPayload } from '../../../../../utils/pixPayload';
import { recordPayment } from '../../../../../services/billing/billingService';
import { PaymentMethod } from '../../../../../types/system';

interface BillingInfoPanelProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    user?: User | null;
    darkMode?: boolean;
}

const BillingInfoPanel: React.FC<BillingInfoPanelProps> = ({ data, onChange, user, darkMode = false }) => {
    const [pixConfig, setPixConfig] = useState<{ key: string, merchantName: string, merchantCity: string } | null>(null);
    const [pixPayload, setPixPayload] = useState('');
    const [copied, setCopied] = useState(false);

    // Múltiplos métodos
    const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');

    // Estados para o fluxo de confirmação direto
    const [confirming, setConfirming] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'pix' | 'boleto'>('pix');
    const [barcode, setBarcode] = useState(data.billingBarCode || '');
    const [senderName, setSenderName] = useState(data.name || user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const boletoFileRef = useRef<HTMLInputElement>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [boletoFile, setBoletoFile] = useState<File | null>(null);

    // Parcelamento
    const [installments, setInstallments] = useState(data.installments || 1);
    const [interestRate, setInterestRate] = useState(data.interestRate || 0);
    const [interestFreeInstallments, setInterestFreeInstallments] = useState(data.interestFreeInstallments || 1);
    const [lateFee, setLateFee] = useState(data.lateFee || 1);
    const [dailyInterest, setDailyInterest] = useState(data.dailyInterest ?? 0.2);

    // Controle de Expansão
    const [expandedMethod, setExpandedMethod] = useState<'pix' | 'boleto' | null>(data.isPaid ? null : (data.billingBarCode ? 'boleto' : 'pix'));

    // Estilos
    const BASE_INPUT_CLASS = "w-full rounded-lg px-4 py-3 text-sm font-medium outline-none border transition-all duration-200 focus:ring-2 focus:ring-red-500/20";
    const LIGHT_INPUT_CLASS = "bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder-gray-400";
    const DARK_INPUT_CLASS = "bg-[#1A1A1A] border-zinc-800 text-gray-100 focus:border-red-500 placeholder-zinc-600";

    const inputClass = `${BASE_INPUT_CLASS} ${darkMode ? DARK_INPUT_CLASS : LIGHT_INPUT_CLASS}`;
    const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`;

    // Duration for Monthly contracts - Using directly from data props
    const contractDurationProp = data.contractDuration || (data.billingCycle === 'monthly' ? 12 : 1);

    // Sincronizar nome do pagador com nome do anunciante se mudar
    useEffect(() => {
        if (data.name) {
            setSenderName(data.name);
        }
    }, [data.name]);

    // Sincronizar estados locais com o objeto data do componente pai
    // Removido contractDuration e data.contractDuration deste efeito para evitar loop
    useEffect(() => {
        const total = calculateTotalWithInterest();
        if (
            data.installments !== installments ||
            data.totalWithInterest !== total ||
            data.interestRate !== interestRate ||
            data.interestFreeInstallments !== interestFreeInstallments ||
            data.lateFee !== lateFee ||
            data.dailyInterest !== dailyInterest ||
            data.billingBarCode !== barcode
        ) {
            onChange({
                ...data,
                installments,
                interestRate,
                interestFreeInstallments,
                lateFee,
                dailyInterest,
                totalWithInterest: total,
                billingBarCode: barcode
            });
        }
    }, [installments, interestRate, interestFreeInstallments, lateFee, dailyInterest, data.billingValue, barcode, data]); // contractDuration removed

    // Carregar configurações do sistema (PIX)
    const loadConfig = async () => {
        const settings = await getSystemSetting('general_settings');
        if (settings?.pixConfig) {
            setPixConfig(settings.pixConfig);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    // Gerar payload sempre que o valor mudar
    useEffect(() => {
        const finalValue = calculateTotalWithInterest();
        if (pixConfig && finalValue > 0) {
            const payload = generatePixPayload({
                key: pixConfig.key,
                merchantName: pixConfig.merchantName,
                merchantCity: pixConfig.merchantCity,
                amount: finalValue,
                txid: data.id ? data.id.replace(/-/g, '').substring(0, 25) : 'ADV001'
            });
            setPixPayload(payload);
        } else {
            setPixPayload('');
        }
    }, [pixConfig, data.billingValue, installments, interestRate, interestFreeInstallments, data.contractDuration]);

    const handleChange = (field: keyof Advertiser, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numberValue = Number(rawValue) / 100;
        handleChange('billingValue', numberValue);
    };

    const handleCopy = () => {
        if (!pixPayload) return;
        navigator.clipboard.writeText(pixPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveMethod = async () => {
        if (paymentMode === 'pix' && !pixConfig?.key) return alert("Configure a chave PIX primeiro.");

        setIsSaving(true);
        try {
            const settings = await getSystemSetting('general_settings') || {};
            const methods = settings.paymentMethods || [];

            const newMethod: PaymentMethod = {
                id: Math.random().toString(36).substr(2, 9),
                type: paymentMode === 'pix' ? 'pix' : 'boleto',
                label: paymentMode === 'pix' ? `PIX - ${pixConfig?.merchantName}` : `Boleto - ${barcode.substring(0, 10)}...`,
                config: paymentMode === 'pix' ? {
                    pixKey: pixConfig?.key,
                    merchantName: pixConfig?.merchantName,
                    merchantCity: pixConfig?.merchantCity
                } : {
                    bankName: 'Banco Configurado',
                    ownerName: senderName
                },
                interestRate: interestRate,
                maxInstallments: 12
            };

            await saveSystemSetting('general_settings', {
                ...settings,
                paymentMethods: [...methods, newMethod]
            });

            setSavedMethods([...methods, newMethod]);
            alert("Método de pagamento salvo com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar método.");
        } finally {
            setIsSaving(false);
        }
    };

    const calculateTotalWithInterest = () => {
        const baseValue = data.billingValue || 0;
        const duration = data.contractDuration || (data.billingCycle === 'monthly' ? 12 : 1);

        // Lógica de Multiplicação Direta conforme solicitado:
        // Se Mensal: Valor Base * Meses
        if (data.billingCycle === 'monthly') {
            const calculatedTotal = baseValue * duration;
            // Juros (se houver parcelamento com juros)
            if (installments <= interestFreeInstallments) return calculatedTotal;
            const parcsWithInterest = installments - interestFreeInstallments;
            return calculatedTotal * (1 + (interestRate / 100) * parcsWithInterest);
        }

        // Se Outros Ciclos (Trimestral, Semestral, Anual), o Base Value é por CICLO.
        // Calculamos quantos ciclos cabem na duração.
        let cycleMonths = 1;
        if (data.billingCycle === 'quarterly') cycleMonths = 3;
        if (data.billingCycle === 'semiannual') cycleMonths = 6;
        if (data.billingCycle === 'yearly') cycleMonths = 12;

        const numberOfCycles = Math.ceil(duration / cycleMonths); // Ex: 12 meses / 6 (semestral) = 2 pagamentos
        const calculatedTotal = baseValue * numberOfCycles;

        if (installments <= interestFreeInstallments) return calculatedTotal;

        const parcsWithInterest = installments - interestFreeInstallments;
        return calculatedTotal * (1 + (interestRate / 100) * parcsWithInterest);
    };

    const totalWithInterest = calculateTotalWithInterest();

    const handleFinalConfirm = async () => {
        if (!user) return alert("Erro: Usuário não identificado.");
        // Removida validação rígida de >0 para permitir ajustes manuais se necessário, mas mantendo alerta
        if (!data.billingValue || data.billingValue <= 0) {
            if (!confirm("O valor base está zerado. Deseja continuar mesmo assim?")) return;
        }

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulação de processamento

            await recordPayment({
                user_id: user.id,
                advertiser_id: data.id,
                amount: totalWithInterest,
                method: paymentMode,
                status: 'completed',
                sender_name: senderName,
                metadata: {
                    userAgent: navigator.userAgent,
                    proofReceived: !!proofFile,
                    pixPayload: paymentMode === 'pix' ? pixPayload : undefined,
                    barcode: paymentMode === 'boleto' ? barcode : undefined,
                    boletoAttached: !!boletoFile,
                    installments: installments,
                    interestRate: interestRate,
                    interestFreeInstallments: interestFreeInstallments,
                    totalOriginal: data.billingValue,
                    directPanel: true
                }
            });

            onChange({
                ...data,
                isPaid: true,
                billingStatus: 'paid',
                installments: installments,
                totalWithInterest: totalWithInterest
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setConfirming(false);
            }, 3000);

        } catch (error) {
            console.error(error);
            alert("Erro ao registrar pagamento.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleExpand = (method: 'pix' | 'boleto') => {
        if (expandedMethod === method) {
            setExpandedMethod(null);
        } else {
            setExpandedMethod(method);
            setPaymentMode(method);
        }
    };

    // Gerador Automático de Carnê
    useEffect(() => {
        if (expandedMethod === 'boleto' && !barcode) {
            // Formato Simulado: 00000.00000 00000.000000 00000.000000 0 00000000000000
            const randomBlock = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
            const randomBlockLong = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            const randomBlockLong2 = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            const randomBlock2 = Math.floor(Math.random() * 99999).toString().padStart(5, '0');

            // Usando ID do anunciante ou timestamp para unicidade
            const ref = data.id ? data.id.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '9') : '00000';
            const valueStr = totalWithInterest.toFixed(2).replace('.', '').padStart(10, '0');

            const generated = `34191.${ref} ${randomBlock}.${randomBlockLong} ${randomBlock2}.${randomBlockLong2} 1 ${valueStr}`;
            setBarcode(generated);
        }
    }, [expandedMethod, barcode, data.id, totalWithInterest]);

    // Sanitize Barcode State (Fix corrupted data from previous bug)
    useEffect(() => {
        if (barcode && (barcode.includes('Math.floor') || barcode.includes('=>'))) {
            // Regenerate valid barcode
            const randomBlock = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
            const randomBlockLong = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            const randomBlockLong2 = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            const randomBlock2 = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
            const ref = data.id ? data.id.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '9') : '00000';
            const valueStr = totalWithInterest.toFixed(2).replace('.', '').padStart(10, '0');
            const cleanBarcode = `34191.${ref} ${randomBlock}.${randomBlockLong} ${randomBlock2}.${randomBlockLong2} 1 ${valueStr}`;
            setBarcode(cleanBarcode);
        }
    }, [barcode, data.id, totalWithInterest]);

    const handleManualUpdate = () => {
        // 1. Recalcular Total
        const total = calculateTotalWithInterest();

        // 2. Recalcular Data Final (forçado)
        let newEndDate = data.endDate;
        if (data.startDate && data.contractDuration && ['monthly', 'quarterly', 'semiannual', 'yearly', 'single'].includes(data.billingCycle)) {
            const start = new Date(data.startDate);
            const end = new Date(start);
            end.setMonth(start.getMonth() + data.contractDuration);
            newEndDate = end.toISOString();
        }

        onChange({
            ...data,
            totalWithInterest: total,
            endDate: newEndDate,
            installments,
            interestRate,
            interestFreeInstallments,
            lateFee,
            dailyInterest,
            billingBarCode: barcode
        });

        alert(`Valores atualizados!\nTotal: R$ ${total.toFixed(2)}\nFim de Vigência: ${new Date(newEndDate).toLocaleDateString()}`);
    };

    return (
        <div className={`mt-8 p-6 rounded-3xl border relative overflow-hidden transition-all duration-500 ${darkMode ? 'bg-[#151515] border-zinc-800 text-white' : 'bg-white border-gray-200 shadow-sm'}`}>
            {/* Header com Status */}
            <div className={`flex items-center justify-between mb-6 pb-2 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    <i className="fas fa-file-invoice-dollar"></i>
                    Configurações de Faturamento
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleManualUpdate}
                        className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                    >
                        <i className="fas fa-sync-alt mr-1"></i> Atualizar Valores
                    </button>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${data.billingStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {data.billingStatus === 'paid' ? 'Contrato Liquidado' : 'Aguardando Pagamento'}
                    </div>
                </div>
            </div>

            {/* Resumo do Contrato (Estágio 0) */}
            <div className={`p-5 rounded-2xl border mb-8 ${darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-5 pb-5 border-b border-dashed border-zinc-700/50">
                    <div className="flex items-center gap-3">
                        <span className={labelClass}>Plano:</span>
                        <span className="text-xs font-black uppercase italic text-red-500">
                            {data.plan?.toUpperCase() || 'BÁSICO'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={labelClass}>Ciclo:</span>
                        <span className="text-xs font-bold">{data.billingCycle?.toUpperCase() || 'MENSAL'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={labelClass}>Vigência:</span>
                        <span className="text-[10px] font-medium text-zinc-400">
                            {new Date(data.startDate).toLocaleDateString()} a {new Date(data.endDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xs font-bold leading-relaxed">
                        O usuário escolheu <span className="text-emerald-400 font-black">{paymentMode.toUpperCase()}</span> para pagamento do plano de anúncios <span className="text-emerald-400 font-black">{data.plan?.toUpperCase() || 'BÁSICO'}</span>.
                    </p>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        CONFIGURAÇÃO: Pagamento único de R$ {(totalWithInterest).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Configurações Financeiras (Inputs Rápidos) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {['monthly', 'quarterly', 'semiannual', 'yearly', 'single'].includes(data.billingCycle) && (
                    <div>
                        <label className={labelClass}>Meses Contratados</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={data.contractDuration || 12}
                            onChange={e => handleChange('contractDuration', Number(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                )}
                <div>
                    <label className={labelClass}>
                        {(() => {
                            switch (data.billingCycle) {
                                case 'monthly': return 'Mensalidade Base';
                                case 'quarterly': return 'Valor Trimestral';
                                case 'semiannual': return 'Valor Semestral';
                                case 'yearly': return 'Valor Anual';
                                case 'single': return 'Valor Único';
                                default: return 'Valor Base (Ciclo)';
                            }
                        })()}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">R$</span>
                        <input
                            type="text"
                            value={data.billingValue ? (data.billingValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                            onChange={handleValueChange}
                            className={`${inputClass} pl-10 text-lg font-black`}
                        />
                    </div>
                </div>
                {false && (
                    <div>
                        <label className={labelClass}>Multa (Atrás)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={lateFee}
                                onChange={e => setLateFee(Number(e.target.value))}
                                className={`${inputClass} pr-8`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                        </div>
                    </div>
                )}
                {false && (
                    <div>
                        <label className={labelClass}>Juros/Dia</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={dailyInterest}
                                onChange={e => setDailyInterest(Number(e.target.value))}
                                className={`${inputClass} pr-8`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                        </div>
                    </div>
                )}
                <div>
                    <label className={labelClass}>Total Final</label>
                    <div className={`px-4 py-3 rounded-lg border font-black text-emerald-400 bg-zinc-900 border-zinc-800 flex items-center justify-between`}>
                        <span className="text-[9px] uppercase">R$</span>
                        {totalWithInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Cards de Métodos Expansíveis */}
            <div className="space-y-4 mb-8">
                {/* CARD PIX */}
                <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${expandedMethod === 'pix' ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'}`}>
                    <button
                        onClick={() => toggleExpand('pix')}
                        className="w-full p-5 flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expandedMethod === 'pix' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-emerald-500'}`}>
                                <i className="fab fa-pix text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase italic">Pagamento Instantâneo PIX</h4>
                                <p className="text-[10px] text-zinc-500 font-medium">Liberação imediata mediante envio de comprovante</p>
                            </div>
                        </div>
                        <i className={`fas fa-chevron-${expandedMethod === 'pix' ? 'up' : 'down'} text-zinc-600`}></i>
                    </button>

                    {expandedMethod === 'pix' && (
                        <div className="px-5 pb-6 animate-fadeIn">
                            <div className="flex flex-col md:flex-row items-center gap-8 bg-black/20 rounded-2xl p-6 border border-zinc-700/50">
                                <div className="shrink-0 bg-white p-3 rounded-2xl shadow-2xl">
                                    {pixPayload ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`}
                                            alt="QR Code Pix"
                                            className="w-32 h-32 object-contain"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 flex flex-col items-center justify-center text-zinc-300">
                                            <i className="fas fa-qrcode text-4xl mb-2"></i>
                                            <span className="text-[8px] font-black uppercase">Aguardando Valor</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <h5 className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        PIX Dinâmico Gerado
                                    </h5>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Escaneie o QR Code ao lado ou copie a chave abaixo. O valor já inclui o cálculo de juros e parcelamento selecionado.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCopy}
                                            className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                                        >
                                            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                                            {copied ? 'Chave Copiada!' : 'Copia e Cola'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CARD BOLETO */}
                {false && (
                    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${expandedMethod === 'boleto' ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'} ${['daily', 'weekly'].includes(data.billingCycle) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                        <button
                            onClick={() => {
                                if (['daily', 'weekly'].includes(data.billingCycle)) {
                                    alert("Boleto/Carnê não disponível para ciclos Diários ou Semanais. Utilize PIX.");
                                    return;
                                }
                                toggleExpand('boleto');
                            }}
                            className="w-full p-5 flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expandedMethod === 'boleto' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-blue-500'}`}>
                                    <i className="fas fa-barcode text-2xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase italic">Boleto Bancário / Carnê</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        {['daily', 'weekly'].includes(data.billingCycle)
                                            ? <span className="text-red-500 font-bold">Indisponível para ciclo {data.billingCycle === 'daily' ? 'Diário' : 'Semanal'}</span>
                                            : 'Liberação após compensação ou envio de PDF'
                                        }
                                    </p>
                                </div>
                            </div>
                            <i className={`fas fa-chevron-${expandedMethod === 'boleto' ? 'up' : 'down'} text-zinc-600`}></i>
                        </button>

                        {expandedMethod === 'boleto' && (
                            <div className="px-5 pb-6 animate-fadeIn">
                                {/* Inject Font for Barcode */}
                                <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');
                                .barcode-font { font-family: 'Libre Barcode 128', cursive; }
                            `}</style>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 rounded-2xl p-6 border border-zinc-700/50">
                                    <div>
                                        <label className={labelClass}>Linha Digitável / Código</label>
                                        <input
                                            type="text"
                                            value={barcode}
                                            onChange={e => setBarcode(e.target.value)}
                                            className={inputClass}
                                            placeholder="00090.00005 00000.000000..."
                                        />
                                        {barcode && (
                                            <div className="mt-4 p-4 bg-white rounded-lg text-center overflow-hidden">
                                                <p className="barcode-font text-5xl text-black whitespace-nowrap overflow-hidden">
                                                    {barcode.replace(/\D/g, '')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Opção PIX no Boleto */}
                                        <div className="mt-4 pt-4 border-t border-zinc-700/50">
                                            <label className={labelClass}>Pagar via PIX (Híbrido)</label>
                                            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                                                {pixPayload ? (
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixPayload)}`}
                                                        alt="QR Code Pix"
                                                        className="w-20 h-20 rounded-lg bg-white p-1"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center">
                                                        <i className="fas fa-qrcode text-zinc-600"></i>
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                                                        <i className="fab fa-pix mr-1"></i> QR Code Disponível
                                                    </div>
                                                    <p className="text-[9px] text-zinc-400 leading-tight mb-2">
                                                        Utilize este QR Code para pagamento instantâneo do valor total.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            if (pixPayload) {
                                                                navigator.clipboard.writeText(pixPayload);
                                                                alert("Pix Copia e Cola copiado!");
                                                            }
                                                        }}
                                                        className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded hover:bg-emerald-500 hover:text-white transition-colors"
                                                    >
                                                        Copiar Código
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClass}>
                                                {['monthly', 'quarterly', 'biannual', 'annual'].includes(data.billingCycle) ? 'Gerar Carnê' : 'PDF do Boleto'}
                                            </label>

                                            {['monthly'].includes(data.billingCycle) && (
                                                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400">
                                                    <i className="fas fa-info-circle mr-2"></i>
                                                    Contratos Mensais geram carnês recorrentes (12x).
                                                </div>
                                            )}

                                            <button
                                                onClick={async () => {
                                                    // Dynamic import to avoid circular dependencies if any, or just standard import usage
                                                    const { generateCarnetPDF } = await import('../../../../../services/pdf/carnetPDFGenerator');
                                                    await generateCarnetPDF(data);
                                                }}
                                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase transition-all mb-3 shadow-lg hover:translate-y-[-2px]"
                                            >
                                                <i className="fas fa-print mr-2"></i>
                                                Gerar PDF do Carnê
                                            </button>

                                            <button
                                                onClick={() => boletoFileRef.current?.click()}
                                                className={`w-full py-3 px-4 border-2 border-dashed rounded-xl text-[10px] font-black uppercase transition-all ${boletoFile ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-zinc-700 text-zinc-500 hover:border-blue-500'}`}
                                            >
                                                <input type="file" ref={boletoFileRef} hidden onChange={e => setBoletoFile(e.target.files?.[0] || null)} />
                                                <i className={`fas ${boletoFile ? 'fa-file-pdf' : 'fa-upload'} mr-2`}></i>
                                                {boletoFile ? (boletoFile as File).name : 'Anexar Boleto Externo (Opcional)'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Painel de Liquidação (Confirmação) */}
            <div className={`rounded-3xl p-6 ${darkMode ? 'bg-zinc-950' : 'bg-gray-100'} border ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-grow space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <i className="fas fa-check-double"></i>
                            </span>
                            <h4 className="text-md font-black uppercase italic tracking-tighter">Liquidando Contrato</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nome do Pagador</label>
                                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} className={inputClass} placeholder="Nome ou Documento" />
                            </div>
                            <div>
                                <label className={labelClass}>Comprovante de Pagamento</label>
                                <button onClick={() => fileInputRef.current?.click()} className={`w-full py-2.5 px-4 border-2 border-dashed rounded-lg text-[10px] font-black uppercase transition-all ${proofFile ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-zinc-700 text-zinc-500'}`}>
                                    <input type="file" ref={fileInputRef} hidden onChange={e => setProofFile(e.target.files?.[0] || null)} />
                                    {proofFile ? proofFile.name : 'Vincular Arquivo'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {data.isPaid ? (
                            <button
                                onClick={() => {
                                    if (window.confirm('Tem certeza que deseja cancelar este pagamento? O status voltará para Pendente.')) {
                                        onChange({
                                            ...data,
                                            isPaid: false,
                                            billingStatus: 'pending',
                                            // paymentDate: undefined // paymentDate não existe no tipo Advertiser, removido para evitar erro
                                        });
                                    }
                                }}
                                className="px-8 py-5 rounded-2xl text-xs font-[1000] uppercase italic tracking-tighter shadow-xl transition-all flex items-center justify-center gap-3 bg-zinc-200 text-zinc-600 hover:bg-red-100 hover:text-red-600 border-b-4 border-zinc-300 hover:border-red-200"
                            >
                                <i className="fas fa-undo"></i>
                                Cancelar Pagamento
                            </button>
                        ) : (
                            <button
                                onClick={handleFinalConfirm}
                                disabled={isSaving || success || !expandedMethod}
                                className={`px-12 py-5 rounded-2xl text-xs font-[1000] uppercase italic tracking-tighter shadow-2xl transition-all flex items-center justify-center gap-3 border-b-4 ${success ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-red-600 border-red-800 text-white hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:grayscale'}`}
                            >
                                {isSaving ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                {success ? 'CONTRATO LIQUIDADO!' : 'Finalizar e Liberar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW: Botão para Salvar Configuração de Pagamento como Novo Método */}
            <div className="mt-8 pt-4 border-t border-zinc-800/50 flex justify-end">
                <button
                    onClick={handleSaveMethod}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-black'}`}
                >
                    <i className="fas fa-save"></i>
                    Salvar Esta Configuração de Pagamento (Criar Novo Pre-set)
                </button>
            </div>

            <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                <i className="fas fa-lock text-emerald-500"></i>
                Segurança: Todas as liquidações são registradas permanentemente no histórico de auditoria do sistema.
            </div>
        </div>
    );
};

export default BillingInfoPanel;
