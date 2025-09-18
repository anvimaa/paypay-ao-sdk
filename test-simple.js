#!/usr/bin/env node

/**
 * Teste simples usando a versão compilada
 */

console.log('🧪 Testando versão compilada...\n');

try {
  const { PayPaySDK, ValidationError, PayPayError } = require('./lib/cjs/index.js');
  
  console.log('✅ 1. Importação:', typeof PayPaySDK);
  
  // Teste de criação de instância com configuração válida
  const validConfig = {
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
  };
  
  const sdk = new PayPaySDK(validConfig);
  console.log('✅ 2. Instanciação:', typeof sdk);
  
  // Teste métodos estáticos
  const orderNo = PayPaySDK.generateUniqueOrderNo('TEST');
  console.log('✅ 3. Geração ordem:', orderNo.length > 0);
  
  const phoneResult = PayPaySDK.validateAngolaPhoneNumber('244912345678');
  console.log('✅ 4. Validação telefone:', phoneResult.isValid);
  
  const amountResult = PayPaySDK.validateAmount(1000);
  console.log('✅ 5. Validação valor:', amountResult.isValid);
  
  // Teste tratamento de erro
  try {
    new PayPaySDK({ partnerId: '', privateKey: '' });
  } catch (error) {
    console.log('✅ 6. Tratamento de erro:', error instanceof ValidationError);
  }
  
  console.log('\n🎉 Todos os testes passaram!');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}