// In-Memory Mock Database
// This simulates a real backend by allowing mutation of data during the session.

let MOCK_USER_INTERNAL = {
  id: 'me',
  name: 'Human Being',
  handle: 'yourhandle',
  avatar_url: 'https://i.pravatar.cc/150?u=me',
  bio: 'Human. Thinker. Explorer. 🌿\nBuilding Sync for a better social web.',
  followers: '1.2k',
  friends: '420'
};

let MOCK_POSTS_INTERNAL = [
  { id: '1', user: { name: 'Jane Doe', handle: 'janedoe', avatar_url: 'https://i.pravatar.cc/150?u=jane' }, content: 'This app feels so refreshingly human. No algorithms, no AI noise. Just pure expression. Love it! 🌿', created_at: '2h ago', likes: 124, comments: 12 },
  { id: '2', user: { name: 'Alex Smith', handle: 'asmith', avatar_url: 'https://i.pravatar.cc/150?u=alex' }, content: 'Just finished a long hike. The silence of the mountains is something we should all experience more often.', media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '4h ago', likes: 89, comments: 8 },
  { id: '11', user: MOCK_USER_INTERNAL, content: 'Finally joined Sync! This feels like the future of social interaction. 🌿', created_at: '1h ago', likes: 15, comments: 2 },
  { id: '12', user: MOCK_USER_INTERNAL, content: 'Morning meditation complete. Ready to build something beautiful today.', media_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '5h ago', likes: 32, comments: 5 },
  { id: '3', user: { name: 'Sarah Connor', handle: 'sconnor', avatar_url: 'https://i.pravatar.cc/150?u=sarah' }, content: 'Authenticity is the new luxury.', created_at: '5h ago', likes: 256, comments: 45 },
];

let MOCK_MESSAGES_INTERNAL = [
  { id: '1', user: { name: 'David Miller', handle: 'davidm', avatar_url: 'https://i.pravatar.cc/150?u=david' }, lastMessage: 'See you tomorrow at the cafe!', time: '10:30 AM', unread: 2, isOnline: true },
  { id: '3', user: { name: 'Marcus Chen', handle: 'mchen', avatar_url: 'https://i.pravatar.cc/150?u=marcus' }, lastMessage: 'Do you have the link to that book?', time: '9:45 AM', unread: 1, isOnline: true },
];

let MOCK_NOTIFICATIONS_INTERNAL = [
  { id: '1', type: 'like', user: { name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=jane' }, text: 'liked your post', timestamp: '2m', icon: 'heart', iconColor: '#F4212E' },
  { id: '2', type: 'repost', user: { name: 'Alex Smith', avatar_url: 'https://i.pravatar.cc/150?u=alex' }, text: 'reposted your post', timestamp: '15m', icon: 'repeat', iconColor: '#00BA7C' },
];

// DB Methods
export const db = {
  getUser: () => ({ ...MOCK_USER_INTERNAL }),
  updateUser: (updates: Partial<typeof MOCK_USER_INTERNAL>) => {
    MOCK_USER_INTERNAL = { ...MOCK_USER_INTERNAL, ...updates };
    // Also update user info in their posts
    MOCK_POSTS_INTERNAL = MOCK_POSTS_INTERNAL.map(p => 
      p.user.handle === MOCK_USER_INTERNAL.handle 
        ? { ...p, user: { ...MOCK_USER_INTERNAL } } 
        : p
    );
    return db.getUser();
  },
  getPosts: () => [...MOCK_POSTS_INTERNAL],
  addPost: (content: string, media_url?: string) => {
    const newPost = {
      id: Date.now().toString(),
      user: db.getUser(),
      content,
      media_url,
      media_type: media_url ? 'image' : undefined,
      created_at: 'Just now',
      likes: 0,
      comments: 0
    };
    MOCK_POSTS_INTERNAL = [newPost as any, ...MOCK_POSTS_INTERNAL];
    return newPost;
  },
  getMessages: () => [...MOCK_MESSAGES_INTERNAL],
  getNotifications: () => [...MOCK_NOTIFICATIONS_INTERNAL],
};
