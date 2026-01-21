import React, { useState, useEffect } from 'react';

const BackToTopButton: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisible = () => setVisible(window.scrollY > 500);
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    if (!visible) {return null;}

    return (
        <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition-colors animate-fadeIn"
        >
            <i className="fas fa-arrow-up"></i>
        </button>
    );
};

export default BackToTopButton;