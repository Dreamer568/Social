# Sync Project: Roadmap & TODO 🌿

This document tracks the remaining tasks to achieve a "Human-First" social experience.

## 🚀 Priority 1: Core Experience (Current)
- [x] **Zero-Flicker Architecture**: Implemented overlays for Chat, Search, Edit Profile, and Notifications.
- [x] **Liquid Navigation**: Standardized status dots and synchronized tab indicator.
- [/] **Search Logic**: Implement basic user search results inside `SearchOverlay.tsx`.
- [ ] **Haptic Feedback**: Add subtle haptics to tab switches and button presses for a "Liquid" feel.
- [ ] **Profile Persistence**: Connect `EditProfileOverlay` to state/backend to actually save changes.

## 💬 Messaging System (Advanced)
- [ ] **P2P & E2E Architecture**: Implement End-to-End Encryption with a P2P-first approach (using WebRTC).
- [ ] **Encrypted Offline Buffer**: Build a secure "temporary store" in Supabase for delivery when recipients are offline.
- [ ] **Typing Indicators**: Show "Aria is typing..." in the Chat Overlay.
- [ ] **Media Sending**: Allow users to send images (via `Ionicons name="add-circle-outline"`) in chat.
- [ ] **Message Reactions**: Long-press on a message bubble to add a "Human" reaction (e.g., ❤️, 🙌, 🌿).

## 📱 Feed & Discovery
- [ ] **Algorithm Implementation**: Start building the vector-based interest matching defined in `feed.md`.
- [ ] **Pull to Refresh**: Add a custom, liquid-style refresh animation to the `HomeSection`.
- [ ] **Post Interactions**: Finish the share and comment modals.
- [ ] **Image Zoom**: Add high-quality image viewing when tapping on post photos.

## 🛠️ Backend & Infrastructure
- [ ] **Supabase Auth**: Implement the login and sign-up flow.
- [ ] **Database Schema**: Finalize tables for `profiles`, `posts`, `follows`, and `messages`.
- [ ] **Vector Storage**: Set up `pgvector` on Supabase for the interest-matching algorithm.
- [ ] **Image Hosting**: Connect profile and post media to Supabase Storage.

## ✨ Polish & Aesthetics
- [ ] **Micro-animations**: Add subtle entry/exit animations for post cards.
- [ ] **Empty States**: Design beautiful "Nothing here yet" screens for empty inboxes and feeds.
- [ ] **Skeleton Refinement**: Ensure skeleton loaders match the actual content layouts perfectly.

---
*Sync: Authentic. Human. Social.*
