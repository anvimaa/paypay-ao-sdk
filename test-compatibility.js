#!/usr/bin/env node

/**
 * Script de teste para verificar compatibilidade CommonJS e ESM
 */

console.log('🧪 Testando compatibilidade CJS/ESM...\n');

// Teste CommonJS
console.log('✅ Teste 1: CommonJS require');
try {
  const { PayPaySDK } = require('./lib/cjs/index.js');
  console.log('- PayPaySDK CJS:', typeof PayPaySDK);
  console.log('- Métodos estáticos disponíveis:', Object.getOwnPropertyNames(PayPaySDK).filter(name => typeof PayPaySDK[name] === 'function'));
  
  // Testar instanciação
  const sdk = new PayPaySDK({
    partnerId: 'TEST_PARTNER_ID',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAOb9ztBh/awG26pT
G4Jw/tGoej321bYEvIR07cXU0SSYwhSN3Dp2dD9oQDO3QaThcu423mMIuBgzPVl9
Mex4oDty4cE5EEtwMEBy6N9h2eNxz1PF3nrBqcLsDtpc7zywuATuiDr9T7WOe/gx
6wYFnp1scTr2E3e3J/oWgdlKeH0NAgMBAAECgYEAvSsoPuGxJDutk6xiAA5XsQ2f
prVJybnRRUyZGQWzjZwIfVq7+6jchLz0ryWp/cSgIdQPhd0zHqZ/3JS52OXkmZyr
u8YJaSTeYBIFfco4dguD/dpWJh0c9X2yygb7eQEcG2JpgjvI0FHBvojdGE5B1Wz0
pis5sUqfOdW35/nUNIECQQD0F206tcW06VNNL/3YdjO8VvDN5hOd/vThrNFV1aBK
w2njSh8Dr9ixq6lRFSljVTAa/b22Ak9YJaXi4O2YPHHtAkEA8kLEqrqDhs1Pn243
JrXm8+vMulW+6XYCgo/AFspRXJssnaNK8lrlTDAxrLU/+kjCwX+ITDdj1Hj3S7Zq
NPlToQJAZheCTSMH/UH14HvpLWdK/kRS1ZucquGfZOCWcdM3Bu4y1KkEzdL3zGAj
IlG6jNxtkWx9s6nFq/WbK4iud5UYhQJAJhyG3+zzoBNQgV5PYtGfAaSI0o+GtyeP
gYany24Mmqr2u93ifnn6NKAoUGk7JV6o9NPhV0wncleNX+XUk3zdwQJBAKj3nGgw
zUPUBCkxLAK2tr+vf0ifQ/udJQml9p2pPO8b+4aB6IXc2tGxQrmBXFVOvRFVzTbs
DVnp5lAOol92g8k=
-----END PRIVATE KEY-----`,
    language: 'pt'
  });
  
  console.log('- Instanciação CJS:', typeof sdk);
  console.log('- Configuração:', typeof sdk.getConfig === 'function' ? 'OK' : 'ERRO');
  
} catch (error) {
  console.error('❌ Erro CJS:', error.message);
}

console.log('\n✅ Teste 2: Utilitários estáticos');
try {
  const { PayPaySDK } = require('./lib/cjs/index.js');
  
  // Testar geração de número único
  const orderNo = PayPaySDK.generateUniqueOrderNo('TEST');
  console.log('- Número gerado:', orderNo);
  console.log('- Formato válido:', /^TEST_\d+[A-Z0-9]+$/.test(orderNo) ? 'OK' : 'ERRO');
  
  // Testar validação de telefone
  const phoneValidation = PayPaySDK.validateAngolaPhoneNumber('244912345678');
  console.log('- Validação telefone:', phoneValidation.isValid ? 'OK' : 'ERRO');
  
  // Testar validação de valor
  const amountValidation = PayPaySDK.validateAmount(1000);
  console.log('- Validação valor:', amountValidation.isValid ? 'OK' : 'ERRO');
  
} catch (error) {
  console.error('❌ Erro utilitários:', error.message);
}

console.log('\n✅ Teste 3: Tipos e erros');
try {
  const { ValidationError, PayPayError, isValidationError } = require('./lib/cjs/index.js');
  
  console.log('- ValidationError:', typeof ValidationError);
  console.log('- PayPayError:', typeof PayPayError);
  console.log('- isValidationError:', typeof isValidationError);
  
  // Testar criação de erro
  const error = new ValidationError('test', 'invalid', 'valid format');
  console.log('- Erro criado:', error instanceof ValidationError ? 'OK' : 'ERRO');
  console.log('- Type guard:', isValidationError(error) ? 'OK' : 'ERRO');
  
} catch (error) {
  console.error('❌ Erro tipos:', error.message);
}

console.log('\n🎉 Testes completados!');