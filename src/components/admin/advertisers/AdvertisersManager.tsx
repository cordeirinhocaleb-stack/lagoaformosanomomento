import React, { useState } from 'react';
import { Advertiser, AdPricingConfig, User } from '../../../types';
import Toast from '../../common/Toast';
import Breadcrumb from '../../common/Breadcrumb';
import LoadingScreen from '../../common/LoadingScreen';

// Sub-módulos
import AdvertisersListView from './list/AdvertisersListView';
import AdvertiserEditor from './editor/AdvertiserEditor';
import AdvertisersConfigView from './config/AdvertisersConfigView';

interface AdvertisersManagerProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => Promise<Advertiser | null>;
  onDeleteAdvertiser?: (id: string) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => Promise<void> | void;
  userPermissions: User;
  darkMode?: boolean;
}

type ViewMode = 'list' | 'editor' | 'config';

const AdvertisersManager: React.FC<AdvertisersManagerProps> = ({
  advertisers,
  adConfig,
  onUpdateAdvertiser,
  onDeleteAdvertiser,
  onUpdateAdConfig,
  userPermissions,
  darkMode = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Handlers de Navegação
  const handleEdit = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser);
    setViewMode('editor');
  };

  const handleCreate = () => {
    setSelectedAdvertiser(null); // null indica criação
    setViewMode('editor');
  };

  const handleConfig = () => {
    setViewMode('config');
  };

  const handleBackToList = () => {
    setSelectedAdvertiser(null);
    setViewMode('list');
  };

  // Handlers de Ação (Persistência)
  const handleSaveAdvertiser = async (advertiser: Advertiser) => {
    setIsLoading(true);
    setLoadingMessage('Salvando anunciante...');
    try {
      // 1. Envia update para o pai (App.tsx)
      const saved = await onUpdateAdvertiser(advertiser);

      // 2. Atualiza o estado local para refletir as mudanças imediatamente na UI do editor
      // Se recebemos um registro salvo (com ID final do banco), usamos ele
      if (saved) {
        setSelectedAdvertiser(saved);
        setToast({ message: "Anunciante salvo com sucesso!", type: 'success' });
      } else {
        setSelectedAdvertiser(advertiser);
        setToast({ message: "Anunciante enviado (processando...)", type: 'info' });
      }
    } catch (error) {
      console.error("Erro ao salvar anunciante (Objeto):", error);
      console.error("Erro ao salvar anunciante (JSON):", JSON.stringify(error, null, 2));
      // @ts-ignore
      if (error?.message) console.error("Message:", error.message);
      // @ts-ignore
      if (error?.details) console.error("Details:", error.details);
      // @ts-ignore
      if (error?.hint) console.error("Hint:", error.hint);

      setToast({ message: "Erro ao salvar anunciante. Verifique o console.", type: 'error' });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSaveConfig = async (newConfig: AdPricingConfig) => {
    setIsLoading(true);
    setLoadingMessage('Salvando configurações...');
    try {
      await onUpdateAdConfig(newConfig);
      setToast({ message: "Configurações salvas com sucesso!", type: 'success' });
    } catch (error) {
      console.error("Erro ao salvar config:", error);
      setToast({ message: "Erro ao salvar configurações.", type: 'error' });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Breadcrumb items baseado no viewMode
  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Anunciantes', onClick: viewMode !== 'list' ? handleBackToList : undefined },
    ...(viewMode === 'editor' ? [{ label: selectedAdvertiser ? 'Editar' : 'Novo' }] : []),
    ...(viewMode === 'config' ? [{ label: 'Configurações' }] : [])
  ];

  // Renderização Condicional
  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} darkMode={darkMode} />

      {/* Loading Overlay */}
      {isLoading && <LoadingScreen onFinished={() => { }} />}

      {viewMode === 'list' && (
        <AdvertisersListView
          advertisers={advertisers}
          onEdit={handleEdit}
          onDelete={onDeleteAdvertiser}
          onUpdate={onUpdateAdvertiser}
          onCreate={handleCreate}
          onConfigClick={handleConfig}
          darkMode={darkMode}
        />
      )}

      {viewMode === 'editor' && (
        <AdvertiserEditor
          key={selectedAdvertiser ? selectedAdvertiser.id : 'new'}
          advertiser={selectedAdvertiser}
          onSave={handleSaveAdvertiser}
          onCancel={handleBackToList}
          currentUser={userPermissions}
          darkMode={darkMode}
        />
      )}

      {viewMode === 'config' && (
        <AdvertisersConfigView
          config={adConfig}
          onSave={handleSaveConfig}
          onCancel={handleBackToList}
          currentUser={userPermissions}
          advertisers={advertisers}
          darkMode={darkMode}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdvertisersManager;
