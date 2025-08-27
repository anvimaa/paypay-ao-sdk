/**
 * Utility functions module for PayPay AO SDK
 * Contains cryptographic operations, validation, and helper functions
 */

const forge = require("node-forge");
const crypto = require("crypto");

/**
 * Validates a PEM-formatted key (either public or private).
 *
 * @param {string} key - The PEM key to validate.
 * @param {string} [type="PUBLIC KEY"] - Type of key: "PUBLIC KEY" or "PRIVATE KEY".
 * @returns {boolean} Returns true if valid, throws an error otherwise.
 * @throws {Error} If the key is invalid or cannot be parsed.
 */
function validatePemKey(key, type = "PUBLIC KEY") {
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
function generateRequestNo() {
    return crypto.randomBytes(16).toString("hex");
}

/**
 * Returns the current timestamp in GMT+1 formatted as 'YYYY-MM-DD HH:mm:ss'.
 *
 * @returns {string} A timestamp string in GMT+1.
 */
function generateTimestamp() {
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
 */
function encryptBizContentWithPrivateKey(bizContent, privateKey) {
    const buffer = Buffer.from(bizContent, "utf8");
    const chunkSize = 117;
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
}

/**
 * Creates a SHA1withRSA signature from the given parameters using the private key.
 *
 * @param {Object} params - The request parameters to sign.
 * @param {string} privateKey - The RSA private key in PEM format.
 * @returns {string} A base64-encoded signature string.
 * @throws {Error} If signature creation fails.
 */
function generateSignature(params, privateKey) {
    try {
        validatePemKey(privateKey, "PRIVATE KEY");
        const sortedKeys = Object.keys(params)
            .filter((key) => key !== "sign" && key !== "sign_type")
            .sort();
        const stringToSign = sortedKeys
            .map((key) => `${key}=${params[key]}`)
            .join("&");

        const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha1.create();
        md.update(stringToSign, "utf8");
        const signature = privateKeyObj.sign(md);
        const encodedSignature = forge.util.encode64(signature);
        return encodedSignature;
    } catch (error) {
        console.error(`Signature error: ${error.message}`);
        throw new Error("Failed to generate signature");
    }
}

module.exports = {
    validatePemKey,
    generateRequestNo,
    generateTimestamp,
    encryptBizContentWithPrivateKey,
    generateSignature,
};