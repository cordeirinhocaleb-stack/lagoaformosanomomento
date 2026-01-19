import React, { useState, useRef, useEffect } from 'react';
import { PromoPopupSetConfig } from '@/types';
import PromoPopupCarousel from '../../../home/popup/PromoPopupCarousel';
import { deviceFrame, stageBackground, toolbarBtn, zoomBtn } from '../popup/previewStageStyles';

interface LivePreviewStageProps {
    popupSet: PromoPopupSetConfig;
    selectedItemId?: string | null; // Nova prop
    darkMode?: boolean;
}

const LivePreviewStage: React.FC<LivePreviewStageProps> = ({ popupSet, selectedItemId, darkMode = false }) => {
    const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
    const [zoom, setZoom] = useState<number>(0.8);
    const [bgMode, setBgMode] = useState<'light' | 'dark' | 'site'>(() => darkMode ? 'dark' : 'site');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

    // Drag & Pan State
    const [isGrabbing, setIsGrabbing] = useState(false);
    const dragInfo = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

    const frameStyle = deviceFrame(device);

    // Debug info for the first item
    const activeItem = popupSet.items.find(i => i.id === selectedItemId) || popupSet.items[0];

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const target = darkMode ? 'dark' : 'site';
        setBgMode(prev => prev === target ? prev : target);
    }, [darkMode]);

    // Auto-fit logic
    const handleFit = () => {
        if (scrollContainerRef.current) {
            const { clientWidth, clientHeight } = scrollContainerRef.current;
            const targetWidth = parseInt(frameStyle.width);
            const targetHeight = parseInt(frameStyle.height);

            // Margem de segurança
            const padding = isMobileView && device === 'phone' ? 0 : 60;

            const scaleX = (clientWidth - padding) / targetWidth;
            const scaleY = (clientHeight - padding) / targetHeight;

            // Escolhe o menor para caber tudo
            const fitScale = Math.min(scaleX, scaleY, 1);
            setZoom(Math.max(0.25, parseFloat(fitScale.toFixed(2))));
        }
    };

    // Ajusta zoom ao trocar device
    useEffect(() => {
        // Pequeno timeout para garantir que o layout renderizou
        const timer = setTimeout(handleFit, 50);
        return () => clearTimeout(timer);
    }, [device, isMobileView]);

    // Se estiver em mobile real e visualizando phone, remove as bordas e ocupa 100%
    const isFullScreenMobile = isMobileView && device === 'phone';

    // --- DRAG HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current || isFullScreenMobile) { return; }
        dragInfo.current.isDown = true;
        dragInfo.current.startX = e.pageX - scrollContainerRef.current.offsetLeft;
        dragInfo.current.startY = e.pageY - scrollContainerRef.current.offsetTop;
        dragInfo.current.scrollLeft = scrollContainerRef.current.scrollLeft;
        dragInfo.current.scrollTop = scrollContainerRef.current.scrollTop;
        setIsGrabbing(true);
    };

    const handleMouseLeave = () => {
        dragInfo.current.isDown = false;
        setIsGrabbing(false);
    };

    const handleMouseUp = () => {
        dragInfo.current.isDown = false;
        setIsGrabbing(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragInfo.current.isDown || !scrollContainerRef.current || isFullScreenMobile) { return; }
        e.preventDefault();

        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const y = e.pageY - scrollContainerRef.current.offsetTop;

        const walkX = (x - dragInfo.current.startX) * 1; // Velocidade do scroll X
        const walkY = (y - dragInfo.current.startY) * 1; // Velocidade do scroll Y

        scrollContainerRef.current.scrollLeft = dragInfo.current.scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = dragInfo.current.scrollTop - walkY;
    };

    return (
        <div className={`flex flex-col h-full w-full rounded-[2rem] overflow-hidden border shadow-inner relative group ${darkMode ? 'bg-zinc-800 border-white/5' : 'bg-gray-50 border-gray-200'}`}>

            {/* Toolbar */}
            <div className={`absolute top-4 left-4 right-4 z-50 flex flex-wrap items-center justify-between gap-2 p-2 backdrop-blur-md rounded-2xl border shadow-lg transition-opacity ${isFullScreenMobile ? 'opacity-30 hover:opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'} pointer-events-auto ${darkMode ? 'bg-black/90 border-white/10' : 'bg-white/90 border-gray-200'}`}>
                <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <button onClick={() => setDevice('phone')} className={toolbarBtn(device === 'phone')}><i className="fas fa-mobile-alt"></i></button>
                    <button onClick={() => setDevice('desktop')} className={toolbarBtn(device === 'desktop')}><i className="fas fa-desktop"></i></button>
                </div>

                <div className={`flex items-center gap-1 border px-2 py-1 rounded-xl shadow-sm overflow-x-auto scrollbar-hide max-w-[150px] md:max-w-none ${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-100'}`}>
                    <button onClick={handleFit} className={zoomBtn(false)} title="Ajustar à tela"><i className="fas fa-expand"></i></button>
                    {!isFullScreenMobile && [0.25, 0.5, 0.75, 1].map(z => (
                        <button key={z} onClick={() => setZoom(z)} className={zoomBtn(zoom === z)}>{z * 100}%</button>
                    ))}
                </div>

                <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <button onClick={() => setBgMode('site')} className={zoomBtn(bgMode === 'site')}><i className="fas fa-globe"></i></button>
                    <button onClick={() => setBgMode('dark')} className={zoomBtn(bgMode === 'dark')}><i className="fas fa-moon"></i></button>
                </div>
            </div>

            {/* Stage Container - Flex 1 para ocupar espaço restante */}
            <div className={`flex-1 relative overflow-hidden ${stageBackground(bgMode)}`}>
                {bgMode === 'site' && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 blur-sm grayscale-[30%] z-0">
                        <div className="w-full h-20 bg-black/80 mb-4"></div>
                        <div className="container mx-auto px-4 grid grid-cols-3 gap-4">
                            <div className="col-span-2 h-96 bg-white/10 rounded-2xl"></div>
                            <div className="col-span-1 h-96 bg-white/10 rounded-2xl"></div>
                        </div>
                    </div>
                )}

                {/* Scroll Area with Drag Events */}
                <div
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`absolute inset-0 overflow-auto custom-scrollbar flex ${isFullScreenMobile ? 'p-0' : 'p-8 md:p-12'} transition-colors ${isGrabbing ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                    {/* Transform Wrapper */}
                    <div
                        style={{
                            width: isFullScreenMobile ? '100%' : frameStyle.width,
                            height: isFullScreenMobile ? '100%' : frameStyle.height,
                            transform: isFullScreenMobile ? 'none' : `scale(${zoom})`,
                            transformOrigin: 'center center',
                            flexShrink: 0
                        }}
                        className="m-auto transition-transform duration-300 ease-out pointer-events-none"
                    >
                        <div
                            className={`${frameStyle.className} pointer-events-auto`}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: isFullScreenMobile ? '0px' : frameStyle.borderRadius,
                                border: isFullScreenMobile ? 'none' : `${frameStyle.borderWidth} solid ${frameStyle.borderColor}`,
                            }}
                        >
                            {/* Fake Browser UI inside Desktop */}
                            {device === 'desktop' && <div className="h-8 bg-gray-100 border-b border-gray-200 w-full flex items-center px-4 gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>}

                            {/* Fake Phone UI - Hide on fullscreen mobile */}
                            {device === 'phone' && !isFullScreenMobile && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1a1a1a] rounded-b-2xl z-[100] pointer-events-none"></div>}

                            {/* REAL RENDERER - LIVE PREVIEW */}
                            <div className="w-full h-full relative overflow-hidden bg-black/10">
                                {popupSet.items.length > 0 ? (
                                    <PromoPopupCarousel
                                        items={popupSet.items}
                                        mode="preview"
                                        selectedId={selectedItemId} // Passando ID selecionado
                                        isMobilePreview={device === 'phone'} // Force mobile rendering logic in preview
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <i className="fas fa-ban text-4xl mb-4 opacity-50"></i>
                                        <p className="text-xs font-black uppercase tracking-widest">Nenhum slide ativo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Readout */}
            {activeItem && !isMobileView && (
                <div className="absolute bottom-4 left-4 bg-black/80 text-white text-[9px] font-mono p-2 rounded z-50 pointer-events-none hidden md:block">
                    DEBUG: Size={activeItem.popupSizePreset} | Scale: {Math.round(zoom * 100)}% | Mobile: {device === 'phone' ? 'Yes' : 'No'}
                </div>
            )}
        </div>
    );
};

export default LivePreviewStage;