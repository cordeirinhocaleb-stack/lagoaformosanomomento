
import React from 'react';
import { Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';

const InstagramFeed: React.FC = () => {
    // Dados Mockup de Alta Qualidade
    const posts = [
        {
            id: '1',
            type: 'image',
            imageUrl: 'https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png',
            likes: '1.2k',
            comments: '45',
            link: 'https://instagram.com/lagoaformosanomomento'
        },
        {
            id: '2',
            type: 'video',
            imageUrl: 'https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png',
            likes: '850',
            comments: '32',
            link: 'https://instagram.com/lagoaformosanomomento'
        },
        {
            id: '3',
            type: 'image',
            imageUrl: 'https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png',
            likes: '2.1k',
            comments: '120',
            link: 'https://instagram.com/lagoaformosanomomento'
        },
        {
            id: '4',
            type: 'image',
            imageUrl: 'https://res.cloudinary.com/dqrxppg5b/image/upload/v1767730957/Gemini_Generated_Image_tkx82stkx82stkx8_jjeumg.png',
            likes: '940',
            comments: '18',
            link: 'https://instagram.com/lagoaformosanomomento'
        }
    ];

    return (
        <section className="w-full mb-16 md:mb-24 px-4 md:px-8 lg:px-12 animate-fadeIn">
            <div className="max-w-[1920px] mx-auto">
                {/* Header do Feed */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-pink-600">
                            <Instagram className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">Instagram @lfnm</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                            Acompanhe no <span className="text-pink-600">Insta</span>
                        </h2>
                    </div>

                    <a
                        href="https://instagram.com/lagoaformosanomomento"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:shadow-pink-500/20 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <span>Seguir para ver tudo</span>
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                {/* Grid de Posts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                            <img
                                src={post.imageUrl}
                                alt="Instagram Post"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Interaction Mockup */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-white" />
                                    <span className="font-black text-sm">{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 fill-white" />
                                    <span className="font-black text-sm">{post.comments}</span>
                                </div>
                            </div>

                            {/* Icon Indicator */}
                            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-xl opacity-100 group-hover:opacity-0 transition-opacity">
                                {post.type === 'video' ? (
                                    <i className="fas fa-play text-white text-[10px]"></i>
                                ) : (
                                    <i className="fas fa-clone text-white text-[10px]"></i>
                                )}
                            </div>
                        </a>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        Mais de 15k seguidores conectados • @lagoaformosanomomento
                    </p>
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
