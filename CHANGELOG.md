# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-08-29

### 🎉 Lançamento Inicial

#### Adicionado
- **SDK Principal**: Classe `PayPaySDK` como ponto de entrada principal
- **Pagamentos MULTICAIXA**: Suporte completo para EXPRESS e REFERENCE
- **Pagamentos PayPay App**: Integração com aplicação móvel
- **Criptografia**: Implementação completa RSA PKCS1 e SHA1withRSA
- **Configuração**: Gerenciamento dinâmico de configurações com validação
- **Ambientes**: Suporte para Sandbox e Produção
- **TypeScript**: Definições completas para melhor DX
- **Validação**: Validadores robustos para dados de entrada
- **Tratamento de Erros**: Classes específicas para diferentes tipos de erro
- **Utilitários**: Funções auxiliares para validação e formatação

#### Funcionalidades

##### Métodos de Pagamento
- `createMulticaixaPayment()` - Pagamentos MULTICAIXA Express/Reference
- `createPayPayAppPayment()` - Pagamentos via PayPay App
- `createExpressPayment()` - Atalho para MULTICAIXA Express
- `createReferencePayment()` - Atalho para MULTICAIXA Reference

##### Configuração e Ambiente
- `validateConfig()` - Validação de configuração
- `updateConfig()` - Atualização dinâmica de configuração
- `isSandbox()` / `isProduction()` - Verificação de ambiente
- `getEnvironmentInfo()` - Informações do ambiente atual

##### Utilitários
- `generateTradeNumber()` - Geração de números de transação únicos
- `validatePhoneNumber()` - Validação de números de telefone Angola
- `formatPhoneNumber()` - Formatação automática de telefones
- `validateAmount()` - Validação de montantes
- `getSupportedMethods()` - Métodos de pagamento suportados

##### Criptografia
- Encriptação RSA PKCS1 automática
- Assinatura SHA1withRSA de requisições
- Validação de chaves PEM
- Geração segura de timestamps GMT+1

##### Classes de Erro
- `PayPayError` - Erro base
- `PayPayConfigError` - Erros de configuração
- `PayPayPaymentError` - Erros de pagamento
- `PayPayCryptoError` - Erros criptográficos
- `PayPayNetworkError` - Erros de rede
- `PayPayValidationError` - Erros de validação
- `PayPayAuthError` - Erros de autenticação
- `PayPayRateLimitError` - Erros de rate limiting
- `PayPayServiceError` - Erros de serviço

#### Componentes Internos

##### ConfigManager
- Validação automática de configurações
- Suporte a múltiplos ambientes
- Gestão segura de chaves RSA

##### CryptoUtils
- `validatePemKey()` - Validação de chaves PEM
- `generateRequestNo()` - Geração de números de requisição
- `generateTimestamp()` - Timestamps GMT+1
- `encryptBizContentWithPrivateKey()` - Encriptação RSA
- `generateSignature()` - Assinatura SHA1withRSA
- `verifySignature()` - Verificação de assinaturas

##### PaymentClient
- Cliente base para operações de pagamento
- Normalização de respostas da API
- Tratamento robusto de erros HTTP

##### Validators
- Validação de números de telefone Angola
- Validação de montantes com limites
- Validação de dados de pedidos
- Validação de emails, IPs e URLs

#### TypeScript
- Definições completas para todas as classes
- Interfaces para configuração e respostas
- Tipos para validação e utilitários
- Suporte completo para IntelliSense

#### Testes
- Suíte completa de testes unitários
- Cobertura de código com Jest
- Testes para todos os componentes principais
- Mocks e fixtures para desenvolvimento

#### Documentação
- README abrangente com exemplos
- Arquivo EXAMPLES com casos práticos
- Definições TypeScript documentadas
- Comentários JSDoc em todo o código

### 🔧 Dependências

#### Produção
- `axios` ^1.10.0 - Cliente HTTP
- `node-forge` ^1.3.1 - Operações criptográficas
- `qs` ^6.14.0 - Serialização de query strings
- `validator` ^13.15.15 - Validações

#### Peer Dependencies
- `crypto` ^1.0.1 - Operações criptográficas nativas
- `uuid` ^11.1.0 - Geração de UUIDs

#### Desenvolvimento
- `jest` ^29.7.0 - Framework de testes
- `eslint` ^8.57.0 - Linting
- `jsdoc` ^4.0.2 - Documentação
- `nodemon` ^3.1.10 - Desenvolvimento

### 📊 Estatísticas

- **Arquivos**: 20+ arquivos de código
- **Cobertura de Testes**: 90%+
- **Tamanho**: ~500KB (comprimido)
- **Suporte Node.js**: >=16.0.0

### 🌍 Compatibilidade

- **Node.js**: >=16.0.0
- **npm**: >=8.0.0
- **TypeScript**: >=4.0.0
- **Ambientes**: Browser (via bundler), Node.js, React Native

### 🔒 Segurança

- Validação rigorosa de todas as entradas
- Chaves privadas nunca expostas em logs
- Implementação segura de criptografia RSA
- Validação de assinaturas em respostas

### 📈 Performance

- Operações criptográficas otimizadas
- Cache de configuração validada
- Gestão eficiente de memória
- Timeouts configuráveis para requisições

### 🚀 Distribuição

- Publicação no npm como `@paypay-ao/payment-sdk`
- Suporte a ES Modules e CommonJS
- Definições TypeScript incluídas
- Documentação online disponível

---

## Versões Futuras

### Planejado para v1.1.0
- [ ] Suporte a webhooks assinados
- [ ] Cache de respostas
- [ ] Retry automático com backoff
- [ ] Métricas e monitoramento

### Planejado para v1.2.0
- [ ] Suporte a múltiplas moedas
- [ ] Pagamentos recorrentes
- [ ] Split payments
- [ ] Relatórios de transações

### Planejado para v2.0.0
- [ ] Migração para ES Modules apenas
- [ ] API redesenhada com breaking changes
- [ ] Suporte a GraphQL
- [ ] SDK para outros métodos de pagamento

---

Para mais informações sobre cada versão, consulte a [documentação oficial](https://developer.paypay.ao) ou as [release notes no GitHub](https://github.com/paypay-ao/payment-sdk/releases).