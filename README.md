# PayPay AO SDK

[![npm version](https://img.shields.io/npm/v/paypay-ao-sdk.svg)](https://www.npmjs.com/package/paypay-ao-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

SDK oficial para integração de pagamentos PayPay Angola. Suporte completo para **MULTICAIXA Express**, **MULTICAIXA Reference** e **PayPay App**.

## 🚀 Características

- ✅ **MULTICAIXA Express** - Pagamentos imediatos via número de telefone
- ✅ **MULTICAIXA Reference** - Pagamentos por referência
- ✅ **PayPay App** - Pagamentos via aplicação móvel
- ✅ **TypeScript** - Tipagem completa para melhor experiência de desenvolvimento
- ✅ **Segurança** - Criptografia RSA PKCS1 e assinaturas SHA1withRSA
- ✅ **Ambientes** - Suporte para Sandbox e Produção
- ✅ **Validação** - Validação robusta de dados de entrada
- ✅ **Tratamento de Erros** - Classes de erro específicas e informativos

## 📦 Instalação

```bash
npm install paypay-ao-sdk
```

ou

```bash
pnpm add paypay-ao-sdk
```

## 🔧 Configuração Inicial

### 1. Obter Credenciais

Para usar o SDK, você precisará de:
- **Partner ID** - Identificador do merchant
- **Chave Privada RSA** - Para assinar requisições
- **Chave Pública PayPay** - Para verificar respostas

### 2. Inicialização Básica

```javascript
const PayPaySDK = require('paypay-ao-sdk');

const sdk = new PayPaySDK({
  partnerId: 'SEU_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SUA_CHAVE_PRIVADA_RSA
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY
-----END PUBLIC KEY-----`,
  environment: 'sandbox', // ou 'production'
  language: 'pt'
});
```

### 3. Inicialização Rápida

```javascript
const { quickStart } = require('paypay-ao-sdk');

// Para sandbox
const sandboxSDK = quickStart.createSandboxSDK(
  'PARTNER_ID',
  'PRIVATE_KEY',
  'PAYPAY_PUBLIC_KEY'
);

// Para produção
const productionSDK = quickStart.createProductionSDK(
  'PARTNER_ID',
  'PRIVATE_KEY',
  'PAYPAY_PUBLIC_KEY'
);
```

## 💳 Uso Básico

### MULTICAIXA Express

Pagamento imediato processado diretamente via número de telefone:

```javascript
try {
  const payment = await sdk.createMulticaixaPayment({
    outTradeNo: 'ORDER_2024_001',
    amount: 5000.00,
    phoneNum: '244900123456',
    paymentMethod: 'EXPRESS',
    subject: 'Compra de produto'
  }, {
    clientIp: '192.168.1.100'
  });

  if (payment.success) {
    console.log('Pagamento criado:', payment.data.dynamicLink);
    console.log('Token:', payment.data.tradeToken);
  } else {
    console.error('Erro:', payment.error.message);
  }
} catch (error) {
  console.error('Falha na requisição:', error.message);
}
```

### MULTICAIXA Reference

Pagamento por referência para processamento posterior:

```javascript
const referencePayment = await sdk.createReferencePayment({
  outTradeNo: 'REF_2024_001',
  amount: 2500.50,
  subject: 'Pagamento de serviço'
});

if (referencePayment.success) {
  console.log('Referência:', referencePayment.data.referenceId);
  console.log('Entidade:', referencePayment.data.entityId);
}
```

### PayPay App

Pagamento via aplicação móvel com QR Code ou Deep Link:

```javascript
const appPayment = await sdk.createPayPayAppPayment({
  outTradeNo: 'APP_2024_001',
  amount: 1500.00,
  subject: 'Assinatura mensal'
});

if (appPayment.success) {
  // Para QR Code
  console.log('Link dinâmico:', appPayment.data.dynamicLink);
  
  // Para integração móvel
  console.log('Deep link:', appPayment.data.dynamicLink);
}
```

## 🔍 Exemplos Avançados

### Validação de Dados

```javascript
// Validar número de telefone
const phoneValidation = sdk.validatePhoneNumber('900123456');
if (phoneValidation.isValid) {
  console.log('Telefone formatado:', phoneValidation.formatted);
}

