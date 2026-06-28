# Feature Specification: Photography Academy Portfolio & E-Learning Platform

**Feature Branch**: `001-photo-academy-webapp`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Build a webapp photography academy website with dual-funnel course management, interactive admin panel, and visual portfolio/marketing elements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore Portfolio & Enquire about Bootcamps (Priority: P1)

Prospective students want to explore the photographer's premium portfolio, view bootcamp perks, and easily inquire about the 30-day intensive bootcamps via WhatsApp.

**Why this priority**: The bootcamps represent high-ticket offline revenue. Showing credibility through high-impact media and encouraging direct engagement is the primary business goal.

**Independent Test**: A visitor accesses the homepage, scrolls through the visual gallery, views the perk callouts, and clicks the WhatsApp CTA button which opens WhatsApp with a pre-filled, customized message.

**Acceptance Scenarios**:

1. **Given** the homepage is loaded, **When** the user clicks the "Enquire for Photography Bootcamp" button, **Then** the browser launches WhatsApp with a message like: "Hi! I'm interested in enrolling in the upcoming Photography Bootcamp in Vijayapur."
2. **Given** the homepage is loaded, **When** the user views the perk highlights section, **Then** they can clearly read details about free food, free stay, and camera/PC equipment support.

---

### User Story 2 - Purchase and Stream Recorded Lectures (Priority: P2)

Students want to purchase low-ticket recorded video lectures instantly and stream them securely on the platform.

**Why this priority**: Automated low-ticket sales provide passive scaling revenue. Secure streaming prevents illegal sharing.

**Independent Test**: A student purchases a course via the payment gateway and is redirected to a video player page where they can stream lessons, with direct download capabilities disabled.

**Acceptance Scenarios**:

1. **Given** a student is on a course checkout screen, **When** they complete their payment via the gateway, **Then** they are immediately redirected to the secure course streaming dashboard.
2. **Given** a student is streaming a video, **When** they try to download or share the source link, **Then** the player prevents the action via domain-locking restrictions.

---

### User Story 3 - Admin Batch & Course Updates (Priority: P3)

The instructor wants to update upcoming batch dates, registration toggles, and recorded course pricing dynamically from an interactive dashboard.

**Why this priority**: Essential to prevent outdated dates ("e.g. 25 JULY") and allow immediate price changes without touching the codebase.

**Independent Test**: The admin changes the next bootcamp start date in the dashboard and verifies that the new date shows up on the public landing page.

**Acceptance Scenarios**:

1. **Given** the admin is logged into the dashboard, **When** they change the next bootcamp start date to "15 SEPTEMBER" and save, **Then** the public page updates the date display immediately.
2. **Given** the course pricing editor in the dashboard, **When** the admin changes a recorded course price and toggles registration status to closed, **Then** public users see the updated price and registration is disabled.

---

### User Story 4 - Admin Portfolio & Testimonial Uploads (Priority: P4)

The instructor wants to keep the portfolio fresh by uploading high-res photos and embedding student video testimonial links.

**Why this priority**: Crucial for social proof and credibility marketing.

**Independent Test**: The admin adds a new testimonial link in the dashboard and verifies it appears in the public testimonial slider.

**Acceptance Scenarios**:

1. **Given** the portfolio manager in the dashboard, **When** the admin uploads a new high-resolution image, **Then** the public image gallery showcases the new image.
2. **Given** the testimonial manager, **When** the admin adds a student video URL, **Then** the video testimonial slider displays and plays the embedded video correctly.

---

### Edge Cases

- **Interrupted Payment Checkouts**: If a payment is initiated but the user's connection drops, the system must not grant access to the video modules until the gateway transaction status is confirmed.
- **Unauthorized Video Access**: If an unauthenticated user tries to directly navigate to a video module URL, they must be redirected back to the storefront checkout.
- **Invalid Admin Inputs**: If the admin enters negative pricing or invalid dates, the dashboard must validate the inputs and show warnings instead of updating.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST include a high-impact cinematographic hero section supporting video backgrounds or high-quality image slides.
- **FR-002**: The homepage MUST display high-visibility perk highlights (highlighting free stay, free food, and provided camera/PC equipment).
- **FR-003**: The website MUST host a video testimonial slider playing embedded student video reviews.
- **FR-004**: The system MUST generate custom WhatsApp CTA links pre-filled with bootcamp-specific query messages.
- **FR-005**: The system MUST integrate with automated Indian payment gateways (Razorpay or Cashfree) to process recorded course transactions in INR.
- **FR-006**: The platform MUST prevent direct video file downloads by enforcing domain-locked streaming configurations.
- **FR-007**: The system MUST provide an administrator dashboard protected by secure authentication.
- **FR-008**: The admin dashboard MUST provide forms to update batch dates, registration toggles, and course prices.
- **FR-009**: The admin dashboard MUST support portfolio image uploads, video module organization, and testimonial link management.
- **FR-010**: The system MUST authenticate students to access their purchased recorded courses via passwordless email magic login links.

### Key Entities

- **Bootcamp Batch**: Represents an offline training program (Photography or Cinematography). Attributes: title, next start date, registration status, description.
- **Recorded Course**: Represents a digital video course. Attributes: title, description, price, thumbnail image.
- **Video Module**: A specific lecture video. Attributes: title, duration, secure video URL.
- **Portfolio Item**: A showcased creative work. Attributes: media URL/path, category, caption, date uploaded.
- **Student Testimonial**: Past student review. Attributes: student name, video embed link, course taken.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can complete a recorded course payment and start streaming their first video lesson in under 2 minutes.
- **SC-002**: The admin can update a bootcamp batch date in the dashboard and verify the change on the public landing page in under 30 seconds.
- **SC-003**: The main public sections (Hero, Perks, Bootcamps, Gallery) render correctly without layout overlap on viewports ranging from 375px (mobile) to 1920px (desktop).
- **SC-004**: Testimonial videos and portfolio media load and play within 2 seconds on a standard 3G/broadband connection.

## Assumptions

- The primary audience resides in India and will utilize standard Indian payment instruments (UPI, Netbanking, Cards).
- The admin hosts video files on services supporting domain restrictions (such as Bunny.net or Vimeo) to enforce the download prevention requirement.
- The admin is responsible for generating and copy-pasting correct video embed URLs (YouTube/Vimeo) for testimonials.
