
import React, { useState, useMemo } from 'react';
import { Advertiser } from '../../../../types';
import AdvertisersListToolbar from './AdvertisersListToolbar';
import AdvertiserRow from './AdvertiserRow';
import EmptyState from './EmptyState';

interface AdvertisersListViewProps {
  advertisers: Advertiser[];
  onEdit: (advertiser: Advertiser) => void;
  onCreate: () => void;
  onConfigClick: () => void;
}

type FilterStatus = 'all' | 'active' | 'inactive' | 'expiring';

const AdvertisersListView: React.FC<AdvertisersListViewProps> = ({ 
  advertisers, 
  onEdit, 
  onCreate, 
  onConfigClick 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Lógica de Filtragem
  const filteredAdvertisers = useMemo(() => {
    return advertisers.filter(ad => {
      // 1. Busca por texto (Nome ou Categoria)
      const matchesSearch = 
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Filtro de Status
      if (filterStatus === 'all') return true;
      
      const now = new Date();
      const endDate = new Date(ad.endDate);
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft < 0;

      if (filterStatus === 'active') return ad.isActive && !isExpired;
      if (filterStatus === 'inactive') return !ad.isActive || isExpired;
      if (filterStatus === 'expiring') return ad.isActive && daysLeft > 0 && daysLeft <= 7;

      return true;
    });
  }, [advertisers, searchTerm, filterStatus]);

  const hasActiveFilters = searchTerm !== '' || filterStatus !== 'all';

  const clearFilters = () => {
      setSearchTerm('');
      setFilterStatus('all');
  };

  return (
    <div className="w-full animate-fadeIn">
      <AdvertisersListToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onConfigClick={onConfigClick}
        onCreateClick={onCreate}
      />

      <div className="flex flex-col gap-4">
        {filteredAdvertisers.length > 0 ? (
            filteredAdvertisers.map(ad => (
                <AdvertiserRow 
                    key={ad.id} 
                    advertiser={ad} 
                    onEdit={onEdit} 
                />
            ))
        ) : (
            <EmptyState 
                onCreate={onCreate} 
                hasFilter={hasActiveFilters} 
                onClearFilter={clearFilters} 
            />
        )}
      </div>
      
      {/* Rodapé da Lista */}
      {filteredAdvertisers.length > 0 && (
          <div className="mt-8 text-center border-t border-gray-100 pt-8">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Exibindo {filteredAdvertisers.length} de {advertisers.length} parceiros
              </p>
          </div>
      )}
    </div>
  );
};

export default AdvertisersListView;
