/**
 * Test setup file
 * Global configuration and utilities for tests
 */

// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Test configuration
global.testConfig = {
  partnerId: 'TEST_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAOb9ztBh/awG26pT
G4Jw/tGoej321bYEvIR07cXU0SSYwhSN3Dp2dD9oQDO3QaThcu423mMIuBgzPVl9
Mex4oDty4cE5EEtwMEBy6N9h2eNxz1PF3nrBqcLsDtpc7zywuATuiDr9T7WOe/gx
6wYFnp1scTr2E3e3J/oWgdlKeH0NAgMBAAECgYEAvSsoPuGxJDutk6xiAA5XsQ2f
prVJybnRRUyZGQWzjZwIfVq7+6jchLz0ryWp/cSgIdQPhd0zHqZ/3JS52OXkmZyr
u8YJaSTeYBIFfco4dguD/dpWJh0c9X2yygb7eQEcG2JpgjvI0FHBvojdGE5B1Wz0
pis5sUqfOdW35/nUNIECQQD0F206tcW06VNNL/3YdjO8VvDN5hOd/vThrNFV1aBK
w2njSh8Dr9ixq6lRFSljVTAa/b22Ak9YJaXi4O2YPHHtAkEA8kLEqrqDhs1Pn243
JrXm8+vMulW+6XYCgo/AFspRXJssnaNK8lrlTDAxrLU/+kjCwX+ITDdj1Hj3S7Zq
NPlToQJAZheCTSMH/UH14HvpLWdK/kRS1ZucquGfZOCWcdM3Bu4y1KkEzdL3zGAj
IlG6jNxtkWx9s6nFq/WbK4iud5UYhQJAJhyG3+zzoBNQgV5PYtGfAaSI0o+GtyeP
gYany24Mmqr2u93ifnn6NKAoUGk7JV6o9NPhV0wncleNX+XUk3zdwQJBAKj3nGgw
zUPUBCkxLAK2tr+vf0ifQ/udJQml9p2pPO8b+4aB6IXc2tGxQrmBXFVOvRFVzTbs
DVnp5lAOol92g8k=
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArL1akdPqJVYIGI4vGNiN
dvoxn7TWYOorLrNOBz3BP2yVSf31L6yPbQIs8hn59iOzbWy8raXAYWjYgM9Lh6h2
6XutwmEjZHqqoH5pLDYvZALMxEwunDpeTFrikuej0nWxjmpA9m4eicXcJbCMJowL
47a5Jw61VkF+wbIj5vxEcSN4SSddJ04zEye1iwkWi9myecU39Do1THBN62ZKiGtd
8jqAqKuDzLtch2mcEjMlgi51RM3IhxtYGY98JE6ICcVu+VDcsAX+OWwOXaWGyv75
5TQG6V8fnYO+Qd4R13jO+32V+EgizHQirhVayAFQGbTBSPIg85G8gVNU64SxbZ5J
XQIDAQAB
-----END PUBLIC KEY-----`,
  environment: 'sandbox',
  language: 'pt'
};

// Test utilities
global.testUtils = {
  // Generate random trade number for tests
  generateTestTradeNo: () => `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Mock successful API response
  mockSuccessResponse: {
    is_success: 'T',
    dynamic_link: 'https://test.paypay.ao/payment?token=test123',
    trade_token: 'test_token_123',
    inner_trade_no: 'INNER_123',
    total_amount: '1000.00',
    return_url: 'https://test.merchant.com/return'
  },
  
  // Mock error API response
  mockErrorResponse: {
    is_success: 'F',
    error_code: 'INVALID_PARAMETER',
    sub_msg: 'Invalid amount provided',
    sub_code: 'AMOUNT_ERROR'
  },
  
  // Mock network error
  mockNetworkError: {
    code: 'ECONNREFUSED',
    message: 'Connection refused'
  }
};

// Console override for cleaner test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Suppress console.error and console.log during tests unless explicitly needed
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Add custom matchers if needed
expect.extend({
  toBeValidPaymentResponse(received) {
    const pass = received && 
      typeof received === 'object' &&
      typeof received.success === 'boolean' &&
      (received.data || received.error);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid payment response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid payment response`,
        pass: false,
      };
    }
  }
});