
# PAYPAY AO API Integration Documentation (Simplified)

This guide provides a clear and practical approach to integrating with the PAYPAY payment gateway using the provided Node.js code. It supports payments via MULTICAIXA Express and the PAYPAY app, with secure RSA encryption and signature generation. The documentation addresses customer feedback about the original PAYPAY documentation being complex by using simple language, structured sections, and actionable examples.

---

## 1. Required Libraries

To interact with the PAYPAY API, you need specific Node.js libraries. These handle HTTP requests, RSA encryption, signatures, and server setup. Install them using:

```bash
npm install axios node-forge crypto querystring express qs cors validator
```

- **`axios`**: Sends HTTP requests to the PAYPAY API.
- **`node-forge`**: Manages RSA encryption and SHA1withRSA signatures.
- **`crypto`**: Node.js built-in module for RSA encryption.
- **`querystring`**: Formats parameters for URL encoding.
- **`express`**: Creates a server for API endpoints and notifications.
- **`qs`**: Converts objects to URL-encoded query strings.
- **`cors`**: Enables Cross-Origin Resource Sharing for frontend apps (e.g., React).
- **`validator`**: Optional, for input validation.

**Note**: Use Node.js version 14 or higher for compatibility.

### Example: Installing Libraries
```bash
# Run in your project directory
npm install axios node-forge crypto querystring express qs cors validator
```

---

## 2. Configuration

The `config` object holds essential settings for the PAYPAY API. Each variable is critical for successful integration, and misconfiguration can lead to errors like "Insufficient permissions" or "Invalid signature."

