
/**
 * Smart Video Player Component
 * Plays random segments of videos >1min in loop (teaser effect)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlaybackSegment, generateSmartSegments, formatSegment } from '../../utils/smartPlaybackGenerator';

interface SmartVideoPlayerProps {
    src: string;
    smartPlayback: boolean;
    segments?: PlaybackSegment[];
    segmentDuration?: number;
    autoGenerate?: boolean;
    className?: string;
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    onLoadedMetadata?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
    style?: React.CSSProperties;
    videoStart?: number; // Manual trim start time
    videoEnd?: number;   // Manual trim end time
}

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
    src,
    smartPlayback,
    segments: providedSegments,
    segmentDuration = 10,
    autoGenerate = true,
    className = '',
    controls = false,
    muted = true,
    loop = true,
    onLoadedMetadata,
    style,
    videoStart,
    videoEnd
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [segments, setSegments] = useState<PlaybackSegment[]>(providedSegments || []);
    const [isReady, setIsReady] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    // Generate segments when video metadata is loaded
    useEffect(() => {
        const video = videoRef.current;
        if (!video) { return; }

        const handleLoadedMetadata = () => {
            const duration = video.duration;
            setVideoDuration(duration);
            setIsReady(true);

            // Auto-generate segments if enabled and duration >60s
            if (smartPlayback && autoGenerate && duration > 60 && (!providedSegments || providedSegments.length === 0)) {
                const generatedSegments = generateSmartSegments({
                    videoDuration: duration,
                    segmentDuration,
                    numSegments: 5,
                    mode: 'random'
                });
                setSegments(generatedSegments);
                console.log('🎬 Smart Playback ativado:', generatedSegments.map(formatSegment));
            }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, [smartPlayback, autoGenerate, segmentDuration, providedSegments]);

    // Update segments if provided externally
    useEffect(() => {
        if (providedSegments && providedSegments.length > 0) {
            setSegments(providedSegments);
        }
    }, [providedSegments]);

    // Handle segment playback
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !smartPlayback || segments.length === 0 || !isReady) { return; }

        const currentSegment = segments[currentSegmentIndex];
        if (!currentSegment) { return; }

        // Jump to segment start
        video.currentTime = currentSegment.start;

        const handleTimeUpdate = () => {
            if (video.currentTime >= currentSegment.end) {
                // Move to next segment (loop back to first if at end)
                const nextIndex = (currentSegmentIndex + 1) % segments.length;
                setCurrentSegmentIndex(nextIndex);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [smartPlayback, segments, currentSegmentIndex, isReady]);

    // Handle manual trim playback (videoStart/videoEnd)
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isReady) {return;}

        // If manual trim is set (videoStart and videoEnd provided)
        if (videoStart !== undefined && videoEnd !== undefined && videoEnd > videoStart) {
            // Set initial position to trim start
            if (video.currentTime < videoStart || video.currentTime > videoEnd) {
                video.currentTime = videoStart;
            }

            const handleTrimTimeUpdate = () => {
                // Loop back to start when reaching end
                if (video.currentTime >= videoEnd) {
                    video.currentTime = videoStart;
                    // Force play to ensure continuous loop
                    video.play().catch(err => console.log('Play error:', err));
                }
            };

            video.addEventListener('timeupdate', handleTrimTimeUpdate);
            return () => video.removeEventListener('timeupdate', handleTrimTimeUpdate);
        }
    }, [videoStart, videoEnd, isReady]);

    // Handle Tab Visibility (Resume playback when tab becomes active)
    useEffect(() => {
        const handleVisibilityChange = () => {
            const video = videoRef.current;
            if (!video) {return;}

            if (document.visibilityState === 'visible') {
                // Force layout recalculation
                video.style.display = 'none';
                video.offsetHeight; // trigger reflow
                video.style.display = 'block';

                // Resume playback
                video.play().catch(e => console.log('Resume play failed', e));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Normal playback (no smart playback)
    if (!smartPlayback || videoDuration <= 60) {
        return (
            <video
                ref={videoRef}
                src={src}
                className={className}
                controls={controls}
                muted={muted}
                loop={loop}
                autoPlay
                playsInline
                onLoadedMetadata={onLoadedMetadata}
                style={style}
            />
        );
    }

    // Smart playback
    return (
        <div className="relative">
            <video
                ref={videoRef}
                src={src}
                className={className}
                controls={controls}
                muted={muted}
                autoPlay
                playsInline
                onLoadedMetadata={onLoadedMetadata}
                style={style}
            />

            {/* Smart Playback Indicator */}
            {segments.length > 0 && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                    <i className="fas fa-magic"></i>
                    Smart Playback
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                        {currentSegmentIndex + 1}/{segments.length}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SmartVideoPlayer;
