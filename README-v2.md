# PayPay AO SDK v2.0 - TypeScript

[![npm version](https://img.shields.io/npm/v/paypay-ao-sdk.svg)](https://www.npmjs.com/package/paypay-ao-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

SDK oficial para integração de pagamentos PayPay Angola com **suporte completo ao TypeScript**. Totalmente reescrito em TypeScript com tipos robustos, suporte dual para CommonJS e ESM, e compatibilidade total com projetos JavaScript existentes.

## 🚀 Novidades da v2.0

- ✅ **TypeScript Nativo** - Tipagem completa para melhor experiência de desenvolvimento
- ✅ **Dual Package** - Suporte simultâneo para CommonJS (`require`) e ESM (`import`)
- ✅ **Type Safety** - Prevenção de erros em tempo de compilação
- ✅ **Melhor IntelliSense** - Autocompletar e documentação aprimorados
- ✅ **Classes de Erro Tipadas** - Tratamento de erros mais robusto
- ✅ **Backward Compatibility** - 100% compatível com v1.x

## 📦 Instalação

```bash
npm install paypay-ao-sdk
```

ou

```bash
pnpm add paypay-ao-sdk
```

## 🔧 Configuração Inicial

### TypeScript/ESM
```typescript
import { PayPaySDK, PayPayConfig, PaymentResponse } from 'paypay-ao-sdk';

const config: PayPayConfig = {
  partnerId: 'SEU_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SUA_CHAVE_PRIVADA_RSA
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY
-----END PUBLIC KEY-----`,
  language: 'pt', // ou 'en'
  saleProductCode: 'CODIGO_DO_PRODUTO',
  apiUrl: 'URL_DA_API'
};

const sdk = new PayPaySDK(config);
```

### JavaScript/CommonJS
```javascript
const { PayPaySDK } = require('paypay-ao-sdk');

const sdk = new PayPaySDK({
  partnerId: 'SEU_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SUA_CHAVE_PRIVADA_RSA
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY
-----END PUBLIC KEY-----`,
  language: 'pt',
  saleProductCode: 'CODIGO_DO_PRODUTO',
  apiUrl: 'URL_DA_API'
});
```

## 💳 Uso Básico

### MULTICAIXA Express (TypeScript)
```typescript
import { MulticaixaPaymentRequest, PaymentResponse } from 'paypay-ao-sdk';

const request: MulticaixaPaymentRequest = {
  outTradeNo: PayPaySDK.generateUniqueOrderNo("MUL"),
  amount: 1000.50,
  phoneNum: "244912345678",
  subject: "Compra de produto",
  payerIp: await PayPaySDK.getIp()
};

try {
  const response: PaymentResponse = await sdk.createMulticaixaPayment(request);
  console.log('Pagamento criado:', response);
} catch (error) {
  console.error('Erro:', error.message);
}
```

### Pagamento por Referência
```typescript
import { PaymentRequest } from 'paypay-ao-sdk';

const request: PaymentRequest = {
  outTradeNo: PayPaySDK.generateUniqueOrderNo("REF"),
  amount: 500.00,
  subject: "Pagamento de serviço"
};

const response = await sdk.createReferencePayment(request);
```

### PayPay App
```typescript
const request: PaymentRequest = {
  outTradeNo: PayPaySDK.generateUniqueOrderNo("PAYPAY"),
  amount: 750.25,
  subject: "Compra online"
};

const response = await sdk.createPayPayAppPayment(request);
```

## 🔍 Consulta e Gestão

### Consultar Status
```typescript
import { OrderStatusResponse } from 'paypay-ao-sdk';

const status: OrderStatusResponse = await sdk.orderStatus('ORDER-123456789');

if (status.trade_status === 'TRADE_SUCCESS') {
  console.log('Pagamento confirmado!');
}
```

### Cancelar Pedido
```typescript
const result = await sdk.closeOrder('ORDER-123456789');
```

## 🛡️ Validação e Tipos

### Validações Tipadas
```typescript
import { 
  ValidationResult, 
  PhoneValidationResult,
  AmountValidationOptions 
} from 'paypay-ao-sdk';

// Validação de telefone
const phoneResult: PhoneValidationResult = PayPaySDK.validateAngolaPhoneNumber('244912345678');
if (phoneResult.isValid) {
  console.log('Telefone formatado:', phoneResult.formatted);
}

// Validação de valor
const amountOptions: AmountValidationOptions = {
  minAmount: 100,
  maxAmount: 100000,
  currency: 'AOA'
};

const amountResult: ValidationResult<number> = PayPaySDK.validateAmount(1500, amountOptions);
```

### Tratamento de Erros
```typescript
import { 
  PayPayError, 
  ValidationError, 
  ApiError,
  isValidationError,
  isApiError 
} from 'paypay-ao-sdk';

try {
  await sdk.createMulticaixaPayment(request);
} catch (error) {
  if (isValidationError(error)) {
    console.error('Erro de validação:', error.field, error.expectedFormat);
  } else if (isApiError(error)) {
    console.error('Erro da API:', error.statusCode, error.apiResponse);
  } else {
    console.error('Erro geral:', error.message);
  }
}
```

## 🔧 Configuração Avançada

### Opções Adicionais
```typescript
import { PayPayOptions } from 'paypay-ao-sdk';

const options: PayPayOptions = {
  timeout: 30000,           // 30 segundos
  retryAttempts: 3,         // 3 tentativas
  environment: 'production' // ou 'sandbox'
};

const sdk = new PayPaySDK(config, options);
```

### Verificação de Assinatura
```typescript
// Verificar resposta de webhook
const isValid = sdk.verifyResponseSignature(webhookResponse);
if (isValid) {
  console.log('Assinatura válida');
}
```

## 📚 Tipos Disponíveis

### Configuração
- `PayPayConfig` - Configuração principal do SDK
- `PayPayOptions` - Opções adicionais
- `PayPayInternalConfig` - Configuração interna (readonly)

### Pagamentos
- `PaymentRequest` - Requisição de pagamento base
- `MulticaixaPaymentRequest` - Requisição para MULTICAIXA Express
- `PaymentResponse` - Resposta da API de pagamento
- `OrderStatusResponse` - Resposta de consulta de status
- `PaymentMethod` - Tipos de método de pagamento
- `TradeStatus` - Status de transação

### Validação
- `ValidationResult<T>` - Resultado de validação genérico
- `PhoneValidationResult` - Resultado de validação de telefone
- `AmountValidationOptions` - Opções de validação de valor

### Erros
- `PayPayError` - Erro base do SDK
- `ValidationError` - Erro de validação
- `ApiError` - Erro de comunicação com API

## 🔄 Migração da v1.x

### Mudanças Principais
1. **Importação**:
   ```javascript
   // v1.x
   const PayPaySDK = require('paypay-ao-sdk');
   
   // v2.x (compatível)
   const { PayPaySDK } = require('paypay-ao-sdk');
   // ou
   import { PayPaySDK } from 'paypay-ao-sdk';
   ```

2. **Tratamento de Erros**:
   ```javascript
   // v1.x
   try {
     await sdk.createPayment(data);
   } catch (error) {
     console.log(error.message);
   }
   
   // v2.x (melhorado)
   try {
     await sdk.createPayment(data);
   } catch (error) {
     if (error instanceof ValidationError) {
       console.log('Erro de validação:', error.field);
     }
   }
   ```

### Compatibilidade
- ✅ Todos os métodos da v1.x funcionam sem alteração
- ✅ Mesma API e assinaturas de função
- ✅ Comportamento idêntico para casos de uso existentes
- ⚠️ Novas classes de erro (opt-in, não breaking)

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Verificar tipos TypeScript
npm run test:types
```

## 🏗️ Build

```bash
# Build completo (CJS + ESM + Types)
npm run build

# Build apenas CommonJS
npm run build:cjs

# Build apenas ESM
npm run build:esm

# Build apenas definições de tipos
npm run build:types
```

## 📋 Requisitos

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **TypeScript**: >= 5.0.0 (para projetos TypeScript)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT © [ANTONIO MANTENTE](https://anvima.vercel.app)

## 🔗 Links

- [Documentação da API PayPay](https://portal.paypayafrica.com/passport/apidoc/guide)
- [NPM Package](https://www.npmjs.com/package/paypay-ao-sdk)
- [GitHub Repository](https://github.com/anvimaa/paypay-ao-sdk)
- [Issues](https://github.com/anvimaa/paypay-ao-sdk/issues)

---

**Nota**: Esta é uma versão major (v2.0) com mudanças significativas na arquitetura interna, mas mantém compatibilidade total com a API pública da v1.x.