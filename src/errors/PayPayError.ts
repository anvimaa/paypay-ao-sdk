/**
 * Classe base para erros do PayPay SDK
 */
export class PayPayError extends Error {
  public readonly code?: string;
  public readonly subCode?: string;
  public readonly details?: any;

  constructor(
    message: string,
    code?: string,
    subCode?: string,
    details?: any
  ) {
    super(message);
    this.name = 'PayPayError';
    this.code = code;
    this.subCode = subCode;
    this.details = details;

    // Mantém o stack trace correto no V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PayPayError);
    }
  }

  /**
   * Converte o erro para formato JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      subCode: this.subCode,
      details: this.details,
      stack: this.stack
    };
  }

  /**
   * Verifica se é um erro de sucesso da API
   */
  static isSuccess(code: string): boolean {
    return code === '10000';
  }
}