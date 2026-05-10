# Sync Database Queries & Schema 🌿

This file contains the current schema and recommended queries for the Sync social platform.

## 🏗️ Core Schema

### Profiles
```sql
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  handle text unique,
  name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone default now()
);
```

### Posts
```sql
create table public.posts (
  id uuid not null default gen_random_uuid () primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  media_url text,
  media_type text,
  likes integer default 0,
  comments integer default 0,
  created_at timestamp with time zone not null default now()
);
create index posts_user_id_idx on public.posts (user_id);
```

### Post Likes
Tracks who liked what. Triggers automatically update the `likes` count and fire a notification.
```sql
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Automation Trigger: Syncs like count + creates notification
CREATE OR REPLACE FUNCTION handle_post_like_automation() 
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
    IF (post_author_id != NEW.user_id) THEN
      INSERT INTO notifications (user_id, actor_id, type, post_id)
      VALUES (post_author_id, NEW.user_id, 'like', NEW.post_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION handle_post_like_automation();
```

### Follows
```sql
create table public.follows (
  id uuid not null default gen_random_uuid () primary key,
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint follows_follower_id_following_id_key unique (follower_id, following_id)
);
create index follows_follower_id_idx on public.follows (follower_id);
create index follows_following_id_idx on public.follows (following_id);
```

### Messages
```sql
create table public.messages (
  id uuid not null default gen_random_uuid () primary key,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  content text,
  media_url text,
  is_read boolean default false,
  created_at timestamp with time zone not null default now()
);
create index messages_sender_receiver_idx on public.messages (sender_id, receiver_id);
```

### Notifications
```sql
create table public.notifications (
  id uuid not null default gen_random_uuid () primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  post_id uuid references posts(id) on delete set null,
  is_read boolean default false,
  created_at timestamp with time zone not null default now()
);
create index notifications_user_id_idx on public.notifications (user_id);
```

## 🧠 Social Algorithm Queries

### 1. Following Feed (Personalized)
Fetches posts from users you follow, ordered by newest.
```sql
-- Used in api.posts.getFollowingFeed
SELECT p.*, pr.name, pr.handle, pr.avatar_url
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.user_id IN (
  SELECT following_id 
  FROM follows 
  WHERE follower_id = 'YOUR_USER_ID'
)
ORDER BY p.created_at DESC;
```

### 2. World Feed (Trending Algo - View)
This view calculates a dynamic score. The higher the engagement and the newer the post, the higher it ranks.
```sql
CREATE OR REPLACE VIEW trending_posts AS
SELECT 
  *,
  -- Calculation: (Engagement) / (Time Decay)
  (likes * 2 + comments * 3 + 1) / 
  POWER(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 + 2, 1.5) AS engagement_score
FROM posts;

-- Usage in App
SELECT * FROM trending_posts ORDER BY engagement_score DESC LIMIT 50;
```

### 3. Mutual Friends Discovery
Find people followed by the people you follow.
```sql
SELECT following_id, count(*) as mutual_count
FROM follows
WHERE follower_id IN (SELECT following_id FROM follows WHERE follower_id = 'YOUR_USER_ID')
AND following_id != 'YOUR_USER_ID'
AND following_id NOT IN (SELECT following_id FROM follows WHERE follower_id = 'YOUR_USER_ID')
GROUP BY following_id
ORDER BY mutual_count DESC;
```

---

## 🔐 Row Level Security (RLS) Policies

> [!CAUTION]
> **THIS IS WHY YOUR MESSAGES TAB IS EMPTY!**
> Supabase enables RLS by default, which blocks all reads. Run these SQL commands in your Supabase dashboard under **SQL Editor** to fix it.

### Messages RLS
```sql
-- Enable RLS (already on by default, but just in case)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages they sent OR received
CREATE POLICY "Users can read their own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to send messages (insert as sender)
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to mark messages as read (update is_read on messages sent to them)
CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);
```

### Profiles RLS (needed for message sender/receiver joins)
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone logged in to view profiles (needed for chat user lookups)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Only allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

### Realtime (needed for live message delivery)
```sql
-- Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

