/**
 * Upload Queue Service
 * Manages sequential upload of files from IndexedDB to final destinations (YouTube/Cloudinary)
 * Ensures minimum 5 seconds per upload for rate limiting
 */

export interface UploadQueueItem {
    id: string;
    localId: string; // ID in IndexedDB
    fileName: string;
    fileSize: number;
    destination: 'youtube' | 'cloudinary';
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    finalUrl?: string;
    error?: string;
    metadata?: any; // YouTube metadata if applicable
}

export interface UploadProgress {
    currentItem: UploadQueueItem | null;
    completedCount: number;
    totalCount: number;
    overallProgress: number;
}

type ProgressCallback = (progress: UploadProgress) => void;

class UploadQueueService {
    private queue: UploadQueueItem[] = [];
    private isProcessing = false;
    private currentProgress: UploadProgress = {
        currentItem: null,
        completedCount: 0,
        totalCount: 0,
        overallProgress: 0
    };

    /**
     * Add files from IndexedDB to upload queue
     */
    async addLocalFilesToQueue(files: Array<{
        localId: string;
        fileName: string;
        fileSize: number;
        destination: 'youtube' | 'cloudinary';
        metadata?: any;
    }>): Promise<void> {
        const items: UploadQueueItem[] = files.map(file => ({
            id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            localId: file.localId,
            fileName: file.fileName,
            fileSize: file.fileSize,
            destination: file.destination,
            status: 'pending',
            progress: 0,
            metadata: file.metadata
        }));

        this.queue.push(...items);
        this.currentProgress.totalCount = this.queue.length;
    }

    /**
     * Process upload queue sequentially
     */
    async processQueue(onProgress: ProgressCallback): Promise<Map<string, string>> {
        if (this.isProcessing) {
            throw new Error('Queue is already being processed');
        }

        this.isProcessing = true;
        const urlMap = new Map<string, string>(); // localId -> finalUrl

        try {
            for (const item of this.queue) {
                this.currentProgress.currentItem = item;
                onProgress(this.currentProgress);

                const startTime = Date.now();

                try {
                    // Update status to uploading
                    item.status = 'uploading';
                    onProgress(this.currentProgress);

                    // Upload file
                    const finalUrl = await this.uploadLocalFile(item, (progress) => {
                        item.progress = progress;
                        this.updateOverallProgress();
                        onProgress(this.currentProgress);
                    });

                    // Success
                    item.status = 'completed';
                    item.progress = 100;
                    item.finalUrl = finalUrl;
                    urlMap.set(item.localId, finalUrl);

                    this.currentProgress.completedCount++;

                } catch (error) {
                    // Failure
                    item.status = 'failed';
                    item.error = error instanceof Error ? error.message : String(error);
                    console.error(`❌ Upload failed for ${item.fileName}:`, error);
                }

                // Ensure minimum 5 seconds per upload
                await this.ensureMinimumDelay(startTime, 5000);

                this.updateOverallProgress();
                onProgress(this.currentProgress);
            }

            return urlMap;

        } finally {
            this.isProcessing = false;
            this.currentProgress.currentItem = null;
        }
    }

    /**
     * Upload a single file from IndexedDB to its destination
     */
    private async uploadLocalFile(
        item: UploadQueueItem,
        onProgress: (progress: number) => void
    ): Promise<string> {
        // Import services dynamically to avoid circular dependencies
        const { getLocalFile } = await import('./storage/localStorageService');
        const { uploadToCloudinary } = await import('./cloudinaryService');
        const { uploadVideoToYouTube } = await import('./upload/youtubeVideoService');

        // Load file from IndexedDB
        const file = await getLocalFile(item.localId);
        if (!file) {
            throw new Error(`File not found in local storage: ${item.localId}`);
        }

        // Upload to destination
        if (item.destination === 'youtube') {
            // YouTube upload
            if (!item.metadata) {
                throw new Error('YouTube metadata is required for YouTube uploads');
            }

            // Get access token (should be stored in config)
            const accessToken = await this.getYouTubeAccessToken();
            if (!accessToken) {
                throw new Error('YouTube access token not found. Please authenticate first.');
            }

            const result = await uploadVideoToYouTube(
                file,
                item.metadata,
                accessToken,
                (progress) => {
                    onProgress(progress.percentage);
                }
            );

            return result.url;

        } else {
            // Cloudinary upload
            // Note: Cloudinary service doesn't support progress callback yet
            // We'll simulate progress for now
            onProgress(50); // Halfway

            const url = await uploadToCloudinary(
                file,
                'news_media',
                'upload_queue'
            );

            onProgress(100); // Complete
            return url;
        }
    }

    /**
     * Get YouTube access token from stored config
     */
    private async getYouTubeAccessToken(): Promise<string | null> {
        // This should load from Supabase youtube_official_configs table
        // For now, return null (will be implemented when we create the config modal)
        return null;
    }

    /**
     * Ensure minimum delay between uploads
     */
    private async ensureMinimumDelay(startTime: number, minimumMs: number): Promise<void> {
        const elapsed = Date.now() - startTime;
        if (elapsed < minimumMs) {
            await new Promise(resolve => setTimeout(resolve, minimumMs - elapsed));
        }
    }

    /**
     * Update overall progress percentage
     */
    private updateOverallProgress(): void {
        if (this.queue.length === 0) {
            this.currentProgress.overallProgress = 0;
            return;
        }

        const totalProgress = this.queue.reduce((sum, item) => sum + item.progress, 0);
        this.currentProgress.overallProgress = Math.round(totalProgress / this.queue.length);
    }

    /**
     * Get current queue status
     */
    getQueueStatus(): UploadProgress {
        return { ...this.currentProgress };
    }

    /**
     * Clear completed items from queue
     */
    clearCompleted(): void {
        this.queue = this.queue.filter(item => item.status !== 'completed');
        this.currentProgress.totalCount = this.queue.length;
        this.currentProgress.completedCount = 0;
        this.updateOverallProgress();
    }

    /**
     * Reset queue
     */
    reset(): void {
        this.queue = [];
        this.isProcessing = false;
        this.currentProgress = {
            currentItem: null,
            completedCount: 0,
            totalCount: 0,
            overallProgress: 0
        };
    }
}

// Singleton instance
export const uploadQueueService = new UploadQueueService();

export default uploadQueueService;
