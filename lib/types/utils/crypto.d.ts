/**
 * Utilitários para operações criptográficas
 */
export declare class CryptoUtils {
    /**
     * Valida uma chave PEM
     */
    static validatePemKey(key: string, type?: 'PUBLIC KEY' | 'PRIVATE KEY'): boolean;
    /**
     * Criptografa conteúdo usando chave privada RSA
     */
    static encryptWithPrivateKey(content: string, privateKey: string): string;
    /**
     * Gera assinatura RSA SHA1
     */
    static generateSignature(params: Record<string, any>, privateKey: string): string;
    /**
     * Verifica assinatura usando chave pública
     */
    static verifySignature(params: Record<string, any>, signature: string, publicKey: string): boolean;
    /**
     * Gera um número de requisição aleatório
     */
    static generateRequestNo(): string;
    /**
     * Gera timestamp no formato GMT+1
     */
    static generateTimestamp(): string;
    /**
     * Gera um número único de pedido
     */
    static generateUniqueOrderNo(prefix?: string): string;
}
//# sourceMappingURL=crypto.d.ts.map