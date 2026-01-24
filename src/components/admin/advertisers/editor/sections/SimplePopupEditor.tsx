'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PromoPopupSetConfig } from '../../../../../types';
import UnifiedImageUploader from '../../../../common/UnifiedImageUploader';
import AdvertiserPopupThemeSelectorPanel from '../../popupBuilder/AdvertiserPopupThemeSelectorPanel';
import PromoPopupView from '../../../../home/popup/PromoPopupView';
import { getLocalFile } from '../../../../../services/storage/localStorageService';
import ToggleSwitch from '../components/ToggleSwitch';

interface SimplePopupEditorProps {
    popupSet: PromoPopupSetConfig;
    onChange: (popupSet: PromoPopupSetConfig) => void;
    darkMode?: boolean;
}

const SimplePopupEditor: React.FC<SimplePopupEditorProps> = ({
    popupSet,
    onChange,
    darkMode = false
}) => {
    const items = popupSet?.items || [];
    const [selectedItemId, setSelectedItemId] = useState<string | null>(
        items.length > 0 ? items[0].id : null
    );
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const selectedItem = items.find(item => item.id === selectedItemId);

    // Carregar preview da imagem se for um ID local
    useEffect(() => {
        const loadImagePreview = async () => {
            const imageUrl = selectedItem?.media?.images?.[0];
            if (imageUrl?.startsWith('local_')) {
                try {
                    const blob = await getLocalFile(imageUrl);
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setImagePreview(url);
                        return () => URL.revokeObjectURL(url);
                    }
                } catch (error) {
                    console.error('Erro ao carregar preview da imagem:', error);
                    setImagePreview(null);
                }
            } else {
                setImagePreview(null);
            }
        };
        loadImagePreview();
    }, [selectedItem?.media?.images?.[0]]);

    // Criar item com preview resolvido para o PromoPopupView
    // useMemo garante que recalcula quando selectedItem ou imagePreview mudam
    const itemWithPreview = useMemo(() => {
        if (!selectedItem) return null;

        return {
            ...selectedItem,
            media: {
                ...selectedItem.media,
                images: imagePreview
                    ? [imagePreview]
                    : (selectedItem.media?.images?.[0]?.startsWith('local_')
                        ? []
                        : selectedItem.media?.images || [])
            }
        };
    }, [selectedItem, imagePreview]);

    const handleAddItem = () => {
        const newItem: import('../../../../../types').PromoPopupItemConfig = {
            id: `popup-${Date.now()}`,
            active: true,
            title: 'Novo Popup',
            body: '',
            ctaText: 'Saiba Mais',
            ctaUrl: '',
            targetPages: ['home', 'news_detail'],
            filterId: 'none',
            themePresetId: 'classic_default',
            popupSizePreset: 'md',
            textStyle: {
                fontFamily: 'Inter',
                titleSize: '2xl',
                bodySize: 'md',
                titleColor: '#000000',
                bodyColor: '#4b5563'
            },
            media: {
                images: [],
                imagePresentation: 'hero_single',
                imageStyle: {
                    fit: 'cover',
                    focusPoint: 'center',
                    borderRadius: 'none',
                    borderStyle: 'none',
                    shadow: 'none',
                    overlayPreset: 'none',
                    overlayIntensity: 0,
                    filterId: 'none',
                    filterVariant: 'soft'
                },
                videoUrl: '',
                videoSettings: {
                    muted: true,
                    loop: true,
                    autoplay: true,
                    fit: 'cover',
                    zoomMotion: 'off',
                    borderRadius: 'none',
                    borderStyle: 'none',
                    shadow: 'none',
                    overlayPreset: 'none',
                    filterId: 'none',
                    filterVariant: 'soft',
                    framePreset: 'clean_border'
                }
            }
        };
        onChange({ items: [...items, newItem] });
        setSelectedItemId(newItem.id);
    };

    const handleUpdateItem = (id: string, updates: any) => {
        onChange({
            items: items.map(item => item.id === id ? { ...item, ...updates } : item)
        });
    };

    const handleDeleteItem = (id: string) => {
        onChange({ items: items.filter(item => item.id !== id) });
        if (selectedItemId === id) {
            setSelectedItemId(items[0]?.id || null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Popup Promocional
                    </h3>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aparecem como modal na home e notícias
                    </p>
                </div>
                <button
                    onClick={handleAddItem}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2"
                    disabled={items.length >= 5}
                >
                    <i className="fas fa-plus"></i> Novo Slide
                </button>
            </div>

            {items.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <i className={`fas fa-bullhorn text-5xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nenhum popup criado ainda
                    </p>
                    <button
                        onClick={handleAddItem}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                    >
                        Criar Primeiro Popup
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de Popups */}
                    <div className="space-y-3">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Slides ({items.length}/5)
                        </h4>
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedItemId === item.id
                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                    : darkMode
                                        ? 'border-white/10 bg-black/20 hover:border-white/20'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-black ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        #{index + 1}
                                    </span>
                                    {item.media?.images?.[0] && (
                                        <img src={item.media.images[0]} className="w-12 h-8 object-cover rounded" alt="" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate text-gray-900 dark:text-white">
                                            {item.title || 'Sem título'}
                                        </p>
                                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                            <ToggleSwitch
                                                enabled={item.active}
                                                onChange={(enabled) => handleUpdateItem(item.id, { active: enabled })}
                                                label=""
                                                darkMode={darkMode}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteItem(item.id);
                                        }}
                                        className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-200"
                                    >
                                        <i className="fas fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Editor do Popup Selecionado */}
                    {selectedItem && (
                        <div className="lg:col-span-2 space-y-6">
                            {/* PREVIEW EM TEMPO REAL - PRIMEIRO */}
                            <div className="mb-6">
                                <label className="block text-xs font-black uppercase tracking-widest text-red-600 mb-3 flex items-center gap-2 animate-pulse">
                                    <i className="fas fa-eye"></i> Preview em Tempo Real
                                </label>
                                <div className="rounded-2xl overflow-hidden border-4 border-gray-900 dark:border-white/20 shadow-2xl">
                                    {itemWithPreview && (
                                        <div className="w-full h-[400px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                                            <PromoPopupView
                                                config={{
                                                    active: true,
                                                    frequency: 'always',
                                                    theme: itemWithPreview.themePresetId || 'classic_default',
                                                    title: itemWithPreview.title,
                                                    description: itemWithPreview.body,
                                                    buttonText: itemWithPreview.ctaText,
                                                    buttonLink: itemWithPreview.ctaUrl,
                                                    targetPages: itemWithPreview.targetPages,
                                                    mediaType: itemWithPreview.media?.videoUrl ? 'video' : 'image',
                                                    mediaUrl: itemWithPreview.media?.videoUrl || itemWithPreview.media?.images?.[0] || '',
                                                    images: itemWithPreview.media?.images,

                                                    // Style Props Mapped
                                                    overlayPreset: itemWithPreview.media?.imageStyle?.overlayPreset,
                                                    mediaFilter: itemWithPreview.media?.imageStyle?.filterId,
                                                    mediaFilterVariant: itemWithPreview.media?.imageStyle?.filterVariant,
                                                    imagePresentation: itemWithPreview.media?.imagePresentation,

                                                    // Video Props Mapped
                                                    videoFramePreset: itemWithPreview.media?.videoSettings?.framePreset
                                                } as any}
                                                mode="preview"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center font-bold italic">
                                    * Assim é como o popup aparecerá no site
                                </p>
                            </div>

                            {/* Upload de Imagem - APENAS UM BOTÃO */}
                            <div className="space-y-3">
                                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Imagem do Popup
                                </label>

                                <input
                                    type="file"
                                    id={`popup-upload-${selectedItem.id}`}
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
                                            handleUpdateItem(selectedItem.id, {
                                                media: {
                                                    ...selectedItem.media,
                                                    images: [localId]
                                                }
                                            });
                                        } catch (err) {
                                            alert('Erro ao processar arquivo');
                                            console.error(err);
                                        }
                                    }}
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => document.getElementById(`popup-upload-${selectedItem.id}`)?.click()}
                                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-upload"></i>
                                        {selectedItem.media?.images?.[0] ? 'Alterar Imagem' : 'Selecionar Imagem'}
                                    </button>

                                    {selectedItem.media?.images?.[0] && (
                                        <button
                                            onClick={() => handleUpdateItem(selectedItem.id, {
                                                media: {
                                                    ...selectedItem.media,
                                                    images: []
                                                }
                                            })}
                                            className="px-6 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>

                                <p className={`text-[10px] text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Tamanho recomendado: 800x600px • Máximo 10MB
                                </p>
                            </div>

                            {/* Seletor de Temas */}
                            <div className="space-y-3">
                                <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tema do Popup (Estilos Visuais)
                                </h4>
                                <AdvertiserPopupThemeSelectorPanel
                                    currentThemeId={selectedItem.themePresetId || 'classic_default'}
                                    onSelect={(updates) => {
                                        // Protective merge for media to avoid wiping images
                                        if (updates.media) {
                                            handleUpdateItem(selectedItem.id, {
                                                ...updates,
                                                media: {
                                                    ...selectedItem.media,
                                                    ...updates.media
                                                }
                                            });
                                        } else {
                                            handleUpdateItem(selectedItem.id, updates);
                                        }
                                    }}
                                    darkMode={darkMode}
                                    previewImage={selectedItem.media?.images?.[0] || selectedItem.media?.videoUrl}
                                />
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
                                        <span className="text-orange-500 font-black text-xs">{selectedItem.media?.imageStyle?.focusPoint?.split(' ')[0] || '50'}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={parseInt(selectedItem.media?.imageStyle?.focusPoint?.split(' ')[0] || '50')}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            media: {
                                                ...selectedItem.media,
                                                imageStyle: {
                                                    ...selectedItem.media?.imageStyle,
                                                    focusPoint: `${e.target.value}% ${selectedItem.media?.imageStyle?.focusPoint?.split(' ')[1] || '50%'}`
                                                }
                                            }
                                        })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${parseInt(selectedItem.media?.imageStyle?.focusPoint?.split(' ')[0] || '50')}%, rgba(249, 115, 22, 0.2) 100%)`
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
                                        <span className="text-orange-500 font-black text-xs">{selectedItem.media?.imageStyle?.focusPoint?.split(' ')[1]?.replace('%', '') || '50'}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={parseInt(selectedItem.media?.imageStyle?.focusPoint?.split(' ')[1]?.replace('%', '') || '50')}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            media: {
                                                ...selectedItem.media,
                                                imageStyle: {
                                                    ...selectedItem.media?.imageStyle,
                                                    focusPoint: `${selectedItem.media?.imageStyle?.focusPoint?.split(' ')[0] || '50%'} ${e.target.value}%`
                                                }
                                            }
                                        })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${parseInt(selectedItem.media?.imageStyle?.focusPoint?.split(' ')[1]?.replace('%', '') || '50')}%, rgba(249, 115, 22, 0.2) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide">
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>↑ Topo</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Centro</span>
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Base ↓</span>
                                    </div>
                                </div>

                                {/* Escurecimento/Overlay */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                            <i className="fas fa-adjust mr-1.5 text-orange-500"></i>
                                            Escurecimento
                                        </span>
                                        <span className="text-orange-500 font-black text-xs">{selectedItem.media?.imageStyle?.overlayIntensity || 0}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedItem.media?.imageStyle?.overlayIntensity || 0}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            media: {
                                                ...selectedItem.media,
                                                imageStyle: {
                                                    ...selectedItem.media?.imageStyle,
                                                    overlayIntensity: parseInt(e.target.value)
                                                }
                                            }
                                        })}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                                        style={{
                                            background: `linear-gradient(to right, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.6) ${selectedItem.media?.imageStyle?.overlayIntensity || 0}%, rgba(249, 115, 22, 0.2) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide">
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Claro</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Médio</span>
                                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Escuro</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUpdateItem(selectedItem.id, {
                                        media: {
                                            ...selectedItem.media,
                                            imageStyle: {
                                                ...selectedItem.media?.imageStyle,
                                                focusPoint: '50% 50%',
                                                overlayIntensity: 0
                                            }
                                        }
                                    })}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <i className="fas fa-undo mr-2"></i>Resetar Ajustes
                                </button>
                            </div>

                            {/* Campos */}
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedItem.title || ''}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, { title: e.target.value })}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-bold ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="Ex: Oferta Especial"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Descrição
                                    </label>
                                    <textarea
                                        value={selectedItem.body || ''}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, { body: e.target.value })}
                                        rows={3}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-medium ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="Descreva a oferta..."
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Texto do Botão
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedItem.ctaText || ''}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, { ctaText: e.target.value })}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-bold ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="Ex: Aproveitar Agora"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Link do Botão
                                    </label>
                                    <input
                                        type="url"
                                        value={selectedItem.ctaUrl || ''}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, { ctaUrl: e.target.value })}
                                        className={`w-full mt-2 px-4 py-3 rounded-xl border font-mono text-sm ${darkMode
                                            ? 'bg-black/20 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimplePopupEditor;
