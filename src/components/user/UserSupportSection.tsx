import React, { useState, useEffect, useCallback } from 'react';
import { createSupportTicket, getUserTickets } from '../../services/supabaseService';
import { SupportTicket } from '../../types';

interface UserSupportSectionProps {
    userId: string;
    userName: string;
    // tickets agora virá do state interno se não passado
    // tickets?: SupportTicket[]; 
    // onCreateTicket?: ... removido pois usaremos direto o service

}

const SUPPORT_CATEGORIES = [
    { id: 'technical', label: 'Problema Técnico', icon: 'fa-bug', color: 'red' },
    { id: 'billing', label: 'Financeiro/Pagamento', icon: 'fa-dollar-sign', color: 'green' },
    { id: 'account', label: 'Conta/Perfil', icon: 'fa-user-circle', color: 'blue' },
    { id: 'content', label: 'Conteúdo/Publicação', icon: 'fa-newspaper', color: 'purple' },
    { id: 'feature', label: 'Solicitação de Recurso', icon: 'fa-lightbulb', color: 'amber' },
    { id: 'other', label: 'Outro', icon: 'fa-question-circle', color: 'gray' }
];

const UserSupportSection: React.FC<UserSupportSectionProps> = ({
    userId,
    userName
}) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        const data = await getUserTickets(userId);
        setTickets(data);
        setIsLoading(false);
    }, [userId]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleSubmit = async () => {
        if (!selectedCategory || !subject.trim() || !message.trim()) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const res = await createSupportTicket(userId, selectedCategory, subject, message);

        if (res.success) {
            alert('Ticket criado com sucesso! Nossa equipe entrará em contato em breve.');
            // Reset form
            setSelectedCategory('');
            setSubject('');
            setMessage('');
            setShowForm(false);
            loadTickets(); // Recarrega lista
        } else {
            alert('Erro ao criar ticket: ' + res.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Aberto';
            case 'in_progress': return 'Em Andamento';
            case 'resolved': return 'Resolvido';
            default: return status;
        }
    };

    const getCategoryInfo = (categoryId: string) => {
        return SUPPORT_CATEGORIES.find(c => c.id === categoryId) || SUPPORT_CATEGORIES[5];
    };

    const filteredTickets = tickets.filter(ticket => {
        if (statusFilter === 'all') return true;
        return ticket.status === statusFilter;
    });

    const handleViewDetails = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">
                    CENTRAL DE <span className="text-red-600">SUPORTE</span>
                </h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Precisa de ajuda? Estamos aqui para você!
                </p>
            </div>

            {/* Botão Novo Ticket */}
            <div className="mb-6">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg flex items-center gap-2"
                >
                    <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i>
                    {showForm ? 'Cancelar' : 'Novo Pedido de Suporte'}
                </button>
            </div>

            {/* Formulário de Novo Ticket */}
            {showForm && (
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8 animate-fadeIn">
                    <h2 className="text-xl font-black uppercase mb-6">Criar Novo Ticket</h2>

                    {/* Seleção de Categoria */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">
                            Categoria do Problema
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SUPPORT_CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedCategory === category.id
                                        ? `border-${category.color}-500 bg-${category.color}-50`
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <i className={`fas ${category.icon} text-lg mb-2 text-${category.color}-600`}></i>
                                    <p className="text-xs font-bold text-gray-900">{category.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assunto */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                            Assunto
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ex: Não consigo publicar anúncio"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-black focus:outline-none"
                        />
                    </div>

                    {/* Mensagem */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                            Descreva o Problema
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Descreva detalhadamente o problema ou sua solicitação..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-black focus:outline-none resize-none"
                        />
                    </div>

                    {/* Botão Enviar */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-black text-white py-4 rounded-xl text-xs font-black uppercase hover:bg-green-600 transition-all shadow-lg"
                    >
                        <i className="fas fa-paper-plane mr-2"></i>
                        Enviar Pedido de Suporte
                    </button>
                </div>
            )}

            {/* Lista de Tickets */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black uppercase">Meus Tickets ({filteredTickets.length})</h2>

                    {/* Filtros de Status */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setStatusFilter('open')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === 'open'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                        >
                            Abertos
                        </button>
                        <button
                            onClick={() => setStatusFilter('in_progress')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === 'in_progress'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                }`}
                        >
                            Em Andamento
                        </button>
                        <button
                            onClick={() => setStatusFilter('resolved')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === 'resolved'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                        >
                            Resolvidos
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Carregando tickets...</div>
                ) : filteredTickets.length > 0 ? (
                    <div className="space-y-4">
                        {filteredTickets.map((ticket) => {
                            const categoryInfo = getCategoryInfo(ticket.category);
                            return (
                                <div
                                    key={ticket.id}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => handleViewDetails(ticket)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl bg-${categoryInfo.color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <i className={`fas ${categoryInfo.icon} text-lg text-${categoryInfo.color}-600`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-black text-gray-900">{ticket.subject}</h3>
                                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                                                        {getStatusLabel(ticket.status)}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-medium mb-2">{categoryInfo.label}</p>
                                                <p className="text-xs text-gray-700 line-clamp-2">{ticket.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="text-[9px] text-gray-400 font-medium">
                                            <i className="fas fa-clock mr-1"></i>
                                            Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        <button className="text-[9px] font-black uppercase text-red-600 group-hover:text-black transition-colors flex items-center gap-1">
                                            Ver Detalhes <i className="fas fa-chevron-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                        <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-sm font-bold text-gray-400 uppercase mb-2">
                            {statusFilter === 'all' ? 'Nenhum ticket de suporte' : `Nenhum ticket ${getStatusLabel(statusFilter)}`}
                        </p>
                        <p className="text-xs text-gray-400">
                            {statusFilter === 'all'
                                ? 'Clique em "Novo Pedido de Suporte" para criar seu primeiro ticket'
                                : 'Tente outro filtro para ver mais tickets'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Detalhes do Ticket */}
            {showDetailModal && selectedTicket && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-white/10" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${getStatusColor(selectedTicket.status).replace('text-', 'bg-').replace('border-', 'text-')}`}>
                                        {getStatusLabel(selectedTicket.status)}
                                    </span>
                                    <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <h2 className="text-2xl font-black uppercase">{selectedTicket.subject}</h2>
                                <p className="text-sm text-gray-400 mt-2">
                                    {getCategoryInfo(selectedTicket.category).label} • Criado em {new Date(selectedTicket.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Mensagem Original</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                            </div>

                            {selectedTicket.status === 'resolved' ? (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                                    <p className="text-xs text-green-600 font-bold uppercase">Ticket Resolvido</p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                    <i className="fas fa-hourglass-half text-blue-500 text-2xl mb-2"></i>
                                    <p className="text-xs text-blue-600 font-bold uppercase">Aguardando resposta da equipe</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-red-600 transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSupportSection;
