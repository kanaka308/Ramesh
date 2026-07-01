-- Supabase (PostgreSQL) Database Schema for Photography Academy
-- This schema maps exactly to the queries and table names expected by src/db/repo.ts

-- 1. settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 2. recorded_courses table
CREATE TABLE IF NOT EXISTS recorded_courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in paise (INR subunits)
    thumbnail_path TEXT NOT NULL
);

-- 3. video_modules table
CREATE TABLE IF NOT EXISTS video_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES recorded_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    secure_video_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 4. bootcamp_batches table
CREATE TABLE IF NOT EXISTS bootcamp_batches (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    next_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    description TEXT
);

-- 5. students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES recorded_courses(id) ON DELETE CASCADE,
    payment_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. registrations table (corresponds to bootcamp_registrations in SQLite)
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES bootcamp_batches(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    status TEXT NOT NULL DEFAULT 'enquired',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. portfolio_images table
CREATE TABLE IF NOT EXISTS portfolio_images (
    id SERIAL PRIMARY KEY,
    file_path TEXT NOT NULL,
    caption TEXT,
    category TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 9. testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 10. notifications table (corresponds to admin_notifications in SQLite)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'payment',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
