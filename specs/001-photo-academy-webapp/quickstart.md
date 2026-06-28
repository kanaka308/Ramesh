# Development Quickstart: Photography Academy Platform

This guide provides steps to install dependencies, configure environment variables, start the development server, and perform manual testing validation.

---

## 1. Prerequisites

Ensure you have the following runtimes installed:
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Git**

---

## 2. Setup & Installation

1.  **Navigate to the project root**:
    ```bash
    cd /home/shiva/ramesh
    ```

2.  **Initialize Node.js packages**:
    If starting fresh, initialize dependencies:
    ```bash
    npx -y create-next-app@latest ./ --typescript --tailwind=false --src-dir --app --import-alias "@/*" --use-npm
    ```
    *Note: If dependencies are already initialized, simply install the required extra packages:*
    ```bash
    npm install better-sqlite3 nodemailer razorpay jsonwebtoken dotenv
    npm install -D @types/better-sqlite3 @types/nodemailer @types/jsonwebtoken jest @types/jest
    ```

3.  **Database Migration**:
    Create the initial database schema:
    ```bash
    node -e "const db = require('better-sqlite3')('academy.db'); db.exec(require('fs').readFileSync('src/db/schema.sql', 'utf8')); console.log('Database initialized successfully.');"
    ```

---

## 3. Environment Configuration

Create a `.env.local` file in the root directory:

```ini
# Application configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SQLite Database path
DATABASE_URL=academy.db

# JWT Secret for passwordless magic links
JWT_SECRET=super_secret_cryptographic_signing_key_change_me

# SMTP Configuration for sending email magic links
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=academy@example.com

# Razorpay payment keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Admin credentials for dashboard access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password_immediately
```

---

## 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 5. Manual Test Verification Playbook

Follow these scenarios to validate features manually during development:

### Scenario 1: Verify WhatsApp Bootcamp CTAs
1. Open the homepage [http://localhost:3000](http://localhost:3000).
2. Scroll to the **Live Offline Bootcamps** section.
3. Click the "Enquire via WhatsApp for Photography" button.
4. Verify that the browser redirects to a URL containing:
   - `wa.me/919900000000`
   - Pre-filled text string matching the syllabus inquiries.

### Scenario 2: Magic Link Sign-In
1. Navigate to `/login` in your browser.
2. Enter your email (e.g., `student@test.com`) and click "Send Magic Link".
3. Check your mock SMTP inbox (e.g., Mailtrap) and verify receipt of the email.
4. Click the link `http://localhost:3000/api/auth/verify?token=...`.
5. Verify that your browser is successfully redirected to `/courses` and displays the storefront dashboard.

### Scenario 3: Course Purchase Checkout
1. Access `/courses` as an authenticated student.
2. Click "Enroll Now" on a recorded course listing.
3. Verify that the Razorpay checkout overlay modal appears with the correct amount in INR.
4. Select "Simulated Success" (in Test Mode) and complete checkout.
5. Verify you are redirected back to the secure player layout `/courses/[id]` containing the Bunny.net/Vimeo video embed.
