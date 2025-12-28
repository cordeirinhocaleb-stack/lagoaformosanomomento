
import React from 'react';
import { NewsItem } from '../types';

interface InstagramFeedProps {
  posts: NewsItem[];
}

const InstagramFeed: React.FC<InstagramFeedProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full bg-black py-16 my-16">
      <div className="container mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1 rounded-lg">
              <i className="fab fa-instagram text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-white text-2xl md:text-4xl font-black uppercase italic tracking-tighter">
                DO FEED <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">INSTAGRAM</span>
              </h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Atualizações Rápidas e Bastidores
              </p>
            </div>
          </div>
          <a 
            href="https://instagram.com/lagoaformosanomomento" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-white border border-white/20 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all font-bold text-xs uppercase tracking-widest"
          >
            Seguir Perfil <i className="fas fa-arrow-right"></i>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-pink-500 transition-all"
            >
              {post.mediaType === 'video' ? (
                <video src={post.videoUrl} className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
              ) : (
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-700" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute top-3 right-3 z-10">
                <i className={`fas ${post.mediaType === 'video' ? 'fa-video' : 'fa-images'} text-white text-xs drop-shadow-md`}></i>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                {/* Fix: Changed post.excerpt to post.lead */}
                <p className="text-white text-xs font-bold line-clamp-2 leading-snug mb-2">
                  {post.lead}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Hoje'}</span>
                  <span className="text-pink-500 text-[9px] font-black uppercase tracking-widest">Ver Post</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <a href="https://instagram.com/lagoaformosanomomento" target="_blank" rel="noopener noreferrer" className="text-white text-xs font-black uppercase underline decoration-pink-500">Ver todos os posts no Instagram</a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
