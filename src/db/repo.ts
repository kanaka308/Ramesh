import { createClient } from '@supabase/supabase-js';
import sqliteDb from './index';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith('your_')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    })
  : null;

// Log active database driver
console.log(`[Database] Active Driver: ${supabase ? 'Supabase (PostgreSQL)' : 'Local SQLite'}`);

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
  pay_now_enabled?: boolean;
}

export interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
  pay_now_enabled?: boolean;
}

export interface Lecture {
  id: number;
  course_id: number;
  title: string;
  secure_video_url: string;
  sort_order: number;
}

export interface GalleryItem {
  id: number;
  file_path: string;
  caption: string;
  category: string;
  display_order: number;
}

export interface Testimonial {
  id: number;
  student_name: string;
  video_url: string;
  description: string;
  display_order: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface Enrollment {
  id: number;
  student_email: string;
  course_title: string;
  course_id: number;
  purchased_at: string;
  status: string;
  payment_id: string;
}

export interface Registration {
  id: number;
  batch_id: number;
  batch_title: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  status: string;
  registered_at: string;
}

export const repo = {
  // Settings API
  async getSiteSettings(): Promise<{ key: string; value: string }[]> {
    if (supabase) {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return sqliteDb.prepare('SELECT * FROM site_settings').all() as any[];
    }
  },

  async getSiteSetting(key: string, defaultValue: string): Promise<string> {
    if (supabase) {
      const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
      if (error) return defaultValue;
      return data ? data.value : defaultValue;
    } else {
      try {
        const row = sqliteDb.prepare('SELECT value FROM site_settings WHERE key = ?').get(key) as { value: string } | undefined;
        return row ? row.value : defaultValue;
      } catch (err) {
        return defaultValue;
      }
    }
  },

  async updateSiteSettings(settingsMap: Record<string, string>): Promise<void> {
    if (supabase) {
      for (const [key, value] of Object.entries(settingsMap)) {
        const { error } = await supabase.from('settings').upsert({ key, value });
        if (error) throw error;
      }
    } else {
      const updateStmt = sqliteDb.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      const transaction = sqliteDb.transaction((map: Record<string, string>) => {
        for (const [key, val] of Object.entries(map)) {
          updateStmt.run(key, val);
        }
      });
      transaction(settingsMap);
    }
  },

  async getCourseRatings(): Promise<Record<string, Record<string, number>>> {
    const raw = await repo.getSiteSetting('course_ratings_data', '{}');
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  async submitCourseRating(courseId: number, email: string, rating: number): Promise<void> {
    const ratings = await repo.getCourseRatings();
    const courseKey = String(courseId);
    if (!ratings[courseKey]) {
      ratings[courseKey] = {};
    }
    ratings[courseKey][email] = rating;
    await repo.updateSiteSettings({ 'course_ratings_data': JSON.stringify(ratings) });
  },

  // Recorded Courses
  async getPayNowDisabledCourses(): Promise<number[]> {
    const raw = await repo.getSiteSetting('disabled_pay_now_courses', '[]');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async setCoursePayNowEnabled(courseId: number, enabled: boolean): Promise<void> {
    const disabled = await repo.getPayNowDisabledCourses();
    let updated: number[];
    if (enabled) {
      updated = disabled.filter(id => id !== courseId);
    } else {
      updated = [...new Set([...disabled, courseId])];
    }
    await repo.updateSiteSettings({ 'disabled_pay_now_courses': JSON.stringify(updated) });
  },

  async getRecordedCourses(): Promise<Course[]> {
    let courses: Course[];
    if (supabase) {
      const { data, error } = await supabase.from('recorded_courses').select('*').order('id', { ascending: false });
      if (error) throw error;
      courses = data || [];
    } else {
      courses = sqliteDb.prepare('SELECT * FROM recorded_courses ORDER BY id DESC').all() as Course[];
    }
    const disabled = await repo.getPayNowDisabledCourses();
    return courses.map(c => ({
      ...c,
      pay_now_enabled: !disabled.includes(c.id)
    }));
  },

  async getRecordedCourse(id: number | string): Promise<Course | undefined> {
    let course: Course | undefined;
    if (supabase) {
      const { data, error } = await supabase.from('recorded_courses').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      course = data || undefined;
    } else {
      course = sqliteDb.prepare('SELECT * FROM recorded_courses WHERE id = ?').get(id) as Course | undefined;
    }
    if (course) {
      const disabled = await repo.getPayNowDisabledCourses();
      course.pay_now_enabled = !disabled.includes(course.id);
    }
    return course;
  },

  async addRecordedCourse(course: Omit<Course, 'id' | 'pay_now_enabled'>): Promise<number> {
    if (supabase) {
      const { data, error } = await supabase.from('recorded_courses').insert([course]).select('id').single();
      if (error) throw error;
      return data ? data.id : Date.now();
    } else {
      const result = sqliteDb.prepare('INSERT INTO recorded_courses (title, description, price, thumbnail_path) VALUES (?, ?, ?, ?)')
        .run(course.title, course.description || '', course.price, course.thumbnail_path);
      return Number(result.lastInsertRowid);
    }
  },

  async updateRecordedCourse(course: Omit<Course, 'pay_now_enabled'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('recorded_courses').update({
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail_path: course.thumbnail_path
      }).eq('id', course.id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE recorded_courses SET title = ?, description = ?, price = ?, thumbnail_path = ? WHERE id = ?')
        .run(course.title, course.description || '', course.price, course.thumbnail_path, course.id);
    }
  },

  async deleteRecordedCourse(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('recorded_courses').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM recorded_courses WHERE id = ?').run(id);
    }
  },

  // Video Modules (Lectures)
  async getVideoModules(courseId: number | string): Promise<Lecture[]> {
    if (supabase) {
      const { data, error } = await supabase.from('video_modules').select('*').eq('course_id', courseId).order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return sqliteDb.prepare('SELECT * FROM video_modules WHERE course_id = ? ORDER BY sort_order ASC').all(courseId) as Lecture[];
    }
  },

  async addVideoModule(lec: Omit<Lecture, 'id'>): Promise<number> {
    if (supabase) {
      const { data, error } = await supabase.from('video_modules').insert([lec]).select('id').single();
      if (error) throw error;
      return data ? data.id : Date.now();
    } else {
      const result = sqliteDb.prepare(`
        INSERT INTO video_modules (course_id, title, secure_video_url, sort_order)
        VALUES (?, ?, ?, ?)
      `).run(lec.course_id, lec.title, lec.secure_video_url, lec.sort_order);
      return Number(result.lastInsertRowid);
    }
  },

  async updateVideoModule(lec: Omit<Lecture, 'course_id'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('video_modules').update({
        title: lec.title,
        secure_video_url: lec.secure_video_url,
        sort_order: lec.sort_order
      }).eq('id', lec.id);
      if (error) throw error;
    } else {
      sqliteDb.prepare(`
        UPDATE video_modules
        SET title = ?, secure_video_url = ?, sort_order = ?
        WHERE id = ?
      `).run(lec.title, lec.secure_video_url, lec.sort_order, lec.id);
    }
  },

  async deleteVideoModule(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('video_modules').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM video_modules WHERE id = ?').run(id);
    }
  },

