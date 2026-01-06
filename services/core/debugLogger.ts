type LogListener = (log: string) => void;

class DebugLogger {
    private logs: string[] = [];
    private listeners: LogListener[] = [];

    log(message: string, data?: any) {
        const timestamp = new Date().toLocaleTimeString();
        let formattedMsg = `[${timestamp}] ${message}`;
        if (data) {
            try {
                formattedMsg += `\n${JSON.stringify(data, null, 2)}`;
            } catch (e) {
                formattedMsg += ` [Data serialization failed]`;
            }
        }

        this.logs.unshift(formattedMsg); // Add to top
        if (this.logs.length > 50) this.logs.pop(); // Keep last 50

        this.notify();

        // Also log to browser console as backup
        console.log(message, data || '');
    }

    getLogs() {
        return this.logs;
    }

    subscribe(listener: LogListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        // Simple notification, in React we might just trigger a re-fetch of logs
        this.listeners.forEach(l => l(this.logs[0]));
    }

    clear() {
        this.logs = [];
        this.notify();
    }
}

export const logger = new DebugLogger();
