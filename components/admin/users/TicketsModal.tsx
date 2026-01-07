
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, SupportTicket, SupportMessage } from '../../../types';
import { getAllTickets, getTicketMessages, addTicketMessage, updateTicketStatus } from '../../../services/supabaseService';

interface TicketsModalProps {
    currentUser: User;
    onClose: () => void;
    onOpenProfile: (user: User) => void;
    darkMode?: boolean;
}

const TicketsModal: React.FC<TicketsModalProps> = ({ currentUser, onClose, onOpenProfile, darkMode = false }) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            loadMessages(selectedTicket.id);
            // Poll for new messages every 10s
            const interval = setInterval(() => loadMessages(selectedTicket.id), 10000);
            return () => clearInterval(interval);
        }
    }, [selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadTickets = async () => {
        setIsLoading(true);
        const data = await getAllTickets();
        // Sort by status (open/in_progress first) logic
        const sorted = data.sort((a, b) => {
            if (a.status !== 'resolved' && b.status === 'resolved') { return -1; }
            if (a.status === 'resolved' && b.status !== 'resolved') { return 1; }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTickets(sorted);
        setIsLoading(false);
    };

    const loadMessages = async (ticketId: string) => {
        const msgs = await getTicketMessages(ticketId);
        setMessages(msgs);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedTicket) { return; }

        setSending(true);
        try {
            const success = await addTicketMessage(selectedTicket.id, currentUser.id, newMessage, true);
            if (success) {
                setNewMessage('');
                await loadMessages(selectedTicket.id);
                // If ticket was new, mark as in_progress when admin replies
                if (selectedTicket.status === 'open') {
                    await updateStatus('in_progress');
                }
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar mensagem.");
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (status: 'open' | 'in_progress' | 'resolved') => {
        if (!selectedTicket) { return; }
        const success = await updateTicketStatus(selectedTicket.id, status);
        if (success) {
            setSelectedTicket({ ...selectedTicket, status });
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status } : t));
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className={`w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex overflow-hidden ${darkMode ? 'bg-zinc-900 ring-1 ring-white/10' : 'bg-white'}`}>

                {/* LISTA DE TICKETS (SIDEBAR) */}
                <div className={`w-1/3 border-r flex flex-col ${darkMode ? 'border-white/5 bg-zinc-900/50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className={`p-6 border-b ${darkMode ? 'border-white/5 bg-zinc-900' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chamados</h2>
                            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-500 text-white' : 'bg-gray-100 hover:bg-red-100 hover:text-red-600'}`}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                            <input
                                type="text"
                                placeholder="Filtrar tickets..."
                                className={`w-full border-none rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 ring-red-500/20 ${darkMode ? 'bg-white/5 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900'}`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-400">
                                <i className="fas fa-circle-notch fa-spin mb-2"></i>
                                <p className="text-[10px] font-bold uppercase">Carregando...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <i className="fas fa-inbox text-2xl mb-2 opacity-50"></i>
                                <p className="text-[10px] font-bold uppercase">Nenhum chamado.</p>
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === ticket.id
                                        ? `border-red-500 shadow-md transform scale-[1.02] ${darkMode ? 'bg-white/5' : 'bg-white'}`
                                        : `${darkMode ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100' : 'bg-white border-gray-200 opacity-70 hover:opacity-100'}`
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'bg-red-100 text-red-600' : ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                            {ticket.status === 'open' ? 'Novo' : ticket.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className={`text-sm font-bold mb-1 line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ticket.subject}</h4>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}
                                            onClick={(e) => { e.stopPropagation(); ticket.user && onOpenProfile(ticket.user); }}
                                            title="Ver Perfil"
                                        >
                                            {ticket.user?.avatar ? <img src={ticket.user.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-[9px] text-gray-400"></i>}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium truncate">{ticket.user?.name || 'Usuário Desconhecido'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* CONTEÚDO DO CHAT (MAIN) */}
                <div className={`flex-1 flex flex-col relative ${darkMode ? 'bg-zinc-950' : 'bg-[#f0f2f5]'}`}>
                    {selectedTicket ? (
                        <>
                            {/* Header do Chat */}
                            <div className={`p-4 border-b flex items-center justify-between shadow-sm z-10 ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner cursor-pointer hover:ring-2 ring-blue-500 transition-all ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                                        onClick={() => selectedTicket.user && onOpenProfile(selectedTicket.user)}
                                        title="Ver Perfil Completo"
                                    >
                                        {selectedTicket.user?.avatar ? <img src={selectedTicket.user.avatar} className="w-full h-full object-cover rounded-full" /> : <i className="fas fa-user text-gray-400"></i>}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.subject}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {selectedTicket.user?.name} &bull; {selectedTicket.category}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedTicket.status !== 'resolved' ? (
                                        <button
                                            onClick={() => updateStatus('resolved')}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition-colors flex items-center gap-2"
                                        >
                                            <i className="fas fa-check"></i> Resolver
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateStatus('in_progress')}
                                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-200 transition-colors flex items-center gap-2"
                                        >
                                            <i className="fas fa-undo"></i> Reabrir
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Área de Mensagens */}
                            <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${darkMode ? 'bg-zinc-950' : "bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]"}`}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.is_admin; // Assumindo que o usuário atual é admin neste contexto
                                    return (
                                        <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-4 rounded-2xl shadow-sm text-sm ${isMe
                                                    ? `${darkMode ? 'bg-white/10 text-white border-white/5' : 'bg-white text-gray-800 border-gray-100'} rounded-tr-none border`
                                                    : 'bg-blue-600 text-white rounded-tl-none'
                                                    }`}>
                                                    {msg.message}
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input de Mensagem */}
                            <div className={`p-4 border-t ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200'}`}>
                                <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
                                    <div className={`flex-1 rounded-2xl p-2 focus-within:ring-2 ring-blue-100 transition-all border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-100'}`}>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Escreva uma resposta..."
                                            className={`w-full bg-transparent border-none resize-none px-4 py-2 text-sm focus:ring-0 max-h-32 ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-700'}`}
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${sending || !newMessage.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                                    >
                                        {sending ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <i className="fas fa-comments text-4xl text-gray-300"></i>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">Selecione um chamado para iniciar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TicketsModal;
