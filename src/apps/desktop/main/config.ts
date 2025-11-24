class Config {
    getBoolEnv(key: string, defaultValue: boolean = false): boolean {
        if (Object.prototype.hasOwnProperty.call(process.env, key)) {
            return process.env[key] === 'true';
        }
        return defaultValue;
    }

    getStringEnv(key: string): string {
        return process.env[key] || '';
    }

    getNumberEnv(key: string): number {
        return parseInt(process.env[key] || '0');
    }
}
export default new Config();