import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), process.env.DATABASE_URL || 'academy.db');

// Ensure database directories exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Singleton database connection
let db: Database.Database;

if (process.env.NODE_ENV === 'production') {
  db = new Database(dbPath);
} else {
  // Use a global variable to preserve the connection during development hot-reloading
  const globalWithDb = global as typeof globalThis & {
    _sqliteDb?: Database.Database;
  };
  if (!globalWithDb._sqliteDb) {
    globalWithDb._sqliteDb = new Database(dbPath);
  }
  db = globalWithDb._sqliteDb;
}

// Run migrations on start if schema tables do not exist
const initDb = () => {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();
  
  if (!tableCheck) {
    console.log('Initializing database schema...');
    const schemaFile = path.resolve(process.cwd(), 'src/db/schema.sql');
    if (fs.existsSync(schemaFile)) {
      const schemaSql = fs.readFileSync(schemaFile, 'utf8');
      db.exec(schemaSql);
      console.log('Schema created successfully.');
      seedDb();
    } else {
      console.error('Migration schema.sql file not found at:', schemaFile);
    }
  }
};

// Seed initial mock data
const seedDb = () => {
  console.log('Seeding initial mock database records...');
  
  // Seed default admin (username: admin, password: password123)
  const passwordHash = crypto.createHash('sha256').update('password123').digest('hex');
  db.prepare('INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)')
    .run('admin', passwordHash);

  // Seed bootcamp batches
  const batches = db.prepare('SELECT COUNT(*) as count FROM bootcamp_batches').get() as { count: number };
  if (batches.count === 0) {
    db.prepare('INSERT INTO bootcamp_batches (title, next_date, is_active, description) VALUES (?, ?, ?, ?)')
      .run('Photography Bootcamp', '25 JULY', 1, '30-day intensive program in Vijayapur covering camera mechanics, composition, lighting, and workflow.');
    db.prepare('INSERT INTO bootcamp_batches (title, next_date, is_active, description) VALUES (?, ?, ?, ?)')
      .run('Cinematography Bootcamp', '10 AUGUST', 1, '30-day masterclass in narrative lighting, camera movement, framing, and sound capture.');
  }

  // Seed recorded storefront courses
  const courses = db.prepare('SELECT COUNT(*) as count FROM recorded_courses').get() as { count: number };
  if (courses.count === 0) {
    const course1Id = db.prepare('INSERT INTO recorded_courses (title, description, price, thumbnail_path) VALUES (?, ?, ?, ?)')
      .run('Mobile Photography Essentials', 'Master professional editing and framing concepts using only your mobile phone.', 49900, '/images/mobile_photo.jpg')
      .lastInsertRowid;
      
    const course2Id = db.prepare('INSERT INTO recorded_courses (title, description, price, thumbnail_path) VALUES (?, ?, ?, ?)')
      .run('Lightroom & Color Grading Masterclass', 'Detailed breakdown of HSL panels, tone curves, and creating professional presets.', 99900, '/images/lightroom.jpg')
      .lastInsertRowid;

    // Seed video modules
    db.prepare('INSERT INTO video_modules (course_id, title, secure_video_url, sort_order) VALUES (?, ?, ?, ?)')
      .run(course1Id, 'Introduction to Mobilography', 'https://player.vimeo.com/video/76979871', 1);
    db.prepare('INSERT INTO video_modules (course_id, title, secure_video_url, sort_order) VALUES (?, ?, ?, ?)')
      .run(course1Id, 'Rule of Thirds and Leading Lines', 'https://player.vimeo.com/video/76979871', 2);

    db.prepare('INSERT INTO video_modules (course_id, title, secure_video_url, sort_order) VALUES (?, ?, ?, ?)')
      .run(course2Id, 'Understanding Tone Curves', 'https://player.vimeo.com/video/76979871', 1);
  }

  // Seed portfolio gallery images
  const images = db.prepare('SELECT COUNT(*) as count FROM portfolio_images').get() as { count: number };
  if (images.count === 0) {
    db.prepare('INSERT INTO portfolio_images (file_path, caption, category, display_order) VALUES (?, ?, ?, ?)')
      .run('/images/port1.jpg', 'Golden hour cinematic frames', 'Cinematography', 1);
    db.prepare('INSERT INTO portfolio_images (file_path, caption, category, display_order) VALUES (?, ?, ?, ?)')
      .run('/images/port2.jpg', 'Street portrait lighting', 'Portrait', 2);
  }

  // Seed testimonials
  const testimonials = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  if (testimonials.count === 0) {
    db.prepare('INSERT INTO testimonials (student_name, video_url, description, display_order) VALUES (?, ?, ?, ?)')
      .run('Rohan K.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'This bootcamp completely changed how I look at lighting.', 1);
  }
  
  console.log('Database seeding completed.');
};

// Auto-run schema initialization
initDb();

export default db;
