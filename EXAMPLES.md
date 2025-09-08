# Exemplos Práticos - PayPay AO SDK

Este documento contém exemplos práticos essenciais de uso do PayPay AO SDK.

## 🔧 Configuração Inicial

```javascript
const PayPaySDK = require('@paypay-ao/payment-sdk');

const sdk = new PayPaySDK({
  partnerId: process.env.PAYPAY_PARTNER_ID,
  privateKey: process.env.PAYPAY_PRIVATE_KEY,
  paypayPublicKey: process.env.PAYPAY_PUBLIC_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  language: 'pt'
});
```

## 💳 MULTICAIXA Express

```javascript
async function createExpressPayment(orderData) {
  try {
    const payment = await sdk.createMulticaixaPayment({
      outTradeNo: `ORDER_${Date.now()}`,
      amount: orderData.total,
      phoneNum: orderData.customerPhone,
      paymentMethod: 'EXPRESS',
      subject: `Pedido #${orderData.orderNumber}`
    }, {
      clientIp: orderData.clientIp
    });

    if (payment.success) {
      return {
        success: true,
        paymentLink: payment.data.dynamicLink,
        tradeToken: payment.data.tradeToken
      };
    } else {
      throw new Error(payment.error.message);
    }
  } catch (error) {
    console.error('Erro ao criar pagamento EXPRESS:', error.message);
    throw error;
  }
}
```

## 📄 MULTICAIXA Reference

```javascript
async function createReferencePayment(orderData) {
  const payment = await sdk.createReferencePayment({
    outTradeNo: `REF_${Date.now()}`,
    amount: orderData.amount,
    subject: orderData.description
  });

  if (payment.success) {
    return {
      reference: payment.data.referenceId,
      entity: payment.data.entityId,
      amount: payment.data.totalAmount
    };
  }
  throw new Error(payment.error.message);
}
```

## 📱 PayPay App

```javascript
async function createAppPayment(orderData) {
  const payment = await sdk.createPayPayAppPayment({
    outTradeNo: `APP_${Date.now()}`,
    amount: orderData.amount,
    subject: orderData.description
  });

  if (payment.success) {
    return {
      paymentLink: payment.data.dynamicLink,
      tradeToken: payment.data.tradeToken
    };
  }
  throw new Error(payment.error.message);
}
```

## 🌐 API REST com Express.js

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/payments/multicaixa', async (req, res) => {
  try {
    const { amount, phoneNum, paymentMethod, description } = req.body;
    
    const payment = await sdk.createMulticaixaPayment({
      outTradeNo: sdk.generateTradeNumber('WEB_'),
      amount: parseFloat(amount),
      phoneNum,
      paymentMethod,
      subject: description || 'Pagamento Web'
    }, {
      clientIp: req.ip
    });

    if (payment.success) {
      res.json({
        success: true,
        payment: {
          id: payment.data.tradeToken,
          link: payment.data.dynamicLink,
          amount: payment.data.totalAmount
        }
      });
    } else {
      res.status(400).json({ error: payment.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/payments/paypay-app', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const payment = await sdk.createPayPayAppPayment({
      outTradeNo: sdk.generateTradeNumber('APP_'),
      amount: parseFloat(amount),
      subject: description || 'Pagamento App'
    });

    if (payment.success) {
      res.json({
        success: true,
        payment: {
          id: payment.data.tradeToken,
          link: payment.data.dynamicLink,
          qrCode: payment.data.dynamicLink
        }
      });
    } else {
      res.status(400).json({ error: payment.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

## 🔔 Webhook/Callbacks

```javascript
app.post('/webhook/paypay', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const notification = JSON.parse(req.body.toString());
    
    switch (notification.trade_status) {
      case 'TRADE_SUCCESS':
        console.log('Pagamento bem-sucedido:', notification.out_trade_no);
        // Atualizar banco de dados
        // Enviar confirmação
        break;
        
      case 'TRADE_FAILED':
        console.log('Pagamento falhou:', notification.out_trade_no);
        // Processar falha
        break;
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid payload' });
  }
});
```

## 🚨 Tratamento de Erros

```javascript
const { PayPayValidationError, PayPayNetworkError } = require('@paypay-ao/payment-sdk');

async function robustPayment(orderData) {
  try {
    return await sdk.createMulticaixaPayment(orderData);
  } catch (error) {
    if (error instanceof PayPayValidationError) {
      throw new Error(`Dados inválidos: ${error.message}`);
    } else if (error instanceof PayPayNetworkError) {
      throw new Error('Erro de conectividade');
    } else {
      throw new Error(`Erro inesperado: ${error.message}`);
    }
  }
}
```

## 📱 React Native

```javascript
// PayPayService.js
import PayPaySDK from '@paypay-ao/payment-sdk';

class PayPayService {
  constructor() {
    this.sdk = new PayPaySDK({
      partnerId: 'YOUR_PARTNER_ID',
      privateKey: 'YOUR_PRIVATE_KEY',
      paypayPublicKey: 'PAYPAY_PUBLIC_KEY',
      environment: __DEV__ ? 'sandbox' : 'production'
    });
  }

  async createAppPayment(amount, description) {
    const payment = await this.sdk.createPayPayAppPayment({
      outTradeNo: `MOBILE_${Date.now()}`,
      amount,
      subject: description
    });

    if (payment.success) {
      return {
        paymentLink: payment.data.dynamicLink,
        tradeToken: payment.data.tradeToken
      };
    }
    throw new Error(payment.error.message);
  }
}

export default new PayPayService();
```

## 🧪 Testes

```javascript
// tests/payment.test.js
const PayPaySDK = require('@paypay-ao/payment-sdk');

describe('PayPay Payments', () => {
  let sdk;
  
  beforeEach(() => {
    sdk = new PayPaySDK({
      partnerId: 'TEST_PARTNER',
      privateKey: 'TEST_KEY',
      paypayPublicKey: 'TEST_PUBLIC_KEY',
      environment: 'sandbox'
    });
  });
  
  test('deve validar configuração', () => {
    const validation = sdk.validateConfig();
    expect(validation.isValid).toBe(true);
  });
  
  test('deve validar número de telefone', () => {
    expect(sdk.validatePhoneNumber('244900123456')).toBe(true);
    expect(sdk.validatePhoneNumber('invalid')).toBe(false);
  });
  
  test('deve gerar número de transação único', () => {
    const tradeNo1 = sdk.generateTradeNumber();
    const tradeNo2 = sdk.generateTradeNumber();
    expect(tradeNo1).not.toBe(tradeNo2);
  });
});
```

## 🔧 Utilitários

```javascript
const { utils, constants } = require('@paypay-ao/payment-sdk');

// Gerar número de transação
const tradeNo = utils.generateTradeNumber('ORDER_');

// Validar telefone
const isValid = utils.validatePhoneNumber('244900123456');

// Formatar telefone
const formatted = utils.formatPhoneNumber('900123456');

// Verificar constantes
console.log('Métodos:', constants.PAYMENT_METHODS);
console.log('Moedas:', constants.CURRENCIES);
```

Para mais exemplos detalhados, consulte a [documentação oficial](https://developer.paypay.ao/docs/examples).