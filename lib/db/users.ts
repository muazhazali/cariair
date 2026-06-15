// ==========================================
// User Database Operations
// ==========================================

import { query } from '@/lib/db';
import { User } from '@/lib/types/db';
import bcrypt from 'bcryptjs';

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

// Create user with password
export async function createUserWithPassword(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 12);
  
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, passwordHash, name || null]
  );
  
  return result.rows[0];
}

// Create OAuth user
export async function createOAuthUser(
  email: string,
  name: string | null,
  image: string | null
): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, name, image, email_verified)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, image = EXCLUDED.image
     RETURNING *`,
    [email, name, image]
  );
  
  return result.rows[0];
}

// Verify password
export async function verifyPassword(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user || !user.password_hash) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (isValid) {
    return user;
  }
  
  return null;
}

// Update user
export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'image' | 'email_verified'>>
): Promise<User | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${index}`);
    values.push(data.name);
    index++;
  }

  if (data.image !== undefined) {
    updates.push(`image = $${index}`);
    values.push(data.image);
    index++;
  }

  if (data.email_verified !== undefined) {
    updates.push(`email_verified = $${index}`);
    values.push(data.email_verified);
    index++;
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const sql = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await query<User>(sql, values);
  return result.rows[0] || null;
}

// Update password
export async function updatePassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  
  const result = await query<User>(
    `UPDATE users 
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [passwordHash, id]
  );
  
  return result.rows.length > 0;
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query<User>(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}
