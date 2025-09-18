import * as crypto from 'crypto';
import * as forge from 'node-forge';
/**
 * Utilitários para operações criptográficas
 */
export class CryptoUtils {
    /**
     * Valida uma chave PEM
     */
    static validatePemKey(key, type = 'PUBLIC KEY') {
        if (!key.includes(`-----BEGIN ${type}-----`) || !key.includes(`-----END ${type}-----`)) {
            throw new Error(`Formato inválido de ${type}: faltam headers PEM`);
        }
        try {
            if (type === 'PRIVATE KEY') {
                forge.pki.privateKeyFromPem(key);
            }
            else {
                forge.pki.publicKeyFromPem(key);
            }
            return true;
        }
        catch (e) {
            throw new Error(`Falha ao parsear ${type}: ${e.message}`);
        }
    }
    /**
     * Criptografa conteúdo usando chave privada RSA
     */
    static encryptWithPrivateKey(content, privateKey) {
        const buffer = Buffer.from(content, 'utf8');
        const chunkSize = 117; // para RSA-1024 com PKCS1
        const encryptedChunks = [];
        for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            const chunk = buffer.slice(offset, offset + chunkSize);
            const encrypted = crypto.privateEncrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            }, chunk);
            encryptedChunks.push(encrypted);
        }
        return Buffer.concat(encryptedChunks).toString('base64');
    }
    /**
     * Gera assinatura RSA SHA1
     */
    static generateSignature(params, privateKey) {
        const sortedKeys = Object.keys(params)
            .filter((k) => k !== 'sign' && k !== 'sign_type')
            .sort();
        const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
        const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha1.create();
        md.update(stringToSign, 'utf8');
        const signature = privateKeyObj.sign(md);
        return forge.util.encode64(signature);
    }
    /**
     * Verifica assinatura usando chave pública
     */
    static verifySignature(params, signature, publicKey) {
        try {
            const { sign, sign_type, ...paramsWithoutSign } = params;
            const stringToVerify = Object.keys(paramsWithoutSign)
                .sort()
                .map((k) => `${k}=${paramsWithoutSign[k]}`)
                .join('&');
            const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
            const md = forge.md.sha1.create();
            md.update(stringToVerify, 'utf8');
            const decodedSignature = forge.util.decode64(signature);
            return publicKeyObj.verify(md.digest().bytes(), decodedSignature);
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Gera um número de requisição aleatório
     */
    static generateRequestNo() {
        return crypto.randomBytes(16).toString('hex');
    }
    /**
     * Gera timestamp no formato GMT+1
     */
    static generateTimestamp() {
        const now = new Date();
        const offset = 1 * 60 * 60 * 1000; // GMT+1
        const gmtPlus1 = new Date(now.getTime() + offset);
        return gmtPlus1.toISOString().replace('T', ' ').substring(0, 19);
    }
    /**
     * Gera um número único de pedido
     */
    static generateUniqueOrderNo(prefix = 'ORDER') {
        if (typeof prefix !== 'string') {
            prefix = 'ORDER';
        }
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).slice(2, 8).toUpperCase();
        let orderNo = `${prefix}_${timestamp}${random}`;
        // Garantir que tenha pelo menos 6 caracteres
        if (orderNo.length < 6) {
            orderNo += Math.random().toString(36).slice(2, 8 - orderNo.length).toUpperCase();
        }
        // Garantir que não exceda 30 caracteres
        if (orderNo.length > 30) {
            orderNo = orderNo.slice(0, 30);
        }
        return orderNo;
    }
}
//# sourceMappingURL=crypto.js.map