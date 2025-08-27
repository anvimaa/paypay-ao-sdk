/**
 * Payment service module for PayPay AO SDK
 * Handles all payment-related operations and API interactions
 */

const axios = require("axios");
const qs = require("qs");
const config = require("../config");
const {
    encryptBizContentWithPrivateKey,
    generateSignature,
    generateRequestNo,
    generateTimestamp,
} = require("../utils/crypto");

/**
 * Creates a payment request for MULTICAIXA Express.
 *
 * @async
 * @function
 * @param {Object} orderDetails - The order details for the payment.
 * @param {string} orderDetails.outTradeNo - Unique external trade number.
 * @param {number} orderDetails.amount - Total amount to be paid.
 * @param {string} orderDetails.phoneNum - Phone number associated with the MULTICAIXA account.
 * @param {string} orderDetails.paymentMethod - Payment method.
 * @param {string} [orderDetails.subject="Purchase"] - Optional description of the transaction.
 * @param {string} ip - Buyer IP address.
 * @returns {Promise<Object>} The API response from the PayPay server.
 * @throws {Error} If the request fails or the API returns an error.
 */
async function createPayment(orderDetails, ip) {
    const { outTradeNo, amount, phoneNum, subject = "Purchase", paymentMethod } = orderDetails;

    let mul_pay_method = {
        pay_product_code: "31",
        amount: amount.toFixed(2),
        bank_code: "MUL",
        phone_num: phoneNum,
    };

    let ref_pay_method = {
        pay_product_code: "31",
        amount: amount.toFixed(2),
        bank_code: "REF",
    };

    const bizContent = {
        cashier_type: "SDK",
        payer_ip: ip,
        sale_product_code: config.saleProductCode,
        timeout_express: "15m",
        trade_info: {
            currency: "AOA",
            out_trade_no: outTradeNo,
            payee_identity: config.partnerId,
            payee_identity_type: "1",
            price: amount.toFixed(2),
            quantity: "1",
            subject,
            total_amount: amount.toFixed(2),
        },
        pay_method: paymentMethod === "EXPRESS" ? mul_pay_method : ref_pay_method,
    };

    const encryptedBizContent = encryptBizContentWithPrivateKey(
        JSON.stringify(bizContent),
        config.privateKey
    );

    const params = {
        charset: "UTF-8",
        biz_content: encryptedBizContent,
        partner_id: config.partnerId,
        service: "instant_trade",
        request_no: generateRequestNo(),
        format: "JSON",
        sign_type: "RSA",
        version: "1.0",
        timestamp: generateTimestamp(),
        language: config.language,
    };

    params.sign = generateSignature(params, config.privateKey);

    const encodedParams = {};
    Object.keys(params)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
            encodedParams[key] = encodeURIComponent(params[key]);
        });

    try {
        const response = await axios.post(
            config.apiUrl,
            qs.stringify(encodedParams),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(
                "API responded with error:",
                JSON.stringify(error.response.data, null, 2)
            );
        } else {
            console.error("API request failed:", error.message);
        }
        throw error;
    }
}

/**
 * Creates a payment request for the PayPay App (non-Multicaixa).
 *
 * @async
 * @function
 * @param {Object} orderDetails - The order details for the payment.
 * @param {string} orderDetails.outTradeNo - Unique external trade number.
 * @param {number} orderDetails.amount - Total amount to be paid.
 * @param {string} [orderDetails.subject="Purchase"] - Optional description of the transaction.
 * @param {string} clientIp - The IP address of the client initiating the transaction.
 * @returns {Promise<Object>} The API response from the PayPay server.
 * @throws {Error} If the request fails or the API returns an error.
 */
async function createPayPayAppPayment(orderDetails, clientIp) {
    const { outTradeNo, amount, subject = "Purchase" } = orderDetails;

    const bizContent = {
        cashier_type: "SDK",
        payer_ip: "102.140.67.101", // Replace with actual buyer IP
        sale_product_code: config.saleProductCode,
        timeout_express: "15m",
        trade_info: {
            currency: "AOA",
            out_trade_no: outTradeNo,
            payee_identity: config.partnerId,
            payee_identity_type: "1",
            price: amount.toFixed(2),
            quantity: "1",
            subject,
            total_amount: amount.toFixed(2),
        },
    };

    const encryptedBizContent = encryptBizContentWithPrivateKey(
        JSON.stringify(bizContent),
        config.privateKey
    );

    const params = {
        charset: "UTF-8",
        biz_content: encryptedBizContent,
        partner_id: config.partnerId,
        service: "instant_trade",
        request_no: generateRequestNo(),
        format: "JSON",
        sign_type: "RSA",
        version: "1.0",
        timestamp: generateTimestamp(),
        language: config.language,
    };

    params.sign = generateSignature(params, config.privateKey);

    const encodedParams = {};
    Object.keys(params)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
            encodedParams[key] = encodeURIComponent(params[key]);
        });

    try {
        const response = await axios.post(
            config.apiUrl,
            qs.stringify(encodedParams),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(
                "API responded with error:",
                JSON.stringify(error.response.data, null, 2)
            );
            throw new Error(error.response.data.sub_msg || "API error");
        } else {
            console.error("API request failed:", error.message);
            throw new Error("Failed to connect to PayPay API");
        }
    }
}

module.exports = {
    createPayment,
    createPayPayAppPayment,
};