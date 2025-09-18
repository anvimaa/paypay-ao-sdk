"use strict";
/**
 * Exportações centralizadas de todos os tipos
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_CONSTANTS = void 0;
// Tipos de configuração
__exportStar(require("./config"), exports);
// Tipos de pagamento
__exportStar(require("./payment"), exports);
// Tipos de API e validação
__exportStar(require("./api"), exports);
/**
 * Constantes
 */
exports.PAYMENT_CONSTANTS = {
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