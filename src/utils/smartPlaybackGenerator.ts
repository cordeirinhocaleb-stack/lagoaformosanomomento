
/**
 * Smart Playback Segment Generator
 * Gera segmentos aleatórios ou distribuídos para reprodução inteligente de vídeos
 */

export interface PlaybackSegment {
    start: number; // segundos
    end: number;   // segundos
}

export type SegmentMode = 'random' | 'distributed';

export interface SmartPlaybackConfig {
    videoDuration: number;
    segmentDuration?: number; // padrão: 10s
    numSegments?: number;     // padrão: 5
    mode?: SegmentMode;       // padrão: 'random'
}

/**
 * Gera segmentos para Smart Playback
 */
export const generateSmartSegments = (config: SmartPlaybackConfig): PlaybackSegment[] => {
    const {
        videoDuration,
        segmentDuration = 10,
        numSegments = 5,
        mode = 'random'
    } = config;

    // Validações
    if (videoDuration <= 60) {
        console.warn('Smart Playback recomendado apenas para vídeos >1min');
        return [];
    }

    if (segmentDuration >= videoDuration) {
        console.warn('Duração do segmento maior que duração do vídeo');
        return [{ start: 0, end: videoDuration }];
    }

    const segments: PlaybackSegment[] = [];

    if (mode === 'random') {
        // Seleciona N pontos aleatórios no vídeo
        const usedRanges: Array<{ start: number; end: number }> = [];

        for (let i = 0; i < numSegments; i++) {
            let attempts = 0;
            let validSegment = false;
            let start = 0;

            // Tenta encontrar um segmento que não sobreponha com os existentes
            while (!validSegment && attempts < 50) {
                start = Math.random() * (videoDuration - segmentDuration);
                const end = start + segmentDuration;

                // Verifica se não sobrepõe com segmentos existentes
                const overlaps = usedRanges.some(range =>
                    (start >= range.start && start < range.end) ||
                    (end > range.start && end <= range.end) ||
                    (start <= range.start && end >= range.end)
                );

                if (!overlaps) {
                    validSegment = true;
                    usedRanges.push({ start, end });
                    segments.push({ start, end });
                }

                attempts++;
            }

            // Se não conseguiu encontrar segmento válido após 50 tentativas, usa qualquer um
            if (!validSegment) {
                const start = Math.random() * (videoDuration - segmentDuration);
                segments.push({ start, end: start + segmentDuration });
            }
        }
    } else {
        // Distribui uniformemente ao longo do vídeo
        const interval = videoDuration / (numSegments + 1);

        for (let i = 1; i <= numSegments; i++) {
            const start = interval * i;
            const end = Math.min(start + segmentDuration, videoDuration);
            segments.push({ start, end });
        }
    }

    // Ordena segmentos por tempo de início
    return segments.sort((a, b) => a.start - b.start);
};

/**
 * Valida se um segmento é válido
 */
export const isValidSegment = (segment: PlaybackSegment, videoDuration: number): boolean => {
    return (
        segment.start >= 0 &&
        segment.end <= videoDuration &&
        segment.start < segment.end
    );
};

/**
 * Calcula duração total dos segmentos
 */
export const getTotalSegmentDuration = (segments: PlaybackSegment[]): number => {
    return segments.reduce((total, segment) => total + (segment.end - segment.start), 0);
};

/**
 * Formata segmento para exibição
 */
export const formatSegment = (segment: PlaybackSegment): string => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return `${formatTime(segment.start)} - ${formatTime(segment.end)}`;
};

/**
 * Gera configuração padrão baseada na duração do vídeo
 */
export const getDefaultConfig = (videoDuration: number): SmartPlaybackConfig => {
    // Para vídeos muito longos, aumenta número de segmentos
    const numSegments = videoDuration > 300 ? 8 : 5; // 5min = 8 segmentos, senão 5

    return {
        videoDuration,
        segmentDuration: 10,
        numSegments,
        mode: 'random'
    };
};
