import React, { useState, useEffect } from 'react';
import { createSupportTicket, getUserTickets, SupportTicket } from '../../services/supabaseService';

interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
    updated_at: string;
}

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

const UserSupportSection: React.FC<{ userId: string; userName: string }> = ({
    userId,
    userName
}) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadTickets();
    }, [userId]);

    const loadTickets = async () => {
        setIsLoading(true);
        const data = await getUserTickets(userId);
        setTickets(data);
        setIsLoading(false);
    };

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
                <h2 className="text-xl font-black uppercase mb-4">Meus Tickets ({tickets.length})</h2>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Carregando tickets...</div>
                ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map((ticket) => {
                            const categoryInfo = getCategoryInfo(ticket.category);
                            return (
                                <div
                                    key={ticket.id}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl bg-${categoryInfo.color}-100 flex items-center justify-center flex-shrink-0`}>
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
                                        <button className="text-[9px] font-black uppercase text-gray-400 hover:text-black transition-colors">
                                            Ver Detalhes <i className="fas fa-chevron-right ml-1"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                        <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-sm font-bold text-gray-400 uppercase mb-2">Nenhum ticket de suporte</p>
                        <p className="text-xs text-gray-400">
                            Clique em "Novo Pedido de Suporte" para criar seu primeiro ticket
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSupportSection;
