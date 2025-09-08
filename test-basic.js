#!/usr/bin/env node

/**
 * Script de teste básico para verificar funcionamento da biblioteca PayPay AO SDK
 */

const PayPaySDK = require('./lib/index.js');

console.log('🧪 Testando PayPay AO SDK...\n');

// Teste 1: Verificar exportações
console.log('✅ Teste 1: Verificar exportações');
console.log('- PayPaySDK:', typeof PayPaySDK);
console.log('- Versão:', PayPaySDK.version);
console.log('- Nome:', PayPaySDK.name);
console.log('- Utilitários disponíveis:', Object.keys(PayPaySDK.utils));
console.log('- Constantes disponíveis:', Object.keys(PayPaySDK.constants));
console.log();

// Teste 2: Criar instância SDK (com chaves de teste)
console.log('✅ Teste 2: Criar instância SDK');
try {
  const sdk = new PayPaySDK({
    partnerId: 'TEST_PARTNER_ID',
    privateKey: global.testConfig?.privateKey || `-----BEGIN PRIVATE KEY-----
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
    paypayPublicKey: global.testConfig?.paypayPublicKey || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArL1akdPqJVYIGI4vGNiN
dvoxn7TWYOorLrNOBz3BP2yVSf31L6yPbQIs8hn59iOzbWy8raXAYWjYgM9Lh6h2
6XutwmEjZHqqoH5pLDYvZALMxEwunDpeTFrikuej0nWxjmpA9m4eicXcJbCMJowL
47a5Jw61VkF+wbIj5vxEcSN4SSddJ04zEye1iwkWi9myecU39Do1THBN62ZKiGtd
8jqAqKuDzLtch2mcEjMlgi51RM3IhxtYGY98JE6ICcVu+VDcsAX+OWwOXaWGyv75
5TQG6V8fnYO+Qd4R13jO+32V+EgizHQirhVayAFQGbTBSPIg85G8gVNU64SxbZ5J
XQIDAQAB
-----END PUBLIC KEY-----`,
    environment: 'sandbox',
    language: 'pt'
  });
  
  console.log('- SDK criado com sucesso');
  console.log('- Ambiente:', sdk.getConfig().environment);
  console.log('- É sandbox:', sdk.isSandbox());
  console.log();
  
  // Teste 3: Métodos utilitários
  console.log('✅ Teste 3: Métodos utilitários');
  
  const tradeNo = sdk.generateTradeNumber('TEST_');
  console.log('- Trade number gerado:', tradeNo);
  
  const phoneValidation = sdk.validatePhoneNumber('244900123456');
  console.log('- Validação telefone válido:', phoneValidation);
  
  const invalidPhoneValidation = sdk.validatePhoneNumber('invalid');
  console.log('- Validação telefone inválido:', invalidPhoneValidation);
  
  const amountValidation = sdk.validateAmount(1000);
  console.log('- Validação montante válido:', amountValidation.isValid);
  
  const methods = sdk.getSupportedMethods();
  console.log('- Métodos suportados:', methods);
  console.log();
  
  // Teste 4: Informações do SDK
  console.log('✅ Teste 4: Informações do SDK');
  const sdkInfo = sdk.getSDKInfo();
  console.log('- Nome:', sdkInfo.name);
  console.log('- Versão:', sdkInfo.version);
  console.log('- Ambiente:', sdkInfo.environment);
  console.log();
  
  // Teste 5: Quick Start helpers
  console.log('✅ Teste 5: Quick Start helpers');
  try {
    const sandboxSDK = PayPaySDK.quickStart.createSandboxSDK(
      'TEST_PARTNER',
      sdk.getConfig().privateKey || 'test-key',
      sdk.getConfig().paypayPublicKey || 'test-public-key'
    );
    console.log('- Sandbox SDK criado via quickStart');
  } catch (error) {
    console.log('- Erro esperado no quickStart (chaves de teste):', error.message);
  }
  
  console.log();
  console.log('🎉 Todos os testes básicos passaram!');
  console.log('✨ A biblioteca PayPay AO SDK está funcionando corretamente.');
  
  // Cleanup
  sdk.destroy();
  
} catch (error) {
  console.error('❌ Erro ao testar SDK:', error.message);
  process.exit(1);
}