# Implementation Plan: Photography Academy Portfolio & E-Learning Platform

**Branch**: `001-photo-academy-webapp` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-photo-academy-webapp/spec.md`

## Summary
The goal is to build a high-converting dual-funnel photography academy web application. It will showcase the instructor's creative portfolio and drive enrollment inquiries for high-ticket offline bootcamps via WhatsApp, while selling low-ticket recorded courses using instant payment processing (Razorpay/Cashfree) and passwordless magic link logins. The application will be built as a single, unified Next.js project leveraging React, vanilla CSS, and SQLite for a lightweight and highly performant architecture.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+

**Primary Dependencies**: `next`, `react`, `react-dom`, `better-sqlite3` (or `sqlite3`), `nodemailer` (for sending email magic links), `razorpay` (or `cashfree-sdk`), `jsonwebtoken` (for secure magic link token signing).

**Storage**: SQLite (embedded database file, zero external database setup).

**Testing**: Jest / React Testing Library (for unit tests on auth/payment helpers).

**Target Platform**: Node.js VPS / Vercel / any standard cloud hosting.

**Project Type**: Full-stack Next.js Web Application.

**Performance Goals**: Public pages (hero, perks, testimonials) load in under 2 seconds. API endpoints respond in under 200ms (p95).

**Constraints**: Domain-locked video embeds (hosted on Bunny.net or Vimeo) to prevent direct downloads.

**Scale/Scope**: Single admin user, <50 portfolio images, <10 courses, ~1000 concurrent students streaming.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Verification Method / Alignment Details |
|---|---|---|
| **I. Code Quality** | ✅ Pass | All TypeScript code will be subject to strict ESLint and Prettier formatting rules. |
| **II. Testing Standards** | ✅ Pass | Unit tests will cover critical token generation, login handler, and payment webhook verification. |
| **III. UX Consistency** | ✅ Pass | Unified design system using vanilla CSS variables, error alerts with actionable steps, responsive viewport support. |
| **IV. Performance** | ✅ Pass | Static page generation (SSG) for landing page, fast API route execution, lazy loading of images and media. |
| **V. Simplicity & Observability** | ✅ Pass | Minimal library usage (relying on built-in Next.js/React APIs), and structured logs for authentication and checkout events. |

## Project Structure

This project uses a unified full-stack structure under the Next.js framework.

```text
src/
├── app/
│   ├── page.tsx               # Public landing page (Hero, Perks, Bootcamps, Gallery)
│   ├── layout.tsx             # Global layout & HTML/CSS context
│   ├── login/                 # Passwordless login request page
│   ├── verify/                # Magic link validation endpoint
│   ├── admin/                 # Dashboard layout & routing (Batch, Courses, Portfolio)
│   │   ├── page.tsx           # Admin summary dashboard
│   │   ├── batches/page.tsx   # Manage offline bootcamps
│   │   ├── courses/page.tsx   # Manage recorded courses
│   │   └── gallery/page.tsx   # Manage portfolio images
│   ├── courses/               # Storefront and secure video player dashboard
│   │   ├── page.tsx           # Recorded course storefront
│   │   └── [id]/page.tsx      # Secure video player page (accessible only to purchasers)
│   └── api/
│       ├── checkout/route.ts  # Payment gateway checkout request
│       ├── webhook/route.ts   # Payment gateway callback/webhook handler
│       └── admin/             # API routes for dashboard data updating
│
├── components/                # Reusable visual components (TestimonialSlider, ImageGallery)
│   ├── Hero.tsx
│   ├── Perks.tsx
│   ├── Gallery.tsx
│   └── TestimonialSlider.tsx
│
├── db/                        # SQLite schema and access layer
│   ├── index.ts
│   └── schema.sql
│
├── lib/                       # Utility functions (auth, payments, mailer)
│   ├── auth.ts
│   ├── mail.ts
│   └── payments.ts
│
└── styles/                    # Vanilla CSS modules
    ├── global.css
    ├── Home.module.css
    └── Admin.module.css
```

**Structure Decision**: Option 1: Single full-stack Next.js project. It simplifies deployment, avoids separate frontend/backend repo synchronization issues, and natively handles SSR/SSG and serverless API route handlers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations. The design adheres strictly to the simplicity, performance, and code quality principles.)*
