import React from 'react';

interface YouTubeUploadStatusProps {
    uploadStage: 'validating' | 'uploading' | 'processing';
    uploadProgress: number;
}

export const YouTubeUploadStatus: React.FC<YouTubeUploadStatusProps> = ({ uploadStage, uploadProgress }) => {
    return (
        <div className="bg-red-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-900">
                    {uploadStage === 'validating' && 'Validando vídeo...'}
                    {uploadStage === 'uploading' && 'Fazendo upload para YouTube...'}
                    {uploadStage === 'processing' && 'Processando no YouTube...'}
                </span>
                <span className="text-sm font-bold text-red-600">
                    {uploadProgress}%
                </span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-red-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                ></div>
            </div>
            <p className="text-xs text-red-700 text-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {uploadStage === 'processing'
                    ? 'O YouTube está processando seu vídeo. Isso pode levar alguns minutos...'
                    : 'Mantenha esta janela aberta.'}
            </p>
        </div>
    );
};