  // Bootcamp Batches (Cohorts)
  async getPayNowDisabledBootcamps(): Promise<number[]> {
    const raw = await repo.getSiteSetting('disabled_pay_now_bootcamps', '[]');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async setBootcampPayNowEnabled(bootcampId: number, enabled: boolean): Promise<void> {
    const disabled = await repo.getPayNowDisabledBootcamps();
    let updated: number[];
    if (enabled) {
      updated = disabled.filter(id => id !== bootcampId);
    } else {
      updated = [...new Set([...disabled, bootcampId])];
    }
    await repo.updateSiteSettings({ 'disabled_pay_now_bootcamps': JSON.stringify(updated) });
  },

  async getBootcampBatches(): Promise<Bootcamp[]> {
    let batches: Bootcamp[];
    if (supabase) {
      const { data, error } = await supabase.from('bootcamp_batches').select('*').order('id', { ascending: false });
      if (error) throw error;
      batches = data || [];
    } else {
      batches = sqliteDb.prepare('SELECT * FROM bootcamp_batches ORDER BY id DESC').all() as Bootcamp[];
    }
    const disabled = await repo.getPayNowDisabledBootcamps();
    return batches.map(b => ({
      ...b,
      pay_now_enabled: !disabled.includes(b.id)
    }));
  },

  async addBootcampBatch(batch: Omit<Bootcamp, 'id' | 'pay_now_enabled'>): Promise<number> {
    if (supabase) {
      const { data, error } = await supabase.from('bootcamp_batches').insert([batch]).select('id').single();
      if (error) throw error;
      return data ? data.id : Date.now();
    } else {
      const result = sqliteDb.prepare('INSERT INTO bootcamp_batches (title, next_date, is_active, description) VALUES (?, ?, ?, ?)')
        .run(batch.title, batch.next_date, batch.is_active, batch.description || '');
      return Number(result.lastInsertRowid);
    }
  },

  async updateBootcampBatch(batch: Omit<Bootcamp, 'pay_now_enabled'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('bootcamp_batches').update({
        title: batch.title,
        next_date: batch.next_date,
        is_active: batch.is_active,
        description: batch.description
      }).eq('id', batch.id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE bootcamp_batches SET title = ?, next_date = ?, is_active = ?, description = ? WHERE id = ?')
        .run(batch.title, batch.next_date, batch.is_active, batch.description || '', batch.id);
    }
  },

  async deleteBootcampBatch(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('bootcamp_batches').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM bootcamp_batches WHERE id = ?').run(id);
    }
  },

