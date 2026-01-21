import React from 'react';

const PrintButton: React.FC = () => {
    return (
        <button onClick={() => window.print()} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <i className="fas fa-print"></i>
        </button>
    );
};

export default PrintButton;