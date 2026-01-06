import React from 'react';
import { User } from '../types';

interface JobsBoardProps {
    isAdmin: boolean;
    onUpdateUser: (user: User) => void;
    currentUser: User;
}

const JobsBoard: React.FC<JobsBoardProps> = ({ isAdmin, currentUser }) => {
    return (
        <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Vagas de Emprego</h2>
            <p className="text-gray-500">Módulo de vagas em construção. A lógica foi movida para Pages/Jobs, mas este componente é mantido para compatibilidade com o painel Admin.</p>
        </div>
    );
};

export default JobsBoard;