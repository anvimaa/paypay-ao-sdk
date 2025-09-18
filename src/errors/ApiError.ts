import { PayPayError } from './PayPayError';

/**
 * Erro específico para falhas na comunicação com a API
 */
export class ApiError extends PayPayError {
  public readonly statusCode: number;
  public readonly apiResponse?: any;
  public readonly requestData?: any;

  constructor(
    message: string,
    statusCode: number,
    apiResponse?: any,
    requestData?: any,
    code?: string,
    subCode?: string
  ) {
    super(message, code, subCode, { statusCode, apiResponse, requestData });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.apiResponse = apiResponse;
    this.requestData = requestData;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Cria um erro de API a partir de uma resposta de erro
   */
  static fromApiResponse(
    statusCode: number,
    apiResponse: any,
    requestData?: any
  ): ApiError {
    const message = apiResponse?.sub_msg || apiResponse?.msg || 'API request failed';
    const code = apiResponse?.code;
    const subCode = apiResponse?.sub_code;

    return new ApiError(
      message,
      statusCode,
      apiResponse,
      requestData,
      code,
      subCode
    );
  }

  /**
   * Cria um erro de conexão
   */
  static connectionError(originalError: Error, requestData?: any): ApiError {
    return new ApiError(
      `Failed to connect to PayPay API: ${originalError.message}`,
      0,
      undefined,
      requestData,
      'CONNECTION_ERROR'
    );
  }

  /**
   * Cria um erro de timeout
   */
  static timeout(requestData?: any): ApiError {
    return new ApiError(
      'Request to PayPay API timed out',
      408,
      undefined,
      requestData,
      'TIMEOUT_ERROR'
    );
  }

  /**
   * Cria um erro de resposta inválida
   */
  static invalidResponse(response: any, requestData?: any): ApiError {
    return new ApiError(
      'Invalid response format from PayPay API',
      200,
      response,
      requestData,
      'INVALID_RESPONSE'
    );
  }

  /**
   * Verifica se é um erro temporário que pode ser retemptado
   */
  isRetryable(): boolean {
    return this.statusCode >= 500 || 
           this.statusCode === 429 || 
           this.statusCode === 408 ||
           this.code === 'CONNECTION_ERROR' ||
           this.code === 'TIMEOUT_ERROR';
  }

  /**
   * Converte para JSON com informações específicas da API
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      apiResponse: this.apiResponse,
      requestData: this.requestData,
      isRetryable: this.isRetryable()
    };
  }
}