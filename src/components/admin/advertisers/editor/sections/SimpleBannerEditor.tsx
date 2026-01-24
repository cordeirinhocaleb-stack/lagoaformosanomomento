'use client';

import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../../../../../types';
import FullWidthPromo from '../../../../ads/FullWidthPromo';
import { getLocalFile } from '../../../../../services/storage/localStorageService';
import ToggleSwitch from '../components/ToggleSwitch';

interface SimpleBannerEditorProps {
    banners: PromoBanner[];
    onChange: (banners: PromoBanner[]) => void;
    darkMode?: boolean;
}

const BANNER_THEMES = [
    { id: 'gradient_bottom_left', name: 'Gradiente', icon: '↙️' },
    { id: 'glass_center', name: 'Vidro', icon: '⬜' },
    { id: 'solid_right_bar', name: 'Barra', icon: '▶️' },
    { id: 'floating_box_top_left', name: 'Caixa', icon: '📦' },
    { id: 'hero_centered_clean', name: 'Hero', icon: '⭐' },
    { id: 'floating_bottom_right', name: 'Flutuante', icon: '↘️' },
    { id: 'newspaper_clipping', name: 'Jornal', icon: '📰' },
    { id: 'vertical_sidebar_left', name: 'Lateral', icon: '◀️' },
    { id: 'full_overlay_impact', name: 'Overlay', icon: '🎯' },
    { id: 'tv_news_bottom_bar', name: 'TV News', icon: '📺' }
];

