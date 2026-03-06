# Emoji Cipher MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membangun aplikasi web Emoji Cipher dengan fitur Host dan Player yang terhubung secara realtime menggunakan Supabase.

**Architecture:** Frontend React (Vite) bertindak sebagai Console (Host) dan Controller (Player). State lokal menggunakan Zustand, sedangkan sinkronisasi realtime menggunakan Supabase Realtime Channels. Routing menggunakan React Router DOM untuk memisahkan halaman muka, halaman host, dan halaman player.

**Tech Stack:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, Zustand, Supabase-js, React Router DOM, Lucide React.

---

### Task 1: Setup Project & Dependencies

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js` dll. (via Create Vite)

**Step 1: Inisialisasi Vite React TypeScript Project**
Run: `npm create vite@latest . -- --template react-ts`
Expected: Project files created.

**Step 2: Install Dependencies**
Run: `npm install tailwindcss postcss autoprefixer framer-motion zustand @supabase/supabase-js react-router-dom lucide-react`
Expected: Dependencies terinstal.

**Step 3: Setup Tailwind CSS**
Run: `npx tailwindcss init -p`
Expected: `tailwind.config.js` and `postcss.config.js` created.

**Step 4: Konfigurasi Tailwind Path**
Modify: `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 5: Tambahkan Tailwind layer ke CSS**
Modify: `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #fdfbf7; /* Off-white / Cream */
  color: #1f2937; /* Gray-800 */
}
```

**Step 6: Commit**
```bash
git add .
git commit -m "chore: initial project setup with tailwind, framer-motion, zustand, supabase"
```

---

### Task 2: Supabase Client & State Store Setup

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/store/gameStore.ts`
- Create: `.env`

**Step 1: Setup Environment Variables**
Akan meminta user untuk menyiapkan file `.env.local` atau minimal template kosong di source code yang berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

**Step 2: Buat Supabase Client**
Create: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 3: Setup Zustand Store Dasar**
Create: `src/store/gameStore.ts`
```typescript
import { create } from 'zustand'

export type RoomStatus = 'LOBBY' | 'PLAYING' | 'SCOREBOARD' | 'END'

interface Player {
  id: string
  name: string
  score: number
  lastAnswerCorrect?: boolean
  isConnected: boolean
}

interface GameState {
  roomCode: string | null
  status: RoomStatus
  role: 'HOST' | 'PLAYER' | null
  players: Record<string, Player>
  currentQuestionIndex: number
  
  // Actions
  setRoomCode: (code: string) => void
  setRole: (role: 'HOST' | 'PLAYER') => void
  addPlayer: (player: Player) => void
  updatePlayerScore: (playerId: string, points: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  roomCode: null,
  status: 'LOBBY',
  role: null,
  players: {},
  currentQuestionIndex: 0,
  
  setRoomCode: (code) => set({ roomCode: code }),
  setRole: (role) => set({ role: role }),
  addPlayer: (player) => set((state) => ({
    players: { ...state.players, [player.id]: player }
  })),
  updatePlayerScore: (playerId, points) => set((state) => ({
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        score: state.players[playerId].score + points,
        lastAnswerCorrect: true
      }
    }
  }))
}))
```

**Step 4: Commit**
```bash
git add src/lib/supabase.ts src/store/gameStore.ts
git commit -m "setup: supabase client and zustand game store"
```

---

### Task 3: Routing Dasar & Homepage

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Home.tsx`

**Step 1: Buat layout Homepage dengan pilihan Host / Join**
Create: `src/pages/Home.tsx`
```tsx
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-serif font-bold mb-2">Emoji Cipher</h1>
      <p className="text-gray-500 mb-12">Multiplayer Guessing Game</p>
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button 
          onClick={() => navigate('/host')}
          className="bg-black text-white rounded-2xl py-4 text-xl font-semibold shadow-lg active:scale-95 transition-transform"
        >
          Host a Game
        </button>
        <button 
          onClick={() => navigate('/join')}
          className="bg-white text-black border-2 border-gray-200 rounded-2xl py-4 text-xl font-semibold shadow-sm active:scale-95 transition-transform"
        >
          Join a Game
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Setup React Router di App.tsx**
Modify: `src/App.tsx`
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Akan ditambahkan path /host dan /join di task berikutnya */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
```

**Step 3: Commit**
```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: basic routing and homepage layout"
```

---

*Catatan: Task 4 (Host Lobby & PIN Verification) dan Task 5 (Player join & Socket Logic) akan dikerjakan pada sesi eksekusi sub-agent berikutnya.*
