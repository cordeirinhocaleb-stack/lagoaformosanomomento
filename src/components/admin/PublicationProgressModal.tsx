import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface PublicationStep {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    duration?: number;
}

interface PublicationProgressModalProps {
    isOpen: boolean;
    steps: PublicationStep[];
    onComplete?: () => void;
    onError?: (error: string) => void;
}

/**
 * Publication Progress Modal
 * Shows step-by-step progress during publication with SEO optimization
 */
export const PublicationProgressModal: React.FC<PublicationProgressModalProps> = ({
    isOpen,
    steps,
    onComplete,
    onError
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Find current processing step
        const processingIndex = steps.findIndex(s => s.status === 'processing');
        if (processingIndex !== -1) {
            setCurrentStepIndex(processingIndex);
        }

        // Check if all completed
        const allCompleted = steps.every(s => s.status === 'completed');
        if (allCompleted && onComplete) {
            setTimeout(() => onComplete(), 1000);
        }

        // Check if any failed
        const failed = steps.find(s => s.status === 'failed');
        if (failed && onError) {
            onError(failed.message || 'Erro desconhecido');
        }
    }, [steps, onComplete, onError]);

    if (!isOpen) return null;

    const getStepIcon = (step: PublicationStep) => {
        switch (step.status) {
            case 'completed':
                return <i className="fas fa-check-circle text-green-500 text-2xl"></i>;
            case 'processing':
                return <i className="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>;
            case 'failed':
                return <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>;
            case 'pending':
            default:
                return <i className="fas fa-clock text-gray-400 text-2xl"></i>;
        }
    };

    const overallProgress = Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <i className="fas fa-rocket text-3xl text-white"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-2xl uppercase tracking-tight">
                                Publicando Notícia
                            </h3>
                            <p className="text-white/70 text-sm font-bold">
                                Otimizando para melhores resultados de busca
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-bold">Progresso Geral</span>
                        <span className="text-white text-sm font-black">{overallProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Steps List */}
                <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`p-5 rounded-xl border transition-all ${step.status === 'processing'
                                    ? 'bg-blue-900/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
                                    : step.status === 'completed'
                                        ? 'bg-green-900/20 border-green-500/30'
                                        : step.status === 'failed'
                                            ? 'bg-red-900/20 border-red-500/30'
                                            : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {getStepIcon(step)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-white font-bold text-base">
                                            {step.label}
                                        </h4>
                                        {step.duration && step.status === 'completed' && (
                                            <span className="text-xs text-green-400 font-bold">
                                                {step.duration}ms
                                            </span>
                                        )}
                                    </div>

                                    {step.message && (
                                        <p className={`text-sm mb-2 ${step.status === 'failed' ? 'text-red-400' : 'text-white/60'
                                            }`}>
                                            {step.message}
                                        </p>
                                    )}

                                    {step.status === 'processing' && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-white/60">Processando...</span>
                                                <span className="text-xs text-white font-bold">{step.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                                                    style={{ width: `${step.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {step.status === 'completed' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs text-green-400 font-bold">Concluído</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <i className="fas fa-shield-alt"></i>
                        <span>Seu conteúdo está sendo otimizado com as melhores práticas de SEO</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PublicationProgressModal;
