// src/components/admin/users/panels/CashbackInfoModal.tsx
import React, { useState } from 'react';

export interface CashbackInfo {
    socialPublications: string[]; // e.g. Instagram, Facebook, YouTube
    contractInfo: string;
    renewalCycle: string;
    displayLocations: {
        homeBar: boolean;
        sideBar: boolean;
        footer: boolean;
        bannerHome: boolean;
        popup: boolean;
    };
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (info: CashbackInfo) => void;
    initialData?: CashbackInfo;
}

export const CashbackInfoModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [socialPublications, setSocialPublications] = useState<string[]>(
        initialData?.socialPublications || []
    );
    const [contractInfo, setContractInfo] = useState<string>(
        initialData?.contractInfo || ''
    );
    const [renewalCycle, setRenewalCycle] = useState<string>(
        initialData?.renewalCycle || ''
    );
    const [displayLocations, setDisplayLocations] = useState(
        initialData?.displayLocations || {
            homeBar: false,
            sideBar: false,
            footer: false,
            bannerHome: false,
            popup: false,
        }
    );

    const toggleLocation = (key: keyof typeof displayLocations) => {
        setDisplayLocations({
            ...displayLocations,
            [key]: !displayLocations[key],
        });
    };

    const addPublication = (pub: string) => {
        if (pub && !socialPublications.includes(pub)) {
            setSocialPublications([...socialPublications, pub]);
        }
    };

    const removePublication = (pub: string) => {
        setSocialPublications(socialPublications.filter((p) => p !== pub));
    };

    const handleSave = () => {
        const info: CashbackInfo = {
            socialPublications,
            contractInfo,
            renewalCycle,
            displayLocations,
        };
        onSave(info);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Configurar Cashback
                </h2>
                {/* Social Publications */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Publicações em Redes Sociais
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Adicionar (ex.: Instagram)"
                            className="flex-1 border rounded px-2 py-1 dark:bg-gray-700"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addPublication((e.target as HTMLInputElement).value.trim());
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                    </div>
                    <ul className="list-disc list-inside">
                        {socialPublications.map((pub) => (
                            <li key={pub} className="flex justify-between items-center">
                                {pub}
                                <button
                                    type="button"
                                    className="text-red-500 hover:underline"
                                    onClick={() => removePublication(pub)}
                                >
                                    remover
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Contract Info */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Informações do Contrato
                    </label>
                    <textarea
                        value={contractInfo}
                        onChange={(e) => setContractInfo(e.target.value)}
                        rows={3}
                        className="w-full border rounded p-2 dark:bg-gray-700"
                    />
                </div>
                {/* Renewal Cycle */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Ciclo de Renovação
                    </label>
                    <input
                        type="text"
                        value={renewalCycle}
                        onChange={(e) => setRenewalCycle(e.target.value)}
                        className="w-full border rounded p-2 dark:bg-gray-700"
                    />
                </div>
                {/* Display Locations */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Onde Exibir
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(
                            [
                                { key: 'homeBar', label: 'Home Barra' },
                                { key: 'sideBar', label: 'Barra Lateral' },
                                { key: 'footer', label: 'Rodapé' },
                                { key: 'bannerHome', label: 'Banner Home' },
                                { key: 'popup', label: 'Popup' },
                            ] as const
                        ).map((item) => (
                            <label key={item.key} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={displayLocations[item.key]}
                                    onChange={() => toggleLocation(item.key)}
                                />
                                <span className="text-sm text-gray-800 dark:text-gray-200">
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleSave}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};
