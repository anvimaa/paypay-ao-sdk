import axios from 'axios';
/**
 * Utilitários auxiliares
 */
export class Helpers {
    /**
     * Obtém o IP público da máquina
     */
    static async getPublicIp() {
        try {
            const response = await axios.get('https://api.ipify.org?format=json', {
                timeout: 5000
            });
            return response.data.ip;
        }
        catch (error) {
            // Fallback para uma API alternativa
            try {
                const response = await axios.get('https://httpbin.org/ip', {
                    timeout: 5000
                });
                return response.data.origin;
            }
            catch (fallbackError) {
                throw new Error(`Falha ao obter IP da máquina: ${fallbackError.message}`);
            }
        }
    }
    /**
     * Delay assíncrono
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Executa uma função com retry
     */
    static async retry(fn, maxAttempts = 3, delayMs = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxAttempts) {
                    break;
                }
                await this.delay(delayMs * attempt);
            }
        }
        throw lastError;
    }
    /**
     * Sanitiza string removendo caracteres perigosos
     */
    static sanitizeString(input) {
        return input.replace(/[<>'"&]/g, '');
    }
    /**
     * Formata valor monetário para exibição
     */
    static formatCurrency(amount, currency = 'AOA') {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    /**
     * Converte timestamp para data legível
     */
    static formatTimestamp(timestamp) {
        try {
            return new Date(timestamp).toLocaleString('pt-AO');
        }
        catch {
            return timestamp;
        }
    }
    /**
     * Verifica se uma string é JSON válida
     */
    static isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Deep clone de objeto
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * Mascara dados sensíveis para logs
     */
    static maskSensitiveData(data) {
        const sensitiveFields = ['privateKey', 'password', 'secret', 'token', 'sign'];
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const masked = this.deepClone(data);
        const maskRecursive = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                        obj[key] = '***MASKED***';
                    }
                    else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        maskRecursive(obj[key]);
                    }
                }
            }
        };
        maskRecursive(masked);
        return masked;
    }
    /**
     * Constrói query string de forma segura
     */
    static buildQueryString(params) {
        const encoded = {};
        Object.keys(params)
            .sort((a, b) => a.localeCompare(b))
            .forEach((key) => {
            encoded[key] = encodeURIComponent(params[key]);
        });
        return Object.keys(encoded)
            .map(key => `${key}=${encoded[key]}`)
            .join('&');
    }
    /**
     * Valida se uma string representa um número válido
     */
    static isNumeric(value) {
        return !isNaN(Number(value)) && isFinite(Number(value));
    }
    /**
     * Converte string para boolean de forma segura
     */
    static parseBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        const lowercased = value.toString().toLowerCase();
        return lowercased === 'true' || lowercased === '1' || lowercased === 'yes';
    }
    /**
     * Gera hash MD5 de uma string
     */
    static md5Hash(input) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(input).digest('hex');
    }
    /**
     * Executa timeout em promise
     */
    static withTimeout(promise, timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    }
}
//# sourceMappingURL=helpers.js.map