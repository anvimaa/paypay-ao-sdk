# PayPay AO SDK - Modular Structure

## Project Structure

The PayPay AO SDK has been organized into a modular structure for better maintainability, scalability, and code organization.

```
src/
├── app.js                      # Main application entry point
├── config/
│   └── index.js               # Configuration settings and constants
├── middleware/
│   └── index.js               # Express middleware functions
├── routes/
│   ├── index.js               # General routes (health check, status)
│   └── paymentRoutes.js       # Payment-related API routes
├── services/
│   ├── index.js               # Service exports
│   └── paymentService.js      # Payment business logic and API calls
└── utils/
    ├── index.js               # Utility exports
    └── crypto.js              # Cryptographic utilities and helpers
```

## Module Descriptions

### 📱 app.js
Main application file that:
- Initializes Express server
- Sets up middleware
- Configures routes
- Handles server startup and graceful shutdown

### ⚙️ config/
Contains all configuration settings:
- Partner ID and API credentials
- RSA keys for encryption/signing
- API endpoints and timeouts
- Server configuration

### 🛡️ middleware/
Express middleware functions:
- Error handling
- Request logging
- Request validation
- CORS handling

### 🛣️ routes/
API route definitions:
- **index.js**: General routes (`/`, `/health`)
- **paymentRoutes.js**: Payment routes (`/api/create-payment`, `/api/paypay-app`)

### 🔧 services/
Business logic and external API interactions:
- **paymentService.js**: Handles PayPay API communication and payment processing

### 🔧 utils/
Utility functions and helpers:
- **crypto.js**: RSA encryption, signature generation, validation functions

## API Endpoints

### General Routes
- `GET /` - Welcome message and status
- `GET /health` - Detailed health check with uptime and version info

### Payment Routes
- `POST /api/create-payment` - Create MULTICAIXA Express/Reference payment
- `POST /api/paypay-app` - Create PayPay App payment

## Key Features

### ✅ Modular Architecture
- Separation of concerns
- Easy to maintain and extend
- Clear module boundaries

### ✅ Improved Error Handling
- Centralized error middleware
- Consistent error responses
- Better error logging

### ✅ Enhanced Logging
- Request logging middleware
- Structured log output
- Development vs production modes

### ✅ Better Configuration Management
- Centralized configuration
- Environment variable support
- Easy to modify settings

### ✅ Scalable Route Organization
- Grouped by functionality
- Easy to add new routes
- Clear API structure

## Usage

### Starting the Server
```bash
npm start
# or
node src/app.js
```

### Health Check
```bash
curl http://localhost:3000/health
```

### Create Payment
```bash
curl -X POST http://localhost:3000/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "total_amount": 1000,
    "paymentMethod": "EXPRESS",
    "phone_num": "244999999999"
  }'
```

## Development Guidelines

### Adding New Routes
1. Create route files in `src/routes/`
2. Import and use in `src/app.js`
3. Follow existing naming conventions

### Adding New Services
1. Create service files in `src/services/`
2. Export functions from `src/services/index.js`
3. Import in routes or other services

### Adding New Utilities
1. Create utility files in `src/utils/`
2. Export functions from `src/utils/index.js`
3. Import where needed

### Configuration Changes
1. Modify `src/config/index.js`
2. Use environment variables for sensitive data
3. Update documentation

## Benefits of This Structure

1. **Maintainability**: Code is organized by functionality
2. **Testability**: Each module can be tested independently
3. **Scalability**: Easy to add new features without affecting existing code
4. **Readability**: Clear separation of concerns makes code easier to understand
5. **Reusability**: Utilities and services can be reused across the application