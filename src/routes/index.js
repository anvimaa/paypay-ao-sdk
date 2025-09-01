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
});

const router = express.Router();

/**
 * Route: GET /
 * Health check endpoint
 *
 * @route GET /
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with welcome message.
 */
router.get("/", (req, res) => {
    res.json({
        message: "Hello! PAY PAY API is running!",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

/**
 * Route: GET /health
 * Detailed health check endpoint
 *
 * @route GET /health
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with health status.
 */
router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "PayPay AO SDK",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

router.post("/test", async (req, res) => {
    const { amount, phoneNum } = req.body;

    try {
        const outTradeNo = PayPaySDK.generateUniqueOrderNo("TX-");
        const resp = await sdk.createMulticaixaPayment({
            outTradeNo,
            amount: amount,
            phoneNum: phoneNum,
            payerIp: req.ip,
        });
        console.log(resp);
        res.json(resp);
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: 'Erro interno', err });
    }
})

module.exports = router;