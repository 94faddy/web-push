import { query } from './db';
import { Admin, AdminSession } from '@/types';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate session token
function generateSessionToken(): string {
  return uuidv4() + '-' + Date.now().toString(36);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Create session
export async function createSession(adminId: number, ip?: string, userAgent?: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await query(
    `INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [adminId, sessionToken, expiresAt, ip || null, userAgent || null]
  );

  // Update last_login
  await query('UPDATE admins SET last_login = NOW() WHERE id = ?', [adminId]);

  return sessionToken;
}

// Get session from cookie
export async function getSessionFromCookie(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const sessions = await query<AdminSession[]>(
      `SELECT * FROM admin_sessions 
       WHERE session_token = ? AND expires_at > NOW()`,
      [sessionCookie.value]
    );

    return sessions.length > 0 ? sessions[0] : null;
  } catch {
    return null;
  }
}

// Get current admin
export async function getCurrentAdmin(): Promise<Admin | null> {
  const session = await getSessionFromCookie();
  
  if (!session) {
    return null;
  }

  const admins = await query<Admin[]>(
    'SELECT * FROM admins WHERE id = ? AND is_active = TRUE',
    [session.admin_id]
  );

  return admins.length > 0 ? admins[0] : null;
}

// Set session cookie
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  });
}

// Delete session cookie
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Delete session from database
export async function deleteSession(sessionToken: string): Promise<void> {
  await query('DELETE FROM admin_sessions WHERE session_token = ?', [sessionToken]);
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  await query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
}

// Get admin by token (for public URL)
export async function getAdminByToken(token: string): Promise<Admin | null> {
  const admins = await query<Admin[]>(
    'SELECT * FROM admins WHERE token = ? AND is_active = TRUE',
    [token]
  );
  
  return admins.length > 0 ? admins[0] : null;
}

// Generate new admin token
export async function generateAdminToken(adminId: number): Promise<string> {
  const token = uuidv4();
  await query('UPDATE admins SET token = ? WHERE id = ?', [token, adminId]);
  return token;
}
