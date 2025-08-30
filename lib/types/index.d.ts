/**
 * TypeScript definitions for PayPay AO SDK
 * Official SDK for PayPay Angola payment integration
 */

declare module '@paypay-ao/sdk' {
  // Configuration interfaces
  export interface PayPaySDKConfig {
    partnerId: string;
    privateKey: string;
    paypayPublicKey: string;
    environment?: 'sandbox' | 'production';
    language?: 'pt' | 'en';
    saleProductCode?: string;
  }

  export interface EnvironmentConfig {
    name: string;
    apiUrl: string;
    description: string;
    features: {
      realTransactions: boolean;
      testCards: boolean;
      debugMode: boolean;
    };
  }

  // Order and payment interfaces
  export interface OrderDetails {
    outTradeNo: string;
    amount: number;
    subject?: string;
  }

  export interface MulticaixaOrderDetails extends OrderDetails {
    phoneNum?: string;
    paymentMethod?: 'EXPRESS' | 'REFERENCE';
  }

  export interface PaymentOptions {
    clientIp?: string;
    redirectUrl?: string;
  }

  // Response interfaces
  export interface PaymentResponseData {
    dynamicLink: string;
    tradeToken: string;
    outTradeNo: string;
    innerTradeNo: string;
    referenceId?: string;
    entityId?: string;
    totalAmount: number;
    returnUrl: string;
    qrCode?: string;
    rawResponse: any;
  }

  export interface PaymentError {
    code: string;
    subCode?: string;
    message: string;
    description?: string;
    rawResponse: any;
  }

  export interface PaymentResponse {
    success: boolean;
    data?: PaymentResponseData;
    error?: PaymentError;
  }

