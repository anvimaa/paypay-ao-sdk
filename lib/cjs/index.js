"use strict";
/**
 * PayPay AO SDK - Ponto de entrada principal
 *
 * SDK oficial para integração de pagamentos PayPay Angola com suporte completo ao TypeScript
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
exports.SDK_INFO = exports.VERSION = exports.PayPaySDK = void 0;
// Exportação principal
var PayPaySDK_1 = require("./PayPaySDK");
Object.defineProperty(exports, "PayPaySDK", { enumerable: true, get: function () { return PayPaySDK_1.PayPaySDK; } });
// Exportações de tipos
__exportStar(require("./types"), exports);
// Exportações de erros
__exportStar(require("./errors"), exports);
// Exportações de utilitários
__exportStar(require("./utils"), exports);
// Exportação padrão para compatibilidade CommonJS
const PayPaySDK_2 = require("./PayPaySDK");
exports.default = PayPaySDK_2.PayPaySDK;
/**
 * Informações da versão (será atualizada durante o build)
 */
exports.VERSION = '2.0.0-beta';
/**
 * Informações do SDK
 */
exports.SDK_INFO = {
    name: 'paypay-ao-sdk',
    version: exports.VERSION,
    language: 'TypeScript',
    author: 'ANTONIO MANTENTE',
    description: 'SDK oficial para integração de pagamentos PayPay AO - TypeScript'
};
//# sourceMappingURL=index.js.map