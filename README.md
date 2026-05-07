# 🌿 Sync — Human-First Social Architecture

**Sync** is a high-performance, privacy-focused social experience built to feel "liquid." It moves away from traditional screen-to-screen navigation in favor of a **Zero-Flicker Overlay Architecture**, ensuring the user's context is never lost.

![Sync Header](https://raw.githubusercontent.com/username/sync/main/assets/readme-header.png)

## ✨ The Vision: "Human-First"
Most social apps feel like a collection of web pages. **Sync** feels like a single, living interface. Every transition is a smooth overlay, every message is a direct connection, and every interaction is designed to feel natural and immediate.

## 🚀 Key Features

### 💎 Zero-Flicker UI
Built using **React Native Reanimated**, all major sections (Chat, Notifications, Search, Profile) are handled as side-sliding or bottom-up overlays. This preserves the state of the main feed and eliminates the "white flash" or "jumpiness" found in traditional navigation.

### 🔐 P2P & E2E Messaging (Blueprint)
*   **End-to-End Encryption**: Messages are encrypted locally before ever leaving your device.
*   **P2P Signaling**: Utilizes WebRTC for direct device-to-device communication when both users are online.
*   **Supabase Buffer**: A minimal, encrypted "dead drop" buffer in Supabase stores messages temporarily only when the recipient is offline.

### 📞 Pro Native Integration
*   **WebRTC Calling**: High-quality, low-latency audio/video calls.
*   **System Call UI**: Integrated with iOS CallKit and Android ConnectionService via `react-native-callkeep`.
*   **Voice Waveforms**: High-fidelity voice notes with live "liquid" visualizers (powered by Skia).

### 🏷️ Intelligent Content
*   **Rich Text Parsing**: Automatic identification and styling of `@handles` and `#hashtags`.
*   **Mutable Memory DB**: A custom-built data abstraction layer that simulates a real backend, making it fully "Supabase-Ready."

## 🛠️ Tech Stack
*   **Framework**: Expo (SDK 54) + React Native
*   **Animations**: React Native Reanimated (Liquid Physics)
*   **Database**: Supabase (PostgreSQL + Real-time)
*   **Native Modules**: WebRTC, CallKeep, expo-notifications
*   **Graphics**: Shopify Skia (planned for waveforms)

## 🏗️ Getting Started

### Prerequisites
*   Node.js & npm
*   Expo Go (for basic UI) or **Development Build** (for Calling/P2P)

### Installation
1.  Clone the repo:
    ```bash
    git clone https://github.com/yourusername/sync.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npx expo start
    ```

## 🗺️ Roadmap
- [x] Zero-Flicker Overlay Architecture
- [x] Mutable Memory "Database" Simulation
- [x] Rich Text Handle/Hashtag Parsing
- [/] EAS Development Build Integration
- [ ] Supabase Cloud Migration
- [ ] P2P WebRTC Signal Handshake
- [ ] Biometric App Lock (FaceID)

---

Built with 🌿 by [Your Name/Handle]
