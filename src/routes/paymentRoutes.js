/**
 * Payment routes module for PayPay AO SDK
 * Handles all payment-related API endpoints
 */

const express = require("express");
const { createPayment, createPayPayAppPayment } = require("../services/paymentService");

const router = express.Router();

/**
 * Route: POST /create-payment
 * Handles MULTICAIXA Express payment creation from the client.
 *
 * @route POST /create-payment
 * @param {Request} req - Express request object (expects JSON body with total_amount, paymentMethod, and phone_num).
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with payment details or error message.
 */
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

/**
 * Route: POST /paypay-app
 * Handles PayPay App payment creation from the client.
 *
 * @route POST /paypay-app
 * @param {Request} req - Express request object (expects total_amount and optional subject).
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with payment link or error message.
 */
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

module.exports = router;