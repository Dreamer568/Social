# Sync Messaging Architecture: P2P & E2E 🛡️

Sync aims for total privacy. This document outlines the hybrid P2P/E2E messaging system.

## 1. End-to-End Encryption (E2E)
Every message in Sync is encrypted on the device before it ever leaves.

*   **Key Generation**: Each user generates a public/private key pair on their device (using `react-native-quick-crypto` or similar).
*   **Public Key Distribution**: Public keys are stored in the Supabase `profiles` table.
*   **Encryption Process**:
    1.  Sender fetches Recipient's public key.
    2.  Sender encrypts the message using a derived shared secret (ECDH).
    3.  Recipient decrypts using their private key (stored securely in the device's Keychain/Keystore).

## 2. Peer-to-Peer (P2P) First
When both users are online, Sync prioritizes direct device-to-device communication to minimize latency and server reliance.

*   **Technology**: WebRTC (Web Real-Time Communication).
*   **Flow**:
    1.  Users signal their presence via Supabase Realtime.
    2.  If both are "Online," a WebRTC data channel is established.
    3.  Messages are sent directly over the P2P connection.
    4.  **Privacy**: The server never sees the encrypted packets, only the signaling metadata required to connect the peers.

## 3. Encrypted Offline Buffer (Fallback)
If the recipient is "Offline" or the P2P connection fails, the system falls back to a temporary server-side buffer.

*   **Storage**: A dedicated `encrypted_buffer` table in Supabase.
*   **Retention**: Messages are stored in their E2E encrypted state.
*   **Self-Destruct**: Once the recipient acknowledges receipt (Double Checkmark), the message is deleted from the `encrypted_buffer` immediately.
*   **Security**: Since the server does not have the recipient's private key, it can never read the buffered messages.

## 4. Background Silent Signaling (No-Database Check)
To ensure messages are received even when the app is closed, Sync uses a "Signal-First" approach:

*   **Silent Wake-up**: When a sender initiates a message (P2P or Buffer), the system sends a high-priority **Silent Push Notification** (Data-only) to the recipient.
*   **Background Fetch**: The OS wakes the Sync process in the background for a short window.
*   **Direct Check**: The app attempts to establish a P2P link with the sender or does a targeted fetch of the `encrypted_buffer` for that specific thread ID.
*   **Efficiency**: This avoids constant polling of the database and ensures that the "check" is triggered only when a real signal exists.

## 5. User Experience (Liquid Feedback)
*   **Single Tick (Grey)**: Message sent to the encrypted buffer (server received it).
*   **Double Tick (Grey)**: Message delivered to the recipient's device (from buffer or P2P).
*   **Double Tick (Blue/Accent)**: Recipient has opened the Chat Overlay.
*   **P2P Indicator**: A subtle "Secure Link" icon (🌿) shown in the chat header when a direct P2P connection is active.

---
*Sync: Your data, your conversations, your privacy.*
