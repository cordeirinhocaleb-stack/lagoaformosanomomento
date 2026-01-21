import React from 'react';

interface ShareBarProps {
    title: string;
    url: string;
}

const ShareBar: React.FC<ShareBarProps> = ({ title, url }) => {
    const shareText = `${title} - Leia no Portal LFNM`;
    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert("Link copiado!");
    };
    const shareWhatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank');
    const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');

    const btnClass = "aspect-square rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg";

    return (
        <div className="grid grid-cols-4 gap-2">
            <button onClick={shareWhatsapp} className={`${btnClass} bg-green-500 text-white`} title="WhatsApp">
                <i className="fab fa-whatsapp text-xl"></i>
            </button>
            <button onClick={shareFacebook} className={`${btnClass} bg-blue-600 text-white`} title="Facebook">
                <i className="fab fa-facebook-f text-xl"></i>
            </button>
            <button onClick={shareTwitter} className={`${btnClass} bg-black dark:bg-zinc-800 text-white`} title="X (Twitter)">
                <i className="fab fa-x-twitter text-xl"></i>
            </button>
            <button onClick={copyLink} className={`${btnClass} bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-red-600 hover:text-white`} title="Copiar Link">
                <i className="fas fa-link text-xl"></i>
            </button>
        </div>
    );
};

export default ShareBar;