/**
 * Exportações centralizadas dos utilitários
 */

export { Validators } from './validators';
export { CryptoUtils } from './crypto';
export { Helpers } from './helpers';

// Importar para usar nas exportações estáticas
import { Validators } from './validators';
import { CryptoUtils } from './crypto';
import { Helpers } from './helpers';

// Re-exportar funcionalidades específicas para facilitar o uso
export { 
  Validators as PayPayValidators,
  CryptoUtils as PayPayCrypto,
  Helpers as PayPayHelpers
};

/**
 * Exportações estáticas para compatibilidade com a API existente
 */
export const validateAngolaPhoneNumber = Validators.validateAngolaPhoneNumber.bind(Validators);
export const validateAmount = Validators.validateAmount.bind(Validators);
export const validateTradeNumber = Validators.validateTradeNumber.bind(Validators);
export const validateEmail = Validators.validateEmail.bind(Validators);
export const validateIP = Validators.validateIP.bind(Validators);
export const validateURL = Validators.validateURL.bind(Validators);
export const validateSubject = Validators.validateSubject.bind(Validators);

export const generateUniqueOrderNo = CryptoUtils.generateUniqueOrderNo.bind(CryptoUtils);
export const getIp = Helpers.getPublicIp.bind(Helpers);
export const getPublicIp = Helpers.getPublicIp.bind(Helpers);