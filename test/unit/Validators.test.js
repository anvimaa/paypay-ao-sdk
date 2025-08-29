/**
 * Unit tests for Validators
 */

const Validators = require('../../lib/utils/validators');

describe('Validators', () => {
  describe('validateAngolaPhoneNumber', () => {
    test('should validate correct Angola phone numbers', () => {
      const validNumbers = [
        '244900123456',
        '244 900 123 456',
        '244-900-123-456',
        '900123456',
        '9 0 0 1 2 3 4 5 6'
      ];

      validNumbers.forEach(number => {
        const result = Validators.validateAngolaPhoneNumber(number);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe('244900123456');
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should validate landline numbers', () => {
      const result = Validators.validateAngolaPhoneNumber('2442345678');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('2442345678');
    });

    test('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123456789',      // Too short
        '244800123456',   // Invalid mobile prefix
        '2449001234567',  // Too long
        'invalid',        // Non-numeric
        '',               // Empty
        null,             // Null
        undefined         // Undefined
      ];

      invalidNumbers.forEach(number => {
        const result = Validators.validateAngolaPhoneNumber(number);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should format phone numbers correctly', () => {
      const result = Validators.validateAngolaPhoneNumber('900123456');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('244900123456');
    });
  });

  describe('validateAmount', () => {
    test('should validate correct amounts', () => {
      const validAmounts = [100, 1000.50, 999999];

      validAmounts.forEach(amount => {
        const result = Validators.validateAmount(amount);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe(parseFloat(amount.toFixed(2)));
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid amounts', () => {
      const invalidAmounts = [
        -100,           // Negative
        0,              // Zero
        99,             // Below minimum
        10000001,       // Above maximum
        'invalid',      // String
        null,           // Null
        undefined,      // Undefined
        NaN,            // NaN
        Infinity        // Infinity
      ];

      invalidAmounts.forEach(amount => {
        const result = Validators.validateAmount(amount);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should respect custom limits', () => {
      const options = { minAmount: 500, maxAmount: 5000 };
      
      const belowMin = Validators.validateAmount(400, options);
      expect(belowMin.isValid).toBe(false);
      expect(belowMin.errors[0]).toContain('500');

      const aboveMax = Validators.validateAmount(6000, options);
      expect(aboveMax.isValid).toBe(false);
      expect(aboveMax.errors[0]).toContain('5000');

      const valid = Validators.validateAmount(1000, options);
      expect(valid.isValid).toBe(true);
    });

    test('should reject amounts with too many decimal places', () => {
      const result = Validators.validateAmount(100.123);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('decimal places');
    });
  });

  describe('validateTradeNumber', () => {
    test('should validate correct trade numbers', () => {
      const validTradeNumbers = [
        'ORDER_123',
        'trade-456',
        'PAYMENT_789_TEST',
        'simple123',
        'A'.repeat(64) // Maximum length
      ];

      validTradeNumbers.forEach(tradeNo => {
        const result = Validators.validateTradeNumber(tradeNo);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid trade numbers', () => {
      const invalidTradeNumbers = [
        '',              // Empty
        'A'.repeat(65),  // Too long
        'trade@123',     // Invalid character
        'trade 123',     // Space
        null,            // Null
        undefined,       // Undefined
        123              // Number
      ];

      invalidTradeNumbers.forEach(tradeNo => {
        const result = Validators.validateTradeNumber(tradeNo);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.ao',
        'developer+test@paypay.ao'
      ];

      validEmails.forEach(email => {
        const result = Validators.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        const result = Validators.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateIP', () => {
    test('should validate correct IP addresses', () => {
      const validIPs = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '8.8.8.8',
        '::1',                    // IPv6
        '2001:db8::1'            // IPv6
      ];

      validIPs.forEach(ip => {
        const result = Validators.validateIP(ip);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid IP addresses', () => {
      const invalidIPs = [
        '256.1.1.1',      // Invalid IPv4
        '192.168.1',      // Incomplete IPv4
        'invalid-ip',     // Not an IP
        '',
        null,
        undefined
      ];

      invalidIPs.forEach(ip => {
        const result = Validators.validateIP(ip);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateURL', () => {
    test('should validate correct URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://localhost:3000',
        'https://paypay.ao/api/callback',
        'http://192.168.1.1:8080/webhook'
      ];

      validURLs.forEach(url => {
        const result = Validators.validateURL(url);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidURLs = [
        'ftp://example.com',   // Invalid protocol
        'example.com',         // Missing protocol
        'https://',            // Incomplete
        'invalid-url',
        '',
        null,
        undefined
      ];

      invalidURLs.forEach(url => {
        const result = Validators.validateURL(url);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateSubject', () => {
    test('should validate correct subjects', () => {
      const validSubjects = [
        'Payment for order',
        'Compra de produtos',
        'A'.repeat(128)  // Maximum length
      ];

      validSubjects.forEach(subject => {
        const result = Validators.validateSubject(subject);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid subjects', () => {
      const invalidSubjects = [
        '',                // Empty
        '   ',             // Only spaces
        'A'.repeat(129),   // Too long
        'Subject<script>', // Dangerous characters
        'Subject"test',    // Quote
        null,
        undefined
      ];

      invalidSubjects.forEach(subject => {
        const result = Validators.validateSubject(subject);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateOrderDetails', () => {
    test('should validate complete MULTICAIXA order', () => {
      const validOrder = {
        outTradeNo: 'ORDER_123',
        amount: 1000,
        phoneNum: '244900123456',
        paymentMethod: 'EXPRESS',
        subject: 'Test payment'
      };

      const result = Validators.validateOrderDetails(validOrder, 'multicaixa');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedData.outTradeNo).toBe(validOrder.outTradeNo);
      expect(result.validatedData.amount).toBe(1000);
      expect(result.validatedData.phoneNum).toBe('244900123456');
    });

    test('should validate PayPay App order', () => {
      const validOrder = {
        outTradeNo: 'ORDER_124',
        amount: 2500.50,
        subject: 'App payment'
      };

      const result = Validators.validateOrderDetails(validOrder, 'paypay_app');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedData.amount).toBe(2500.50);
    });

    test('should reject invalid order details', () => {
      const invalidOrder = {
        outTradeNo: '',     // Invalid
        amount: -100,       // Invalid
        phoneNum: 'invalid' // Invalid for MULTICAIXA
      };

      const result = Validators.validateOrderDetails(invalidOrder, 'multicaixa');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing order details', () => {
      const result = Validators.validateOrderDetails(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Order details are required');
    });
  });
});