### Configuration Variables
- **`partnerId`**:
  - **Description**: Your unique merchant ID (also called "member number") assigned by PAYPAY.
  - **How to Get**: Log in to the PAYPAY back office ([https://portal.paypayafrica.com](https://portal.paypayafrica.com)) to find your `partnerId`. Requires a registered and approved enterprise account.
  - **Example**: `"200001860721"`

- **`privateKey`**:
  - **Description**: A 1024-bit RSA private key used for encrypting `biz_content` and signing requests with SHA1withRSA. This key is part of an RSA key pair, and its corresponding public key must be uploaded to the PAYPAY back office for verification.
  - **Why It’s Important**: The private key ensures secure encryption of sensitive payment data and authenticates your requests. The public key, derived from this private key, allows PAYPAY to verify your signatures.
  - **How to Generate**:
    - Use **OpenSSL**, a widely available tool, to generate a 1024-bit RSA key pair. The private key is kept secure on your system, while the public key is extracted and uploaded to the PAYPAY back office.
    - **Step 1: Generate the Private Key**:
      - The following commands create a 1024-bit RSA private key in PEM format.
      - **PowerShell (Windows)**:
        ```powershell
        # Install OpenSSL if not already installed (e.g., via Chocolatey: choco install openssl)
        openssl genrsa -out private_key.pem 1024
        ```
      - **CMD (Windows)**:
        ```cmd
        REM Install OpenSSL if needed (e.g., download from openssl.org or use a package manager)
        openssl genrsa -out private_key.pem 1024
        ```
      - **Git Bash (Windows)**:
        ```bash
        # OpenSSL is typically included with Git Bash
        openssl genrsa -out private_key.pem 1024
        ```
      - **Linux/macOS Terminal**:
        ```bash
        # OpenSSL is usually pre-installed or available via package managers (e.g., apt, brew)
        openssl genrsa -out private_key.pem 1024
        ```
    - **Step 2: Generate the Public Key**:
      - Extract the public key from the private key using OpenSSL.
      - **PowerShell (Windows)**:
        ```powershell
        openssl rsa -in private_key.pem -pubout -out public_key.pem
        ```
      - **CMD (Windows)**:
        ```cmd
        openssl rsa -in private_key.pem -pubout -out public_key.pem
        ```
      - **Git Bash (Windows)**:
        ```bash
        openssl rsa -in private_key.pem -pubout -out public_key.pem
        ```
      - **Linux/macOS Terminal**:
        ```bash
        openssl rsa -in private_key.pem -pubout -out public_key.pem
        ```
    - **Step 3: Verify and Use**:
      - The `private_key.pem` file contains your private key. Keep it secure and never share it.
      - The `public_key.pem` file contains the public key. Upload this to the PAYPAY back office under your account settings to enable signature verification.
      - Example private key (shortened):
        ```plaintext
        -----BEGIN PRIVATE KEY-----
        MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALPlEvZAyTz/d6nE
        ... // 1024-bit RSA private key
        -----END PRIVATE KEY-----
        ```
      - Example public key (shortened):
        ```plaintext
        -----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCz5RL2QMk8/3epxLp5ACJnnMgV
        ... // Corresponding public key
        -----END PUBLIC KEY-----
        ```
    - **Where to Generate**: You can generate keys on any system with OpenSSL installed:
      - **Windows**: Install OpenSSL via Chocolatey (`choco install openssl`), download from [openssl.org](https://www.openssl.org/), or use Git Bash (which includes OpenSSL).
      - **Linux**: Install via `sudo apt install openssl` (Ubuntu/Debian) or equivalent.
      - **macOS**: Install via `brew install openssl` or use the pre-installed version.
    - **Security Tips**:
      - Store the private key in a secure location (e.g., a restricted folder or `.env` file).
      - Back up the key pair in a safe place.
      - Upload only the public key to PAYPAY; never share the private key.
  - **How to Use**: Include the private key in your `config` object and upload the public key to the PAYPAY back office.

- **`paypayPublicKey`**:
  - **Description**: PAYPAY’s 1024-bit RSA public key for verifying signatures in API responses and notifications.
  - **How to Get**: Download from the PAYPAY back office after account approval.
  - **Example**:
    ```plaintext
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArL1akdPqJVYIGI4vGNiN
    ... // PAYPAY’s public key
    -----END PUBLIC KEY-----
    ```

- **`apiUrl`**:
  - **Description**: The PAYPAY API gateway endpoint.
  - **Value**: Confirm with PAYPAY support. The provided code uses a test URL (`https://xxxxx/gateway/recv.do`).
  - **Note**: No sandbox exists; all transactions involve real funds.

- **`saleProductCode`**:
  - **Description**: A code specific to the payment product (e.g., MULTICAIXA Express or PAYPAY app).
  - **How to Get**: Request from PAYPAY support, as it’s tied to your account and payment type.
  - **Common Issue**: Errors like:
    ```json
    {
      "sub_code": "F11001",
      "msg": "Insufficient permissions",
      "sub_msg": "Insufficient interface authority"
    }
    ```
    Indicate an invalid or unauthorized `saleProductCode`. Contact PAYPAY support to verify your account’s "adenda" (contract) and obtain the correct code or permissions.
  - **Example**: `"050200030"`

**Best Practice**: Store sensitive data (e.g., `privateKey`, `partnerId`) in environment variables using a `.env` file to avoid hardcoding. For example:
```bash
echo "PRIVATE_KEY=\"$(cat private_key.pem)\"" >> .env
```

### Example: Setting Up Configuration
```javascript
const config = {
  partnerId: "200001860721", // Replace with your merchant ID
  privateKey: `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALPlEvZAyTz/d6nE
... // Your 1024-bit RSA private key
-----END PRIVATE KEY-----`,
  paypayPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArL1akdPqJVYIGI4vGNiN
... // PAYPAY’s public key
-----END PUBLIC KEY-----`,
  apiUrl: "https://xxxxx/gateway/recv.do", // Confirm with PAYPAY support
  saleProductCode: "050200030", // Request from PAYPAY support
};
```

---

## 3. Core Functions

The following functions handle the PAYPAY API integration. Each is explained with its purpose, mechanics, and an example from your code.

### 3.1 `validatePemKey`
- **Purpose**: Validates RSA public or private keys to ensure they are correctly formatted and usable.
- **How It Works**:
  - Checks for proper PEM headers (e.g., `-----BEGIN PRIVATE KEY-----`).
  - Uses `node-forge` to parse the key and detect errors.
  - Throws an error if the key is invalid, preventing encryption or signature failures.
- **Parameters**:
  - `key`: The RSA key (string).
  - `type`: `"PUBLIC KEY"` or `"PRIVATE KEY"` (default: `"PUBLIC KEY"`).
- **Why It’s Important**: Invalid keys cause errors like "Invalid signature" or failed encryption.

#### Example: Validating a Private Key
```javascript
function validatePemKey(key, type = "PUBLIC KEY") {
  try {
    if (
      !key.includes(`-----BEGIN ${type}-----`) ||
      !key.includes(`-----END ${type}-----`)
    ) {
      throw new Error(`Invalid ${type} format: Missing PEM headers`);
    }
    if (type === "PRIVATE KEY") {
      forge.pki.privateKeyFromPem(key);
    } else {
      forge.pki.publicKeyFromPem(key);
    }
    console.log(`${type} is valid`);
    return true;
  } catch (error) {
    console.error(`Invalid ${type}:`, error.message);
    throw new Error(`Failed to parse ${type}`);
  }
}

// Usage
try {
  validatePemKey(config.privateKey, "PRIVATE KEY");
} catch (err) {
  console.error(err.message);
}
```

---

### 3.2 `generateRequestNo`
- **Purpose**: Creates a unique request number for each API call to identify it on the PAYPAY server.
- **How It Works**:
  - Generates a 16-byte random hexadecimal string using `crypto.randomBytes`.
  - Ensures uniqueness to avoid request conflicts.
- **Requirements**:
  - Must be 6–32 characters, alphanumeric with underscores.
  - Must be unique per request.
- **Why It’s Important**: Duplicate `request_no` values cause errors or rejected transactions.

#### Example: Generating a Request Number
```javascript
function generateRequestNo() {
  return crypto.randomBytes(16).toString("hex");
}

// Usage
const requestNo = generateRequestNo();
console.log("Request Number:", requestNo); // e.g., "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

### 3.3 `generateTimestamp`
- **Purpose**: Generates a GMT+1 timestamp for API requests, as PAYPAY’s server operates in this timezone.
- **How It Works**:
  - Creates a timestamp in `yyyy-MM-dd HH:mm:ss` format.
  - Adjusts the current time to GMT+1 using a 1-hour offset.
- **Requirements**:
  - Must be within ±10 minutes of PAYPAY’s server time.
  - Incorrect timezones cause errors like `"Invalid timestamp"`.
- **Why It’s Important**: Ensures requests are time-synced with the server.

#### Example: Generating a GMT+1 Timestamp
```javascript
function generateTimestamp() {
  const now = new Date();
  const offset = 1 * 60 * 60 * 1000; // GMT+1 offset in milliseconds
  const gmtPlus1 = new Date(now.getTime() + offset);
  return gmtPlus1.toISOString().replace("T", " ").substring(0, 19);
}

// Usage
const timestamp = generateTimestamp();
console.log("Timestamp:", timestamp); // e.g., "2025-07-08 11:02:45"
```

---

### 3.4 `encryptBizContentWithPrivateKey`
- **Purpose**: Encrypts the `biz_content` JSON payload using the RSA private key.
- **How It Works**:
  - Converts `biz_content` to a UTF-8 buffer.
  - Splits it into 117-byte chunks (due to RSA 1024-bit key limitations).
  - Encrypts each chunk with `crypto.privateEncrypt`.
  - Concatenates and encodes the result in base64.
- **Parameters**:
  - `bizContent`: JSON string of the business content.
  - `privateKey`: The merchant’s RSA private key.
- **Why It’s Important**: PAYPAY requires encrypted `biz_content` for security. The 117-byte chunk size is critical for RSA 1024-bit keys.

#### Example: Encrypting `biz_content`
```javascript
function encryptBizContentWithPrivateKey(bizContent, privateKey) {
  const buffer = Buffer.from(bizContent, "utf8");
  const chunkSize = 117;
  const encryptedChunks = [];

  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    const chunk = buffer.slice(offset, offset + chunkSize);
    const encrypted = crypto.privateEncrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      chunk
    );
    encryptedChunks.push(encrypted);
  }

  const encryptedBuffer = Buffer.concat(encryptedChunks);
  const encoded = encryptedBuffer.toString("base64");
  console.log("Encrypted biz_content:", encoded);
  return encoded;
}

// Usage
const bizContent = JSON.stringify({
  cashier_type: "SDK",
  payer_ip: "123.25.68.9",
  sale_product_code: config.saleProductCode,
  trade_info: { out_trade_no: "ORDER_123", total_amount: "1000.50" },
});
const encrypted = encryptBizContentWithPrivateKey(bizContent, config.privateKey);
```

---

### 3.5 `generateSignature`
- **Purpose**: Generates a SHA1withRSA signature for API requests to ensure authenticity.
- **How It Works**:
  - Excludes `sign` and `sign_type` from parameters.
  - Sorts parameters by ASCII order.
  - Concatenates them into a string (e.g., `biz_content=VALUE&charset=VALUE&...`).
  - Signs using `SHA1withRSA` via `node-forge`.
  - Returns the base64-encoded signature.
- **Parameters**:
  - `params`: Object containing API request parameters.
  - `privateKey`: The merchant’s RSA private key.
- **Why It’s Important**: Incorrect signatures cause errors like `"Invalid signature"`.

#### Example: Generating a Signature
```javascript
function generateSignature(params, privateKey) {
  try {
    validatePemKey(privateKey, "PRIVATE KEY");
    const sortedKeys = Object.keys(params)
      .filter((key) => key !== "sign" && key !== "sign_type")
      .sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    console.log("String to sign:", stringToSign);

    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha1.create();
    md.update(stringToSign, "utf8");
    const signature = privateKeyObj.sign(md);
    const encodedSignature = forge.util.encode64(signature);
    console.log("Signature:", encodedSignature);
    return encodedSignature;
  } catch (error) {
    console.error("Signature error:", error.message);
    throw new Error("Failed to generate signature");
  }
}

// Usage
const params = {
  charset: "UTF-8",
  biz_content: "encrypted_content",
  partner_id: config.partnerId,
  service: "instant_trade",
  request_no: generateRequestNo(),
};
const signature = generateSignature(params, config.privateKey);
```

---

### 3.6 `createMulticaixaPayment`
- **Purpose**: Creates a payment order for MULTICAIXA Express.
- **How It Works**:
  - Builds `biz_content` with order details and `pay_method` for MULTICAIXA.
  - Encrypts `biz_content` and generates a signature.
  - Sends a POST request to the PAYPAY API.
- **Parameters**:
  - `orderDetails`: Object with `outTradeNo`, `amount`, `phoneNum`, `subject`.
- **Response**:
  - Success: `{ code: "S0001", biz_content: { status: "P", dynamic_link, trade_token, ... } }`
  - Failure: Includes `sub_code` and `sub_msg`.

#### Example: Creating a MULTICAIXA Express Payment
```javascript
async function createMulticaixaPayment(orderDetails) {
  const { outTradeNo, amount, phoneNum, subject = "Purchase" } = orderDetails;

  const bizContent = {
    cashier_type: "SDK",
    payer_ip: "123.25.68.9",
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
    pay_method: {
      pay_product_code: "31",
      amount: amount.toFixed(2),
      bank_code: "MUL",
      phone_num: phoneNum,
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
    language: "pt",
  };

  params.sign = generateSignature(params, config.privateKey);

  try {
    const response = await axios.post(config.apiUrl, qs.stringify(params), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
const orderDetails = {
  outTradeNo: "ORDER_123456",
  amount: 1000.50,
  phoneNum: "912345678",
  subject: "Online Purchase",
};
createMulticaixaPayment(orderDetails)
  .then((result) => console.log("Response:", result))
  .catch((err) => console.error("Error:", err.message));
```

---

### 3.7 `createPayPayAppPayment`
- **Purpose**: Creates a payment order for the PAYPAY app, returning a `dynamic_link` for QR code or app redirection.
- **How It Works**:
  - Similar to `createMulticaixaPayment`, but excludes `pay_method`.
  - Sends a POST request and returns `dynamic_link` for user interaction.
- **Parameters**:
  - `orderDetails`: Object with `outTradeNo`, `amount`, `subject`.
  - `clientIp`: Buyer’s IP address.

#### Example: Creating a PAYPAY App Payment
```javascript
async function createPayPayAppPayment(orderDetails, clientIp) {
  const { outTradeNo, amount, subject = "Purchase" } = orderDetails;

  const bizContent = {
    cashier_type: "SDK",
    payer_ip: clientIp,
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
    language: "pt",
  };

  params.sign = generateSignature(params, config.privateKey);

  try {
    const response = await axios.post(config.apiUrl, qs.stringify(params), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
const orderDetails = {
  outTradeNo: "ORDER_789012",
  amount: 500.25,
  subject: "App Purchase",
};
createPayPayAppPayment(orderDetails, "102.140.67.101")
  .then((result) => console.log("Response:", result))
  .catch((err) => console.error("Error:", err.message));
```

---

## 4. Express Server Endpoints

The Express server handles payment requests and PAYPAY notifications.

### 4.1 `/api/create` (MULTICAIXA Express Payments)
- **Purpose**: Creates MULTICAIXA Express payments via a POST endpoint.
- **Request**: `{ total_amount, paymentMethod, phone_num }`
- **Response**: `{ success, dynamic_link, trade_token, out_trade_no, ... }`

#### Example: MULTICAIXA Express Endpoint
```javascript
app.post("/api/create", async (req, res) => {
  try {
    const { total_amount, paymentMethod, phone_num } = req.body;

    if (paymentMethod !== "MULTICAIXA_EXPRESS") {
      return res.status(400).json({
        success: false,
        error: "This endpoint supports only MULTICAIXA_EXPRESS payments",
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
    };

    const result = await createMulticaixaPayment(orderDetails);

    if (result.code === "S0001" && result.biz_content.status === "P") {
      res.json({
        success: true,
        dynamic_link: result.biz_content.dynamic_link,
        trade_token: result.biz_content.trade_token,
        out_trade_no: result.biz_content.out_trade_no,
        inner_trade_no: result.biz_content.trade_no,
        total_amount: parseFloat(result.biz_content.total_amount || total_amount),
      });
    } else {
      res.json({
        success: false,
        error: result.sub_msg || "Falha ao iniciar pagamento.",
      });
    }
  } catch (err) {
    console.error("Error in /api/create:", err.message);
    res.json({ success: false, error: String(err) });
  }
});
```

---

### 4.2 `/api/create-paypay-app` (PAYPAY App Payments)
- **Purpose**: Creates PAYPAY app payments via a POST endpoint.
- **Request**: `{ total_amount, subject }`
- **Response**: `{ success, dynamic_link, trade_token, out_trade_no, ... }`

#### Example: PAYPAY App Endpoint
```javascript
app.post("/api/create-paypay-app", async (req, res) => {
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
        total_amount: parseFloat(result.biz_content.total_amount || total_amount),
      });
    } else {
      res.json({
        success: false,
        error: result.sub_msg || "Falha ao iniciar pagamento.",
      });
    }
  } catch (err) {
    console.error("Error in /api/create-paypay-app:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});
```

---

## 5. Common Issues and Troubleshooting

- **"Insufficient permissions" (`F11001`)**:
  - **Cause**: Invalid `saleProductCode` or account permissions.
  - **Solution**: Contact PAYPAY support to verify your adenda and `saleProductCode`.
- **"Invalid signature"**:
  - **Cause**: Incorrect `privateKey` or parameter sorting.
  - **Solution**: Use `validatePemKey` and ensure ASCII sorting in `generateSignature`.
- **"Invalid timestamp"**:
  - **Cause**: Timestamp not in GMT+1.
  - **Solution**: Verify `generateTimestamp` and server clock.
- **No Sandbox**: Test with small amounts and confirm configurations with PAYPAY support.

---

## 6. Best Practices
- **Secure Keys**: Use environment variables for `privateKey` and `partnerId`.
- **Logging**: Remove `console.log` in production for security.
- **Frontend**:
  - Web: Use a QR code library (e.g., `qrcode`) for `dynamic_link`.
  - Mobile: Redirect to `dynamic_link` (e.g., `paypayao://trade/pay?...`).
- **Error Handling**: Check `code` and `sub_code`. Use `trade_query` for status confirmation.

---

## 7. Additional Notes
- **Back Office**: [https://portal.paypayafrica.com](https://portal.paypayafrica.com)
- **Support**: Contact PAYPAY for `saleProductCode`, API URL, or permissions.
- **Version**: Based on PAYPAY AO API v1.0.5 (June 17, 2024).

---
