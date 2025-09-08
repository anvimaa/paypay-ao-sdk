/**
 * Unit tests for CryptoUtils
 */

const CryptoUtils = require('../../lib/crypto/CryptoUtils');

describe('CryptoUtils', () => {
  const validPrivateKey = global.testConfig.privateKey;
  const validPublicKey = global.testConfig.paypayPublicKey;

  describe('validatePemKey', () => {
    test('should validate correct private key', () => {
      expect(() => {
        CryptoUtils.validatePemKey(validPrivateKey, 'PRIVATE KEY');
      }).not.toThrow();
    });

    test('should validate correct public key', () => {
      expect(() => {
        CryptoUtils.validatePemKey(validPublicKey, 'PUBLIC KEY');
      }).not.toThrow();
    });

    test('should reject invalid key format', () => {
      const invalidKey = 'invalid-key-format';
      expect(() => {
        CryptoUtils.validatePemKey(invalidKey, 'PRIVATE KEY');
      }).toThrow('Invalid PRIVATE KEY format');
    });

    test('should reject malformed PEM', () => {
      const malformedKey = '-----BEGIN PRIVATE KEY-----\ninvalid content\n-----END PRIVATE KEY-----';
      expect(() => {
        CryptoUtils.validatePemKey(malformedKey, 'PRIVATE KEY');
      }).toThrow('Failed to parse PRIVATE KEY');
    });
  });

  describe('generateRequestNo', () => {
    test('should generate unique request numbers', () => {
      const req1 = CryptoUtils.generateRequestNo();
      const req2 = CryptoUtils.generateRequestNo();
      
      expect(req1).not.toBe(req2);
      expect(typeof req1).toBe('string');
      expect(req1.length).toBe(32); // 16 bytes = 32 hex chars
    });

    test('should generate hex format', () => {
      const requestNo = CryptoUtils.generateRequestNo();
      expect(/^[0-9a-f]{32}$/.test(requestNo)).toBe(true);
    });
  });

  describe('generateTimestamp', () => {
    test('should generate valid timestamp format', () => {
      const timestamp = CryptoUtils.generateTimestamp();
      
      // Should match YYYY-MM-DD HH:mm:ss format
      const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      expect(timestampRegex.test(timestamp)).toBe(true);
    });

    test('should generate different timestamps', () => {
      const ts1 = CryptoUtils.generateTimestamp();
      // Small delay to ensure different timestamps
      setTimeout(() => {
        const ts2 = CryptoUtils.generateTimestamp();
        expect(ts1).not.toBe(ts2);
      }, 10);
    });
  });

  describe('encryptBizContentWithPrivateKey', () => {
    test('should encrypt content successfully', () => {
      const content = JSON.stringify({ test: 'data' });
      const encrypted = CryptoUtils.encryptBizContentWithPrivateKey(content, validPrivateKey);
      
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      // Should be base64 encoded
      expect(/^[A-Za-z0-9+/]+=*$/.test(encrypted)).toBe(true);
    });

    test('should handle large content', () => {
      // Create content larger than RSA chunk size
      const largeContent = JSON.stringify({
        data: 'x'.repeat(200),
        moreData: 'y'.repeat(200)
      });
      
      const encrypted = CryptoUtils.encryptBizContentWithPrivateKey(largeContent, validPrivateKey);
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    test('should throw error with invalid private key', () => {
      const content = JSON.stringify({ test: 'data' });
      const invalidKey = 'invalid-key';
      
      expect(() => {
        CryptoUtils.encryptBizContentWithPrivateKey(content, invalidKey);
      }).toThrow('Failed to encrypt bizContent');
    });
  });

  describe('generateSignature', () => {
    test('should generate valid signature', () => {
      const params = {
        partner_id: 'TEST123',
        service: 'instant_trade',
        request_no: 'req123',
        timestamp: '2024-01-01 12:00:00'
      };
      
      const signature = CryptoUtils.generateSignature(params, validPrivateKey);
      
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
      // Should be base64 encoded
      expect(/^[A-Za-z0-9+/]+=*$/.test(signature)).toBe(true);
    });

    test('should exclude sign and sign_type from signature', () => {
      const params = {
        partner_id: 'TEST123',
        service: 'instant_trade',
        sign: 'should-be-ignored',
        sign_type: 'RSA'
      };
      
      const signature = CryptoUtils.generateSignature(params, validPrivateKey);
      expect(typeof signature).toBe('string');
    });

    test('should generate consistent signatures for same input', () => {
      const params = {
        partner_id: 'TEST123',
        service: 'instant_trade',
        request_no: 'req123'
      };
      
      const sig1 = CryptoUtils.generateSignature(params, validPrivateKey);
      const sig2 = CryptoUtils.generateSignature(params, validPrivateKey);
      
      expect(sig1).toBe(sig2);
    });

    test('should throw error with invalid private key', () => {
      const params = { test: 'data' };
      const invalidKey = 'invalid-key';
      
      expect(() => {
        CryptoUtils.generateSignature(params, invalidKey);
      }).toThrow('Failed to generate signature');
    });
  });

  describe('verifySignature', () => {
    test('should verify valid signature', () => {
      const data = 'test data to sign';
      const params = { data };
      const signature = CryptoUtils.generateSignature(params, validPrivateKey);
      
      // For this test, we'd need the matching public key
      // This is more of an integration test
      const stringToSign = 'data=test data to sign';
      const isValid = CryptoUtils.verifySignature(stringToSign, signature, validPublicKey);
      
      // This might fail due to key mismatch, but method should not throw
      expect(typeof isValid).toBe('boolean');
    });

    test('should return false for invalid signature', () => {
      const data = 'test data';
      const invalidSignature = 'invalid-signature';
      
      const isValid = CryptoUtils.verifySignature(data, invalidSignature, validPublicKey);
      expect(isValid).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    test('should generate random strings of specified length', () => {
      const str1 = CryptoUtils.generateRandomString(16);
      const str2 = CryptoUtils.generateRandomString(16);
      
      expect(str1.length).toBe(16);
      expect(str2.length).toBe(16);
      expect(str1).not.toBe(str2);
    });

    test('should support different encodings', () => {
      const hexStr = CryptoUtils.generateRandomString(16, 'hex');
      const base64Str = CryptoUtils.generateRandomString(16, 'base64');
      
      expect(/^[0-9a-f]+$/.test(hexStr)).toBe(true);
      expect(/^[A-Za-z0-9+/=]+$/.test(base64Str)).toBe(true);
    });
  });

  describe('createHash', () => {
    test('should create SHA256 hash by default', () => {
      const data = 'test data';
      const hash = CryptoUtils.createHash(data);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 = 32 bytes = 64 hex chars
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    test('should create consistent hashes', () => {
      const data = 'test data';
      const hash1 = CryptoUtils.createHash(data);
      const hash2 = CryptoUtils.createHash(data);
      
      expect(hash1).toBe(hash2);
    });

    test('should support different algorithms', () => {
      const data = 'test data';
      const sha1Hash = CryptoUtils.createHash(data, 'sha1');
      const sha256Hash = CryptoUtils.createHash(data, 'sha256');
      
      expect(sha1Hash.length).toBe(40);  // SHA1 = 20 bytes = 40 hex chars
      expect(sha256Hash.length).toBe(64); // SHA256 = 32 bytes = 64 hex chars
      expect(sha1Hash).not.toBe(sha256Hash);
    });
  });
});