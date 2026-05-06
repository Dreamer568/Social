import { db } from './mockData';

// API Layer: Async functions to simulate database calls.
// This allows for an easy transition to Supabase later.

export const api = {
  posts: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return db.getPosts();
    },
    getByUser: async (handle: string) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return db.getPosts().filter(post => post.user.handle === handle);
    },
    create: async (content: string, media_url?: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return db.addPost(content, media_url);
    }
  },
  messages: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return db.getMessages();
    }
  },
  user: {
    getMe: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return db.getUser();
    },
    updateProfile: async (updates: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return db.updateUser(updates);
    }
  },
  notifications: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return db.getNotifications();
    }
  }
};
