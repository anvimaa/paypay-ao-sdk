/**
 * Exportações centralizadas de todos os tipos
 */
export * from './config';
export * from './payment';
export * from './api';
/**
 * Tipos utilitários
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
/**
 * Constantes
 */
export declare const PAYMENT_CONSTANTS: {
    /** Valor mínimo em AOA */
    readonly MIN_AMOUNT: 1;
    /** Valor máximo em AOA */
    readonly MAX_AMOUNT: 10000000000000;
    /** Comprimento mínimo do número de transação */
    readonly MIN_TRADE_NO_LENGTH: 6;
    /** Comprimento máximo do número de transação */
    readonly MAX_TRADE_NO_LENGTH: 32;
    /** Timeout padrão para pagamentos */
    readonly DEFAULT_TIMEOUT: "15m";
    /** URL padrão da API */
    readonly DEFAULT_API_URL: "https://gateway.paypayafrica.com/recv.do";
    /** Código padrão do produto de venda */
    readonly DEFAULT_SALE_PRODUCT_CODE: "050200030";
    /** Idioma padrão */
    readonly DEFAULT_LANGUAGE: "en";
    /** Códigos de resposta de sucesso */
    readonly SUCCESS_CODES: readonly ["10000"];
    /** Padrões de telefone angolano */
    readonly ANGOLA_PHONE_PATTERNS: readonly [RegExp, RegExp, RegExp];
};
//# sourceMappingURL=index.d.ts.map