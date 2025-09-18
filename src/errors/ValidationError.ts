import { PayPayError } from './PayPayError';

/**
 * Erro de validação específico para o PayPay SDK
 */
export class ValidationError extends PayPayError {
  public readonly field: string;
  public readonly value: any;
  public readonly expectedFormat: string;

  constructor(
    field: string,
    value: any,
    expectedFormat: string,
    customMessage?: string
  ) {
    const message = customMessage || 
      `Validation failed for field '${field}'. Expected: ${expectedFormat}, got: ${typeof value === 'string' ? `"${value}"` : value}`;
    
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.expectedFormat = expectedFormat;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Cria um erro de validação para campo obrigatório
   */
  static required(field: string): ValidationError {
    return new ValidationError(
      field,
      undefined,
      'required field',
      `Field '${field}' is required`
    );
  }

  /**
   * Cria um erro de validação para tipo inválido
   */
  static invalidType(field: string, value: any, expectedType: string): ValidationError {
    return new ValidationError(
      field,
      value,
      expectedType,
      `Field '${field}' must be of type ${expectedType}, got ${typeof value}`
    );
  }

  /**
   * Cria um erro de validação para formato inválido
   */
  static invalidFormat(field: string, value: any, format: string): ValidationError {
    return new ValidationError(
      field,
      value,
      format,
      `Field '${field}' has invalid format. Expected: ${format}`
    );
  }

  /**
   * Cria um erro de validação para valor fora do intervalo
   */
  static outOfRange(field: string, value: any, min?: number, max?: number): ValidationError {
    let rangeDesc = '';
    if (min !== undefined && max !== undefined) {
      rangeDesc = `between ${min} and ${max}`;
    } else if (min !== undefined) {
      rangeDesc = `at least ${min}`;
    } else if (max !== undefined) {
      rangeDesc = `at most ${max}`;
    }

    return new ValidationError(
      field,
      value,
      rangeDesc,
      `Field '${field}' value ${value} is out of range. Expected: ${rangeDesc}`
    );
  }

  /**
   * Converte para JSON com informações específicas de validação
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      expectedFormat: this.expectedFormat
    };
  }
}