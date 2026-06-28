# Technical Research: Photography Academy Portfolio & E-Learning Platform

This document outlines the technical decisions, rationales, and alternatives considered for the development of the photography academy platform.

---

## 1. Web Framework & Runtime

*   **Decision**: Next.js (version 14+) with App Router and TypeScript, using Vanilla CSS Modules for styling.
*   **Rationale**:
    *   **Unified Architecture**: Next.js combines frontend presentation (pages, visual portfolio) and backend operations (API routes, webhook handlers, database connections) in a single package.
    *   **Performance (SSR/SSG)**: High-resolution galleries and testimonials can be pre-rendered using Static Site Generation (SSG), resulting in sub-second load times.
    *   **Vanilla CSS**: Satisfies the constraint of using minimal external styling frameworks. Standard CSS modules provide encapsulation without build-time performance penalties.
*   **Alternatives Considered**:
    *   *Vite (SPA) + Express (API)*: Rejected because maintaining two separate build configurations and environments increases deployment complexity. Next.js offers standard route handling built-in.
    *   *Vite (SPA) + Firebase/Supabase*: Rejected to avoid vendor lock-in and keep runtime dependencies strictly local (SQLite).

---

## 2. Database Layer

*   **Decision**: SQLite via `better-sqlite3`.
*   **Rationale**:
    *   **Embedded & Serverless**: SQLite runs as a local file, requiring zero external server configuration. Extremely simple to deploy and back up.
    *   **Performance**: Since our application is read-heavy (loading portfolio gallery items, course listings, testimonial structures) and has a single-writer (admin updates), SQLite is faster than networked databases due to zero network round-trip overhead.
    *   **Simplicity**: Uses standard SQL, keeping dependency footprints minimal.
*   **Alternatives Considered**:
    *   *PostgreSQL / MySQL*: Rejected. Setting up and managing an RDS instance or local Docker container is over-engineered for a simple single-admin portfolio site.
    *   *JSON Flat Files*: Rejected. Lacks indexing, transactional integrity, and querying flexibility, which are necessary for dynamic relations like identifying whether a student has paid for a specific course.

---

## 3. Video Security & Delivery

*   **Decision**: Embed domain-restricted players from Vimeo (Pro/Business) or Bunny.net Stream.
*   **Rationale**:
    *   **No Direct Download**: Both platforms offer domain-level restriction, meaning the video player will only render if embedded on our platform's domain (e.g. `academy.com`). Direct video source links are obfuscated and locked behind temporal signatures, stopping simple scraping or downloading.
    *   **Global CDN**: Videos load quickly globally without putting heavy bandwidth costs or processing overhead on our main application server.
*   **Alternatives Considered**:
    *   *Self-hosted video files (HTML5 `<video>` tag)*: Rejected. Storing mp4 files on local disk or AWS S3 is expensive, lacks adaptive bitrate streaming, and allows trivial direct downloads via inspect element.
    *   *YouTube Unlisted Links*: Rejected. Anyone with the link can easily share it outside the platform, bypass payment, or download it via YouTube-DL.

---

## 4. Student Authentication

*   **Decision**: Passwordless Email Magic Links (JWT signed) sent via SMTP (`nodemailer`).
*   **Rationale**:
    *   **Low Friction**: Students do not need to memorize passwords. Clicking a single link from their email registers/logs them in instantly.
    *   **Security**: Links contain single-use, short-lived JWT tokens that expire after 10-15 minutes, preventing session reuse or brute-forcing.
*   **Alternatives Considered**:
    *   *Password Authentication*: Rejected. Increases friction, requires complex hashing configurations (bcrypt/argon2), and forces users to remember/reset passwords.
    *   *OAuth2 (Google/Facebook)*: Rejected to avoid third-party dev account setup overhead, maintaining a minimal library approach.

---

## 5. Payment Processing

*   **Decision**: Razorpay API Integration with secure Webhook confirmation.
*   **Rationale**:
    *   **INR Optimization**: Razorpay provides native, optimized checkout UI supporting UPI apps, Indian credit cards, Netbanking, and Wallets out-of-the-box.
    *   **Webhook Resilience**: Purchases are confirmed via backend webhooks, ensuring courses are unlocked even if the student closes the checkout page before redirect.
*   **Alternatives Considered**:
    *   *Stripe*: Rejected due to less optimized local payment flows in India (e.g. mandatory UPI redirect rules) compared to Razorpay.
