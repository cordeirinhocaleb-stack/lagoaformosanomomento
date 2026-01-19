
import React, { useState } from 'react';
import { toolbarBtn, zoomBtn, stageBackground, deviceFrame } from './previewStageStyles';

interface PreviewStageProps {
  children: React.ReactNode;
  defaultDevice?: 'phone' | 'desktop';
}

const PreviewStage: React.FC<PreviewStageProps> = ({ children, defaultDevice = 'desktop' }) => {
  const [device, setDevice] = useState<'phone' | 'desktop'>(defaultDevice);
  const [zoom, setZoom] = useState<number>(0.65); // Default zoom 75%
  const [bgMode, setBgMode] = useState<'light' | 'dark' | 'site'>('site');

  const frameStyle = deviceFrame(device);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-200 shadow-inner relative group">
        
        {/* TOOLBAR SUPERIOR FLUTUANTE */}
        <div className="absolute top-4 left-4 right-4 z-50 flex flex-wrap items-center justify-between gap-4 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
            
            {/* Esquerda: Device Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => { setDevice('phone'); setZoom(0.75); }} className={toolbarBtn(device === 'phone')}>
                    <i className="fas fa-mobile-alt"></i> Mobile
                </button>
                <button onClick={() => { setDevice('desktop'); setZoom(0.5); }} className={toolbarBtn(device === 'desktop')}>
                    <i className="fas fa-desktop"></i> Desktop
                </button>
            </div>

            {/* Centro: Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-xl shadow-sm">
                <span className="text-[8px] font-black uppercase text-gray-300 mr-2 tracking-widest">Zoom</span>
                {[0.5, 0.75, 0.9, 1].map((z) => (
                    <button 
                        key={z} 
                        onClick={() => setZoom(z)} 
                        className={zoomBtn(zoom === z)}
                    >
                        {z * 100}%
                    </button>
                ))}
            </div>

            {/* Direita: Background & Status */}
            <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setBgMode('light')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bgMode === 'light' ? 'bg-white shadow-sm' : 'text-gray-400'}`} title="Fundo Claro"><i className="fas fa-sun text-xs"></i></button>
                    <button onClick={() => setBgMode('site')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bgMode === 'site' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`} title="Simular Site"><i className="fas fa-globe text-xs"></i></button>
                    <button onClick={() => setBgMode('dark')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bgMode === 'dark' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`} title="Fundo Escuro"><i className="fas fa-moon text-xs"></i></button>
                </div>
                
                <div className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Live Preview</span>
                </div>
            </div>
        </div>

        {/* STAGE AREA (SCROLLABLE) */}
        <div className={`flex-1 overflow-auto flex items-center justify-center p-10 ${stageBackground(bgMode)} relative`}>
            
            {/* Background Pattern (Grid) se Light */}
            {bgMode === 'light' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
            )}

            {/* Fake Site Background se Site Mode */}
            {bgMode === 'site' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 blur-sm grayscale-[30%]">
                    <div className="w-full h-20 bg-black/80 mb-4"></div>
                    <div className="container mx-auto px-4 grid grid-cols-3 gap-4">
                        <div className="col-span-2 h-96 bg-white/10 rounded-2xl"></div>
                        <div className="col-span-1 h-96 bg-white/10 rounded-2xl"></div>
                    </div>
                </div>
            )}

            {/* SCALED WRAPPER */}
            <div 
                style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease-out'
                }}
            >
                <div 
                    className={frameStyle.className}
                    style={{ 
                        width: frameStyle.width, 
                        height: frameStyle.height,
                        borderRadius: frameStyle.borderRadius,
                        border: `${frameStyle.borderWidth} solid ${frameStyle.borderColor}`
                    }}
                >
                    {/* Phone Notch Simulation */}
                    {device === 'phone' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1a1a1a] rounded-b-2xl z-[100] pointer-events-none"></div>
                    )}

                    {/* Status Bar Simulation (Phone) */}
                    {device === 'phone' && (
                        <div className="absolute top-2 left-6 right-6 flex justify-between items-center z-[90] text-black text-[10px] font-bold mix-blend-difference pointer-events-none opacity-50">
                            <span>9:41</span>
                            <div className="flex gap-1">
                                <i className="fas fa-signal"></i>
                                <i className="fas fa-wifi"></i>
                                <i className="fas fa-battery-full"></i>
                            </div>
                        </div>
                    )}

                    {/* Render Content */}
                    <div className="w-full h-full relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PreviewStage;
