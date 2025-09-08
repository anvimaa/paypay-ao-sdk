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
- ✅ **Validação** - Validação robusta de dados de entrada


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
- **Sale Product Code** - Código Único do produto fornecido pelo suporte Pay Pay
- **API URL** - Url autorizada da API fornecido pelo suporte Pay Pay

### 2. Inicialização Básica

```javascript
const PayPaySDK = require('paypay-ao-sdk');

const sdk = new PayPaySDK({
  partnerId: 'SEU PARTNER ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SUA_CHAVE_PRIVADA_RSA
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY
-----END PUBLIC KEY-----`,
  language: 'pt/en',
  saleProductCode: 'Codigo do produto',
  apiUrl:'URL da API'
});
```

## 💳 Uso Básico

### Express

Pagamento imediato processado diretamente via número de telefone:

```javascript
try {
  const outTradeNo = PayPaySDK.generateUniqueOrderNo("MUL-");
  const resp = await sdk.createMulticaixaPayment({
      outTradeNo,
      amount: amount,
      phoneNum: phoneNum,
      payerIp: ip,
  });
  console.log(resp);
} catch (error) {
  console.error('Falha na requisição:', error.message);
}
```

### Reference

Pagamento por referência para processamento posterior:

```javascript
const outTradeNo = PayPaySDK.generateUniqueOrderNo("REF-");
const resp = await sdk.createReferencePayment({
    outTradeNo,
    amount: amount,
    payerIp: ip,
});
console.log(resp);
```

### PayPay App

Pagamento via aplicação móvel com QR Code ou Deep Link:

```javascript
const outTradeNo = PayPaySDK.generateUniqueOrderNo("PAYPAY-");
const resp = await sdk.createPayPayAppPayment({
    outTradeNo,
    amount: amount,
    payerIp: ip,
});
console.log(resp);
```

## 🔍 Exemplos Avançados

### Validação de Dados

```javascript
// Validar número de telefone
const phoneValidation = PayPaySDK.validatePhoneNumber('900123456');
if (phoneValidation.isValid) {
  console.log('Telefone formatado:', phoneValidation.formatted);
}

// Validar montante
const amountValidation = PayPaySDK.validateAmount(1000);
if (!amountValidation.isValid) {
  console.error('Erros:', amountValidation.errors);
}

// Gerar número de transação único
const tradeNo = PayPaySDK.generateUniqueOrderNo('ORDER_');
console.log('Trade Number:', tradeNo);
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

## ⚠️ Limitações e Considerações

### Limites de Montante

- **Mínimo**: 1 AOA
- **Máximo**: 10.000.000.000.000 AOA

### Timeouts

- **Padrão**: 15 minutos
- **Máximo**: 30 minutos
- **Mínimo**: 5 minutos

### Formatos Suportados

- **Números de telefone**: 244XXXXXXXXX ou 9XXXXXXXX
- **Moeda**: Apenas AOA (Kwanza Angolano)
- **Codificação**: UTF-8


## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de submeter pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte técnico, entre em contato:

- **Email**: anvimaa@gmail.com
- **Documentação**: https://portal.paypayafrica.com/passport/apidoc/guide

---

Desenvolvido com ❤️ por anvimaa