import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabaseService';
import { Job, User } from '../../types';
import JobFilterBar from './jobs/JobFilterBar';
import JobListTable from './jobs/JobListTable';
import JobEditModal from './jobs/JobEditModal';

interface JobManagerProps {
    currentUser: User;
    onUpdateUser?: (user: User) => void;
    darkMode?: boolean;
}

const JobManager: React.FC<JobManagerProps> = ({ currentUser: _currentUser, darkMode = true }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) { throw new Error("Supabase não inicializado"); }

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('postedAt', { ascending: false });

            if (error) { throw error; }
            setJobs(data || []);
        } catch (error) {
            console.error("Erro ao buscar vagas:", error); // eslint-disable-line no-console
            // alert("Erro ao carregar lista de vagas."); // Silent fail preferível na inicialização
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (job: Job) => {
        setSelectedJob(job);
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedJob(null);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (jobId: string) => {
        try {
            const supabase = getSupabase();
            if (!supabase) { throw new Error("Supabase não inicializado"); }

            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (error) { throw error; }

            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (error) {
            console.error("Erro ao deletar vaga:", error); // eslint-disable-line no-console
            alert("Falha ao deletar vaga.");
        }
    };

    const handleSave = async (jobId: string | undefined, data: Partial<Job>) => {
        const supabase = getSupabase();
        if (!supabase) { throw new Error("Supabase não inicializado"); }

        try {
            if (jobId) {
                // Update
                const { error } = await supabase
                    .from('jobs')
                    .update(data)
                    .eq('id', jobId);

                if (error) { throw error; }

                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...data } as Job : j));
            } else {
                // Create
                const newJob = {
                    ...data,
                    postedAt: new Date().toISOString()
                };

                const { data: createdJob, error } = await supabase
                    .from('jobs')
                    .insert([newJob])
                    .select()
                    .single();

                if (error) { throw error; }
                setJobs(prev => [createdJob, ...prev]);
            }
        } catch (error) {
            console.error("Erro na operação de vaga:", error); // eslint-disable-line no-console
            throw error;
        }
    };

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (job.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (job.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'active') { matchesStatus = job.isActive === true; }
        if (statusFilter === 'inactive') { matchesStatus = job.isActive === false; }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fadeIn">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gerenciar <span className="text-red-600">Vagas</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Total de {jobs.length} oportunidades cadastradas
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2`}
                >
                    <i className="fas fa-plus"></i> Nova Vaga
                </button>
            </header>

            <JobFilterBar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                darkMode={darkMode}
            />

            <JobListTable
                jobs={filteredJobs}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                darkMode={darkMode}
            />

            <JobEditModal
                job={selectedJob}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                darkMode={darkMode}
            />
        </div>
    );
};

export default JobManager;
