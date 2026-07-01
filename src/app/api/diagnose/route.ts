import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {};

  // 1. Check Node environment
  diagnostics.nodeVersion = process.version;
  diagnostics.nodeEnv = process.env.NODE_ENV;

  // 2. Check Supabase Environment Variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  diagnostics.supabaseEnv = {
    hasUrl: !!supabaseUrl,
    urlValueStart: supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : null,
    hasAnonKey: !!supabaseAnonKey,
    anonKeyValueStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : null,
    isPlaceholder: !!(supabaseAnonKey && supabaseAnonKey.startsWith('your_'))
  };

  const isSupabaseActive = !!(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith('your_'));
  diagnostics.isSupabaseActive = isSupabaseActive;

  // 3. Test Database Connection
  if (isSupabaseActive) {
    diagnostics.driver = 'Supabase (PostgreSQL)';
    try {
      // Polyfill WebSocket in case it's missing (same as repo.ts)
      if (typeof globalThis.WebSocket === 'undefined') {
        globalThis.WebSocket = class {} as any;
      }
      
      const client = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await client.from('settings').select('key, value').limit(3);
      
      if (error) {
        diagnostics.supabaseConnection = {
          success: false,
          error: error.message,
          details: error.details,
          hint: error.hint
        };
      } else {
        diagnostics.supabaseConnection = {
          success: true,
          rowsCount: data?.length || 0,
          sampleData: data
        };
      }
    } catch (err: any) {
      diagnostics.supabaseConnection = {
        success: false,
        error: err.message || err,
        stack: err.stack
      };
    }
  } else {
    diagnostics.driver = 'Local SQLite';
    try {
      const path = eval('require')('path');
      const fs = eval('require')('fs');
      
      const dbPath = path.resolve(process.cwd(), process.env.DATABASE_URL || 'academy.db');
      diagnostics.sqlitePath = dbPath;
      diagnostics.sqliteFileExists = fs.existsSync(dbPath);

      const Database = eval('require')('better-sqlite3');
      const db = new Database(dbPath);
      const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1").get();
      
      diagnostics.sqliteConnection = {
        success: true,
        sampleTable: row
      };
    } catch (err: any) {
      diagnostics.sqliteConnection = {
        success: false,
        error: err.message || err,
        code: err.code
      };
    }
  }

  // 4. Other key configurations
  diagnostics.jwtSecretConfigured = !!process.env.JWT_SECRET;
  diagnostics.adminUsernameConfigured = !!process.env.ADMIN_USERNAME;
  diagnostics.adminPasswordConfigured = !!process.env.ADMIN_PASSWORD;

  return NextResponse.json({ success: true, diagnostics });
}
