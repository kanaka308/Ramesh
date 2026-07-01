import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseActive = !!(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith('your_'));

let db: any;

if (isSupabaseActive) {
  // Return a dummy db proxy since all operations will route to Supabase in repo.ts
  db = new Proxy({}, {
    get(target, prop) {
      return () => {
        throw new Error(`Attempted to call SQLite database method '${String(prop)}' while Supabase is active.`);
      };
    }
  });
} else {
  // Dynamically require better-sqlite3 to avoid crashes in environments where it is not installed/needed
  const Database = eval('require')('better-sqlite3');
  
  const dbPath = path.resolve(process.cwd(), process.env.DATABASE_URL || 'academy.db');

  // Ensure database directories exist
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (process.env.NODE_ENV === 'production') {
    db = new Database(dbPath);
  } else {
    // Use a global variable to preserve the connection during development hot-reloading
    const globalWithDb = global as typeof globalThis & {
      _sqliteDb?: any;
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

    // Run incremental migrations to add new tables if they are missing
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS bootcamp_registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          batch_id INTEGER NOT NULL,
          student_name TEXT NOT NULL,
          student_email TEXT NOT NULL,
          student_phone TEXT,
          status TEXT NOT NULL DEFAULT 'enquired',
          registered_at TEXT NOT NULL,
          FOREIGN KEY(batch_id) REFERENCES bootcamp_batches(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS admin_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          is_read INTEGER DEFAULT 0
      );
    `);

    // Seed default settings if empty
    const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
    if (settingsCount.count === 0) {
      console.log('Seeding initial site settings...');
      const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
      insertSetting.run('site_title', 'Ramclicks');
      insertSetting.run('site_logo_first', 'RAM');
      insertSetting.run('site_logo_second', 'CLICKS');
      insertSetting.run('site_hero_pre', 'Ramclicks');
      insertSetting.run('site_hero_title', "Capture Life's Greatest Masterpieces");
      insertSetting.run('site_hero_subtitle', 'Learn elite, hands-on production directly from industry directors. Standard equipment, home-cooked food, and free premium stay provided.');
      insertSetting.run('whatsapp_number', '919900000000');
      insertSetting.run('whatsapp_custom_message', 'Hi Ramclicks, I would like to enquire about your photography bootcamps and recorded courses!');
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
    
    console.log('Database seeding completed.');
  };

  // Auto-run schema initialization
  initDb();
}

export default db;
