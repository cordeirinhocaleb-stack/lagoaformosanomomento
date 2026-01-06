
import React from 'react';
import { PERMISSION_SCHEMA } from '../constants';

interface UserPermissionsPanelProps {
  permissions: Record<string, boolean>;
  onTogglePermission: (key: string) => void;
  onSave: () => void;
}

const UserPermissionsPanel: React.FC<UserPermissionsPanelProps> = ({ permissions, onTogglePermission, onSave }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-24">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
            <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                <i className="fas fa-info-circle mr-1"></i> Defina exatamente o que este usuário pode acessar no painel. Desenvolvedores têm acesso total automático.
            </p>
        </div>

        {PERMISSION_SCHEMA.map(group => (
            <div key={group.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-900 uppercase mb-4 flex items-center gap-2">
                    <i className={`fas ${group.icon} text-gray-400`}></i> 
                    {group.label}
                </h3>
                <div className="space-y-4">
                    {group.actions.map(action => (
                        <div key={action.key} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600">{action.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={permissions[action.key] || false}
                                    onChange={() => onTogglePermission(action.key)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-end rounded-b-[inherit]">
            <button 
                onClick={onSave}
                className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-colors shadow-lg w-full md:w-auto"
            >
                Salvar Permissões
            </button>
        </div>
    </div>
  );
};

export default UserPermissionsPanel;
