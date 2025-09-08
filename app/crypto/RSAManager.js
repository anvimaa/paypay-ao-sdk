/**
 * RSAManager - Advanced RSA key management for PayPay SDK
 * Provides enhanced RSA operations and key management functionality
 */

const forge = require("node-forge");
const crypto = require("crypto");
const CryptoUtils = require("./CryptoUtils");

/**
 * RSA Manager for advanced key operations
 */
class RSAManager {
    constructor(privateKey, publicKey) {
        this.privateKey = null;
        this.publicKey = null;
        this.paypayPublicKey = null;
        
        if (privateKey) {
            this.setPrivateKey(privateKey);
        }
        
        if (publicKey) {
            this.setPayPayPublicKey(publicKey);
        }
    }

    /**
     * Sets and validates the private key
     * @param {string} privateKeyPem - Private key in PEM format
     */
    setPrivateKey(privateKeyPem) {
        CryptoUtils.validatePemKey(privateKeyPem, "PRIVATE KEY");
        this.privateKey = privateKeyPem;
        this.privateKeyObj = forge.pki.privateKeyFromPem(privateKeyPem);
    }

    /**
     * Sets and validates the PayPay public key
     * @param {string} publicKeyPem - Public key in PEM format  
     */
    setPayPayPublicKey(publicKeyPem) {
        CryptoUtils.validatePemKey(publicKeyPem, "PUBLIC KEY");
        this.paypayPublicKey = publicKeyPem;
        this.paypayPublicKeyObj = forge.pki.publicKeyFromPem(publicKeyPem);
    }

    /**
     * Gets the public key derived from the private key
     * @returns {string} Public key in PEM format
     */
    getPublicKey() {
        if (!this.privateKeyObj) {
            throw new Error("Private key not set");
        }
        
        const publicKey = forge.pki.rsa.setPublicKey(
            this.privateKeyObj.n, 
            this.privateKeyObj.e
        );
        
        return forge.pki.publicKeyToPem(publicKey);
    }

    /**
     * Encrypts data with private key (for PayPay API)
     * @param {string} data - Data to encrypt
     * @returns {string} Base64 encoded encrypted data
     */
    encryptWithPrivateKey(data) {
        if (!this.privateKey) {
            throw new Error("Private key not set");
        }
        
        return CryptoUtils.encryptBizContentWithPrivateKey(data, this.privateKey);
    }

    /**
     * Decrypts data with PayPay public key
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @returns {string} Decrypted data
     */
    decryptWithPayPayPublicKey(encryptedData) {
        if (!this.paypayPublicKey) {
            throw new Error("PayPay public key not set");
        }
        
        return CryptoUtils.decryptWithPublicKey(encryptedData, this.paypayPublicKey);
    }

    /**
     * Signs data with private key
     * @param {Object} params - Parameters to sign
     * @returns {string} Base64 encoded signature
     */
    signData(params) {
        if (!this.privateKey) {
            throw new Error("Private key not set");
        }
        
        return CryptoUtils.generateSignature(params, this.privateKey);
    }

    /**
     * Verifies signature with PayPay public key
     * @param {string} data - Original data
     * @param {string} signature - Base64 encoded signature
     * @returns {boolean} True if signature is valid
     */
    verifySignature(data, signature) {
        if (!this.paypayPublicKey) {
            throw new Error("PayPay public key not set");
        }
        
        return CryptoUtils.verifySignature(data, signature, this.paypayPublicKey);
    }

    /**
     * Gets key information
     * @returns {Object} Key information object
     */
    getKeyInfo() {
        const info = {
            hasPrivateKey: !!this.privateKey,
            hasPayPayPublicKey: !!this.paypayPublicKey
        };

        if (this.privateKeyObj) {
            info.privateKeyBits = this.privateKeyObj.n.bitLength();
        }

        if (this.paypayPublicKeyObj) {
            info.paypayPublicKeyBits = this.paypayPublicKeyObj.n.bitLength();
        }

        return info;
    }

    /**
     * Validates that all required keys are present
     * @throws {Error} If required keys are missing
     */
    validateKeys() {
        if (!this.privateKey) {
            throw new Error("Private key is required");
        }
        
        if (!this.paypayPublicKey) {
            throw new Error("PayPay public key is required");
        }
    }

    /**
     * Clears all keys from memory (security cleanup)
     */
    clearKeys() {
        this.privateKey = null;
        this.publicKey = null;
        this.paypayPublicKey = null;
        this.privateKeyObj = null;
        this.paypayPublicKeyObj = null;
    }
}

module.exports = RSAManager;