  // Validation interfaces
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    formatted?: any;
  }

  export interface PhoneValidationResult extends ValidationResult {
    formatted?: string;
  }

  export interface AmountValidationResult extends ValidationResult {
    formatted?: number;
  }

  // QR Code and Deep Link interfaces
  export interface QRCodeData {
    qrCodeData: string;
    format: string;
    size: string;
    instructions: {
      pt: string;
      en: string;
    };
  }

  export interface DeepLinkData {
    deepLink: string;
    fallbackUrl: string;
    instructions: {
      pt: string;
      en: string;
    };
  }

  // Payment flow interfaces
  export interface PaymentFlow {
    steps: string[];
    title: string;
  }

  export interface IntegrationOptions {
    web: {
      qrCode: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
      redirectLink: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
    };
    mobile: {
      deepLink: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
      fallback: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
    };
    api: {
      webhook: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
      polling: {
        recommended: boolean;
        description: string;
        implementation: string;
      };
    };
  }

  // SDK Info interface
  export interface SDKInfo {
    name: string;
    version: string;
    environment: string;
    supportedMethods: {
      multicaixa: string[];
      paypayApp: string[];
      currencies: string[];
    };
    author: string;
    documentation: string;
  }

  // Error classes
  export class PayPayError extends Error {
    code: string;
    details: any;
    timestamp: string;
    constructor(message: string, code?: string, details?: any);
    toJSON(): any;
  }

  export class PayPayConfigError extends PayPayError { }
  export class PayPayPaymentError extends PayPayError { }
  export class PayPayCryptoError extends PayPayError { }
  export class PayPayNetworkError extends PayPayError { }
  export class PayPayValidationError extends PayPayError { }
  export class PayPayAuthError extends PayPayError { }
  export class PayPayRateLimitError extends PayPayError { }
  export class PayPayServiceError extends PayPayError { }

  // Main SDK class
  export class PayPaySDK {
    constructor(config: PayPaySDKConfig);

    // Payment methods
    createMulticaixaPayment(
      orderDetails: MulticaixaOrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;

    createPayPayAppPayment(
      orderDetails: OrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;

    createExpressPayment(
      orderDetails: MulticaixaOrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;

    createReferencePayment(
      orderDetails: OrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;

    // Configuration methods
    validateConfig(): ValidationResult;
    getConfig(): Partial<PayPaySDKConfig>;
    updateConfig(newConfig: Partial<PayPaySDKConfig>): void;

    // Environment methods
    isSandbox(): boolean;
    isProduction(): boolean;
    getEnvironmentInfo(): EnvironmentConfig;

    // Utility methods
    generateTradeNumber(prefix?: string): string;
    validateAmount(amount: number): AmountValidationResult;
    validatePhoneNumber(phoneNum: string): PhoneValidationResult;
    formatPhoneNumber(phoneNum: string): string;
    getSupportedMethods(): any;
    getSDKInfo(): SDKInfo;

    // Cleanup
    destroy(): void;
  }

  // Component classes
  export class ConfigManager {
    constructor(config?: PayPaySDKConfig);
    setConfig(config: PayPaySDKConfig): void;
    getConfig(): PayPaySDKConfig;
    get(key: string): any;
    set(key: string, value: any): void;
    isSandbox(): boolean;
    isProduction(): boolean;
    validate(): boolean;
  }

  export class CryptoUtils {
    static validatePemKey(key: string, type?: string): boolean;
    static generateRequestNo(): string;
    static generateTimestamp(): string;
    static encryptBizContentWithPrivateKey(bizContent: string, privateKey: string): string;
    static generateSignature(params: any, privateKey: string): string;
    static verifySignature(data: string, signature: string, publicKey: string): boolean;
    static decryptWithPublicKey(encryptedContent: string, publicKey: string): string;
    static generateRandomString(length?: number, encoding?: string): string;
    static createHash(data: string, algorithm?: string): string;
  }

  export class RSAManager {
    constructor(privateKey?: string, publicKey?: string);
    setPrivateKey(privateKeyPem: string): void;
    setPayPayPublicKey(publicKeyPem: string): void;
    getPublicKey(): string;
    encryptWithPrivateKey(data: string): string;
    decryptWithPayPayPublicKey(encryptedData: string): string;
    signData(params: any): string;
    verifySignature(data: string, signature: string): boolean;
    getKeyInfo(): any;
    validateKeys(): void;
    clearKeys(): void;
  }

  export class PaymentClient {
    constructor(config: PayPaySDKConfig);
    createMulticaixaPayment(
      orderDetails: MulticaixaOrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;
    createPayPayAppPayment(
      orderDetails: OrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;
    getConfig(): Partial<PayPaySDKConfig>;
  }

  export class MulticaixaPayment extends PaymentClient {
    createExpressPayment(
      orderDetails: MulticaixaOrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;
    createReferencePayment(
      orderDetails: OrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;
    static validatePhoneNumber(phoneNum: string): boolean;
    static formatPhoneNumber(phoneNum: string): string;
    static getSupportedMethods(): string[];
    static getMethodRequirements(method: string): any;
  }

  export class PayPayAppPayment extends PaymentClient {
    createAppPayment(
      orderDetails: OrderDetails,
      options?: PaymentOptions
    ): Promise<PaymentResponse>;
    generateQRCodeData(dynamicLink: string): QRCodeData;
    generateDeepLink(dynamicLink: string): DeepLinkData;
    static validateAmount(amount: number): ValidationResult;
    static getPaymentFlow(language?: string): PaymentFlow;
    static getIntegrationOptions(): IntegrationOptions;
    static getSupportedCurrencies(): string[];
    static getTimeoutInfo(): any;
  }

  export class Validators {
    static validateAngolaPhoneNumber(phoneNum: string): PhoneValidationResult;
    static validateAmount(amount: number, options?: any): AmountValidationResult;
    static validateTradeNumber(tradeNo: string): ValidationResult;
    static validateEmail(email: string): ValidationResult;
    static validateIP(ip: string): ValidationResult;
    static validateURL(url: string): ValidationResult;
    static validateSubject(subject: string): ValidationResult;
    static validateOrderDetails(orderDetails: any, paymentType?: string): ValidationResult;
  }

  export class ErrorFactory {
    static fromApiResponse(response: any, operation?: string): PayPayError;
    static fromNetworkError(originalError: Error, operation?: string): PayPayNetworkError;
    static fromValidationErrors(validationErrors: string[], field?: string): PayPayValidationError;
  }

  export class ErrorHandler {
    static handle(error: Error, context?: any): void;
    static isRetryable(error: Error): boolean;
    static getRetryDelay(error: Error, attemptNumber?: number): number;
  }

  // Factory function
  export function createPayPaySDK(config: PayPaySDKConfig): PayPaySDK;

  // Environment utilities
  export const environments: Record<string, EnvironmentConfig>;
  export function getEnvironmentConfig(environment: string): EnvironmentConfig;

  // Utility functions
  export const utils: {
    generateTradeNumber(prefix?: string): string;
    validatePhoneNumber(phoneNum: string): boolean;
    formatPhoneNumber(phoneNum: string): string;
    validateAmount(amount: number): ValidationResult;
    getSupportedMethods(): any;
  };

  // Constants
  export const constants: {
    ENVIRONMENTS: string[];
    PAYMENT_METHODS: {
      MULTICAIXA: {
        EXPRESS: string;
        REFERENCE: string;
      };
      PAYPAY_APP: string;
    };
    CURRENCIES: string[];
    TIMEOUT: {
      DEFAULT: string;
      MAXIMUM: string;
      MINIMUM: string;
    };
  };

  // Quick start helpers
  export const quickStart: {
    createSandboxSDK(partnerId: string, privateKey: string, paypayPublicKey: string): PayPaySDK;
    createProductionSDK(partnerId: string, privateKey: string, paypayPublicKey: string): PayPaySDK;
  };

  // Documentation links
  export const docs: {
    apiReference: string;
    gettingStarted: string;
    examples: string;
    support: string;
  };

  // Version info
  export const version: string;
  export const name: string;

  // Default export
  export default PayPaySDK;
}