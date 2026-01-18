
import React, { useState } from 'react';
import { Advertiser, AdPricingConfig, User } from '../../../types';

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
    // 1. Envia update para o pai (App.tsx)
    const saved = await onUpdateAdvertiser(advertiser);

    // 2. Atualiza o estado local para refletir as mudanças imediatamente na UI do editor
    // Se recebemos um registro salvo (com ID final do banco), usamos ele
    if (saved) {
      setSelectedAdvertiser(saved);
      alert("Anunciante salvo com sucesso!");
    } else {
      setSelectedAdvertiser(advertiser);
      alert("Anunciante enviado (processando...)");
    }

    // NOTA: Não chamamos handleBackToList() para manter o usuário na tela de edição.
  };

  const handleSaveConfig = async (newConfig: AdPricingConfig) => {
    await onUpdateAdConfig(newConfig);
    // Não volta para a lista, mantém na config
    alert("Configurações salvas com sucesso!");
  };

  // Renderização Condicional
  return (
    <div className="w-full max-w-7xl mx-auto pb-20">

      {viewMode === 'list' && (
        <AdvertisersListView
          advertisers={advertisers}
          onEdit={handleEdit}
          onDelete={onDeleteAdvertiser}
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

    </div>
  );
};

export default AdvertisersManager;
