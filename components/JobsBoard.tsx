import React from 'react';
import { User } from '../types';

interface JobsBoardProps {
    isAdmin: boolean;
    onUpdateUser: (user: User) => void;
    currentUser: User;
    darkMode?: boolean;
}

const JobsBoard: React.FC<JobsBoardProps> = ({ darkMode = false }) => {
    return (
        <div className={`p-6 rounded-2xl transition-colors ${darkMode ? 'bg-[#0F0F0F] text-white border border-white/5' : 'bg-white text-gray-900 shadow-sm'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vagas de Emprego</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Módulo de vagas em construção. A lógica foi movida para Pages/Jobs, mas este componente é mantido para compatibilidade com o painel Admin.</p>
        </div>
    );
};

export default JobsBoard;