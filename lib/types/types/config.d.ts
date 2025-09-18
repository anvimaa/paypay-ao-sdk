/**
 * Configurações do PayPay SDK
 */
export interface PayPayConfig {
    /** ID do parceiro fornecido pela PayPay */
    partnerId: string;
    /** Chave privada RSA em formato PEM para assinar requisições */
    privateKey: string;
    /** Chave pública da PayPay em formato PEM para verificar respostas */
    paypayPublicKey?: string;
    /** Idioma de preferência para mensagens (pt ou en) */
    language?: 'pt' | 'en';
    /** Código do produto de venda fornecido pela PayPay */
    saleProductCode?: string;
    /** URL da API PayPay (padrão: https://gateway.paypayafrica.com/recv.do) */
    apiUrl?: string;
}
/**
 * Opções adicionais para configuração do SDK
 */
export interface PayPayOptions {
    /** Timeout para requisições em segundos (padrão: 30) */
    timeout?: number;
    /** Número de tentativas de retry em caso de falha (padrão: 3) */
    retryAttempts?: number;
    /** Ambiente de execução */
    environment?: 'production' | 'sandbox';
}
/**
 * Configuração completa do SDK (interno)
 */
export interface PayPayInternalConfig extends Required<PayPayConfig> {
    options: PayPayOptions;
}
//# sourceMappingURL=config.d.ts.map