  // Students, Purchases and Direct Enrollments
  async getStudentByEmail(email: string): Promise<{ id: number } | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('students').select('id').eq('email', email).maybeSingle();
      if (error) throw error;
      return data || undefined;
    } else {
      return sqliteDb.prepare('SELECT id FROM students WHERE email = ?').get(email) as { id: number } | undefined;
    }
  },

  async createStudent(email: string): Promise<number> {
    if (supabase) {
      const { data, error } = await supabase.from('students').insert([{ email }]).select('id').single();
      if (error) throw error;
      return data ? data.id : Date.now();
    } else {
      const result = sqliteDb.prepare('INSERT INTO students (email, created_at) VALUES (?, ?)')
        .run(email, new Date().toISOString());
      return Number(result.lastInsertRowid);
    }
  },

  async getPurchasedCourseIdsForEmail(email: string): Promise<number[]> {
    if (!email) return [];
    if (supabase) {
      const student = await this.getStudentByEmail(email);
      if (!student) return [];
      const { data, error } = await supabase.from('purchases').select('course_id').eq('student_id', student.id).eq('status', 'completed');
      if (error) throw error;
      return (data || []).map(p => p.course_id);
    } else {
      const rows = sqliteDb.prepare(`
        SELECT p.course_id 
        FROM purchases p
        JOIN students s ON p.student_id = s.id
        WHERE s.email = ? AND p.status = 'completed'
      `).all(email) as { course_id: number }[];
      return rows.map(r => r.course_id);
    }
  },

  async checkCourseAccess(email: string, courseId: number | string): Promise<boolean> {
    if (!email) return false;
    if (supabase) {
      const student = await this.getStudentByEmail(email);
      if (!student) return false;
      const { data, error } = await supabase.from('purchases')
        .select('id')
        .eq('student_id', student.id)
        .eq('course_id', courseId)
        .eq('status', 'completed')
        .maybeSingle();
      if (error) return false;
      return !!data;
    } else {
      const purchase = sqliteDb.prepare("SELECT id FROM purchases WHERE student_id = (SELECT id FROM students WHERE email = ?) AND course_id = ? AND status = 'completed'")
        .get(email, courseId);
      return !!purchase;
    }
  },

  async registerPendingPurchase(studentId: number, courseId: number, orderId: string): Promise<void> {
    if (supabase) {
      const { data } = await supabase.from('purchases')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (!data) {
        const { error } = await supabase.from('purchases').insert([{
          student_id: studentId,
          course_id: courseId,
          payment_id: orderId,
          status: 'pending'
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('purchases').update({
          payment_id: orderId,
          purchased_at: new Date().toISOString()
        }).eq('id', data.id);
        if (error) throw error;
      }
    } else {
      const pending = sqliteDb.prepare('SELECT id FROM purchases WHERE student_id = ? AND course_id = ? AND status = ?')
        .get(studentId, courseId, 'pending');
      if (!pending) {
        sqliteDb.prepare('INSERT INTO purchases (student_id, course_id, payment_id, status, purchased_at) VALUES (?, ?, ?, ?, ?)')
          .run(studentId, courseId, orderId, 'pending', new Date().toISOString());
      } else {
        sqliteDb.prepare('UPDATE purchases SET payment_id = ?, purchased_at = ? WHERE id = ?')
          .run(orderId, new Date().toISOString(), (pending as any).id);
      }
    }
  },

  async completePurchase(paymentId: string): Promise<boolean> {
    if (supabase) {
      const { data, error } = await supabase.from('purchases').update({ status: 'completed', purchased_at: new Date().toISOString() }).eq('payment_id', paymentId).select('id');
      if (error) throw error;
      return !!data && data.length > 0;
    } else {
      const result = sqliteDb.prepare("UPDATE purchases SET status = 'completed', purchased_at = ? WHERE payment_id = ?").run(new Date().toISOString(), paymentId);
      return result.changes > 0;
    }
  },

  async grantManualAccess(email: string, courseId: number): Promise<void> {
    let student = await this.getStudentByEmail(email);
    if (!student) {
      const studentId = await this.createStudent(email);
      student = { id: studentId };
    }

    if (supabase) {
      const { data } = await supabase.from('purchases')
        .select('id')
        .eq('student_id', student.id)
        .eq('course_id', courseId)
        .eq('status', 'completed')
        .maybeSingle();
      
      if (!data) {
        const { error } = await supabase.from('purchases').insert([{
          student_id: student.id,
          course_id: courseId,
          payment_id: 'manual_' + Math.random().toString(36).substring(2, 10),
          status: 'completed'
        }]);
        if (error) throw error;
      }
    } else {
      const existing = sqliteDb.prepare("SELECT id FROM purchases WHERE student_id = ? AND course_id = ? AND status = 'completed'")
        .get(student.id, courseId);
      if (!existing) {
        sqliteDb.prepare("INSERT INTO purchases (student_id, course_id, payment_id, status, purchased_at) VALUES (?, ?, ?, 'completed', ?)")
          .run(student.id, courseId, 'manual_' + Math.random().toString(36).substring(2, 10), new Date().toISOString());
      }
    }
  },

  async getEnrollments(): Promise<Enrollment[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          purchased_at,
          status,
          payment_id,
          course_id,
          students(email),
          recorded_courses(title)
        `)
        .order('purchased_at', { ascending: false });
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        student_email: row.students ? row.students.email : 'Deleted Student',
        course_title: row.recorded_courses ? row.recorded_courses.title : 'Deleted Course',
        course_id: row.course_id,
        purchased_at: row.purchased_at,
        status: row.status,
        payment_id: row.payment_id
      }));
    } else {
      return sqliteDb.prepare(`
        SELECT p.id, s.email as student_email, c.title as course_title, p.course_id, p.purchased_at, p.status, p.payment_id
        FROM purchases p
        JOIN students s ON p.student_id = s.id
        JOIN recorded_courses c ON p.course_id = c.id
        ORDER BY p.purchased_at DESC
      `).all() as Enrollment[];
    }
  },

  async deleteEnrollment(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('purchases').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM purchases WHERE id = ?').run(id);
    }
  },

  // Offline Bootcamp Registrations
  async getRegistrations(batchId?: number | string): Promise<Registration[]> {
    if (supabase) {
      let query = supabase
        .from('registrations')
        .select(`
          id,
          batch_id,
          full_name,
          email,
          phone,
          registered_at,
          bootcamp_batches(title)
        `);
      if (batchId) {
        query = query.eq('batch_id', batchId);
      }
      const { data, error } = await query.order('registered_at', { ascending: false });
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        batch_id: row.batch_id,
        batch_title: row.bootcamp_batches ? row.bootcamp_batches.title : 'General Enquiry',
        student_name: row.full_name,
        student_email: row.email,
        student_phone: row.phone,
        status: 'enquired',
        registered_at: row.registered_at
      }));
    } else {
      if (batchId) {
        return sqliteDb.prepare(`
          SELECT r.id, r.batch_id, b.title as batch_title, r.student_name, r.student_email, r.student_phone, r.status, r.registered_at
          FROM bootcamp_registrations r
          JOIN bootcamp_batches b ON r.batch_id = b.id
          WHERE r.batch_id = ?
          ORDER BY r.registered_at DESC
        `).all(batchId) as Registration[];
      } else {
        return sqliteDb.prepare(`
          SELECT r.id, r.batch_id, b.title as batch_title, r.student_name, r.student_email, r.student_phone, r.status, r.registered_at
          FROM bootcamp_registrations r
          JOIN bootcamp_batches b ON r.batch_id = b.id
          ORDER BY r.registered_at DESC
        `).all() as Registration[];
      }
    }
  },

  async addRegistration(reg: { batch_id: number; student_name: string; student_email: string; student_phone?: string; status?: string }): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('registrations').insert([{
        batch_id: reg.batch_id,
        full_name: reg.student_name,
        email: reg.student_email,
        phone: reg.student_phone || ''
      }]);
      if (error) throw error;
    } else {
      sqliteDb.prepare(`
        INSERT INTO bootcamp_registrations (batch_id, student_name, student_email, student_phone, status, registered_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(reg.batch_id, reg.student_name, reg.student_email, reg.student_phone || '', reg.status || 'enquired', new Date().toISOString());
    }
  },

  async updateRegistration(reg: { id: number | string; batch_id: number; student_name: string; student_email: string; student_phone?: string; status?: string }): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('registrations').update({
        batch_id: reg.batch_id,
        full_name: reg.student_name,
        email: reg.student_email,
        phone: reg.student_phone || ''
      }).eq('id', reg.id);
      if (error) throw error;
    } else {
      sqliteDb.prepare(`
        UPDATE bootcamp_registrations 
        SET batch_id = ?, student_name = ?, student_email = ?, student_phone = ?, status = ? 
        WHERE id = ?
      `).run(reg.batch_id, reg.student_name, reg.student_email, reg.student_phone || '', reg.status || 'enquired', reg.id);
    }
  },

  async deleteRegistration(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM bootcamp_registrations WHERE id = ?').run(id);
    }
  },

  // Visual Portfolio Items (Gallery)
  async getPortfolioImages(): Promise<GalleryItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('portfolio_images').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return sqliteDb.prepare('SELECT * FROM portfolio_images ORDER BY display_order ASC').all() as GalleryItem[];
    }
  },

  async addPortfolioImage(img: Omit<GalleryItem, 'id'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('portfolio_images').insert([img]);
      if (error) throw error;
    } else {
      sqliteDb.prepare('INSERT INTO portfolio_images (file_path, caption, category, display_order) VALUES (?, ?, ?, ?)')
        .run(img.file_path, img.caption || '', img.category || 'general', img.display_order);
    }
  },

  async getPortfolioImage(id: number | string): Promise<GalleryItem | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('portfolio_images').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    } else {
      return sqliteDb.prepare('SELECT file_path FROM portfolio_images WHERE id = ?').get(id) as GalleryItem | undefined;
    }
  },

  async deletePortfolioImage(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('portfolio_images').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM portfolio_images WHERE id = ?').run(id);
    }
  },

  async renameGalleryCategory(oldCat: string, newCat: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('portfolio_images').update({ category: newCat }).eq('category', oldCat);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE portfolio_images SET category = ? WHERE category = ?').run(newCat, oldCat);
    }
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    if (supabase) {
      const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return sqliteDb.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all() as Testimonial[];
    }
  },

  async addTestimonial(t: Omit<Testimonial, 'id'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('testimonials').insert([t]);
      if (error) throw error;
    } else {
      sqliteDb.prepare('INSERT INTO testimonials (student_name, video_url, description, display_order) VALUES (?, ?, ?, ?)')
        .run(t.student_name, t.video_url || '', t.description || '', t.display_order);
    }
  },

  async updateTestimonial(t: Omit<Testimonial, 'display_order'>): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('testimonials').update({
        student_name: t.student_name,
        video_url: t.video_url,
        description: t.description
      }).eq('id', t.id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE testimonials SET student_name = ?, video_url = ?, description = ? WHERE id = ?')
        .run(t.student_name, t.video_url || '', t.description || '', t.id);
    }
  },

  async deleteTestimonial(id: number | string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    }
  },

  // Admin Notifications
  async getNotifications(): Promise<Notification[]> {
    if (supabase) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return sqliteDb.prepare('SELECT * FROM admin_notifications ORDER BY created_at DESC').all() as Notification[];
    }
  },

  async addNotification(title: string, message: string, type: string = 'payment'): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('notifications').insert([{ title, message, type, is_read: 0 }]);
      if (error) throw error;
    } else {
      sqliteDb.prepare('INSERT INTO admin_notifications (title, message, type, is_read, created_at) VALUES (?, ?, ?, 0, ?)')
        .run(title, message, type, new Date().toISOString());
    }
  },

  async checkNotificationExists(messageLike: string): Promise<boolean> {
    if (supabase) {
      const { data } = await supabase.from('notifications').select('id').like('message', messageLike).maybeSingle();
      return !!data;
    } else {
      const row = sqliteDb.prepare("SELECT id FROM admin_notifications WHERE message LIKE ?").get(messageLike);
      return !!row;
    }
  },

  async getPurchaseByPaymentId(paymentId: string): Promise<{ payment_id: string; course_title: string; student_email: string; price: number } | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          payment_id,
          recorded_courses(title, price),
          students(email)
        `)
        .eq('payment_id', paymentId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return undefined;
      return {
        payment_id: data.payment_id,
        course_title: data.recorded_courses ? (data.recorded_courses as any).title : '',
        student_email: data.students ? (data.students as any).email : '',
        price: data.recorded_courses ? (data.recorded_courses as any).price : 0
      };
    } else {
      return sqliteDb.prepare(`
        SELECT p.payment_id, c.title as course_title, s.email as student_email, c.price
        FROM purchases p
        JOIN recorded_courses c ON p.course_id = c.id
        JOIN students s ON p.student_id = s.id
        WHERE p.payment_id = ?
      `).get(paymentId) as any;
    }
  },

  async updateBatchStatusAndDate(id: number | string, nextDate: string, isActive: number): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('bootcamp_batches').update({ next_date: nextDate, is_active: isActive }).eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE bootcamp_batches SET next_date = ?, is_active = ? WHERE id = ?').run(nextDate, isActive, id);
    }
  },

  async updateCoursePrice(id: number | string, price: number): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('recorded_courses').update({ price }).eq('id', id);
      if (error) throw error;
    } else {
      sqliteDb.prepare('UPDATE recorded_courses SET price = ? WHERE id = ?').run(price, id);
    }
  },

  async markNotificationsRead(id?: number | string): Promise<void> {
    if (supabase) {
      if (id) {
        const { error } = await supabase.from('notifications').update({ is_read: 1 }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notifications').update({ is_read: 1 }).eq('is_read', 0);
        if (error) throw error;
      }
    } else {
      if (id) {
        sqliteDb.prepare('UPDATE admin_notifications SET is_read = 1 WHERE id = ?').run(id);
      } else {
        sqliteDb.prepare('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0').run();
      }
    }
  },

  async deleteNotifications(id?: number | string): Promise<void> {
    if (supabase) {
      if (id) {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notifications').delete().neq('id', 0); // Delete all
        if (error) throw error;
      }
    } else {
      if (id) {
        sqliteDb.prepare('DELETE FROM admin_notifications WHERE id = ?').run(id);
      } else {
        sqliteDb.prepare('DELETE FROM admin_notifications').run();
      }
    }
  },

  // Materials and Templates
  async getMaterials(): Promise<any[]> {
    const raw = await repo.getSiteSetting('materials_data', '[]');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async saveMaterials(materials: any[]): Promise<void> {
    await repo.updateSiteSettings({ 'materials_data': JSON.stringify(materials) });
  },

  async getMaterialPurchasedIdsForEmail(email: string): Promise<number[]> {
    const raw = await repo.getSiteSetting('material_purchases_data', '{}');
    try {
      const data = JSON.parse(raw);
      return data[email] || [];
    } catch {
      return [];
    }
  },

  async grantMaterialAccess(email: string, materialId: number): Promise<void> {
    const raw = await repo.getSiteSetting('material_purchases_data', '{}');
    let data: Record<string, number[]> = {};
    try {
      data = JSON.parse(raw);
    } catch {}
    if (!data[email]) {
      data[email] = [];
    }
    if (!data[email].includes(materialId)) {
      data[email].push(materialId);
    }
    await repo.updateSiteSettings({ 'material_purchases_data': JSON.stringify(data) });
  },

  async getMaterialOrders(): Promise<any[]> {
    const raw = await repo.getSiteSetting('material_orders_data', '[]');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async saveMaterialOrders(orders: any[]): Promise<void> {
    await repo.updateSiteSettings({ 'material_orders_data': JSON.stringify(orders) });
  },

  async registerPendingMaterialPurchase(email: string, materialId: number, orderId: string): Promise<void> {
    const orders = await repo.getMaterialOrders();
    const filtered = orders.filter(o => !(o.email === email && o.materialId === materialId && o.status === 'pending'));
    filtered.push({
      orderId,
      email,
      materialId,
      status: 'pending',
      purchasedAt: new Date().toISOString()
    });
    await repo.saveMaterialOrders(filtered);
  },

  async completeMaterialPurchase(orderId: string): Promise<boolean> {
    const orders = await repo.getMaterialOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) return false;
    
    const order = orders[orderIndex];
    if (order.status === 'completed') return true;

    order.status = 'completed';
    order.purchasedAt = new Date().toISOString();
    await repo.saveMaterialOrders(orders);
    await repo.grantMaterialAccess(order.email, order.materialId);
    return true;
  },

  async getMaterialOrderById(orderId: string): Promise<any | undefined> {
    const orders = await repo.getMaterialOrders();
    return orders.find(o => o.orderId === orderId);
  }
};
export default repo;