const SimpleBannerEditor: React.FC<SimpleBannerEditorProps> = ({
    banners,
    onChange,
    darkMode = false
}) => {
    const [selectedBannerId, setSelectedBannerId] = useState<string | null>(
        banners.length > 0 ? banners[0].id : null
    );
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

    const selectedBanner = banners.find(b => b.id === selectedBannerId);

    // Carregar previews locais para IDs local_
    useEffect(() => {
        const loadPreviews = async () => {
            const idsToLoad = banners
                .map(b => b.image)
                .filter((url): url is string => !!url && url.startsWith('local_') && !localPreviews[url]);

            if (idsToLoad.length === 0) return;

            const newPreviews = { ...localPreviews };
            await Promise.all(idsToLoad.map(async (id) => {
                try {
                    const blob = await getLocalFile(id);
                    if (blob) {
                        newPreviews[id] = URL.createObjectURL(blob);
                    }
                } catch (e) {
                    console.error('Erro ao carregar preview:', id);
                }
            }));
            setLocalPreviews(newPreviews);
        };
        loadPreviews();
    }, [banners.map(b => b.image).join(',')]);

    // Criar banner com preview resolvido para o FullWidthPromo
    const bannerWithPreview = selectedBanner ? {
        ...selectedBanner,
        images: selectedBanner.image
            ? [selectedBanner.image.startsWith('local_')
                ? (localPreviews[selectedBanner.image] || '')
                : selectedBanner.image]
            : [],
        // Aplicar posicionamento de imagem
        imagePosition: `${selectedBanner.imagePositionX || 50}% ${selectedBanner.imagePositionY || 50}%`,
        imageScale: (selectedBanner.imageScale || 100) / 100
    } : null;

    const handleAddBanner = () => {
        const newBanner: PromoBanner = {
            id: `banner-${Date.now()}`,
            tag: 'Novo Banner',
            title: '',
            description: '',
            image: '',
            images: [],
            type: 'image',
            layout: 'classic',
            align: 'left',
            overlayOpacity: 0,
            textPositionPreset: 'gradient_bottom_left',
            active: true,
            link: '',
            buttonText: 'Saiba Mais'
        };
        onChange([...banners, newBanner]);
        setSelectedBannerId(newBanner.id);
    };

    const handleUpdateBanner = (id: string, updates: Partial<PromoBanner>) => {
        // Sincronizar image com images para o preview funcionar
        if (updates.image !== undefined) {
            updates.images = updates.image ? [updates.image] : [];
        }
        onChange(banners.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleDeleteBanner = (id: string) => {
        onChange(banners.filter(b => b.id !== id));
        if (selectedBannerId === id) {
            setSelectedBannerId(banners[0]?.id || null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Banners Home
                    </h3>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aparecem no topo da página inicial
                    </p>
                </div>
                <button
                    onClick={handleAddBanner}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Novo Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <i className={`fas fa-panorama text-5xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nenhum banner criado ainda
                    </p>
                    <button
                        onClick={handleAddBanner}
                        className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700"
                    >
                        Criar Primeiro Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de Banners */}
                    <div className="space-y-3">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Banners ({banners.length})
                        </h4>
                        {banners.map(banner => (
                            <div
                                key={banner.id}
                                onClick={() => setSelectedBannerId(banner.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedBannerId === banner.id
                                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                    : darkMode
                                        ? 'border-white/10 bg-black/20 hover:border-white/20'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {banner.image && (
                                        <img
                                            src={banner.image.startsWith('local_')
                                                ? (localPreviews[banner.image] || banner.image)
                                                : banner.image
                                            }
                                            className="w-12 h-8 object-cover rounded"
                                            alt=""
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate text-gray-900 dark:text-white">
                                            {banner.tag || 'Sem título'}
                                        </p>
                                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                            <ToggleSwitch
                                                enabled={banner.active}
                                                onChange={(enabled) => {
                                                    const updatedBanners = banners.map(b =>
                                                        b.id === banner.id ? { ...b, active: enabled } : b
                                                    );
                                                    onChange(updatedBanners);
                                                }}
                                                label=""
                                                darkMode={darkMode}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBanner(banner.id);
                                        }}
                                        className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-200"
                                    >
                                        <i className="fas fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Editor do Banner Selecionado */}
                    {selectedBanner && (
                        <div className="lg:col-span-2 space-y-6">
                            {/* PREVIEW EM TEMPO REAL */}
                            <div className="mb-6">
                                <label className="block text-xs font-black uppercase tracking-widest text-red-600 mb-3 flex items-center gap-2 animate-pulse">
                                    <i className="fas fa-eye"></i> Preview em Tempo Real
                                </label>
                                <div className="rounded-2xl overflow-hidden border-4 border-gray-900 dark:border-white/20 shadow-2xl">
                                    {bannerWithPreview && (
                                        <FullWidthPromo
                                            banners={[bannerWithPreview]}
                                            customHeight="h-[280px]"
                                            forceShow={true}
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center font-bold italic">
                                    * Assim é como o banner aparecerá no topo da home
                                </p>
                            </div>


                            {/* Upload de Imagem - APENAS UM BOTÃO */}
                            <div className="space-y-3">
                                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Imagem de Fundo
                                </label>

                                <input
                                    type="file"
                                    id={`banner-upload-${selectedBanner.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const sizeMB = file.size / (1024 * 1024);
                                        if (sizeMB > 10) {
                                            alert('Arquivo muito grande! Máximo 10MB');
                                            return;
                                        }

                                        try {
                                            const { storeLocalFile } = await import('../../../../../services/storage/localStorageService');
                                            const localId = await storeLocalFile(file);
                                            handleUpdateBanner(selectedBanner.id, { image: localId });
                                        } catch (err) {
                                            alert('Erro ao processar arquivo');
                                            console.error(err);
                                        }
                                    }}
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => document.getElementById(`banner-upload-${selectedBanner.id}`)?.click()}
                                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-upload"></i>
                                        {selectedBanner.image ? 'Alterar Imagem' : 'Selecionar Imagem'}
                                    </button>

                                    {selectedBanner.image && (
                                        <button
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { image: '', images: [] })}
                                            className="px-6 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>

                                <p className={`text-[10px] text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Tamanho recomendado: 1920x400px • Máximo 10MB
                                </p>
                            </div>

                            {/* Tema */}
                            <div className="space-y-3">
                                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tema do Banner (10 Estilos)
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {BANNER_THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => handleUpdateBanner(selectedBanner.id, {
                                                textPositionPreset: theme.id as any
                                            })}
                                            className={`
                                                relative aspect-square rounded-lg p-2 transition-all duration-200
                                                flex flex-col items-center justify-center gap-1
                                                ${selectedBanner.textPositionPreset === theme.id
                                                    ? 'bg-black/40 border-2 border-orange-500 shadow-lg shadow-orange-500/20'
                                                    : darkMode
                                                        ? 'bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20'
                                                        : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl">{theme.icon}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-tight text-center leading-tight ${selectedBanner.textPositionPreset === theme.id
                                                ? darkMode ? 'text-white' : 'text-gray-900'
                                                : darkMode ? 'text-gray-500' : 'text-gray-600'
                                                }`}>
                                                {theme.name}
                                            </span>
                                            {selectedBanner.textPositionPreset === theme.id && (
                                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ajustes de Imagem */}
                            <div className={`space-y-4 p-4 rounded-xl ${darkMode ? 'bg-black/20 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <i className="fas fa-sliders-h text-orange-500"></i>
                                    Ajustes de Imagem
                                </h4>

                                {/* Posição Horizontal */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                            <i className="fas fa-arrows-alt-h mr-1.5 text-orange-500"></i>
                                            Horizontal
                                        </span>
                                        <span className="text-orange-500 font-black text-xs">{selectedBanner.imagePositionX || 50}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedBanner.imagePositionX || 50}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { imagePositionX: parseInt(e.target.value) })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${selectedBanner.imagePositionX || 50}%, rgba(249, 115, 22, 0.2) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide">
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>← Esq</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Centro</span>
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Dir →</span>
                                    </div>
                                </div>

                                {/* Posição Vertical */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                            <i className="fas fa-arrows-alt-v mr-1.5 text-orange-500"></i>
                                            Vertical
                                        </span>
                                        <span className="text-orange-500 font-black text-xs">{selectedBanner.imagePositionY || 50}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedBanner.imagePositionY || 50}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { imagePositionY: parseInt(e.target.value) })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${selectedBanner.imagePositionY || 50}%, rgba(249, 115, 22, 0.2) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide">
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>↑ Topo</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Centro</span>
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Base ↓</span>
                                    </div>
                                </div>

                                {/* Zoom da Imagem */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                            <i className="fas fa-search-plus mr-1.5 text-orange-500"></i>
                                            Zoom
                                        </span>
                                        <span className="text-orange-500 font-black text-xs">{selectedBanner.imageScale || 100}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="200"
                                        value={selectedBanner.imageScale || 100}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { imageScale: parseInt(e.target.value) })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${((selectedBanner.imageScale || 100) - 50) / 1.5}%, rgba(249, 115, 22, 0.2) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide">
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>50%</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>100%</span>
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>200%</span>
                                    </div>
                                </div>

                                {/* Enquadramento (Fit Mode) */}
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-gray-400">
                                        <i className="fas fa-expand-arrows-alt text-orange-500"></i>
                                        Enquadramento
                                    </label>
                                    <div className="flex gap-2 p-1 bg-black/30 rounded-lg">
                                        <button
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { fit: 'cover' })}
                                            className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${selectedBanner.fit !== 'contain' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Preencher (Recortar)
                                        </button>
                                        <button
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { fit: 'contain' })}
                                            className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${selectedBanner.fit === 'contain' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Inteira (Sem Cortes)
                                        </button>
                                    </div>
                                    <p className="text-[8px] italic text-gray-500 leading-tight">
                                        * "Inteira" garante que a imagem apareça completa sem ser cortada.
                                    </p>
                                </div>

                                {/* Opacidade do Overlay */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                        <span>Escurecimento da Imagem</span>
                                        <span className="text-orange-600">{selectedBanner.overlayOpacity || 0}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedBanner.overlayOpacity || 0}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { overlayOpacity: parseInt(e.target.value) })}
                                        className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                    />
                                    <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                                        <span>Claro</span>
                                        <span>Médio</span>
                                        <span>Escuro</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUpdateBanner(selectedBanner.id, {
                                        imagePositionX: 50,
                                        imagePositionY: 50,
                                        overlayOpacity: 0,
                                        imageScale: 100,
                                        fit: 'cover'
                                    })}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <i className="fas fa-undo mr-2"></i>Resetar Ajustes
                                </button>
                            </div>

                            {/* Textos */}
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedBanner.tag || ''}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { tag: e.target.value })}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-bold ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="Ex: Promoção Especial"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Texto do Botão
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedBanner.buttonText || ''}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { buttonText: e.target.value })}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-bold ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="Ex: Saiba Mais"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Link / Rede Social
                                    </label>

                                    {/* Botões de Redes Sociais */}
                                    <div className="grid grid-cols-4 gap-2 mt-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { link: 'https://instagram.com/' })}
                                            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                                        >
                                            <i className="fab fa-instagram"></i> Instagram
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { link: 'https://wa.me/' })}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <i className="fab fa-whatsapp"></i> WhatsApp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { link: 'https://facebook.com/' })}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <i className="fab fa-facebook"></i> Facebook
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateBanner(selectedBanner.id, { link: 'https://' })}
                                            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <i className="fas fa-link"></i> Outro
                                        </button>
                                    </div>

                                    <input
                                        type="url"
                                        value={selectedBanner.link || ''}
                                        onChange={(e) => handleUpdateBanner(selectedBanner.id, { link: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="https://..."
                                    />

                                    {selectedBanner.link && (
                                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                            <i className={`fab fa-${selectedBanner.link.includes('instagram') ? 'instagram text-pink-600' :
                                                selectedBanner.link.includes('whatsapp') || selectedBanner.link.includes('wa.me') ? 'whatsapp text-green-600' :
                                                    selectedBanner.link.includes('facebook') ? 'facebook text-blue-600' :
                                                        'link text-gray-600'
                                                }`}></i>
                                            {selectedBanner.link.includes('instagram') ? 'Instagram' :
                                                selectedBanner.link.includes('whatsapp') || selectedBanner.link.includes('wa.me') ? 'WhatsApp' :
                                                    selectedBanner.link.includes('facebook') ? 'Facebook' : 'Link personalizado'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Ativo/Inativo */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedBanner.active}
                                    onChange={(e) => handleUpdateBanner(selectedBanner.id, { active: e.target.checked })}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedBanner.active ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                    }`}>
                                    {selectedBanner.active && <i className="fas fa-check text-white text-xs"></i>}
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    Banner Ativo
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimpleBannerEditor;
