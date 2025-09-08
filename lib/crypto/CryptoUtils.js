/**
 * CryptoUtils - Utility functions for PayPay SDK cryptographic operations
 * Handles RSA encryption, signature generation, and cryptographic validations
 */

const forge = require("node-forge");
const crypto = require("crypto");

/**
 * Cryptographic utilities for PayPay SDK
 * Provides RSA encryption, signature generation, and validation functions
 */
class CryptoUtils {
    /**
     * Validates a PEM-formatted key (either public or private).
     *
     * @param {string} key - The PEM key to validate.
     * @param {string} [type="PUBLIC KEY"] - Type of key: "PUBLIC KEY" or "PRIVATE KEY".
     * @returns {boolean} Returns true if valid, throws an error otherwise.
     * @throws {Error} If the key is invalid or cannot be parsed.
     */
    static validatePemKey(key, type = "PUBLIC KEY") {
        try {
            if (
                !key.includes(`-----BEGIN ${type}-----`) ||
                !key.includes(`-----END ${type}-----`)
            ) {
                throw new Error(`Invalid ${type} format: Missing PEM headers`);
            }
            if (type === "PRIVATE KEY") {
                forge.pki.privateKeyFromPem(key);
            } else {
                forge.pki.publicKeyFromPem(key);
            }
            return true;
        } catch (error) {
            console.error(`Invalid ${type}:`, error.message);
            throw new Error(`Failed to parse ${type}`);
        }
    }

    /**
     * Generates a unique request number (request_no) as a 32-character hex string.
     *
     * @returns {string} A unique request identifier.
     */
    static generateRequestNo() {
        return crypto.randomBytes(16).toString("hex");
    }

    /**
     * Returns the current timestamp in GMT+1 formatted as 'YYYY-MM-DD HH:mm:ss'.
     *
     * @returns {string} A timestamp string in GMT+1.
     */
    static generateTimestamp() {
        const now = new Date();
        const offset = 1 * 60 * 60 * 1000; // GMT+1 offset in milliseconds
        const gmtPlus1 = new Date(now.getTime() + offset);
        return gmtPlus1.toISOString().replace("T", " ").substring(0, 19);
    }

    /**
     * Encrypts the given bizContent using a private RSA key (PKCS1 padding).
     *
     * @param {string} bizContent - The JSON string to encrypt.
     * @param {string} privateKey - The RSA private key in PEM format.
     * @returns {string} The encrypted content encoded in base64.
     * @throws {Error} If encryption fails or key is invalid.
     */
    static encryptBizContentWithPrivateKey(bizContent, privateKey) {
        try {
            // Validate private key first
            this.validatePemKey(privateKey, "PRIVATE KEY");
            
            const buffer = Buffer.from(bizContent, "utf8");
            const chunkSize = 117; // Maximum chunk size for 1024-bit RSA with PKCS1 padding
            const encryptedChunks = [];

            for (let offset = 0; offset < buffer.length; offset += chunkSize) {
                const chunk = buffer.slice(offset, offset + chunkSize);
                const encrypted = crypto.privateEncrypt(
                    {
                        key: privateKey,
                        padding: crypto.constants.RSA_PKCS1_PADDING,
                    },
                    chunk
                );
                encryptedChunks.push(encrypted);
            }

            const encryptedBuffer = Buffer.concat(encryptedChunks);
            const encoded = encryptedBuffer.toString("base64");
            return encoded;
        } catch (error) {
            console.error(`Encryption error: ${error.message}`);
            throw new Error(`Failed to encrypt bizContent: ${error.message}`);
        }
    }

    /**
     * Creates a SHA1withRSA signature from the given parameters using the private key.
     *
     * @param {Object} params - The request parameters to sign.
     * @param {string} privateKey - The RSA private key in PEM format.
     * @returns {string} A base64-encoded signature string.
     * @throws {Error} If signature creation fails.
     */
    static generateSignature(params, privateKey) {
        try {
            this.validatePemKey(privateKey, "PRIVATE KEY");
            
            // Filter out signature-related parameters and sort
            const sortedKeys = Object.keys(params)
                .filter((key) => key !== "sign" && key !== "sign_type")
                .sort();
                
            // Build string to sign
            const stringToSign = sortedKeys
                .map((key) => `${key}=${params[key]}`)
                .join("&");

            // Generate signature using node-forge
            const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
            const md = forge.md.sha1.create();
            md.update(stringToSign, "utf8");
            const signature = privateKeyObj.sign(md);
            const encodedSignature = forge.util.encode64(signature);
            
            return encodedSignature;
        } catch (error) {
            console.error(`Signature error: ${error.message}`);
            throw new Error(`Failed to generate signature: ${error.message}`);
        }
    }

    /**
     * Verifies a signature using the PayPay public key
     *
     * @param {string} data - The original data that was signed
     * @param {string} signature - The signature to verify (base64 encoded)
     * @param {string} publicKey - The PayPay public key in PEM format
     * @returns {boolean} True if signature is valid
     */
    static verifySignature(data, signature, publicKey) {
        try {
            this.validatePemKey(publicKey, "PUBLIC KEY");
            
            const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
            const md = forge.md.sha1.create();
            md.update(data, "utf8");
            
            const decodedSignature = forge.util.decode64(signature);
            return publicKeyObj.verify(md.digest().bytes(), decodedSignature);
        } catch (error) {
            console.error(`Signature verification error: ${error.message}`);
            return false;
        }
    }

    /**
     * Decrypts content using PayPay public key (for response validation)
     *
     * @param {string} encryptedContent - Base64 encoded encrypted content
     * @param {string} publicKey - PayPay public key in PEM format
     * @returns {string} Decrypted content
     */
    static decryptWithPublicKey(encryptedContent, publicKey) {
        try {
            this.validatePemKey(publicKey, "PUBLIC KEY");
            
            const encryptedBuffer = Buffer.from(encryptedContent, "base64");
            const decrypted = crypto.publicDecrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                encryptedBuffer
            );
            
            return decrypted.toString("utf8");
        } catch (error) {
            console.error(`Decryption error: ${error.message}`);
            throw new Error(`Failed to decrypt content: ${error.message}`);
        }
    }

    /**
     * Generates a secure random string for various purposes
     *
     * @param {number} [length=32] - Length of the random string
     * @param {string} [encoding='hex'] - Encoding format (hex, base64, base64url)
     * @returns {string} Random string
     */
    static generateRandomString(length = 32, encoding = 'hex') {
        const bytes = Math.ceil(length / 2);
        const buffer = crypto.randomBytes(bytes);
        
        switch (encoding) {
            case 'base64':
                return buffer.toString('base64').slice(0, length);
            case 'base64url':
                return buffer.toString('base64url').slice(0, length);
            case 'hex':
            default:
                return buffer.toString('hex').slice(0, length);
        }
    }

    /**
     * Creates a hash of the given data using specified algorithm
     *
     * @param {string} data - Data to hash
     * @param {string} [algorithm='sha256'] - Hash algorithm
     * @returns {string} Hex encoded hash
     */
    static createHash(data, algorithm = 'sha256') {
        try {
            const hash = crypto.createHash(algorithm);
            hash.update(data, 'utf8');
            return hash.digest('hex');
        } catch (error) {
            throw new Error(`Failed to create hash: ${error.message}`);
        }
    }
}

module.exports = CryptoUtils;