'use client';

import React, { useState } from 'react';
import { Advertiser } from '../../../types';
import { generateContractPDF } from '../../../services/pdf/contractPDFGenerator';

interface ContractPDFButtonProps {
    advertiser: Advertiser;
    darkMode?: boolean;
}

const ContractPDFButton: React.FC<ContractPDFButtonProps> = ({ advertiser, darkMode = false }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateContractPDF(advertiser);
            if (result.success) {
                alert(`✓ PDF gerado com sucesso!\n\nArquivo: ${result.fileName}`);
            } else {
                alert('✗ Erro ao gerar PDF. Verifique o console para mais detalhes.');
            }
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('✗ Erro ao gerar PDF. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`
                px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest
                transition-all duration-200 flex items-center gap-3
                ${isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:scale-105'
                }
                text-white shadow-md
            `}
        >
            {isGenerating ? (
                <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Gerando PDF...
                </>
            ) : (
                <>
                    <i className="fas fa-file-pdf"></i>
                    Gerar Contrato PDF
                </>
            )}
        </button>
    );
};

export default ContractPDFButton;
