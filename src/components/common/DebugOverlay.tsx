import React, { useState, useEffect } from 'react';
import { logger } from '../../services/core/debugLogger';

interface DebugOverlayProps {
    isVisible?: boolean;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ isVisible = true }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Init logs
        setLogs([...logger.getLogs()]);

        // Subscribe
        const unsubscribe = logger.subscribe(() => {
            setLogs([...logger.getLogs()]);
        });
        return unsubscribe;
    }, []);

    if (!isVisible) {return null;}

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition"
                title="Debug Logs"
            >
                <i className="fas fa-bug"></i>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-[600px] z-[9999] bg-black/90 text-green-400 p-4 rounded-lg shadow-2xl border border-green-800 font-mono text-xs max-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
                <span className="font-bold flex items-center gap-2">
                    <i className="fas fa-terminal"></i> System Logs
                </span>
                <div className="flex gap-2">
                    <button onClick={() => logger.clear()} className="hover:text-white px-2">Limpar</button>
                    <button onClick={() => setIsExpanded(false)} className="hover:text-white px-2">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto flex-1 space-y-1">
                {logs.length === 0 && <span className="opacity-50">Aguardando logs...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all border-b border-white/10 pb-1">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DebugOverlay;