// Validar montante
const amountValidation = sdk.validateAmount(1000);
if (!amountValidation.isValid) {
  console.error('Erros:', amountValidation.errors);
}

// Gerar número de transação único
const tradeNo = sdk.generateTradeNumber('ORDER_');
console.log('Trade Number:', tradeNo);
```

### Tratamento de Erros

```javascript
const { PayPayError, PayPayValidationError, PayPayNetworkError } = require('paypay-ao-sdk');

try {
  const payment = await sdk.createMulticaixaPayment(orderData);
} catch (error) {
  if (error instanceof PayPayValidationError) {
    console.error('Erro de validação:', error.details);
  } else if (error instanceof PayPayNetworkError) {
    console.error('Erro de rede:', error.message);
  } else if (error instanceof PayPayError) {
    console.error('Erro PayPay:', error.code, error.message);
  } else {
    console.error('Erro desconhecido:', error.message);
  }
}
```

### Configuração Dinâmica

```javascript
// Verificar configuração atual
const config = sdk.getConfig();
console.log('Ambiente atual:', config.environment);

// Alternar para produção
sdk.updateConfig({
  environment: 'production',
  language: 'en'
});

// Verificar se é sandbox
if (sdk.isSandbox()) {
  console.log('Executando em modo de teste');
}
```

## 🔐 Segurança

### Gestão de Chaves

```javascript
const { CryptoUtils } = require('paypay-ao-sdk');

// Validar chave privada
try {
  CryptoUtils.validatePemKey(privateKey, 'PRIVATE KEY');
  console.log('Chave privada válida');
} catch (error) {
  console.error('Chave inválida:', error.message);
}
```

### Assinatura e Verificação

```javascript
// O SDK automaticamente:
// 1. Encripta o conteúdo com sua chave privada
// 2. Gera assinatura SHA1withRSA
// 3. Valida respostas da API PayPay
```

## 📱 Integração Móvel

### QR Code

```javascript
const { PayPayAppPayment } = require('paypay-ao-sdk');

const payment = await sdk.createPayPayAppPayment(orderDetails);

if (payment.success) {
  const qrData = PayPayAppPayment.prototype.generateQRCodeData(payment.data.dynamicLink);
  
  // Use qualquer biblioteca de QR Code com qrData.qrCodeData
  console.log('Dados do QR:', qrData.qrCodeData);
  console.log('Instruções:', qrData.instructions.pt);
}
```

### Deep Links

```javascript
const deepLink = PayPayAppPayment.prototype.generateDeepLink(payment.data.dynamicLink);

// Para iOS/Android
window.location.href = deepLink.deepLink;

// Fallback para web
if (!appInstalled) {
  window.location.href = deepLink.fallbackUrl;
}
```

## 🌐 TypeScript

O SDK inclui definições TypeScript completas:

```typescript
import PayPaySDK, { PayPaySDKConfig, PaymentResponse } from 'paypay-ao-sdk';

const config: PayPaySDKConfig = {
  partnerId: 'PARTNER_ID',
  privateKey: 'PRIVATE_KEY',
  paypayPublicKey: 'PUBLIC_KEY',
  environment: 'sandbox'
};

const sdk = new PayPaySDK(config);

const payment: PaymentResponse = await sdk.createMulticaixaPayment({
  outTradeNo: 'ORDER_001',
  amount: 1000,
  phoneNum: '244900123456',
  paymentMethod: 'EXPRESS'
});
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🔧 Utilitários

### Constantes Disponíveis

```javascript
const { constants } = require('paypay-ao-sdk');

console.log('Ambientes:', constants.ENVIRONMENTS);
console.log('Métodos de pagamento:', constants.PAYMENT_METHODS);
console.log('Moedas suportadas:', constants.CURRENCIES);
console.log('Timeouts:', constants.TIMEOUT);
```

### Funções Utilitárias

