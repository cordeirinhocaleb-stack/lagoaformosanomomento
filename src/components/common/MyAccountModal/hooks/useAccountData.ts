import { useState, useEffect } from 'react';
import { Advertiser } from '../../../../types';
import { getUserAdvertisers } from '../../../../services/content/advertiserService';

export const useAccountData = (userId: string) => {
    const [userAds, setUserAds] = useState<Advertiser[]>([]);
    const [isLoadingAds, setIsLoadingAds] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            setIsLoadingAds(true);
            try {
                const ads = await getUserAdvertisers(userId);
                setUserAds(ads);
            } catch (err) {
                console.error("Erro ao buscar anúncios:", err);
            } finally {
                setIsLoadingAds(false);
            }
        };
        fetchAds();
    }, [userId]);

    return {
        userAds,
        isLoadingAds
    };
};
