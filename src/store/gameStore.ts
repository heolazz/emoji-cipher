import { create } from 'zustand'
import { quizData } from '../data/quizData';
import type { QuizItem } from '../data/quizData';

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
    timeLeft: number; // Added timeLeft state

    // Actions
    setRoomCode: (code: string) => void
    setRole: (role: 'HOST' | 'PLAYER') => void
    addPlayer: (id: string, name: string) => void; // Modified signature
    updatePlayerScore: (id: string, points: number) => void; // Modified signature
    setPlayers: (players: Record<string, Player>) => void
    questions: QuizItem[];
    startGame: () => void;
    nextQuestion: () => void;
    setTimeLeft: (time: number) => void; // Added setTimeLeft action
    validateAnswer: (answer: string) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
    roomCode: null,
    status: 'LOBBY',
    role: null,
    players: {},
    currentQuestionIndex: 0,
    timeLeft: 20, // Initial timeLeft
    questions: quizData,

    setRoomCode: (code) => set({ roomCode: code }),
    setRole: (role) => set({ role: role }),
    addPlayer: (id, name) => set((state) => ({
        players: { ...state.players, [id]: { id, name, score: 0, isConnected: true } } // Updated addPlayer logic
    })),
    updatePlayerScore: (id, points) => set((state) => { // Updated updatePlayerScore logic
        const player = state.players[id];
        if (!player) return state;
        return {
            players: {
                ...state.players,
                [id]: { ...player, score: player.score + points, lastAnswerCorrect: true }
            }
        };
    }),
    setPlayers: (players) => set({ players }),
    startGame: () => set({ status: 'PLAYING', currentQuestionIndex: 0, timeLeft: 20 }), // Reset timeLeft on game start
    nextQuestion: () => set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timeLeft: 20 // Reset timeLeft on next question
    })),
    setTimeLeft: (time) => set({ timeLeft: time }), // setTimeLeft implementation
    validateAnswer: (answer: string): boolean => {
        const state = get();
        const currentQuiz = state.questions[state.currentQuestionIndex];
        return currentQuiz.answer.trim().toLowerCase() === answer.trim().toLowerCase();
    }
}))
