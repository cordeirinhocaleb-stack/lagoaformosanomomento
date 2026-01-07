import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportMessage, getUserTickets, addTicketMessage, getTicketMessages, updateTicketStatus } from '../../../../services/supabaseService';
import { User } from '../../../../types'; // Assuming User type is here or pass current admin user

interface UserSupportPanelProps {
    userId: string;
    tickets?: SupportTicket[]; // Optional now as we fetch
    onCreateTicket?: (subject: string, message: string) => void;
}

const UserSupportPanel: React.FC<UserSupportPanelProps> = ({ userId }) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Simulação do usuário admin atual (precisaria ser passado via props idealmente, 
    // mas vamos assumir que quem vê isso é admin)
    const currentAdminId = (JSON.parse(localStorage.getItem('lfnm_user') || '{}') as any).id;

    useEffect(() => {
        loadTickets();
    }, [userId]);

    useEffect(() => {
        if (selectedTicket) {
            loadMessages(selectedTicket.id);
        }
    }, [selectedTicket]);

    const loadTickets = async () => {
        setIsLoading(true);
        const data = await getUserTickets(userId);
        setTickets(data);
        setIsLoading(false);
    };

    const loadMessages = async (ticketId: string) => {
        const msgs = await getTicketMessages(ticketId);
        setMessages(msgs);
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !replyText.trim() || !currentAdminId) {return;}

        const res = await addTicketMessage(selectedTicket.id, currentAdminId, replyText, true);
        if (res.success) {
            setReplyText('');
            loadMessages(selectedTicket.id);
            // Atualiza status localmente
            setSelectedTicket({ ...selectedTicket, status: 'in_progress', updated_at: new Date().toISOString() });
            loadTickets(); // Atualiza lista
        } else {
            alert("Erro ao enviar resposta: " + res.message);
        }
    };

    const handleResolve = async () => {
        if (!selectedTicket) {return;}
        await updateTicketStatus(selectedTicket.id, 'resolved');
        setSelectedTicket({ ...selectedTicket, status: 'resolved' });
        loadTickets();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <i className="fas fa-headset"></i> Suporte ({tickets.length})
                </h3>
                {selectedTicket && (
                    <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-[9px] font-bold text-gray-500 hover:text-black uppercase"
                    >
                        <i className="fas fa-arrow-left mr-1"></i> Voltar
                    </button>
                )}
            </div>

            {!selectedTicket ? (
                // Lista de Tickets
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-gray-900">{ticket.subject}</span>
                                            <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${getStatusColor(ticket.status)}`}>
                                                {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Respondido' : 'Resolvido'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{ticket.category}</span>
                                            <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-300 group-hover:text-black transition-colors"></i>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                            <p className="text-xs text-gray-400">Nenhum ticket encontrado.</p>
                        </div>
                    )}
                </div>
            ) : (
                // Detalhe do Ticket (Chat)
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-96">
                    {/* Header do Chat */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{selectedTicket.subject}</h4>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">{selectedTicket.category}</span>
                        </div>
                        {selectedTicket.status !== 'resolved' && (
                            <button
                                onClick={handleResolve}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase hover:bg-green-200"
                            >
                                <i className="fas fa-check mr-1"></i> Resolver
                            </button>
                        )}
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.is_admin
                                    ? 'bg-black text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    <p>{msg.message}</p>
                                    <span className={`text-[8px] block mt-1 opacity-70 ${msg.is_admin ? 'text-gray-300' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input de Resposta */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Escreva uma resposta..."
                                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-black focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                            />
                            <button
                                onClick={handleSendReply}
                                disabled={!replyText.trim()}
                                className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center disabled:opacity-50 hover:bg-green-600 transition-colors"
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSupportPanel;
