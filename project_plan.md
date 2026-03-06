# Project Plan: Emoji Cipher (Multi-Screen Edition)

## 1. Executive Summary
**Emoji Cipher** adalah permainan party game multiplayer berbasis web yang memisahkan peran antara layar utama (**Console/iPad**) dan layar pemain (**Controller/Smartphone**). Project ini dirancang untuk memberikan pengalaman bermain yang mulus, estetis, dan interaktif secara real-time, dengan memanfaatkan solusi *cloud free-tier* untuk pengembangan tanpa biaya operasional awal.

---

## 2. Tech Stack (Free Tier Optimized)

| Komponen | Teknologi | Alasan & Batasan Free Tier |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + TS | Performa cepat, bundle size kecil. |
| **Styling** | Tailwind CSS | Pengembangan UI konsisten dan responsif. |
| **Animation** | Framer Motion | Animasi premium (Apple-like) dengan sedikit kode. |
| **Realtime Engine** | **Supabase Realtime** | Mengelola *broadcast* jawaban & sinkronisasi state. (Free tier: 50.000 MAU, 5GB database). |
| **Hosting** | Vercel | Deployment otomatis dari GitHub & performa edge global (Gratis). |
| **Assets** | Lucide React | Icon set minimalis dan ringan. |

---

## 3. Arsitektur Sistem & Alur Kerja

### A. Mekanisme Multi-Screen
1. **Console (iPad/Laptop):** Membuka URL utama, membuat room, dan mendapatkan 4 digit `Room Code`.
2. **Controller (Smartphone):** Memasukkan `Room Code` dan `Name` di URL yang sama (otomatis terdeteksi sebagai mobile).
3. **Sinkronisasi:** Supabase Realtime akan melakukan *subscribing* ke channel room berdasarkan `Room Code`. Setiap kali ada jawaban masuk, Console akan menerima sinyal secara instan.

### B. State Management
*   **Room State:** `WAITING` (Lobby), `PLAYING` (Question), `SCOREBOARD` (Leaderboard), `FINISHED`.
*   **Sync Logic:** Teka-teki hanya ada di memori/database Console. Controller hanya mengirimkan string jawaban.

---

## 4. Struktur Data (Supabase Schema)

```typescript
// Table: rooms
interface Room {
  id: string; // UUID
  code: string; // 4-char code (e.g. "A7X1")
  host_id: string;
  status: 'LOBBY' | 'PLAYING' | 'SCOREBOARD' | 'END';
  current_question_id: string | null;
  timer_end_at: string | null;
}

// Table: players
interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  is_connected: boolean;
  last_answer_correct: boolean | null;
}

// Table: quizzes (Static Metadata)
interface QuizItem {
  id: string;
  emojis: string;
  answer: string; // Disimpan lowercase untuk validasi
  clue: string;
  category: 'Movie' | 'Music' | 'Proverb' | 'Brand';
  difficulty: 1 | 2 | 3;
}
```

---

## 5. User Interface & Experience (Aesthetics)
Terinspirasi dari **Apple Books & Journal App**:
*   **Typography:** Menggunakan font Serif untuk judul (seperti *Outfit* atau *Playfair Display*) dikombinasikan dengan Sans Serif bersih (*Inter*).
*   **Color Palette:** Soft neutrals (Cream, Paper White, Soft Charcoal) dengan aksen warna kategori (misal: Movie = Soft Red, Music = Muted Blue).
*   **Transisi:** Gunakan "Spring" animations dari Framer Motion untuk transisi emoji agar terasa kenyal/vibrant.
*   **Haptic Feedback:** Menggunakan `navigator.vibrate()` pada HP pemain saat jawaban salah/benar.

---

## 6. Roadmap Pengembangan

### Phase 1: Foundation (Minggu 1)
*   Setup project Vite + Tailwind + Lucide.
*   Setup project Supabase & tabel dasar.
*   Implementasi logika "Create Room" & "Join Room".

### Phase 2: Core Gameplay (Minggu 2)
*   Integrasi Supabase Realtime untuk kirim-terima jawaban.
*   Logika validasi jawaban (fuzzy matching sederhana agar typo tipis tetap benar).
*   Timer logic di sisi Console.

### Phase 3: Visual Polish & Leaderboard (Minggu 3)
*   Implementasi animasi Framer Motion di layar Console.
*   Leaderboard dinamis (bar chart yang tumbuh saat skor bertambah).
*   Sound effects (SFX) minimalis untuk suasana game.

---

## 7. Ide Peningkatan (Unique Selling Point)

1.  **AI Clue Generator:** Gunakan OpenAI API (Free tier/Trial) untuk membuat clue yang berbeda setiap kali game dimainkan jika pemain kesulitan.
2.  **Emoji Reactions:** Pemain bisa mengirimkan emoji "reaksi" (seperti di Zoom/Teams) yang akan melayang di layar iPad saat menunggu.
3.  **QR Code Join:** Console menampilkan QR Code besar untuk discan HP teman agar tidak perlu mengetik Room Code.
4.  **Themed Decks:** User bisa membuat tebak-tebakan mereka sendiri (User Generated Content).
5.  **Multi-Language Support:** Pilihan bahasa Indonesia/Inggris untuk kategori Peribahasa.
6.  **Dark Mode Integration:** Visual yang menyesuaikan dengan ambient cahaya ruangan (cozy night mode).

---

## 8. Strategi Biaya $0 (Free Forever)
*   **Supabase:** Gunakan Cloud Tier (Gratis untuk beban harian). 
*   **Vercel:** Hosting gratis selamanya untuk personal project.
*   **Domain:** Gunakan subdomain `.vercel.app` atau `.up.railway.app`.
*   **Images:** Gunakan tool AI atau icon SVG daripada aset gambar berat agar bandwidth hemat.
