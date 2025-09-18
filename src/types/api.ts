/**
 * Tipos para validação
 */

/**
 * Resultado de validação genérico
 */
export interface ValidationResult<T = any> {
  /** Indica se a validação passou */
  isValid: boolean;
  
  /** Valor formatado (se a validação passou) */
  formatted?: T;
  
  /** Lista de erros de validação */
  errors: string[];
}

/**
 * Resultado de validação de telefone
 */
export interface PhoneValidationResult extends ValidationResult<string> {
  /** Código do país */
  countryCode?: string;
  
  /** Número nacional */
  nationalNumber?: string;
}

/**
 * Opções de validação de valor
 */
export interface AmountValidationOptions {
  /** Valor mínimo permitido */
  minAmount?: number;
  
  /** Valor máximo permitido */
  maxAmount?: number;
  
  /** Moeda */
  currency?: string;
}

/**
 * Parâmetros de requisição para API
 */
export interface ApiRequestParams {
  /** Charset */
  charset: string;
  
  /** Conteúdo de negócio criptografado */
  biz_content: string;
  
  /** ID do parceiro */
  partner_id: string;
  
  /** Serviço */
  service: string;
  
  /** Número da requisição */
  request_no: string;
  
  /** Formato */
  format: string;
  
  /** Tipo de assinatura */
  sign_type: string;
  
  /** Versão */
  version: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Idioma */
  language: string;
  
  /** Assinatura */
  sign?: string;
}