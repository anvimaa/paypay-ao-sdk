/**
 * ConfigManager - Gerenciamento de configuração do PayPay SDK
 * Handles dynamic configuration, validation, and environment management
 */

const { validatePemKey } = require('../crypto/CryptoUtils');

/**
 * Configuration Manager for PayPay SDK
 * Provides dynamic configuration management with validation
 */
class ConfigManager {
    constructor(config = {}) {
        this.config = {};
        this.environments = {
            sandbox: {
                apiUrl: "https://gateway.paypayafrica.com/recv.do",
                name: "sandbox"
            },
            production: {
                apiUrl: "https://gateway.paypayafrica.com/recv.do",
                name: "production"
            }
        };

        this.setConfig(config);
    }

    /**
     * Sets and validates the SDK configuration
     * @param {Object} config - Configuration object
     * @param {string} config.partnerId - Merchant partner ID
     * @param {string} config.privateKey - RSA private key in PEM format
     * @param {string} config.paypayPublicKey - PayPay public key in PEM format
     * @param {string} [config.environment='production'] - Environment (sandbox/production)
     * @param {string} [config.language='pt'] - Language preference (pt/en)
     * @param {string} [config.saleProductCode] - Sale product code
     */
    setConfig(config) {
        // Required fields validation
        this.validateRequiredFields(config);

        // Set default values
        const defaults = {
            environment: 'production',
            language: 'pt',
            saleProductCode: '050200001'
        };

        this.config = { ...defaults, ...config };

        // Validate environment
        this.validateEnvironment();

        // Validate RSA keys
        this.validateKeys();

        // Set environment-specific settings
        this.setEnvironmentConfig();
    }

    /**
     * Validates required configuration fields
     * @private
     */
    validateRequiredFields(config) {
        const required = ['partnerId', 'privateKey', 'paypayPublicKey'];
        const missing = required.filter(field => !config[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required configuration fields: ${missing.join(', ')}`);
        }
    }

    /**
     * Validates the environment setting
     * @private
     */
    validateEnvironment() {
        const validEnvironments = Object.keys(this.environments);
        if (!validEnvironments.includes(this.config.environment)) {
            throw new Error(`Invalid environment: ${this.config.environment}. Valid options: ${validEnvironments.join(', ')}`);
        }
    }

    /**
     * Validates RSA keys format and structure
     * @private
     */
    validateKeys() {
        try {
            // Validate private key
            validatePemKey(this.config.privateKey, 'PRIVATE KEY');

            // Validate PayPay public key
            validatePemKey(this.config.paypayPublicKey, 'PUBLIC KEY');
        } catch (error) {
            throw new Error(`Key validation failed: ${error.message}`);
        }
    }

    /**
     * Sets environment-specific configuration
     * @private
     */
    setEnvironmentConfig() {
        const envConfig = this.environments[this.config.environment];
        this.config.apiUrl = envConfig.apiUrl;
    }

    /**
     * Gets the current configuration
     * @returns {Object} Current configuration object
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Gets a specific configuration value
     * @param {string} key - Configuration key
     * @returns {*} Configuration value
     */
    get(key) {
        return this.config[key];
    }

    /**
     * Checks if the SDK is configured for sandbox environment
     * @returns {boolean} True if sandbox environment
     */
    isSandbox() {
        return this.config.environment === 'sandbox';
    }

    /**
     * Checks if the SDK is configured for production environment
     * @returns {boolean} True if production environment
     */
    isProduction() {
        return this.config.environment === 'production';
    }

    /**
     * Updates a configuration value with validation
     * @param {string} key - Configuration key
     * @param {*} value - New value
     */
    set(key, value) {
        const oldConfig = { ...this.config };
        this.config[key] = value;

        try {
            // Re-validate configuration after change
            this.validateRequiredFields(this.config);
            this.validateEnvironment();
            this.validateKeys();
            this.setEnvironmentConfig();
        } catch (error) {
            // Restore old configuration if validation fails
            this.config = oldConfig;
            throw error;
        }
    }

    /**
     * Gets environment-specific settings
     * @returns {Object} Environment configuration
     */
    getEnvironmentConfig() {
        return this.environments[this.config.environment];
    }

    /**
     * Validates the entire configuration
     * @returns {boolean} True if configuration is valid
     * @throws {Error} If configuration is invalid
     */
    validate() {
        this.validateRequiredFields(this.config);
        this.validateEnvironment();
        this.validateKeys();
        return true;
    }
}

module.exports = ConfigManager;