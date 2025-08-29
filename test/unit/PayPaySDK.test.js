/**
 * Unit tests for PayPaySDK main class
 */

const PayPaySDK = require('../../lib/PayPaySDK');
const { PayPayConfigError, PayPayValidationError } = require('../../lib/utils/errors');

describe('PayPaySDK', () => {
  let sdk;
  let validConfig;

  beforeEach(() => {
    validConfig = {
      partnerId: global.testConfig.partnerId,
      privateKey: global.testConfig.privateKey,
      paypayPublicKey: global.testConfig.paypayPublicKey,
      environment: 'sandbox',
      language: 'pt'
    };
  });

  afterEach(() => {
    if (sdk) {
      sdk.destroy();
      sdk = null;
    }
  });

  describe('Constructor', () => {
    test('should create SDK instance with valid configuration', () => {
      sdk = new PayPaySDK(validConfig);
      expect(sdk).toBeInstanceOf(PayPaySDK);
      expect(sdk.getConfig().partnerId).toBe(validConfig.partnerId);
      expect(sdk.getConfig().environment).toBe('sandbox');
    });

    test('should throw error with missing partnerId', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.partnerId;
      
      expect(() => {
        new PayPaySDK(invalidConfig);
      }).toThrow('Missing required configuration fields');
    });

    test('should throw error with missing privateKey', () => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig.privateKey;
      
      expect(() => {
        new PayPaySDK(invalidConfig);
      }).toThrow('Missing required configuration fields');
    });

    test('should throw error with invalid environment', () => {
      const invalidConfig = { ...validConfig, environment: 'invalid' };
      
      expect(() => {
        new PayPaySDK(invalidConfig);
      }).toThrow('Invalid environment');
    });

    test('should use default values for optional fields', () => {
      const minimalConfig = {
        partnerId: validConfig.partnerId,
        privateKey: validConfig.privateKey,
        paypayPublicKey: validConfig.paypayPublicKey
      };
      
      sdk = new PayPaySDK(minimalConfig);
      expect(sdk.getConfig().environment).toBe('production');
      expect(sdk.getConfig().language).toBe('pt');
    });
  });

  describe('Environment Methods', () => {
    beforeEach(() => {
      sdk = new PayPaySDK(validConfig);
    });

    test('should correctly identify sandbox environment', () => {
      expect(sdk.isSandbox()).toBe(true);
      expect(sdk.isProduction()).toBe(false);
    });

    test('should correctly identify production environment', () => {
      const prodConfig = { ...validConfig, environment: 'production' };
      sdk.destroy();
      sdk = new PayPaySDK(prodConfig);
      
      expect(sdk.isSandbox()).toBe(false);
      expect(sdk.isProduction()).toBe(true);
    });

    test('should return environment info', () => {
      const envInfo = sdk.getEnvironmentInfo();
      expect(envInfo).toHaveProperty('name');
      expect(envInfo).toHaveProperty('apiUrl');
      expect(envInfo).toHaveProperty('features');
    });
  });

  describe('Validation Methods', () => {
    beforeEach(() => {
      sdk = new PayPaySDK(validConfig);
    });

    test('should validate phone number correctly', () => {
      expect(sdk.validatePhoneNumber('244900123456')).toBe(true);
      expect(sdk.validatePhoneNumber('900123456')).toBe(true);
      expect(sdk.validatePhoneNumber('invalid')).toBe(false);
    });

    test('should format phone number correctly', () => {
      expect(sdk.formatPhoneNumber('900123456')).toBe('244900123456');
      expect(sdk.formatPhoneNumber('244900123456')).toBe('244900123456');
    });

    test('should validate amount correctly', () => {
      const validAmount = sdk.validateAmount(1000);
      expect(validAmount.isValid).toBe(true);
      
      const invalidAmount = sdk.validateAmount(-100);
      expect(invalidAmount.isValid).toBe(false);
      expect(invalidAmount.errors).toContain('Amount must be greater than zero');
    });

    test('should validate configuration', () => {
      const validation = sdk.validateConfig();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      sdk = new PayPaySDK(validConfig);
    });

    test('should generate unique trade numbers', () => {
      const tradeNo1 = sdk.generateTradeNumber();
      const tradeNo2 = sdk.generateTradeNumber();
      
      expect(tradeNo1).not.toBe(tradeNo2);
      expect(typeof tradeNo1).toBe('string');
      expect(tradeNo1.length).toBeGreaterThan(0);
    });

    test('should generate trade number with prefix', () => {
      const prefix = 'ORDER_';
      const tradeNo = sdk.generateTradeNumber(prefix);
      expect(tradeNo.startsWith(prefix)).toBe(true);
    });

    test('should return supported methods', () => {
      const methods = sdk.getSupportedMethods();
      expect(methods).toHaveProperty('multicaixa');
      expect(methods).toHaveProperty('paypayApp');
      expect(methods).toHaveProperty('currencies');
      expect(methods.multicaixa).toContain('EXPRESS');
      expect(methods.multicaixa).toContain('REFERENCE');
    });

    test('should return SDK info', () => {
      const info = sdk.getSDKInfo();
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('environment');
      expect(info).toHaveProperty('supportedMethods');
    });
  });

  describe('Configuration Updates', () => {
    beforeEach(() => {
      sdk = new PayPaySDK(validConfig);
    });

    test('should update configuration successfully', () => {
      const newConfig = { language: 'en' };
      sdk.updateConfig(newConfig);
      expect(sdk.getConfig().language).toBe('en');
    });

    test('should reject invalid configuration updates', () => {
      expect(() => {
        sdk.updateConfig({ environment: 'invalid' });
      }).toThrow();
    });
  });

  describe('Payment Methods Input Validation', () => {
    beforeEach(() => {
      sdk = new PayPaySDK(validConfig);
    });

    test('should validate MULTICAIXA payment input', async () => {
      const validOrder = {
        outTradeNo: global.testUtils.generateTestTradeNo(),
        amount: 1000,
        phoneNum: '244900123456',
        paymentMethod: 'EXPRESS'
      };

      // This should not throw validation errors
      try {
        await sdk.createMulticaixaPayment(validOrder);
      } catch (error) {
        // We expect this to fail due to network/API, not validation
        expect(error.message).not.toContain('validation');
      }
    });

    test('should reject invalid MULTICAIXA payment input', async () => {
      const invalidOrder = {
        outTradeNo: '', // Invalid empty trade number
        amount: -100,   // Invalid negative amount
        phoneNum: '244900123456',
        paymentMethod: 'EXPRESS'
      };

      await expect(sdk.createMulticaixaPayment(invalidOrder)).rejects.toThrow();
    });

    test('should validate PayPay App payment input', async () => {
      const validOrder = {
        outTradeNo: global.testUtils.generateTestTradeNo(),
        amount: 1000,
        subject: 'Test payment'
      };

      // This should not throw validation errors
      try {
        await sdk.createPayPayAppPayment(validOrder);
      } catch (error) {
        // We expect this to fail due to network/API, not validation
        expect(error.message).not.toContain('validation');
      }
    });
  });

  describe('Memory Management', () => {
    test('should cleanup resources on destroy', () => {
      sdk = new PayPaySDK(validConfig);
      sdk.destroy();
      
      // Verify cleanup
      expect(sdk.configManager).toBeNull();
      expect(sdk.paymentClient).toBeNull();
    });
  });
});