
import React from 'react';
import { AuditLog, User } from '../../../../types';

interface UserAuditPanelProps {
    logs: AuditLog[];
    isLoading: boolean;
    selectedUser: User;
    darkMode?: boolean;
}

const UserAuditPanel: React.FC<UserAuditPanelProps> = ({ logs, isLoading, selectedUser, darkMode = false }) => {
    return (
        <div className="relative animate-fadeIn pb-24">
            <h3 className={`text-xs font-black uppercase mb-4 sticky top-0 py-2 z-10 ${darkMode ? 'text-white bg-[#0F0F0F]' : 'text-gray-900 bg-white'}`}>
                Histórico de Ações
            </h3>

            {isLoading ? (
                <div className="text-center py-10">
                    <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-8 h-8 animate-coin object-contain mx-auto" alt="Loading" />
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Carregando Auditoria...</p>
                </div>
            ) : (
                <div className="space-y-8 relative">
                    <div className={`absolute left-3 top-2 bottom-0 w-0.5 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}></div>
                    {logs.filter(log => log.userId === selectedUser.id || log.userName === selectedUser.name).map((log, idx) => (
                        <div key={idx} className="relative pl-10 group">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-all ${log.action.includes('failed') || log.action.includes('delete') ? 'bg-red-500' : 'bg-blue-500 group-hover:scale-110'} ${darkMode ? 'border-black' : 'border-white'}`}></div>
                            <p className={`text-xs font-black leading-tight mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{log.details}</p>
                            <div className="flex gap-2 text-[9px] font-bold text-gray-400 uppercase">
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                <span>•</span>
                                <span className="text-gray-500">{log.action}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserAuditPanel;
