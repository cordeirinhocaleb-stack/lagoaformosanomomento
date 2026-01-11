/**
 * VideoTrimSelector Component
 * WhatsApp-style video trim selector with timeline and draggable handles
 */

import React, { useState, useRef, useEffect } from 'react';

interface VideoTrimSelectorProps {
    videoUrl: string;
    duration: number;
    initialStart?: number;
    initialEnd?: number;
    onTrimChange: (start: number, end: number) => void;
    maxDuration?: number; // Maximum allowed trim duration
}

const VideoTrimSelector: React.FC<VideoTrimSelectorProps> = ({
    videoUrl,
    duration,
    initialStart = 0,
    initialEnd,
    onTrimChange,
    maxDuration = 60 // Default 60 seconds max
}) => {
    const [trimStart, setTrimStart] = useState(initialStart);
    const [trimEnd, setTrimEnd] = useState(initialEnd || Math.min(duration, maxDuration));
    const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate position percentage
    const getPositionPercent = (time: number): number => {
        return (time / duration) * 100;
    };

    // Handle mouse/touch move
    const handleMove = (clientX: number) => {
        if (!timelineRef.current || !isDragging) {return;}

        const rect = timelineRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newTime = (percent / 100) * duration;

        if (isDragging === 'start') {
            const maxStart = trimEnd - 1; // At least 1 second
            setTrimStart(Math.min(newTime, maxStart));
        } else if (isDragging === 'end') {
            const minEnd = trimStart + 1; // At least 1 second
            const maxEnd = Math.min(duration, trimStart + maxDuration);
            setTrimEnd(Math.max(minEnd, Math.min(newTime, maxEnd)));
        }
    };

    // Mouse events
    useEffect(() => {
        if (!isDragging) {return;}

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const handleMouseUp = () => {
            setIsDragging(null);
            onTrimChange(trimStart, trimEnd);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, trimStart, trimEnd]);

    const selectedDuration = trimEnd - trimStart;
    const startPercent = getPositionPercent(trimStart);
    const endPercent = getPositionPercent(trimEnd);
    const widthPercent = endPercent - startPercent;

    return (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <i className="fas fa-cut text-white text-xs"></i>
                    </div>
                    Recortar Vídeo
                </label>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {formatTime(selectedDuration)} selecionado
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={timelineRef}
                className="relative h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
            >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200"></div>

                {/* Selected range */}
                <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-40 border-l-2 border-r-2 border-blue-600"
                    style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`
                    }}
                ></div>

                {/* Start handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize group hover:w-2 transition-all"
                    style={{ left: `${startPercent}%` }}
                    onMouseDown={() => setIsDragging('start')}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-10 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-grip-vertical text-white text-xs"></i>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {formatTime(trimStart)}
                    </div>
                </div>

                {/* End handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize group hover:w-2 transition-all"
                    style={{ left: `${endPercent}%` }}
                    onMouseDown={() => setIsDragging('end')}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-10 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-grip-vertical text-white text-xs"></i>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {formatTime(trimEnd)}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <span>Duração total: {formatTime(duration)}</span>
                {selectedDuration > maxDuration && (
                    <span className="text-amber-600 font-bold">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Máximo {maxDuration}s
                    </span>
                )}
            </div>
        </div>
    );
};

export default VideoTrimSelector;
