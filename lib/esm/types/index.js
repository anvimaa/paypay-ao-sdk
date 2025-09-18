/**
 * Exportações centralizadas de todos os tipos
 */
// Tipos de configuração
export * from './config';
// Tipos de pagamento
export * from './payment';
// Tipos de API e validação
export * from './api';
/**
 * Constantes
 */
export const PAYMENT_CONSTANTS = {
    /** Valor mínimo em AOA */
    MIN_AMOUNT: 1,
    /** Valor máximo em AOA */
    MAX_AMOUNT: 10000000000000,
    /** Comprimento mínimo do número de transação */
    MIN_TRADE_NO_LENGTH: 6,
    /** Comprimento máximo do número de transação */
    MAX_TRADE_NO_LENGTH: 32,
    /** Timeout padrão para pagamentos */
    DEFAULT_TIMEOUT: '15m',
    /** URL padrão da API */
    DEFAULT_API_URL: 'https://gateway.paypayafrica.com/recv.do',
    /** Código padrão do produto de venda */
    DEFAULT_SALE_PRODUCT_CODE: '050200030',
    /** Idioma padrão */
    DEFAULT_LANGUAGE: 'en',
    /** Códigos de resposta de sucesso */
    SUCCESS_CODES: ['10000'],
    /** Padrões de telefone angolano */
    ANGOLA_PHONE_PATTERNS: [
        /^244[9][0-9]{8}$/, // 244 + 9XXXXXXXX (mobile)
        /^244[2][0-9]{7}$/, // 244 + 2XXXXXXX (landline)
        /^9[0-9]{8}$/ // 9XXXXXXXX (mobile without country code)
    ]
};
//# sourceMappingURL=index.js.map