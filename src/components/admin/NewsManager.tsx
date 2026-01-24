import React, { useState, useMemo } from 'react';
import { NewsItem, User, SystemSettings } from '../../types';
import EditorTab from './EditorTab';
import NewsFilterHeader from './news/NewsFilterHeader';
import NewsList from './news/NewsList';

interface NewsManagerProps {
    news: NewsItem[];
    user: User;
    onAddNews: (news: NewsItem) => void;
    onUpdateNews: (news: NewsItem) => void;
    onDeleteNews: (id: string) => void;
    systemSettings: SystemSettings;
    initialNewsToEdit?: NewsItem | null;
    initialFilter?: string;
    darkMode?: boolean;
    onEditorToolsChange?: (isOpen: boolean) => void;
}

const NewsManager: React.FC<NewsManagerProps> = ({ news, user, onAddNews, onUpdateNews, onDeleteNews, systemSettings, initialNewsToEdit, initialFilter, darkMode = false, onEditorToolsChange }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState(initialFilter || 'Todas');
    const [showHidden, setShowHidden] = useState(false);

    // Deep Linking Effect
    React.useEffect(() => {
        if (initialNewsToEdit) {
            setSelectedNews(initialNewsToEdit);
            setView('editor');
        }
    }, [initialNewsToEdit]);

    const categories = ['Todas', 'Postagens do Site', 'Brasil', 'Mundo', ...Array.from(new Set(news.filter(n => !['Brasil', 'Mundo'].includes(n.category)).map(n => n.category))).sort()];

    // Filter Logic
    const filteredNews = useMemo(() => {
        return news.filter(item => {
            // Filter out hidden news unless showHidden is true
            if (!showHidden && item.hidden) return false;

            const matchesSearch = (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            let matchesCategory = true;
            if (filterCategory === 'Postagens do Site') {
                matchesCategory = item.source === 'site' || (!item.source && item.category !== 'Brasil' && item.category !== 'Mundo'); // Fallback if source empty
            } else if (filterCategory === 'Minhas Publicações') {
                matchesCategory = item.author === user.name || item.authorId === user.id;
            } else if (filterCategory !== 'Todas') {
                matchesCategory = item.category === filterCategory;
            }

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }, [news, searchTerm, filterCategory, showHidden]);

    // Pagination
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const currentNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, showHidden]);

    const [editorKey, setEditorKey] = useState(0);

    const handleEdit = (item: NewsItem) => {
        setSelectedNews(item);
        setView('editor');
    };

    const handleCreate = () => {
        setSelectedNews(null);
        setEditorKey(prev => prev + 1);
        setView('editor');
    };

    const handleSave = (savedNews: NewsItem, isUpdate: boolean) => {
        if (isUpdate) {
            onUpdateNews(savedNews);
        } else {
            onAddNews(savedNews);
        }
        setSelectedNews(savedNews);
        // CRITICAL: Do NOT close editor automatically. 
        // We rely on PublishSuccessModal in EditorTab to give user options.
        // setView('list'); 
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
            onDeleteNews(id);
        }
    };

    const handleToggleHidden = (item: NewsItem) => {
        const updatedItem = { ...item, hidden: !item.hidden };
        onUpdateNews(updatedItem);
    };

    if (view === 'editor') {
        return (
            <div className="h-[calc(100vh-5rem)] -m-4 md:-m-8 relative">
                <EditorTab
                    key={selectedNews?.id || `new_${editorKey}`}
                    user={user}
                    initialData={selectedNews}
                    onSave={handleSave}
                    onCreateNew={handleCreate}
                    onCancel={() => { setView('list'); setSelectedNews(null); }}
                    accessToken={null}
                    systemSettings={systemSettings}
                    darkMode={darkMode}
                    onEditorToolsChange={onEditorToolsChange}
                />
            </div>
        );
    }

    return (
        <div className={`space-y-6 animate-fade-in transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <NewsFilterHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                categories={categories}
                darkMode={darkMode}
                showHidden={showHidden}
                setShowHidden={setShowHidden}
                onCreate={handleCreate}
            />

            <NewsList
                currentNews={currentNews}
                filteredNewsLength={filteredNews.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalPages={totalPages}
                darkMode={darkMode}
                onPageChange={setCurrentPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleHidden={handleToggleHidden}
            />
        </div>
    );
};

export default NewsManager;
