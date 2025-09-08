/**
 * General routes module for PayPay AO SDK
 * Handles general API endpoints like health checks and status
 */

const express = require("express");
const PayPaySDK = require("../services/PayPaySDK");
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const sdk = new PayPaySDK({
    partnerId: process.env.PAYPAY_PARTNER_ID,
    privateKey: process.env.PAYPAY_PRIVATE_KEY,
    paypayPublicKey: process.env.PAYPAY_PUBLIC_KEY,
    saleProductCode: process.env.PAYPAY_SALE_PRODUCT_CODE
});

const router = express.Router();


router.get("/", (req, res) => {
    res.json({
        message: "Hello! PAY PAY API is running!",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "PayPay AO SDK",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

router.post("/test-multicaixa", async (req, res) => {
    const { amount, phoneNum } = req.body;

    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("MUL-");
        const resp = await sdk.createMulticaixaPayment({
            outTradeNo,
            amount: amount,
            phoneNum: phoneNum,
            payerIp: req.ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno', err });
    }
})

router.post("/test-reference", async (req, res) => {
    const { amount } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("REF-");
        const resp = await sdk.createReferencePayment({
            outTradeNo,
            amount: amount,
            payerIp: req.ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno', err });
    }
})

router.post("/test-paypayapp", async (req, res) => {
    const { amount } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("PAYPAY-");
        const resp = await sdk.createPayPayAppPayment({
            outTradeNo,
            amount: amount,
            payerIp: req.ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno', err });
    }
})

router.post("/test-consult", async (req, res) => {
    const { outTradeNo } = req.body;
    try {
        const resp = await sdk.orderStatus(outTradeNo);
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno' });
    }
})

router.post("/test-close", async (req, res) => {
    const { outTradeNo } = req.body;
    try {
        const resp = await sdk.closeOrder(outTradeNo);
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno', err });
    }
})

module.exports = router;
