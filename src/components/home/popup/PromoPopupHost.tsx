
import React, { useState, useEffect } from 'react';
import { PromoPopupSetConfig, PopupTargetPage, PromoPopupItemConfig, AdvertiserInfoSummary } from '../../../types';
import { normalizePopupSet } from '../../../utils/popupSafety';
import PromoPopupCarousel from './PromoPopupCarousel';
import AdvertiserInfoModal from './components/AdvertiserInfoModal';

interface PromoPopupHostProps {
    popupSet?: PromoPopupSetConfig;
    mode?: 'live' | 'preview';
    onClose?: () => void;
    currentContext?: PopupTargetPage; // New prop for filtering
}

const PromoPopupHost: React.FC<PromoPopupHostProps> = ({ popupSet, mode = 'live', onClose, currentContext = 'home' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [normalizedItems, setNormalizedItems] = useState<any[]>([]);

    // Internal Advertiser Info Modal State
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedAdvertiserInfo, setSelectedAdvertiserInfo] = useState<AdvertiserInfoSummary | null>(null);

    useEffect(() => {
        if (!popupSet) {
            setNormalizedItems([]);
            setIsOpen(false);
            return;
        }

        // Normaliza para garantir dados seguros
        const { normalized } = normalizePopupSet(popupSet);

        let filteredItems = normalized.items;

        // 1. Filtra ativos se LIVE (STRICT CHECK)
        if (mode === 'live') {
            filteredItems = filteredItems.filter(i => i.active === true);
        }

        // 2. Filtra por Contexto (Se LIVE)
        // Se estiver em PREVIEW, mostra todos para não confundir o editor
        if (mode === 'live') {
            filteredItems = filteredItems.filter(item => {
                // Se não tiver targets definidos (legado), assume Home e News
                const targets = item.targetPages && item.targetPages.length > 0
                    ? item.targetPages
                    : ['home', 'news_detail'];

                // Se tiver 'all', aparece em tudo
                if (targets.includes('all')) { return true; }

                // Verifica match exato
                return targets.includes(currentContext);
            });
        }

        // Se após filtros não sobrou nada, fecha e limpa
        if (filteredItems.length === 0) {
            setNormalizedItems([]);
            setIsOpen(false);
            return;
        }

        if (filteredItems.length > 0) {
            setNormalizedItems(filteredItems);

            if (mode === 'preview') {
                setIsOpen(true);
            } else {
                // Lógica de Frequência Simples por Sessão
                // Usa IDs combinados para gerar chave única do set (agora filtrado por contexto)
                const setHash = filteredItems.map(i => i.id).join('_');
                const storageKey = `lfnm_popup_set_${setHash}_seen`;

                const hasSeen = sessionStorage.getItem(storageKey);
                // Se mudou o contexto e tem novos itens que não foram vistos nessa combinação, mostra
                if (!hasSeen) {
                    // Reset open state to trigger animation if re-opening
                    setIsOpen(false);
                    const timer = setTimeout(() => setIsOpen(true), 1500); // Delay UX
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [popupSet, mode, currentContext]);

    const handleClose = () => {
        setIsOpen(false);
        if (mode === 'live' && normalizedItems.length > 0) {
            const setHash = normalizedItems.map(i => i.id).join('_');
            const storageKey = `lfnm_popup_set_${setHash}_seen`;
            sessionStorage.setItem(storageKey, 'true');
        }
        if (onClose) { onClose(); }
    };

    const handleAction = (url: string, item?: PromoPopupItemConfig) => {
        if (url) {
            window.open(url, '_blank');
            handleClose();
        } else if (item?.advertiserInfo) {
            setSelectedAdvertiserInfo(item.advertiserInfo);
            setShowInfoModal(true);
            // We keep isOpen true technically, but we won't render the carousel because of the early return below
            // Actually, we should probably close the carousel if we consider it "Action Taken"
            // But we want to show the modal.
        } else {
            handleClose();
        }
    };

    const handleCloseInfoModal = () => {
        setShowInfoModal(false);
        setSelectedAdvertiserInfo(null);
        handleClose(); // Close the main popup flow too
    };

    // Render Advertiser Info Modal if active
    if (showInfoModal && selectedAdvertiserInfo) {
        return <AdvertiserInfoModal info={selectedAdvertiserInfo} onClose={handleCloseInfoModal} />;
    }

    // Renderização Condicional Estrita
    if (!isOpen || normalizedItems.length === 0) { return null; }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn">
            {/* Backdrop com Blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

            {/* Fullscreen Container for Carousel */}
            <div className="relative w-full h-full z-50 pointer-events-none">
                {/* Carousel handles interactions internally */}
                <div className="w-full h-full pointer-events-auto">
                    <PromoPopupCarousel
                        items={normalizedItems}
                        mode={mode}
                        onClose={handleClose}
                        onAction={handleAction}
                        isMobilePreview={false} // Host is live/real environment
                    />
                </div>
            </div>
        </div>
    );
};

export default PromoPopupHost;
