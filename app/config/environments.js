/**
 * Environment configurations for PayPay SDK
 * Defines environment-specific settings and endpoints
 */

const environments = {
    sandbox: {
        name: 'sandbox',
        apiUrl: 'https://gateway.paypayafrica.com/recv.do',
        description: 'Sandbox environment for testing and development',
        features: {
            realTransactions: false,
            testCards: true,
            debugMode: true
        }
    },

    production: {
        name: 'production',
        apiUrl: 'https://gateway.paypayafrica.com/recv.do',
        description: 'Production environment for live transactions',
        features: {
            realTransactions: true,
            testCards: false,
            debugMode: false
        }
    }
};

/**
 * Gets configuration for specific environment
 * @param {string} environment - Environment name (sandbox/production)
 * @returns {Object} Environment configuration
 */
function getEnvironmentConfig(environment) {
    if (!environments[environment]) {
        throw new Error(`Unknown environment: ${environment}`);
    }
    return environments[environment];
}

/**
 * Gets list of available environments
 * @returns {string[]} Array of environment names
 */
function getAvailableEnvironments() {
    return Object.keys(environments);
}

/**
 * Validates if environment name is valid
 * @param {string} environment - Environment name to validate
 * @returns {boolean} True if valid environment
 */
function isValidEnvironment(environment) {
    return environments.hasOwnProperty(environment);
}

module.exports = {
    environments,
    getEnvironmentConfig,
    getAvailableEnvironments,
    isValidEnvironment
};