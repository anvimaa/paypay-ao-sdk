# Guia de Migração - PayPay AO SDK v1.x para v2.0

Este guia ajuda na migração do PayPay AO SDK da versão 1.x para a versão 2.0 com TypeScript.

## 📋 Resumo das Mudanças

### ✅ O que NÃO mudou (Compatível)
- **API pública**: Todos os métodos principais mantêm a mesma assinatura
- **Comportamento**: Funcionalidade idêntica para casos de uso existentes
- **Configuração**: Mesmo formato de configuração aceito
- **Métodos estáticos**: Validadores e utilitários inalterados

### 🆕 O que é NOVO na v2.0
- **TypeScript nativo** com tipagem completa
- **Dual package**: Suporte simultâneo para CommonJS e ESM
- **Classes de erro tipadas** para melhor tratamento
- **Validação aprimorada** com tipos específicos
- **IntelliSense melhorado** em IDEs

### ⚠️ Breaking Changes (Mínimos)
- **Importação**: Mudança na forma de importar (mas compatível)
- **Erros**: Tipos de erro mais específicos (opt-in)
- **Node.js**: Requer versão >= 16.0.0

## 🚀 Migração Passo a Passo

### 1. Atualizar Dependências

```bash
# Atualizar para v2.0
npm install paypay-ao-sdk@^2.0.0

# Se usando TypeScript, verificar versões
npm install typescript@^5.0.0 --save-dev
```

### 2. Ajustar Importações

#### JavaScript (CommonJS) - COMPATÍVEL
```javascript
// v1.x - Funcionava
const PayPaySDK = require('paypay-ao-sdk');

// v2.x - Ainda funciona (retrocompatibilidade)
const PayPaySDK = require('paypay-ao-sdk');

// v2.x - Recomendado
const { PayPaySDK } = require('paypay-ao-sdk');
```

#### TypeScript/ESM - NOVO
```typescript
// v2.x - Novo suporte nativo
import { PayPaySDK, PayPayConfig, PaymentResponse } from 'paypay-ao-sdk';
```

### 3. Usar Tipagem (Opcional para JavaScript)

#### Configuração Tipada
```typescript
// Antes (v1.x) - JavaScript
const config = {
  partnerId: 'PARTNER_ID',
  privateKey: '...',
  language: 'pt'
};

// Depois (v2.x) - TypeScript
import { PayPayConfig } from 'paypay-ao-sdk';

const config: PayPayConfig = {
  partnerId: 'PARTNER_ID',
  privateKey: '...',
  language: 'pt' // Autocompletar: 'pt' | 'en'
};
```

#### Métodos Tipados
```typescript
// Antes (v1.x)
const response = await sdk.createMulticaixaPayment({
  outTradeNo: 'ORDER-123',
  amount: 1000,
  phoneNum: '244912345678'
});

// Depois (v2.x) - Com tipos
import { MulticaixaPaymentRequest, PaymentResponse } from 'paypay-ao-sdk';

const request: MulticaixaPaymentRequest = {
  outTradeNo: 'ORDER-123',
  amount: 1000,
  phoneNum: '244912345678'
};

const response: PaymentResponse = await sdk.createMulticaixaPayment(request);
```

### 4. Melhorar Tratamento de Erros (Opcional)

#### Tratamento Básico (Compatível)
```javascript
// v1.x e v2.x - Funciona igual
try {
  const result = await sdk.createPayment(data);
} catch (error) {
  console.error('Erro:', error.message);
}
```

#### Tratamento Avançado (Novo)
```typescript
// v2.x - Tratamento tipado
import { ValidationError, ApiError, isValidationError, isApiError } from 'paypay-ao-sdk';

try {
  const result = await sdk.createPayment(data);
} catch (error) {
  if (isValidationError(error)) {
    console.error('Erro de validação:', {
      field: error.field,
      value: error.value,
      expectedFormat: error.expectedFormat
    });
  } else if (isApiError(error)) {
    console.error('Erro da API:', {
      statusCode: error.statusCode,
      apiResponse: error.apiResponse,
      isRetryable: error.isRetryable()
    });
  } else {
    console.error('Erro geral:', error.message);
  }
}
```

## 📝 Exemplos de Migração

### Exemplo 1: Projeto JavaScript Simples

#### Antes (v1.x)
```javascript
const PayPaySDK = require('paypay-ao-sdk');

const sdk = new PayPaySDK({
  partnerId: 'PARTNER_ID',
  privateKey: '...'
});

async function createPayment() {
  try {
    const orderNo = PayPaySDK.generateUniqueOrderNo('ORDER');
    const result = await sdk.createMulticaixaPayment({
      outTradeNo: orderNo,
      amount: 1000,
      phoneNum: '244912345678'
    });
    return result;
  } catch (error) {
    throw new Error('Payment failed: ' + error.message);
  }
}
```

