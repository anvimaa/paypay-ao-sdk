/**
 * General routes module for PayPay AO SDK
 * Handles general API endpoints like health checks and status
 */

const express = require("express");
//const PayPaySDK = require("paypay-ao-sdk");
const PayPaySDK = require("../../lib");
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const sdk = new PayPaySDK({
    partnerId: process.env.PAYPAY_PARTNER_ID,
    privateKey: process.env.PAYPAY_PRIVATE_KEY,
    paypayPublicKey: process.env.PAYPAY_PUBLIC_KEY,
    saleProductCode: process.env.PAYPAY_SALE_PRODUCT_CODE,
    language: 'en'
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

router.post("/test-express", async (req, res) => {
    const { amount, phoneNum } = req.body;

    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("MUL");
        console.log(outTradeNo);
        const ip = await PayPaySDK.getIp();
        const resp = await sdk.createMulticaixaPayment({
            outTradeNo: outTradeNo,
            amount: amount,
            phoneNum: phoneNum,
            payerIp: ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
})

router.post("/test-reference", async (req, res) => {
    const { amount } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("REF");
        const ip = await PayPaySDK.getIp();
        const resp = await sdk.createReferencePayment({
            outTradeNo: outTradeNo,
            amount: amount,
            payerIp: ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
})

router.post("/test-paypayapp", async (req, res) => {
    const { amount } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("PAYPAY");
        console.log(outTradeNo, outTradeNo.length);
        const ip = await PayPaySDK.getIp();
        const resp = await sdk.createPayPayAppPayment({
            outTradeNo: outTradeNo,
            amount: amount,
            payerIp: ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
})

// route for Payment to Bank Account
router.post("/test-bank-account", async (req, res) => {
    const { amount, bankCode, bankAccountNo, accountName } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("BANK");
        const ip = await PayPaySDK.getIp();
        const resp = await sdk.createBankAccountPayment({
            outTradeNo: outTradeNo,
            amount: amount,
            bankCode: bankCode,
            bankAccountNo: bankAccountNo,
            accountName: accountName,
            payerIp: ip,
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
})

// route for Payment to PAYPAY Account
router.post("/test-paypay-account", async (req, res) => {
    const { amount, payeeAccount, pay_product_code } = req.body;
    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("PAYACC");
        const ip = await PayPaySDK.getIp();
        const resp = await sdk.createPayPayAccountPayment({
            outTradeNo: outTradeNo,
            amount: amount,
            payeeAccount: payeeAccount,
            payerIp: ip, pay_product_code
        });
        res.json(resp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
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
        res.status(500).json({ error: 'Erro interno' });
    }
})

module.exports = router;