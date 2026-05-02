// Persists AI provider API keys (OpenAI / Gemini) encrypted with the OS-level
// safeStorage primitive (DPAPI on Windows, Keychain on macOS, Secret Service
// on Linux). The plaintext key never reaches disk; only the renderer obtains
// it through the exposed IPC channel after Electron decrypts it on demand.
import { app, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

type Provider = 'openai' | 'gemini';

interface EncryptedKeyStore {
    openai?: string;
    gemini?: string;
}

const STORE_FILENAME = 'ai-keys.json';
const FILE_ENCODING_UTF8 = 'utf8';
const ENCRYPTED_BUFFER_ENCODING = 'base64';

function getStoreFilePath(): string {
    return path.join(app.getPath('userData'), STORE_FILENAME);
}

function readStore(): EncryptedKeyStore {
    const storeFilePath = getStoreFilePath();
    if (!fs.existsSync(storeFilePath)) {
        return {};
    }
    try {
        const fileContents = fs.readFileSync(storeFilePath, FILE_ENCODING_UTF8);
        return JSON.parse(fileContents) as EncryptedKeyStore;
    } catch (error) {
        console.error('Failed to read AI key store:', error);
        return {};
    }
}

function writeStore(store: EncryptedKeyStore): void {
    const storeFilePath = getStoreFilePath();
    const serializedStore = JSON.stringify(store, null, 2);
    fs.writeFileSync(storeFilePath, serializedStore, FILE_ENCODING_UTF8);
}

function ensureEncryptionAvailable(): void {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error(
            'OS-level encryption is unavailable; refusing to handle AI keys in plaintext'
        );
    }
}

export function saveKey(provider: Provider, plaintextKey: string): void {
    ensureEncryptionAvailable();
    const encryptedBuffer = safeStorage.encryptString(plaintextKey);
    const encryptedBase64 = encryptedBuffer.toString(ENCRYPTED_BUFFER_ENCODING);
    const store = readStore();
    store[provider] = encryptedBase64;
    writeStore(store);
}

export function getKey(provider: Provider): string | null {
    const store = readStore();
    const encryptedBase64 = store[provider];
    if (!encryptedBase64) {
        return null;
    }
    ensureEncryptionAvailable();
    try {
        const encryptedBuffer = Buffer.from(encryptedBase64, ENCRYPTED_BUFFER_ENCODING);
        return safeStorage.decryptString(encryptedBuffer);
    } catch (error) {
        console.error(`Failed to decrypt ${provider} key:`, error);
        return null;
    }
}

export function deleteKey(provider: Provider): void {
    const store = readStore();
    delete store[provider];
    writeStore(store);
}
