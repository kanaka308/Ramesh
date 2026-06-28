# API Interface Contracts: Photography Academy Portfolio & E-Learning Platform

This document specifies the request and response formats for the public API endpoints.

---

## 1. Authentication Endpoints

### POST `/api/auth/magic-link`
Requests a passwordless login magic link to be sent to the user's email.

*   **Request Headers**:
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "email": "student@example.com"
    }
    ```
*   **Response (200 OK - Link Sent)**:
    ```json
    {
      "success": true,
      "message": "Verification link has been sent to your email."
    }
    ```
*   **Response (400 Bad Request - Invalid Email)**:
    ```json
    {
      "success": false,
      "error": "Please provide a valid email address."
    }
    ```

---

### GET `/api/auth/verify?token=JWT_TOKEN`
Validates the passwordless JWT token. Sets a secure, http-only session cookie if verified.

*   **Query Parameters**:
    *   `token` (string): The temporary JWT sent to the user's email.
*   **Response (302 Redirect - Success)**:
    *   **Header**: `Set-Cookie: session_token=SECURE_JWT; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000` (30 days)
    *   **Redirect Target**: `/courses`
*   **Response (401 Unauthorized - Invalid/Expired Token)**:
    ```json
    {
      "success": false,
      "error": "The login link is invalid or has expired. Please request a new one."
    }
    ```

---

## 2. Payment Checkout Endpoints

### POST `/api/checkout/create-order`
Creates an order with the payment gateway (e.g. Razorpay) and registers a pending transaction.

*   **Request Headers**:
    *   `Content-Type: application/json`
    *   `Cookie: session_token=SECURE_JWT`
*   **Request Body**:
    ```json
    {
      "courseId": 12
    }
    ```
*   **Response (200 OK - Order Created)**:
    ```json
    {
      "success": true,
      "orderId": "order_Hj28ksJa9P",
      "amount": 99900,
      "currency": "INR",
      "key": "rzp_test_XXXXXXXXXX"
    }
    ```
*   **Response (401 Unauthorized)**:
    ```json
    {
      "success": false,
      "error": "Authentication required. Please sign in to purchase."
    }
    ```

---

### POST `/api/checkout/webhook`
Receives payment completion webhooks from the payment gateway to finalize course unlock.

*   **Request Headers**:
    *   `X-Razorpay-Signature: HEX_SIGNATURE`
*   **Request Body**:
    *   Standard payment gateway webhook JSON structure containing:
        *   `event`: `"payment.captured"`
        *   `payload.payment.entity.order_id`
        *   `payload.payment.entity.id` (Razorpay Payment ID)
*   **Response (200 OK - Processed)**:
    ```json
    {
      "status": "processed"
    }
    ```
*   **Response (400 Bad Request - Invalid Signature)**:
    ```json
    {
      "status": "signature_mismatch"
    }
    ```

---

## 3. WhatsApp Integration

### Bootcamp Enrollment Button Schema
*   **URL Scheme**: `https://wa.me/{phone_number}?text={encoded_message}`
*   **Vijayapur Branch Number**: `+919900000000` *(example, instructor's actual number)*
*   **Photography Course Message**:
    `Hi, I'm interested in the 30-day Photography Bootcamp in Vijayapur starting next batch. Please send more details.`
    *   *Encoded URL*: `https://wa.me/919900000000?text=Hi%2C%20I'm%20interested%20in%20the%2030-day%20Photography%20Bootcamp%20in%20Vijayapur%20starting%20next%20batch.%20Please%20send%20more%20details.`
*   **Cinematography Course Message**:
    `Hi, I'm interested in the 30-day Cinematography Bootcamp in Vijayapur starting next batch. Please send more details.`
    *   *Encoded URL*: `https://wa.me/919900000000?text=Hi%2C%20I'm%20interested%20in%20the%2030-day%20Cinematography%20Bootcamp%20in%20Vijayapur%20starting%20next%20batch.%20Please%20send%20more%20details.`
