import React, { useState, useRef, useEffect } from 'react';
import { recordPayment } from '../../../../services/billing/billingService';
import { getSystemSetting } from '../../../../services/content/contentService';
import { generatePixPayload } from '../../../../utils/pixPayload';
import { User } from '../../../../types';

interface PixRechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    advertiserId?: string;
    initialAmount?: number;
    pixKey?: string;
}

type ModalState = 'pix_info' | 'confirm_payment' | 'processing' | 'success';

const PixRechargeModal: React.FC<PixRechargeModalProps> = ({ isOpen, onClose, user, advertiserId, initialAmount, pixKey: manualPixKey }) => {
    const [copied, setCopied] = useState(false);
    const [modalState, setModalState] = useState<ModalState>('pix_info');
    const [amount, setAmount] = useState(initialAmount ? initialAmount.toFixed(2) : '0.00');
    const [senderName, setSenderName] = useState(user?.name || '');
    const [senderDoc, setSenderDoc] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [pixConfig, setPixConfig] = useState<{ key: string, merchantName: string, merchantCity: string } | null>(null);
    const [pixPayload, setPixPayload] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    // Carregar configurações de PIX do sistema
    useEffect(() => {
        const loadConfig = async () => {
            const settings = await getSystemSetting('general_settings');
            if (settings?.pixConfig) {
                setPixConfig(settings.pixConfig);
            } else if (manualPixKey) {
                setPixConfig({
                    key: manualPixKey,
                    merchantName: 'LFNM',
                    merchantCity: 'LAGOA FORMOSA'
                });
            }
        };
        if (isOpen) loadConfig();
    }, [isOpen, manualPixKey]);

    // Gerar payload sempre que o valor ou config mudar
    useEffect(() => {
        if (pixConfig) {
            const payload = generatePixPayload({
                key: pixConfig.key,
                merchantName: pixConfig.merchantName,
                merchantCity: pixConfig.merchantCity,
                amount: parseFloat(amount) > 0 ? parseFloat(amount) : undefined,
                txid: advertiserId ? advertiserId.replace(/-/g, '').substring(0, 25) : 'RPX001'
            });
            setPixPayload(payload);
        }
    }, [pixConfig, amount, advertiserId]);

    // Update amount if initialAmount changes
    useEffect(() => {
        if (initialAmount !== undefined && initialAmount !== null) {
            setAmount(initialAmount.toFixed(2));
        }
    }, [initialAmount]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(pixPayload || pixConfig?.key || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Erro: Usuário não identificado.");
        if (parseFloat(amount) <= 0) return alert("Informe um valor válido.");

        setIsSaving(true);
        setModalState('processing');

        try {
            // Simulação de processamento por 2 segundos
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Grava no histórico (isso também atualiza o status do anunciante e créditos do usuário no backend)
            await recordPayment({
                user_id: user.id,
                advertiser_id: advertiserId,
                amount: parseFloat(amount),
                method: 'pix',
                status: 'completed',
                sender_name: senderName,
                sender_document: senderDoc,
                metadata: {
                    userAgent: navigator.userAgent,
                    proofReceived: !!proofFile,
                    pixPayload: pixPayload
                }
            });

            setModalState('success');
        } catch (error) {
            console.error(error);
            alert("Erro ao registrar pagamento.");
            setModalState('confirm_payment');
        } finally {
            setIsSaving(false);
        }
    };

    const resetAndClose = () => {
        setModalState('pix_info');
        setAmount(initialAmount ? initialAmount.toFixed(2) : '0.00');
        setProofFile(null);
        onClose();
    };

    const renderContent = () => {
        switch (modalState) {
            case 'pix_info':
                return (
                    <div className="animate-fadeIn">
                        <div className="mb-6">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Valor da Operação</label>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-transparent text-3xl font-[1000] tracking-tighter w-40 text-center outline-none focus:text-red-600 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-dashed border-gray-100 flex flex-col items-center">
                            <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden border">
                                {pixPayload ? (
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`}
                                        alt="QR Code Pix"
                                        className="w-40 h-40 object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span className="text-[9px] font-bold">Gerando...</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Aponte a câmera do seu banco</span>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 group relative">
                            <span className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Pix Copia e Cola</span>
                            <div className="text-[9px] font-mono text-gray-500 break-all px-4 line-clamp-2">
                                {pixPayload || 'Carregando...'}
                            </div>

                            <button
                                onClick={handleCopy}
                                className={`mt-4 w-full px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-black text-white hover:bg-red-600 shadow-lg'}`}
                            >
                                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                                {copied ? 'Copiado com Sucesso!' : 'Copiar Código Pix'}
                            </button>
                        </div>

                        <button
                            onClick={() => setModalState('confirm_payment')}
                            className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-[1000] uppercase italic text-xs shadow-xl shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-check-circle text-lg"></i> Confirmar Pagamento
                        </button>
                    </div>
                );

            case 'confirm_payment':
                return (
                    <form onSubmit={handleConfirmPayment} className="animate-fadeIn text-left space-y-4">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
                            <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider mb-1">Total Confirmado</p>
                            <p className="text-2xl font-black text-blue-900 tracking-tighter italic">R$ {parseFloat(amount).toFixed(2)}</p>
                        </div>

                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Dados de Comprovação</h4>

                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Nome Completo do Pagador</label>
                            <input
                                type="text"
                                required
                                value={senderName}
                                onChange={e => setSenderName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Anexar Comprovante (Recomendado)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${proofFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={e => setProofFile(e.target.files?.[0] || null)}
                                />
                                <i className={`fas ${proofFile ? 'fa-file-circle-check text-green-500' : 'fa-cloud-upload-alt text-gray-300'} text-xl mb-2`}></i>
                                <p className="text-[10px] font-bold text-gray-500 uppercase truncate">
                                    {proofFile ? proofFile.name : 'Selecionar Comprovante'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                Finalizar e Validar
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalState('pix_info')}
                                className="w-full py-2 text-gray-400 font-bold uppercase text-[9px] tracking-widest"
                            >
                                ← Voltar para o QR Code
                            </button>
                        </div>
                    </form>
                );

            case 'processing':
                return (
                    <div className="py-12 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <i className="fas fa-search-dollar text-3xl text-red-600 animate-bounce"></i>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Processando...</h4>
                        <p className="text-xs text-gray-500 font-medium">Validando os dados informados.</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="py-8 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
                            <i className="fas fa-check text-4xl text-green-600"></i>
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h4 className="text-2xl font-[1000] uppercase italic tracking-tighter text-gray-900 mb-2">CONTRATO ATUALIZADO</h4>
                        <p className="text-sm text-gray-500 font-medium mb-8">
                            O status de pagamento foi atualizado para **PAGO** e os créditos foram registrados.
                        </p>
                        <button
                            onClick={resetAndClose}
                            className="px-12 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-red-600 transition-all"
                        >
                            Finalizar Sessão
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={resetAndClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleIn border border-gray-100">
                {/* Header decorativo */}
                <div className="bg-red-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                            <i className="fas fa-qrcode text-red-600 text-3xl"></i>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                            {advertiserId ? 'Liquidação de Contrato' : 'Recarga PIX'}
                        </h3>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Lagoa Formosa no Momento</p>
                    </div>
                </div>

                <div className="p-8 text-center">
                    {renderContent()}

                    {modalState !== 'success' && modalState !== 'processing' && (
                        <button
                            onClick={resetAndClose}
                            className="w-full py-4 mt-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors"
                        >
                            Fechar sem salvar
                        </button>
                    )}
                </div>

                {/* Footer decorativo */}
                <div className="bg-gray-50 py-3 border-t border-gray-100 flex justify-center gap-8">
                    <i className="fab fa-pix text-gray-300"></i>
                    <i className="fas fa-shield-halved text-gray-300"></i>
                    <i className="fas fa-check-double text-gray-300"></i>
                </div>
            </div>
        </div>
    );
};

export default PixRechargeModal;
