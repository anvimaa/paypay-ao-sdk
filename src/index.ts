/**
 * PayPay AO SDK - Ponto de entrada principal
 * 
 * SDK oficial para integração de pagamentos PayPay Angola com suporte completo ao TypeScript
 */

// Exportação principal
export { PayPaySDK } from './PayPaySDK';

// Exportações de tipos
export * from './types';

// Exportações de erros
export * from './errors';

// Exportações de utilitários
export * from './utils';

// Exportação padrão para compatibilidade CommonJS
import { PayPaySDK } from './PayPaySDK';
export default PayPaySDK;

/**
 * Informações da versão (será atualizada durante o build)
 */
export const VERSION = '2.0.0-beta';

/**
 * Informações do SDK
 */
export const SDK_INFO = {
  name: 'paypay-ao-sdk',
  version: VERSION,
  language: 'TypeScript',
  author: 'ANTONIO MANTENTE',
  description: 'SDK oficial para integração de pagamentos PayPay AO - TypeScript'
} as const;