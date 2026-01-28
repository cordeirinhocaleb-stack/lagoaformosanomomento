import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../../types';

interface FinanceSettingsProps {
    settings: SystemSettings;
    onUpdatePix: (field: string, value: string) => void;
    onUpdateBoleto: (field: string, value: string) => void;
    onUpdateSecurity?: (security: any) => void; // Novo callback
    darkMode?: boolean;
}

const FinanceSettings: React.FC<FinanceSettingsProps> = ({ settings, onUpdatePix, onUpdateBoleto, onUpdateSecurity, darkMode = false }) => {

    // Classes
    const cardClass = `p-6 rounded-3xl border transition-all duration-300 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`;
    const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'bg-zinc-950 border-zinc-800 text-gray-100 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500'}`;
    const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`;
    const headerClass = `text-sm font-black uppercase italic flex items-center gap-3 mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`;

    // State for Security
    const [isLocked, setIsLocked] = useState(settings.financeSecurity?.isLocked ?? false); // Default false if undefined
    const [pinInput, setPinInput] = useState('');
    const [showPinModal, setShowPinModal] = useState<'lock' | 'unlock' | 'none'>('none');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setIsLocked(settings.financeSecurity?.isLocked ?? false);
    }, [settings.financeSecurity]);

    const handleSecurityAction = () => {
        setErrorMsg('');
        setPinInput('');
        if (isLocked) {
            setShowPinModal('unlock');
        } else {
            // Se já tem PIN, pede pra confirmar pra trancar? Ou só tranca?
            // User disse: "quem trancar primeiro que pode editar depois"
            // Se não tem PIN, cria. Se tem, pede pra destrancar depois.
            // Vamos assumir: Unlock -> Lock (se não tiver PIN, seta. Se tiver, só tranca pois já validou antes ou é dono).
            // Simplificação: Se unlock -> Lock sempre pede PIN para "Armar" ou "Criar".
            // Melhor: Se !isLocked e !pinHash -> Set New Pin.
            // Se !isLocked e pinHash -> Just Lock (ou confirm pin). Vamos pedir para criar/confirmar.
            setShowPinModal('lock');
        }
    };

    const confirmPinAction = () => {
        if (pinInput.length < 4) {
            setErrorMsg("Mínimo 4 dígitos.");
            return;
        }

        const storedPin = settings.financeSecurity?.pinHash;

        if (showPinModal === 'unlock') {
            if (pinInput === storedPin) {
                // Unlock success
                const newSettings = { ...settings, financeSecurity: { ...settings.financeSecurity, isLocked: false } };
                // Propagar mudança via callback pai não temos aqui, mas onUpdatePix/Boleto são campos.
                // Precisamos de um onUpdateSecurity ou similar.
                // Como FinanceSettings recebe apenas onUpdatePix/Boleto, precisamos improvisar ou pedir refactor.
                // Vou injetar a atualização direta no objeto settings local e chamar onUpdatePix com dummy para forçar update pai?
                // Não, o pai (SettingsTab) gerencia o estado. Preciso adicionar onUpdateSecurity nas props. Refactor necessário.
                // WORKAROUND TEMPORÁRIO: Alterar diretamente settings e forçar re-render ou passar callback novo.
                // Assumindo que posso injetar props novas no replace.
                alert("Desbloqueado com sucesso!");
                setIsLocked(false);
                // NOTA: O estado real só salva quando clicar em "Salvar" no pai.
                // Precisamos atualizar o settings do pai.
                alert("Desbloqueado com sucesso!");
                setIsLocked(false);
                if (onUpdateSecurity) {
                    onUpdateSecurity({ isLocked: false, pinHash: storedPin, lockedBy: 'user' });
                }
                setShowPinModal('none');
            } else {
                setErrorMsg("PIN incorreto.");
            }
        } else if (showPinModal === 'lock') {
            // Setting new PIN or confirming
            // Se já existe PIN e está "destrancado", talvez queira mudar? Ou só re-trancar?
            // Vamos simplificar: Ao trancar, define/valida o PIN.
            if (storedPin && pinInput !== storedPin) {
                // Se já tem PIN, deve bater (opcional, ou permite trocar se ja estava destrancado)
                // "Quem trancar primeiro". Se já destrancou, tem o poder. Pode mudar o PIN.
            }

            setIsLocked(true);
            if (onUpdateSecurity) {
                onUpdateSecurity({ isLocked: true, pinHash: pinInput, lockedBy: 'user' });
            }
            setShowPinModal('none');
        }
    };

    // Mask fields if locked
    const maskValue = (val: string) => isLocked && val ? '••••••••' : val;
    const isFieldDisabled = isLocked;

    return (
        <div className="relative">
            {/* Security Header */}
            <div className={`flex justify-between items-center mb-6 p-4 rounded-xl border ${isLocked ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} transition-colors`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        <i className={`fas ${isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold uppercase ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                            {isLocked ? 'Configurações Protegidas' : 'Modo Edição Habilitado'}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                            {isLocked ? 'Digite o PIN para editar os dados sensíveis.' : 'Clique no cadeado para travar e proteger os dados.'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSecurityAction}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isLocked
                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                        }`}
                >
                    {isLocked ? 'Destrancar' : 'Trancar Sistema'}
                </button>
            </div>

            {/* PIN Modal */}
            {showPinModal !== 'none' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white'} p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {showPinModal === 'lock' ? 'Definir PIN de Segurança' : 'Desbloquear Acesso'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            {showPinModal === 'lock'
                                ? 'Crie um PIN numérico para proteger os dados bancários. Só quem tem este PIN poderá editar depois.'
                                : 'Informe o PIN definido anteriormente para liberar a edição.'}
                        </p>

                        <input
                            type="password"
                            autoFocus
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                            className={`w-full text-center text-3xl tracking-[0.5em] font-bold py-4 rounded-xl border mb-2 outline-none focus:ring-2 ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white focus:ring-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500'}`}
                            placeholder="••••"
                            maxLength={6}
                        />

                        {errorMsg && <p className="text-xs text-red-500 font-bold mb-4 text-center">{errorMsg}</p>}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowPinModal('none')}
                                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase bg-gray-100 text-gray-500 hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmPinAction}
                                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase bg-black text-white hover:bg-gray-900"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isLocked ? 'opacity-75 grayscale-[0.5] pointer-events-none select-none' : ''}`}>
                {/* PIX Configuration */}
                <div className={cardClass}>
                    {/* ... (Existing Header) ... */}
                    <div className={headerClass}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <i className="fab fa-pix text-xl"></i>
                        </div>
                        <div>
                            <h2>Configuração PIX</h2>
                            <p className={`text-[10px] font-medium normal-case ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Dados para geração de QR Code</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Chave PIX (CPF/CNPJ/Email/Aleatória)</label>
                            <div className="relative">
                                <i className={`fas fa-key absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}></i>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={isLocked ? maskValue(settings.pixConfig?.key || '') : settings.pixConfig?.key || ''}
                                    onChange={(e) => onUpdatePix('key', e.target.value)}
                                    className={`${inputClass} pl-10`}
                                    placeholder="Ex: 12.345.678/0001-90"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nome do Beneficiário</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.pixConfig?.merchantName || ''}
                                    onChange={(e) => onUpdatePix('merchantName', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Lagoa Formosa Ltda"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Cidade do Beneficiário</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.pixConfig?.merchantCity || ''}
                                    onChange={(e) => onUpdatePix('merchantCity', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Lagoa Formosa"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Boleto Configuration (Hidden as per request) */}
                {/* <div className={cardClass}>
                    <div className={headerClass}>
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <i className="fas fa-barcode text-xl"></i>
                        </div>
                        <div>
                            <h2>Configuração Boleto/Conta</h2>
                            <p className={`text-[10px] font-medium normal-case ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Dados para depósito em conta</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className={labelClass}>Nome do Banco</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.boletoConfig?.bankName || ''}
                                    onChange={(e) => onUpdateBoleto('bankName', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Banco do Brasil"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass}>Código do Banco</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.boletoConfig?.bankCode || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').substring(0, 3);
                                        onUpdateBoleto('bankCode', val);
                                    }}
                                    className={`${inputClass} font-mono tracking-widest`}
                                    placeholder="001"
                                    maxLength={3}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Agência</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={isLocked ? '****' : settings.boletoConfig?.agency || ''}
                                    onChange={(e) => onUpdateBoleto('agency', e.target.value)}
                                    className={inputClass}
                                    placeholder="0000-X"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Conta Corrente</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={isLocked ? '*****' : settings.boletoConfig?.account || ''}
                                    onChange={(e) => onUpdateBoleto('account', e.target.value)}
                                    className={inputClass}
                                    placeholder="00000-X"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Titular da Conta</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.boletoConfig?.ownerName || ''}
                                    onChange={(e) => onUpdateBoleto('ownerName', e.target.value)}
                                    className={inputClass}
                                    placeholder="Nome Completo"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>CPF/CNPJ Titular</label>
                                <input
                                    type="text"
                                    disabled={isFieldDisabled}
                                    value={settings.boletoConfig?.ownerDocument || ''}
                                    onChange={(e) => onUpdateBoleto('ownerDocument', e.target.value)}
                                    className={inputClass}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default FinanceSettings;
