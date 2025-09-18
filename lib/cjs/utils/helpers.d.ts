/**
 * Utilitários auxiliares
 */
export declare class Helpers {
    /**
     * Obtém o IP público da máquina
     */
    static getPublicIp(): Promise<string>;
    /**
     * Delay assíncrono
     */
    static delay(ms: number): Promise<void>;
    /**
     * Executa uma função com retry
     */
    static retry<T>(fn: () => Promise<T>, maxAttempts?: number, delayMs?: number): Promise<T>;
    /**
     * Sanitiza string removendo caracteres perigosos
     */
    static sanitizeString(input: string): string;
    /**
     * Formata valor monetário para exibição
     */
    static formatCurrency(amount: number, currency?: string): string;
    /**
     * Converte timestamp para data legível
     */
    static formatTimestamp(timestamp: string): string;
    /**
     * Verifica se uma string é JSON válida
     */
    static isValidJson(str: string): boolean;
    /**
     * Deep clone de objeto
     */
    static deepClone<T>(obj: T): T;
    /**
     * Mascara dados sensíveis para logs
     */
    static maskSensitiveData(data: any): any;
    /**
     * Constrói query string de forma segura
     */
    static buildQueryString(params: Record<string, any>): string;
    /**
     * Valida se uma string representa um número válido
     */
    static isNumeric(value: string): boolean;
    /**
     * Converte string para boolean de forma segura
     */
    static parseBoolean(value: string | boolean): boolean;
    /**
     * Gera hash MD5 de uma string
     */
    static md5Hash(input: string): string;
    /**
     * Executa timeout em promise
     */
    static withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
}
//# sourceMappingURL=helpers.d.ts.map