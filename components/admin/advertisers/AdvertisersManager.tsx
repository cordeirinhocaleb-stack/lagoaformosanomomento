
import React, { useState } from 'react';
import { Advertiser, AdPricingConfig, User } from '../../../types';

// Sub-módulos
import AdvertisersListView from './list/AdvertisersListView';
import AdvertiserEditor from './editor/AdvertiserEditor';
import AdvertisersConfigView from './config/AdvertisersConfigView';

interface AdvertisersManagerProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => void;
  userPermissions: User;
}

type ViewMode = 'list' | 'editor' | 'config';

const AdvertisersManager: React.FC<AdvertisersManagerProps> = ({
  advertisers,
  adConfig,
  onUpdateAdvertiser,
  onUpdateAdConfig,
  userPermissions
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
  const handleSaveAdvertiser = (advertiser: Advertiser) => {
    // 1. Envia update para o pai (App.tsx)
    onUpdateAdvertiser(advertiser);
    
    // 2. Atualiza o estado local para refletir as mudanças imediatamente na UI do editor
    setSelectedAdvertiser(advertiser);
    
    // 3. Feedback visual
    alert("Anunciante salvo com sucesso!");
    
    // NOTA: Não chamamos handleBackToList() para manter o usuário na tela de edição.
  };

  const handleSaveConfig = (newConfig: AdPricingConfig) => {
    onUpdateAdConfig(newConfig);
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
          onCreate={handleCreate}
          onConfigClick={handleConfig}
        />
      )}

      {viewMode === 'editor' && (
        <AdvertiserEditor 
          advertiser={selectedAdvertiser}
          onSave={handleSaveAdvertiser}
          onCancel={handleBackToList}
        />
      )}

      {viewMode === 'config' && (
        <AdvertisersConfigView 
          config={adConfig}
          onSave={handleSaveConfig}
          onCancel={handleBackToList}
          currentUser={userPermissions}
        />
      )}

    </div>
  );
};

export default AdvertisersManager;
