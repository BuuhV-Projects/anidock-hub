import { v4 as uuidv4 } from 'uuid';

class Logger {
    private trace_id: string;
    private static instance: Logger;
    constructor(private readonly name: string, trace_id: string = uuidv4()) {
        this.name = name;
        this.trace_id = trace_id;
    }

    info(...message: unknown[]) {
        console.log(`[${this.name}] [${this.trace_id}]`, ...message);
    }

    warn(...message: unknown[]) {
        console.warn(`[${this.name}] [${this.trace_id}]`, ...message);
    }
    
    error(...message: unknown[]) {
        console.error(`[${this.name}] [${this.trace_id}]`, ...message);
    }
    static getInstance(name: string) {
        if (!Logger.instance) {
            Logger.instance = new Logger(name);
        }
        return Logger.instance;
    }
}

export { Logger };