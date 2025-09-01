/**
 * Payment routes module for PayPay AO SDK
 * Handles all payment-related API endpoints
 */

const express = require("express");
const { createPayment, createPayPayAppPayment } = require("../services/paymentService");

const PayPaySDK = require('paypay-ao-sdk');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const sdk = new PayPaySDK({
    partnerId: process.env.PAYPAY_PARTNER_ID,
    privateKey: process.env.PAYPAY_PRIVATE_KEY,
    paypayPublicKey: process.env.PAYPAY_PUBLIC_KEY,
    saleProductCode: process.env.PAYPAY_SALE_PRODUCT_CODE,
    language: 'en',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'production',
});

const router = express.Router();

router.post("/create-payment", async (req, res) => {
    try {
        const { total_amount, paymentMethod, phone_num } = req.body;

        if (String(paymentMethod).toUpperCase() !== "EXPRESS" && String(paymentMethod).toUpperCase() !== "REFERENCE") {
            return res.status(400).json({
                success: false,
                error: "This endpoint supports only express or reference payments",
            });
        }

        if (!total_amount || !phone_num) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: total_amount and phone_num",
            });
        }

        const orderDetails = {
            outTradeNo: Date.now().toString(),
            amount: parseFloat(total_amount),
            phoneNum: phone_num,
            subject: "Purchase",
            paymentMethod: paymentMethod,
        };

        const result = await createPayment(orderDetails, req.ip);

        if (result.code === "S0001" && result.biz_content.status === "P") {
            res.json({
                success: true,
                dynamic_link: result.biz_content.dynamic_link || "",
                trade_token: result.biz_content.trade_token || "",
                out_trade_no: result.biz_content.out_trade_no || "",
                inner_trade_no: result.biz_content.trade_no || "",
                reference_id: result.biz_content.reference_id || "",
                entity_id: result.biz_content.entity_id || "",
                total_amount: parseFloat(
                    result.biz_content.total_amount || total_amount
                ),
                return_url: result.biz_content.dynamic_link,
            });
            console.log({
                success: true,
                dynamic_link: result.biz_content.dynamic_link,
                trade_token: result.biz_content.trade_token,
                out_trade_no: result.biz_content.out_trade_no,
                inner_trade_no: result.biz_content.trade_no,
                total_amount: parseFloat(
                    result.biz_content.total_amount || total_amount
                ),
                return_url: result.biz_content.dynamic_link,
            });
        } else {
            res.json({
                success: false,
                code: result.code,
                sub_code: result.sub_code,
                message: result.msg || "Falha ao iniciar pagamento.",
                description: result.sub_msg || "Falha ao iniciar pagamento.",
            });
        }
    } catch (err) {
        console.error("Error in /create-payment:", err.message);
        res.json({ success: false, error: String(err) });
    }
});

router.post("/paypay-app", async (req, res) => {
    try {
        const { total_amount, subject } = req.body;

        if (!total_amount) {
            return res.status(400).json({
                success: false,
                error: "Missing required field: total_amount",
            });
        }

        const orderDetails = {
            outTradeNo: Date.now().toString(),
            amount: parseFloat(total_amount),
            subject: subject || "Purchase",
        };

        const result = await createPayPayAppPayment(orderDetails, req.ip);

        if (result.code === "S0001" && result.biz_content.status === "P") {
            res.json({
                success: true,
                dynamic_link: result.biz_content.dynamic_link,
                trade_token: result.biz_content.trade_token,
                out_trade_no: result.biz_content.out_trade_no,
                inner_trade_no: result.biz_content.trade_no,
                total_amount: parseFloat(
                    result.biz_content.total_amount || total_amount
                ),
                return_url: result.biz_content.dynamic_link,
            });
            console.log({
                success: true,
                dynamic_link: result.biz_content.dynamic_link,
                trade_token: result.biz_content.trade_token,
                out_trade_no: result.biz_content.out_trade_no,
                inner_trade_no: result.biz_content.trade_no,
                total_amount: parseFloat(
                    result.biz_content.total_amount || total_amount
                ),
                return_url: result.biz_content.dynamic_link,
            });
        } else {
            res.json({
                success: false,
                code: result.code,
                sub_code: result.sub_code,
                message: result.msg || "Falha ao iniciar pagamento.",
                description: result.sub_msg || "Falha ao iniciar pagamento.",
            });
        }
    } catch (err) {
        console.error("Error in /paypay-app:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});

router.post('/multicaixa', async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

router.post('/consult', async (req, res) => {
    const { outTradeNo } = req.body;
    try {
        const result = await sdk.queryPaymentOrderStatus(outTradeNo)
        if (result.success) {
            res.json(result)
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno' });
    }
})

module.exports = router;