/**
 * Tipos relacionados a pagamentos
 */

/**
 * Métodos de pagamento disponíveis
 */
export type PaymentMethod = 'EXPRESS' | 'REFERENCE' | 'PAYPAY_APP';

/**
 * Status de transação
 */
export type TradeStatus = 
  | 'WAIT_BUYER_PAY'    // Aguardando pagamento do comprador
  | 'TRADE_SUCCESS'     // Pagamento realizado com sucesso
  | 'TRADE_FINISHED'    // Transação finalizada
  | 'TRADE_CLOSED';     // Transação cancelada/fechada

/**
 * Moedas suportadas
 */
export type Currency = 'AOA';

/**
 * Requisição de pagamento base
 */
export interface PaymentRequest {
  /** Número único do pedido do comerciante */
  outTradeNo: string;
  
  /** Valor do pagamento em AOA */
  amount: number;
  
  /** Descrição do pagamento */
  subject?: string;
  
  /** IP do pagador */
  payerIp?: string;
}

/**
 * Requisição de pagamento MULTICAIXA Express
 */
export interface MulticaixaPaymentRequest extends PaymentRequest {
  /** Número de telefone no formato 244XXXXXXXXX ou 9XXXXXXXX */
  phoneNum: string;
}

/**
 * Informações de transação
 */
export interface TradeInfo {
  /** Moeda (sempre AOA) */
  currency: Currency;
  
  /** Número único do pedido do comerciante */
  out_trade_no: string;
  
  /** Identidade do beneficiário */
  payee_identity: string;
  
  /** Tipo de identidade do beneficiário */
  payee_identity_type: string;
  
  /** Preço unitário */
  price: string;
  
  /** Quantidade */
  quantity: string;
  
  /** Descrição do pagamento */
  subject: string;
  
  /** Valor total */
  total_amount: string;
}

/**
 * Método de pagamento MULTICAIXA
 */
export interface MulticaixaPayMethod {
  /** Código do produto de pagamento */
  pay_product_code: string;
  
  /** Valor do pagamento */
  amount: string;
  
  /** Código do banco */
  bank_code: 'MUL' | 'REF';
  
  /** Número de telefone (apenas para MULTICAIXA Express) */
  phone_num?: string;
}

/**
 * Conteúdo de negócio para requisições à API
 */
export interface BizContent {
  /** Tipo de caixa (sempre SDK) */
  cashier_type: 'SDK';
  
  /** IP do pagador */
  payer_ip: string;
  
  /** Código do produto de venda */
  sale_product_code: string;
  
  /** Tempo limite para expiração */
  timeout_express: string;
  
  /** Informações da transação */
  trade_info: TradeInfo;
  
  /** Método de pagamento (opcional, apenas para MULTICAIXA) */
  pay_method?: MulticaixaPayMethod;
}

/**
 * Resposta da API PayPay
 */
export interface PaymentResponse {
  /** Código de resposta */
  code: string;
  
  /** Mensagem de resposta */
  msg: string;
  
  /** Sub-código (em caso de erro) */
  sub_code?: string;
  
  /** Sub-mensagem (em caso de erro) */
  sub_msg?: string;
  
  /** Conteúdo de negócio */
  biz_content?: {
    /** Status da transação */
    status: string;
    
    /** Número da transação PayPay */
    trade_no: string;
    
    /** Número único do pedido do comerciante */
    out_trade_no: string;
    
    /** Valor total */
    total_amount: string;
    
    /** Link dinâmico para pagamento (PayPay App) */
    dynamic_link?: string;
    
    /** Token de transação */
    trade_token?: string;
    
    /** URL de retorno */
    return_url?: string;
  };
}

/**
 * Resposta de consulta de status
 */
export interface OrderStatusResponse extends PaymentResponse {
  /** Número da transação PayPay */
  trade_no?: string;
  
  /** Número único do pedido do comerciante */
  out_trade_no?: string;
  
  /** Status da transação */
  trade_status?: TradeStatus;
  
  /** Valor total */
  total_amount?: string;
  
  /** Moeda */
  currency?: Currency;
  
  /** Data/hora do pagamento */
  gmt_payment?: string;
}