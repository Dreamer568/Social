# Veritas Feed Architecture: Future Implementation

This document outlines the proposed "Human-First" feed algorithm and data structure for Veritas. The goal is to move away from addictive rage-bait loops toward a system that surface high-quality content aligned with user interests.

## 1. Content Hashing & Data Integrity
To ensure a clean and trustworthy feed, every post will undergo a normalization and hashing process:

*   **Normalization**: Text is stripped of redundant whitespace, converted to lowercase for comparison, and special characters are handled.
*   **Deduplication (SHA-256)**: We generate a unique hash for the post content.
    *   **Goal**: Prevent "echo-chamber" effects where the same content is reposted hundreds of times.
    *   **Action**: If a post's content hash already exists in the local "World" feed cache within a certain timeframe, it is flagged as a duplicate and collapsed.

## 2. Semantic Similarity (Content Grouping)
Instead of relying purely on hashtags (which can be gamed), Veritas uses **Vector Embeddings** to understand content:

*   **Embedding Generation**: Posts are passed through a lightweight LLM/Embedding model (e.g., Mistral or OpenAI) to generate a 768 or 1536-dimensional vector.
*   **Clustering**: Posts are grouped mathematically by their "Distance" (Cosine Similarity). 
    *   *Example*: A post about "React Native" and a post about "Expo" will naturally cluster together even if they don't share the same tags.
*   **Exploration**: The algorithm can intentionally surface "adjacent" clusters to keep the user's worldview expanding without being trapped in a single bubble.

## 3. The "Human-First" Algorithm
The feed ranking is determined by a transparent scoring engine:

### Scoring Factors:
1.  **Interest Alignment (Primary)**:
    *   Users select core interests (e.g., `Developer`, `Art`, `Business`).
    *   Posts in matching semantic clusters receive a significant multiplier (e.g., **5x**).
2.  **Human Engagement (Secondary)**:
    *   Likes and meaningful comments (determined by length/content) add linear points.
    *   *Constraint*: High engagement on a post *outside* your interest area won't force it into your feed unless you explicitly follow the author.
3.  **Recency (Decay)**:
    *   Points decay over time using a gravity-based formula: `Score / (Time + 2)^1.5`.
    *   This ensures the feed stays "Liquid" and fresh.
4.  **Interaction History**:
    *   If a user consistently spends time reading posts about `Memes`, the algorithm gradually increases the weight for that cluster for that specific user.

## 4. End-Agent Strategy
To maintain the "Human-Only" feel, the algorithm should eventually move toward an **End-Agent** model:

*   **Local Filtering**: The heavy lifting of the algorithm happens on the user's device (the Agent).
*   **Privacy**: Your interaction data (what you read, how long you linger) never leaves your device. The Agent fetches a broad "World" bucket and sorts it locally according to your personal interest profile.

## 5. Development Roadmap
1.  **Phase 1**: Implement basic tagging and SQLite-based local caching.
2.  **Phase 2**: Integrate Supabase `pgvector` for backend semantic search.
3.  **Phase 3**: Deploy the local "End-Agent" for client-side ranking.
