import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { UploadQueueItem, UploadProgress } from '@/services/uploadQueueService';

interface UploadQueueModalProps {
    isOpen: boolean;
    progress: UploadProgress;
    onClose?: () => void;
    onMinimize?: () => void;
    allowClose?: boolean;
}

/**
 * Upload Queue Progress Modal
 * Shows real-time progress of sequential file uploads
 */
export const UploadQueueModal: React.FC<UploadQueueModalProps> = ({
    isOpen,
    progress,
    onClose,
    onMinimize,
    allowClose = false
}) => {
    const [minimized, setMinimized] = useState(false);

    if (!isOpen) return null;

    const getStatusIcon = (status: UploadQueueItem['status']) => {
        switch (status) {
            case 'completed':
                return <i className="fas fa-check-circle text-green-500"></i>;
            case 'uploading':
                return <i className="fas fa-spinner fa-spin text-blue-500"></i>;
            case 'failed':
                return <i className="fas fa-exclamation-circle text-red-500"></i>;
            case 'pending':
            default:
                return <i className="fas fa-clock text-gray-400"></i>;
        }
    };

    const getDestinationIcon = (destination: string) => {
        switch (destination) {
            case 'youtube':
                return <i className="fab fa-youtube text-red-600"></i>;
            case 'cloudinary':
                return <i className="fas fa-cloud text-blue-500"></i>;
            default:
                return <i className="fas fa-upload text-gray-500"></i>;
        }
    };

    const getDestinationName = (destination: string) => {
        switch (destination) {
            case 'youtube':
                return 'YouTube';
            case 'cloudinary':
                return 'Cloudinary';
            default:
                return destination;
        }
    };

    // Minimized view
    if (minimized) {
        return ReactDOM.createPortal(
            <div className="fixed bottom-4 right-4 z-[7000]">
                <button
                    onClick={() => setMinimized(false)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 animate-pulse"
                >
                    <i className="fas fa-upload"></i>
                    <span className="font-bold text-sm">
                        Uploading... {progress.completedCount}/{progress.totalCount}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xs font-black">{progress.overallProgress}%</span>
                    </div>
                </button>
            </div>,
            document.body
        );
    }

    // Full modal view
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[7000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <i className="fas fa-cloud-upload-alt text-2xl text-white"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl uppercase tracking-tight">
                                Upload em Andamento
                            </h3>
                            <p className="text-white/70 text-xs font-bold">
                                {progress.completedCount} de {progress.totalCount} arquivos enviados
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onMinimize && (
                            <button
                                onClick={() => setMinimized(true)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                title="Minimizar"
                            >
                                <i className="fas fa-minus text-white"></i>
                            </button>
                        )}
                        {allowClose && onClose && (
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                title="Fechar"
                            >
                                <i className="fas fa-times text-white"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-bold">Progresso Geral</span>
                        <span className="text-white text-sm font-black">{progress.overallProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress.overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Upload Queue List */}
                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {progress.currentItem && (
                        <UploadQueueItemCard
                            item={progress.currentItem}
                            getStatusIcon={getStatusIcon}
                            getDestinationIcon={getDestinationIcon}
                            getDestinationName={getDestinationName}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <i className="fas fa-info-circle"></i>
                        <span>Mantenha esta janela aberta durante o upload</span>
                    </div>
                    {allowClose && progress.completedCount === progress.totalCount && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            Concluído
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// Individual upload item card
const UploadQueueItemCard: React.FC<{
    item: UploadQueueItem;
    getStatusIcon: (status: UploadQueueItem['status']) => React.ReactElement;
    getDestinationIcon: (destination: string) => React.ReactElement;
    getDestinationName: (destination: string) => string;
}> = ({ item, getStatusIcon, getDestinationIcon, getDestinationName }) => {
    return (
        <div className={`p-4 rounded-xl border transition-all ${item.status === 'uploading'
            ? 'bg-blue-900/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
            : item.status === 'completed'
                ? 'bg-green-900/20 border-green-500/30'
                : item.status === 'failed'
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm truncate">
                            {item.fileName}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                            {getDestinationIcon(item.destination)}
                            <span>{getDestinationName(item.destination)}</span>
                        </div>
                    </div>

                    {item.status === 'uploading' && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-white/60">Enviando...</span>
                                <span className="text-xs text-white font-bold">{item.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {item.status === 'completed' && (
                        <div className="text-xs text-green-400 font-bold mt-1">
                            ✓ Upload concluído
                        </div>
                    )}

                    {item.status === 'failed' && item.error && (
                        <div className="text-xs text-red-400 mt-1">
                            ✗ {item.error}
                        </div>
                    )}

                    {item.status === 'pending' && (
                        <div className="text-xs text-white/40 mt-1">
                            Aguardando na fila...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadQueueModal;
