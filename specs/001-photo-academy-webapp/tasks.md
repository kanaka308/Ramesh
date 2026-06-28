# Tasks: Photography Academy Portfolio & E-Learning Platform

**Input**: Design documents from `/specs/001-photo-academy-webapp/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api-endpoints.md

**Tests**: Tests are included under each user story phase in accordance with the project's testing standards principles. Write these tests first to verify failures before implementing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Includes exact project-relative file paths in descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [X] T001 Create project folder structure and source directories per implementation plan
- [X] T002 Initialize Next.js project with TypeScript, setting `tailwind` option to false in `/package.json`
- [X] T003 [P] Configure ESLint, Prettier lint configurations, and Jest testing framework options in `/jest.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create SQLite database schema migration script in `src/db/schema.sql`
- [X] T005 Implement database helper instance and SQL executor in `src/db/index.ts`
- [X] T006 [P] Setup environment variable configurations and type safety loading schema in `src/lib/config.ts`
- [X] T007 [P] Configure SMTP email sender utilities using nodemailer in `src/lib/mail.ts`
- [X] T008 Implement secure JWT magic link generation and signature verification logic in `src/lib/auth.ts`
- [X] T009 Create base layout modules and root CSS modules in `src/app/layout.tsx` and `src/styles/global.css`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Explore Portfolio & Enquire (Priority: P1) 🎯 MVP

**Goal**: Visitors can view the photographer's visual portfolio gallery, testimonial sliders, and enquire about the bootcamps via WhatsApp CTA links.

**Independent Test**: Visit the landing page, view gallery/testimonials, and click the WhatsApp booking button to verify pre-filled messages work correctly.

### Tests for User Story 1
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
- [X] T010 [P] [US1] Write unit tests verifying custom WhatsApp link generation parameters in `tests/unit/test_whatsapp_link.test.ts`

### Implementation for User Story 1
- [X] T011 [P] [US1] Implement responsive visual gallery container in `src/components/Gallery.tsx`
- [X] T012 [P] [US1] Implement perk callout details card in `src/components/Perks.tsx`
- [X] T013 [P] [US1] Implement testimonial video slider component in `src/components/TestimonialSlider.tsx`
- [X] T014 [US1] Build public landing page combining Hero, Perks, Gallery, and Testimonials in `src/app/page.tsx`
- [X] T015 [US1] Create api endpoint to load portfolio items and testimonial data dynamically in `src/app/api/home/route.ts`

**Checkpoint**: At this point, the public portfolio and bootcamp enquiry flow should be fully functional.

---

## Phase 4: User Story 2 - Purchase and Stream Recorded Lectures (Priority: P2)

**Goal**: Student authentication via passwordless email link, storefront navigation, order creation, Razorpay checkout, and secure streaming.

**Independent Test**: Request magic link login, purchase a course using simulated checkout, redirect to player dashboard, and confirm download blocking.

### Tests for User Story 2
- [X] T016 [P] [US2] Write unit tests for magic link JWT generation and validation lifecycle in `tests/unit/test_magic_link_auth.test.ts`
- [X] T017 [P] [US2] Write unit tests for payment webhook verification payload matching in `tests/unit/test_payment_webhook.test.ts`

### Implementation for User Story 2
- [X] T018 [P] [US2] Build student magic link request landing page at `src/app/login/page.tsx`
- [X] T019 [P] [US2] Build validation verification API route for magic links at `src/app/api/auth/verify/route.ts`
- [X] T020 [US2] Build digital storefront directory page listing courses in `src/app/courses/page.tsx`
- [X] T021 [US2] Create endpoint for initiating orders with the payment gateway in `src/app/api/checkout/create-order/route.ts`
- [X] T022 [US2] Create webhook API route confirming successful payments and updating purchases table in `src/app/api/checkout/webhook/route.ts`
- [X] T023 [US2] Create secure video player dashboard route rendering domain-locked stream iframes in `src/app/courses/[id]/page.tsx`

**Checkpoint**: Students can log in passwordless, pay, and stream courses securely.

---

## Phase 5: User Story 3 - Admin Batch & Course Updates (Priority: P3)

**Goal**: Admin dashboard interface allowing the instructor to update upcoming batch dates, pricing, and toggling registration states dynamically.

**Independent Test**: Edit batch details or prices via dashboard forms and confirm updates render on the public landing page instantly.

### Tests for User Story 3
- [X] T024 [P] [US3] Write unit tests for admin session cookie checking and access controls in `tests/unit/test_admin_auth.test.ts`

### Implementation for User Story 3
- [X] T025 [P] [US3] Build admin control panel layout structure in `src/app/admin/layout.tsx`
- [X] T026 [P] [US3] Build admin login credential request page in `src/app/admin/login/page.tsx`
- [X] T027 [US3] Build bootcamp batch schedule editor form page in `src/app/admin/batches/page.tsx`
- [X] T028 [US3] Build digital course storefront prices and toggle forms in `src/app/admin/courses/page.tsx`
- [X] T029 [US3] Implement admin update submission endpoints in `src/app/api/admin/updates/route.ts`

**Checkpoint**: The instructor can fully manage schedule dates and prices dynamically.

---

## Phase 6: User Story 4 - Admin Portfolio & Testimonial Uploads (Priority: P4)

**Goal**: Admin dashboard capability to upload high-res images to the gallery and embed student video testimonials.

**Independent Test**: Upload new gallery photos and input video testimonial links, checking they load correctly in public sections.

### Implementation for User Story 4
- [X] T030 [P] [US4] Implement admin portfolio gallery uploading component in `src/app/admin/gallery/page.tsx`
- [X] T031 [P] [US4] Implement admin testimonial list and embed fields in `src/app/admin/testimonials/page.tsx`
- [X] T032 [US4] Create upload endpoint managing portfolio storage uploads and DB registry additions in `src/app/api/admin/gallery/route.ts`

**Checkpoint**: Complete admin content and media updates workflow.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Global enhancements across all sections.

- [X] T033 Polish styling behaviors for mobile viewports using CSS media queries in `src/styles/global.css`
- [X] T034 Setup global route level error fallbacks and fallback handlers in `src/app/error.tsx`
- [X] T035 Run quickstart manual verification playbook to confirm setup steps execute correctly

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. Blocks all user stories.
- **User Stories (Phases 3-6)**: All depend on Phase 2 completion. Can be worked on in parallel.
- **Polish (Phase N)**: Depends on all user stories being completed.

### Parallel Opportunities
- All tests marked `[P]` under each user story can run in parallel.
- Admin UI layout (`T025`, `T026`) can be developed in parallel with main public component files.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm public portfolio and WhatsApp CTA booking flow work correctly.
