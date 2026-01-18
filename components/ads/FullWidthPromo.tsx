
import React, { useState, useEffect, useRef } from 'react';
import { PromoBanner, BannerTextPositionPreset } from '../../types';

interface FullWidthPromoProps {
    banners?: PromoBanner[];
    customHeight?: string;
    forceShow?: boolean;
}

const DEFAULT_SLIDES: PromoBanner[] = [
    {
        id: '1',
        type: 'image',
        images: ['https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1600'],
        layout: 'classic',
        align: 'left',
        overlayOpacity: 50,
        tag: 'Cobertura Exclusiva',
        title: 'LAGOA FORMOSA <br /><span class="text-red-600">CONECTADA</span> COM VOCÊ',
        description: 'Informação de verdade, com a credibilidade de quem conhece cada canto da nossa terra.',
        // Fixed: Added missing buttonText and link properties to DEFAULT_SLIDES
        buttonText: 'Seguir @lagoaformosanomomento',
        link: 'https://instagram.com/lagoaformosanomomento',
        textPositionPreset: 'gradient_bottom_left',
        buttonConfig: {
            label: 'Seguir @lagoaformosanomomento',
            link: 'https://instagram.com/lagoaformosanomomento',
            style: 'solid',
            size: 'md',
            rounded: 'none',
            effect: 'none'
        },
        textConfig: {
            titleSize: 'xl',
            titleShadow: 'soft',
            descriptionVisible: true,
            fontFamily: 'Inter',
            customColor: '#ffffff'
        },
        active: true
    }
];

