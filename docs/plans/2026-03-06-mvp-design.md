# Emoji Cipher (Multi-Screen Edition) - MVP Design Spec

## 1. Konsep Permainan & Interaksi
Emoji Cipher adalah permainan tebak kata/kalimat berdasarkan *clue* emoji yang dimainkan banyak orang secara bersamaan. Permainan memisahkan perangkat layar besar (Console/iPad) sebagai pusat informasi dan perangkat kecil (Controller/HP) sebagai alat *input*. 

## 2. Platform & Teknologi
- **Frontend Stack:** React (Vite), TypeScript, Tailwind CSS
- **Animasi:** Framer Motion (Transisi "Spring" ala iOS, animasi bar skor dinamis)
- **Komunikasi Data (Realtime):** Supabase Realtime Channels (untuk broadcasting posisi *room*, perpindahan pertanyaan, dan pengiriman jawaban)
- **State Management:** Zustand (untuk mengelola *state* yang kompleks di sisi Console/iPad, seperti timer dan daftar pemain)

## 3. Arsitektur & Alur Kerja Host vs Player
Pengalaman awal (Homepage) dibagi dua secara eksplisit dengan opsi: **"Host a Game"** dan **"Join a Game"**.

### A. Host (Console/iPad)
1.  **Proteksi Host:** Saat menekan tombol "Host a Game", sistem akan meminta memasukkan **PIN 6 digit** (sebagai *passcode* khusus agar tidak sembarang orang bisa membuat room).
2.  **Pembuatan Room:** Setelah lolos PIN, Console men-generate `Room Code` (4 Karakter unik) dan menunggu pemain di mode Lobby. Console bertindak sebagai *master of truth*, menyimpan semua soal kuis dan menerima jawaban dari pemain.
3.  **Mode Permainan:** Console menampilkan emoji raksasa di tengah. 
4.  **Validasi Jawaban (Client-side):** Console menerima respon dari Controller, memvalidasi apakah jawaban benar, dan langsung mengirim *event* perbaruan peringkat/skor.
5.  **Scoreboard Beranimasi:** Menggunakan format *Racing Bar Chart*, bar skor pemain akan tumbuh menyamping ke kanan (lengkap dengan pantulan animasi *spring*) saat nilainya naik.

### B. Player (Controller/HP)
1.  **Alur Masuk (Join):** Pemain memilih "Join a Game", lalu memasukkan `Room Code` beserta `Nama Panggilan`.
2.  **Mode Input Ganda:** Host dapat memilih metode bermain sebelum *game* dimulai:
    -   **Multiple Choice (Pilihan Ganda):** Menampilkan tombol pilihan yang otomatis dibuat oleh Console (diambil dari soal lain) agar cepat dan kasual.
    -   **Text Input (Mode Ketik):** Pemain harus mengetik jawaban sendiri; sistem Console akan menangani toleransi kesalahan ketik *(typo)* atau format huruf.
3.  **Haptic Feedback:** HP pemain merespon dengan getaran (`navigator.vibrate()`) ketika jawaban mereka benar (disertai efek partikel kemenangan singkat) atau salah.

## 4. UI/UX Design System
-   **Tema Apple Books Minimalism:** Bersih, terfokus, menggunakan *whitespace* yang luas.
-   **Warna Latar:** *Off-white* (kertas/kanvas) untuk mengurangi silau, warna abu-abu lembut (*charcoal*) untuk teks. Aksen warna pop (*soft red*, *muted blue*) saat menyoroti pemenang.
-   **Tipografi:** Serif (*Playfair Display* atau mirip) untuk aksen, dipadu dengan Sans-Serif bersih (*Inter* / *SF Pro*) untuk keterbacaan tinggi.
-   **Fokus Visual:** Tidak ada elemen tambahan yang mengganggu, semua hanya mengenai *content* (Emoji dan Timer/Score).

## 5. Sinkronisasi Supabase Realtime
Logika sinkronisasi menggunakan model *Pub/Sub*:
-   **Channel Name:** `room_[ROOM_CODE]`
-   **Host Events:** `game_start`, `next_question`, `show_scoreboard`, `game_end`
-   **Player Events:** `player_join`, `submit_answer`

*Database Postgres di Supabase tetap digunakan secara minimal untuk pendaftaran room dan skor akhir, memastikan kuota "Free Tier" tidak cepat habis.*
