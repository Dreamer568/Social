import { createClient } from '@supabase/supabase-js';

// These should be replaced with your actual Supabase project URL and Anon Key
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * DATABASE SCHEMA (TODO):
 * 
 * users:
 * - id (uuid, primary key)
 * - username (text, unique)
 * - handle (text, unique)
 * - avatar_url (text)
 * - bio (text)
 * - created_at (timestamp)
 * 
 * posts:
 * - id (uuid, primary key)
 * - user_id (uuid, references users.id)
 * - content (text)
 * - media_url (text)
 * - media_type (text: 'image', 'audio', null)
 * - created_at (timestamp)
 * - likes_count (int)
 * - comments_count (int)
 * - reposts_count (int)
 * 
 * follows:
 * - follower_id (uuid, references users.id)
 * - following_id (uuid, references users.id)
 * - created_at (timestamp)
 * 
 * messages:
 * - id (uuid, primary key)
 * - sender_id (uuid, references users.id)
 * - receiver_id (uuid, references users.id)
 * - content (text)
 * - created_at (timestamp)
 * - read (boolean)
 * 
 * notifications:
 * - id (uuid, primary key)
 * - user_id (uuid, references users.id)
 * - type (text: 'like', 'repost', 'follow', 'mention')
 * - from_user_id (uuid, references users.id)
 * - post_id (uuid, references posts.id)
 * - read (boolean)
 * - created_at (timestamp)
 */