```javascript
const { utils } = require('paypay-ao-sdk');

// Gerar número de transação
const tradeNo = utils.generateTradeNumber('PREFIX_');

// Validar telefone
const isValidPhone = utils.validatePhoneNumber('244900123456');

// Formatar telefone
const formatted = utils.formatPhoneNumber('900123456');

// Validar montante
const amountValidation = utils.validateAmount(1000);

// Métodos suportados
const methods = utils.getSupportedMethods();
```

## 📊 Fluxo de Pagamento

### MULTICAIXA Express

```mermaid
sequenceDiagram
    participant App as Sua Aplicação
    participant SDK as PayPay SDK
    participant API as PayPay API
    participant User as Utilizador
    
    App->>SDK: createMulticaixaPayment()
    SDK->>SDK: Validar dados
    SDK->>SDK: Encriptar conteúdo
    SDK->>SDK: Gerar assinatura
    SDK->>API: POST /gateway/recv.do
    API-->>SDK: Resposta com link dinâmico
    SDK-->>App: PaymentResponse
    App->>User: Apresentar link/QR
    User->>API: Confirmar pagamento
    API-->>App: Callback (webhook)
```

### PayPay App

```mermaid
sequenceDiagram
    participant App as Sua Aplicação
    participant SDK as PayPay SDK
    participant API as PayPay API
    participant PayPay as App PayPay
    
    App->>SDK: createPayPayAppPayment()
    SDK->>API: Criar pagamento
    API-->>SDK: Link dinâmico
    SDK-->>App: PaymentResponse
    App->>PayPay: Redirecionar/QR Code
    PayPay->>API: Processar pagamento
    API-->>App: Notificação
```

## 🏗️ Ambientes

### Sandbox (Teste)

```javascript
const sdk = new PayPaySDK({
  // ... outras configurações
  environment: 'sandbox'
});

// URL da API: https://sandbox-gateway.paypayafrica.com/recv.do
```

### Produção

```javascript
const sdk = new PayPaySDK({
  // ... outras configurações
  environment: 'production'
});

// URL da API: https://gateway.paypayafrica.com/recv.do
```

## ⚠️ Limitações e Considerações

### Limites de Montante

- **Mínimo**: 100 AOA
- **Máximo**: 10.000.000 AOA

### Timeouts

- **Padrão**: 15 minutos
- **Máximo**: 30 minutos
- **Mínimo**: 5 minutos

### Formatos Suportados

- **Números de telefone**: 244XXXXXXXXX ou 9XXXXXXXX
- **Moeda**: Apenas AOA (Kwanza Angolano)
- **Codificação**: UTF-8

## 🐛 Resolução de Problemas

### Erros Comuns

1. **Chave Privada Inválida**
   ```javascript
   // Verificar formato PEM
   if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
     throw new Error('Formato de chave inválido');
   }
   ```

2. **Erro de Assinatura**
   ```javascript
   // Verificar se a chave corresponde ao Partner ID
   const validation = sdk.validateConfig();
   if (!validation.isValid) {
     console.error('Configuração inválida:', validation.errors);
   }
   ```

3. **Timeout de Rede**
   ```javascript
   // Aumentar timeout das requisições
   const axios = require('axios');
   axios.defaults.timeout = 30000; // 30 segundos
   ```

### Debug

```javascript
// Ativar logs detalhados
process.env.PAYPAY_DEBUG = 'true';

// Verificar informações do SDK
const info = sdk.getSDKInfo();
console.log('SDK Info:', info);

// Verificar ambiente
const envInfo = sdk.getEnvironmentInfo();
console.log('Environment:', envInfo);
```

## 📖 Documentação Adicional

- [API Reference](https://developer.paypay.ao/api)
- [Guia de Início Rápido](https://developer.paypay.ao/docs/getting-started)
- [Exemplos](https://developer.paypay.ao/docs/examples)
- [Suporte](https://support.paypay.ao)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de submeter pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte técnico, entre em contato:

- **Email**: developers@paypay.ao
- **Documentação**: https://developer.paypay.ao
- **Issues**: https://github.com/paypay-ao/payment-sdk/issues

---

Desenvolvido com ❤️ pela equipe PayPay Angola