#### Depois (v2.x)
```javascript
// Mudança mínima - apenas importação
const { PayPaySDK } = require('paypay-ao-sdk');

const sdk = new PayPaySDK({
  partnerId: 'PARTNER_ID',
  privateKey: '...'
});

async function createPayment() {
  try {
    const orderNo = PayPaySDK.generateUniqueOrderNo('ORDER');
    const result = await sdk.createMulticaixaPayment({
      outTradeNo: orderNo,
      amount: 1000,
      phoneNum: '244912345678'
    });
    return result;
  } catch (error) {
    throw new Error('Payment failed: ' + error.message);
  }
}
```

### Exemplo 2: Projeto TypeScript

#### Migração Completa
```typescript
// v2.x - TypeScript completo
import { 
  PayPaySDK, 
  PayPayConfig, 
  MulticaixaPaymentRequest, 
  PaymentResponse,
  ValidationError,
  isValidationError 
} from 'paypay-ao-sdk';

const config: PayPayConfig = {
  partnerId: 'PARTNER_ID',
  privateKey: '...',
  language: 'pt'
};

const sdk = new PayPaySDK(config);

async function createPayment(amount: number, phone: string): Promise<PaymentResponse> {
  try {
    const request: MulticaixaPaymentRequest = {
      outTradeNo: PayPaySDK.generateUniqueOrderNo('ORDER'),
      amount,
      phoneNum: phone,
      subject: 'Compra de produto'
    };
    
    return await sdk.createMulticaixaPayment(request);
  } catch (error) {
    if (isValidationError(error)) {
      throw new Error(`Dados inválidos: ${error.field} - ${error.expectedFormat}`);
    }
    throw error;
  }
}
```

## 🔍 Verificação de Migração

### Checklist de Migração

- [ ] ✅ Atualizar versão do pacote para ^2.0.0
- [ ] ✅ Verificar versão do Node.js (>= 16.0.0)
- [ ] ✅ Ajustar importações se necessário
- [ ] ✅ Testar funcionalidades existentes
- [ ] ✅ Aproveitar novos tipos TypeScript (opcional)
- [ ] ✅ Melhorar tratamento de erros (opcional)
- [ ] ✅ Atualizar documentação interna

### Script de Teste de Migração

```javascript
// test-migration.js
const { PayPaySDK, ValidationError } = require('paypay-ao-sdk');

console.log('Testando migração...');

// Teste 1: Importação
console.log('✅ Importação:', typeof PayPaySDK);

// Teste 2: Métodos estáticos (compatibilidade)
const orderNo = PayPaySDK.generateUniqueOrderNo('TEST');
console.log('✅ Geração ordem:', orderNo.length > 0);

// Teste 3: Validação (compatibilidade)
const phoneResult = PayPaySDK.validateAngolaPhoneNumber('244912345678');
console.log('✅ Validação telefone:', phoneResult.isValid);

// Teste 4: Instanciação (compatibilidade)
try {
  new PayPaySDK({ partnerId: '', privateKey: '' });
} catch (error) {
  console.log('✅ Tratamento erro:', error instanceof ValidationError);
}

console.log('🎉 Migração bem-sucedida!');
```

## 🚨 Problemas Comuns

### 1. Erro de Importação
```
Error: Cannot find module 'paypay-ao-sdk'
```
**Solução**: Reinstalar o pacote
```bash
npm uninstall paypay-ao-sdk
npm install paypay-ao-sdk@^2.0.0
```

### 2. Erro de Tipo TypeScript
```
Property 'phoneNum' does not exist on type 'PaymentRequest'
```
**Solução**: Usar tipo correto
```typescript
// Em vez de PaymentRequest
import { MulticaixaPaymentRequest } from 'paypay-ao-sdk';
```

### 3. Erro de Versão Node.js
```
Error: Requires Node.js >= 16.0.0
```
**Solução**: Atualizar Node.js
```bash
node --version  # Verificar versão atual
# Atualizar para Node.js 16+ se necessário
```

## 📞 Suporte

### Onde Buscar Ajuda
- 📖 [Documentação completa](./README-v2.md)
- 🐛 [Issues no GitHub](https://github.com/anvimaa/paypay-ao-sdk/issues)
- 💬 Discussões na comunidade
- 📧 Suporte técnico oficial

### Rollback para v1.x (Se Necessário)
```bash
# Voltar para última versão estável v1.x
npm install paypay-ao-sdk@^1.0.5
```

---

**Recomendação**: A migração para v2.0 é fortemente recomendada para novos projetos e quando possível para projetos existentes, devido aos benefícios significativos de tipo safety e developer experience.