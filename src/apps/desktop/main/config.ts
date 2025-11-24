class Config {
    getBoolEnv(key: string): boolean {
        return process.env[key] === 'true';
    }

    getStringEnv(key: string): string {
        return process.env[key] || '';
    }

    getNumberEnv(key: string): number {
        return parseInt(process.env[key] || '0');
    }
}
export default new Config();