const FullWidthPromo: React.FC<FullWidthPromoProps> = ({ banners, customHeight, forceShow = false }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const activeBanners = (banners && banners.length > 0) ? (forceShow ? banners : banners.filter(b => b.active)) : DEFAULT_SLIDES;
    const slidesToRender = activeBanners.length > 0 ? activeBanners : (banners && banners.length > 0 ? banners : DEFAULT_SLIDES);

    const currentBanner = slidesToRender[currentSlide];

    const currentImages = (currentBanner?.images && currentBanner.images.length > 0)
        ? currentBanner.images
        : (currentBanner?.image ? [currentBanner.image] : []);

    useEffect(() => {
        if (slidesToRender.length <= 1) { return; }
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
            setBackgroundIndex(0);
        }, 8000);
        return () => clearInterval(timer);
    }, [slidesToRender.length]);

    useEffect(() => {
        if (currentBanner?.type === 'image' && currentImages.length > 1) {
            const bgTimer = setInterval(() => {
                setBackgroundIndex((prev) => (prev + 1) % currentImages.length);
            }, 4000);
            return () => clearInterval(bgTimer);
        }
    }, [currentBanner?.type, currentImages.length, currentSlide]);

    // SMART VIDEO SNIPPETS LOGIC
    useEffect(() => {
        const video = videoRef.current;
        if (!video || currentBanner?.type !== 'video' || !currentBanner.videoUrl) { return; }

        // Garantia de mudo forçado
        video.muted = true;

        const handleSnippetTimeUpdate = () => {
            if (video.duration > 60) {
                // Se o vídeo for maior que 1 minuto, exibe apenas trechos de 10 segundos
                // e pula 40 segundos para criar um efeito de fundo dinâmico e leve
                if (video.currentTime % 50 >= 10) {
                    const nextTime = Math.min(video.duration - 0.5, video.currentTime + 40);
                    video.currentTime = nextTime;
                    if (video.currentTime >= video.duration - 0.5) { video.currentTime = 0; }
                }
            }
        };

        video.addEventListener('timeupdate', handleSnippetTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleSnippetTimeUpdate);
    }, [currentBanner?.type, currentBanner?.videoUrl, currentSlide]);

    if (!currentBanner) { return null; }

    const buttonConfig = currentBanner.buttonConfig || {
        label: currentBanner.buttonText || 'Saiba Mais',
        link: currentBanner.link || '#',
        style: 'solid',
        size: 'md',
        rounded: 'none',
        effect: 'none'
    };

    const textConfig = currentBanner.textConfig || {
        titleSize: 'xl',
        titleShadow: 'soft',
        descriptionVisible: true,
        fontFamily: 'Inter',
        customColor: '#ffffff'
    };

    const getButtonClasses = () => {
        let classes = 'transition-all flex items-center gap-3 uppercase font-black tracking-widest shadow-lg ';
        if (buttonConfig.size === 'sm') { classes += 'px-4 py-2 text-[9px] '; }
        else if (buttonConfig.size === 'md') { classes += 'px-6 py-3 text-[10px] '; }
        else if (buttonConfig.size === 'lg') { classes += 'px-8 py-4 text-xs '; }
        else { classes += 'px-10 py-5 text-sm '; }

        if (buttonConfig.rounded === 'none') { classes += 'rounded-none '; }
        else if (buttonConfig.rounded === 'md') { classes += 'rounded-xl '; }
        else { classes += 'rounded-full '; }

        if (buttonConfig.style === 'solid') { classes += 'bg-red-600 text-white hover:bg-white hover:text-red-600 border border-red-600 '; }
        else if (buttonConfig.style === 'outline') { classes += 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black '; }
        else { classes += 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-black '; }

        if (buttonConfig.effect === 'pulse') { classes += 'animate-pulse '; }
        if (buttonConfig.effect === 'bounce') { classes += 'animate-bounce '; }
        if (buttonConfig.rounded === 'none') { classes += 'skew-x-[-10deg] '; }
        return classes;
    };

    const getTitleClasses = () => {
        let classes = 'font-black uppercase italic tracking-tighter leading-[0.9] mb-4 animate-fadeInUp ';
        if (textConfig.titleSize === 'md') { classes += 'text-xl md:text-3xl '; }
        else if (textConfig.titleSize === 'lg') { classes += 'text-2xl md:text-4xl '; }
        else if (textConfig.titleSize === 'xl') { classes += 'text-2xl md:text-5xl '; }
        else { classes += 'text-4xl md:text-7xl '; }
        if (textConfig.titleShadow === 'strong') { classes += 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] '; }
        else if (textConfig.titleShadow === 'soft') { classes += 'drop-shadow-md '; }
        return classes;
    };

    const renderInnerContent = (isDarkBg: boolean = false) => (
        <div className={`max-w-3xl ${currentBanner.align === 'center' ? 'text-center mx-auto' : ''}`}>
            <div className={`flex items-center gap-4 mb-2 animate-fadeInLeft ${currentBanner.align === 'center' ? 'justify-center' : currentBanner.align === 'right' ? 'justify-end flex-row-reverse' : ''}`}>
                <div className="h-1 w-8 bg-red-600"></div>
                <span className={`${isDarkBg ? 'text-gray-900' : 'text-white'} text-[10px] md:text-xs font-black uppercase tracking-[0.4em]`}>{currentBanner.tag}</span>
            </div>
            <h2
                className={`${getTitleClasses()}`}
                style={{
                    color: textConfig.customColor || (isDarkBg ? '#111827' : '#ffffff'),
                    fontFamily: textConfig.fontFamily ? `${textConfig.fontFamily}, sans-serif` : 'inherit'
                }}
                dangerouslySetInnerHTML={{ __html: currentBanner.title }}
            />
            {textConfig.descriptionVisible && (
                <p className={`${isDarkBg ? 'text-gray-600' : 'text-gray-300'} text-xs md:text-base font-medium max-w-lg mb-6 leading-relaxed animate-fadeInUp delay-100 line-clamp-2 md:line-clamp-3 ${currentBanner.align === 'center' ? 'mx-auto' : ''}`}>
                    {currentBanner.description}
                </p>
            )}
            <div className={`flex flex-wrap gap-4 animate-fadeInUp delay-200 ${currentBanner.align === 'center' ? 'justify-center' : currentBanner.align === 'right' ? 'justify-end' : ''}`}>
                <a href={buttonConfig.link} target="_blank" rel="noopener noreferrer" className={`${getButtonClasses()} group/btn`} onClick={(e) => { if (buttonConfig.link === '#') { e.preventDefault(); } }}>
                    <span className={buttonConfig.rounded === 'none' ? 'skew-x-[10deg]' : ''}>
                        {buttonConfig.link.includes('instagram') && <i className="fab fa-instagram text-sm mr-2"></i>}
                        {buttonConfig.link.includes('whatsapp') && <i className="fab fa-whatsapp text-sm mr-2"></i>}
                        {buttonConfig.label}
                    </span>
                    {buttonConfig.effect === 'shine' && (
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none"></div>
                    )}
                </a>
            </div>
        </div>
    );

    const renderContentWrapper = (children: React.ReactNode) => {
        const preset = currentBanner.textPositionPreset || 'gradient_bottom_left';
        switch (preset) {
            case 'glass_center':
                return (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-4xl w-full text-center animate-zoomIn">
                            <div className="flex flex-col items-center">{children}</div>
                        </div>
                    </div>
                );
            case 'solid_right_bar':
                return (
                    <div className="absolute inset-y-0 right-0 z-30 w-[80%] md:w-[45%] bg-black/95 p-8 md:p-12 flex items-center shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-l-4 border-red-600 animate-slideInRight">
                        <div className="w-full">{children}</div>
                    </div>
                );
            case 'floating_box_top_left':
                return (
                    <div className="absolute top-10 left-6 md:top-16 md:left-16 z-30 max-w-2xl animate-slideDown">
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-gray-100 text-left">{renderInnerContent(true)}</div>
                    </div>
                );
            case 'hero_centered_clean':
                return (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center animate-fadeIn">{renderInnerContent(false)}</div>
                );
            case 'floating_bottom_right':
                return (
                    <div className="absolute bottom-10 right-6 md:right-16 z-30 max-w-md animate-slideInRight">
                        <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 text-right">{renderInnerContent(true)}</div>
                    </div>
                );
            case 'newspaper_clipping':
                return (
                    <div className="absolute top-1/2 left-6 md:left-16 -translate-y-1/2 z-30 max-w-sm md:max-w-md animate-fadeIn rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                        <div className="bg-[#f4f1ea] p-8 md:p-10 border-b-4 border-r-4 border-black/10 shadow-2xl relative">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md z-40"></div>
                            {renderInnerContent(true)}
                        </div>
                    </div>
                );
            case 'vertical_sidebar_left':
                return (
                    <div className="absolute inset-y-0 left-0 z-30 w-full md:w-[35%] bg-red-600 p-8 md:p-12 flex items-center shadow-[20px_0_40px_rgba(0,0,0,0.3)] animate-slideInLeft">
                        <div className="w-full">{renderInnerContent(false)}</div>
                    </div>
                );
            case 'full_overlay_impact':
                return (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-8 md:p-20 text-center animate-fadeIn">
                        <div className="absolute inset-0 bg-red-600/60 mix-blend-multiply z-0"></div>
                        <div className="relative z-10 w-full">{renderInnerContent(false)}</div>
                    </div>
                );
            case 'tv_news_bottom_bar':
                return (
                    <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 border-t-4 border-red-600 p-6 md:p-10 flex items-center animate-slideUp">
                        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-red-600 text-white px-2 py-0.5 text-[8px] font-black uppercase italic animate-pulse">BREAKING</div>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{currentBanner.tag}</span>
                                </div>
                                <h2 className="text-white text-xl md:text-3xl font-[1000] uppercase italic tracking-tighter leading-none" style={{ fontFamily: textConfig.fontFamily }} dangerouslySetInnerHTML={{ __html: currentBanner.title }} />
                            </div>
                            <div className="shrink-0"><a href={buttonConfig.link} className={getButtonClasses()}>{buttonConfig.label}</a></div>
                        </div>
                    </div>
                );
            case 'gradient_bottom_left':
            default:
                return (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none"></div>
                        <div className={`absolute inset-0 z-30 flex items-end p-6 md:p-16 ${currentBanner.align === 'center' ? 'justify-center text-center' : currentBanner.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>{children}</div>
                    </>
                );
        }
    };

    const renderBackgroundMedia = () => {
        if (currentBanner.type === 'video' && currentBanner.videoUrl) {
            return (
                <div className="absolute inset-0 z-0">
                    <video
                        ref={videoRef}
                        src={currentBanner.videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </div>
            );
        }
        if (currentImages.length === 0) {
            return (
                <div className="absolute inset-0 bg-zinc-900 border-2 border-dashed border-white/5 flex items-center justify-center">
                    <div className="text-center opacity-20">
                        <i className="fas fa-image text-6xl mb-4"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Imagem</p>
                    </div>
                </div>
            );
        }
        return currentImages.map((img, idx) => (
            <div key={`${currentBanner.id}-bg-${idx}`} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === backgroundIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <img src={img || 'https://placehold.co/1600x600/111111/333333?text=Lagoa+Formosa+no+Momento'} className="w-full h-full object-cover object-center" alt="" />
            </div>
        ));
    };

    return (
        <section className={`w-full bg-black relative overflow-hidden group shadow-2xl border-b border-gray-800 ${customHeight || 'h-[350px] md:h-[500px]'}`}>
            <div className="absolute inset-0 z-0">
                {renderBackgroundMedia()}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: `rgba(0,0,0, ${currentBanner.overlayOpacity ? currentBanner.overlayOpacity / 100 : 0})` }}></div>
            </div>
            {['floating_box_top_left', 'hero_centered_clean', 'floating_bottom_right', 'newspaper_clipping', 'vertical_sidebar_left', 'full_overlay_impact', 'tv_news_bottom_bar'].includes(currentBanner.textPositionPreset || '') ? renderContentWrapper(null) : renderContentWrapper(renderInnerContent(false))}
            {slidesToRender.length > 1 && (
                <>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                        {slidesToRender.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`h-1 transition-all rounded-none ${index === currentSlide ? 'w-8 bg-red-600' : 'w-3 bg-white/30 hover:bg-white/50'}`} />))}
                    </div>
                    <button onClick={() => setCurrentSlide((prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"><i className="fas fa-chevron-left"></i></button>
                    <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slidesToRender.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"><i className="fas fa-chevron-right"></i></button>
                </>
            )}
            <div className="absolute top-0 right-6 hidden lg:flex flex-col items-end z-40">
                <div className="bg-red-600 text-white px-4 py-2 font-black uppercase italic tracking-tighter text-xl shadow-xl rounded-b-lg">LFNM</div>
            </div>
        </section>
    );
};

export default FullWidthPromo;
