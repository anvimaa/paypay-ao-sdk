import { PayPayConfig, PayPayOptions, PaymentRequest, MulticaixaPaymentRequest, PaymentResponse, OrderStatusResponse, PaymentMethod } from './types';
import { Validators, Helpers } from './utils';
/**
 * PayPay AO SDK - Cliente TypeScript para integração com a API PayPay
 *
 * Este SDK fornece uma interface tipada e simplificada para interagir com os serviços
 * de pagamento da PayPay Africa, incluindo pagamentos via Multicaixa Express,
 * referência bancária e aplicação PayPay.
 */
export declare class PayPaySDK {
    private readonly config;
    private readonly options;
    /**
     * Cria uma nova instância do PayPay SDK
     */
    constructor(config: PayPayConfig, options?: PayPayOptions);
    /**
     * Valida a configuração fornecida
     */
    private _validateConfig;
    /**
     * Cria um pagamento genérico
     */
    createPayment(request: (PaymentRequest & {
        paymentMethod: PaymentMethod;
    }) | (MulticaixaPaymentRequest & {
        paymentMethod: PaymentMethod;
    })): Promise<PaymentResponse>;
    /**
     * Cria um pagamento MULTICAIXA Express
     */
    createMulticaixaPayment(request: MulticaixaPaymentRequest): Promise<PaymentResponse>;
    /**
     * Cria um pagamento por referência
     */
    createReferencePayment(request: PaymentRequest): Promise<PaymentResponse>;
    /**
     * Cria um pagamento via PayPay App
     */
    createPayPayAppPayment(request: PaymentRequest): Promise<PaymentResponse>;
    /**
     * Consulta o status de um pedido de pagamento
     */
    orderStatus(outTradeNo: string): Promise<OrderStatusResponse>;
    /**
     * Cancela um pedido de pagamento
     */
    closeOrder(outTradeNo: string): Promise<PaymentResponse>;
    /**
     * Verifica a assinatura de uma resposta
     */
    verifyResponseSignature(response: Record<string, any>): boolean;
    /**
     * Envia requisição para a API
     */
    private _send;
    /**
     * Obtém a configuração atual (apenas leitura)
     */
    getConfig(): Readonly<Required<PayPayConfig>>;
    /**
     * Obtém as opções atuais (apenas leitura)
     */
    getOptions(): Readonly<PayPayOptions>;
    /**
     * Gera um número único de pedido
     */
    static generateUniqueOrderNo(prefix?: string): string;
    /**
     * Valida número de telefone angolano
     */
    static validateAngolaPhoneNumber: typeof Validators.validateAngolaPhoneNumber;
    /**
     * Valida valor de pagamento
     */
    static validateAmount: typeof Validators.validateAmount;
    /**
     * Valida número de transação
     */
    static validateTradeNumber: typeof Validators.validateTradeNumber;
    /**
     * Valida email
     */
    static validateEmail: typeof Validators.validateEmail;
    /**
     * Valida IP
     */
    static validateIP: typeof Validators.validateIP;
    /**
     * Valida URL
     */
    static validateURL: typeof Validators.validateURL;
    /**
     * Valida assunto
     */
    static validateSubject: typeof Validators.validateSubject;
    /**
     * Obtém IP público
     */
    static getIp: typeof Helpers.getPublicIp;
}
//# sourceMappingURL=PayPaySDK.d.ts.map