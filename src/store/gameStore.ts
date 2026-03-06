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

    // Actions
    setRoomCode: (code: string) => void
    setRole: (role: 'HOST' | 'PLAYER') => void
    addPlayer: (player: Player) => void
    updatePlayerScore: (playerId: string, points: number) => void
    setPlayers: (players: Record<string, Player>) => void
    questions: QuizItem[];
    startGame: () => void;
    nextQuestion: () => void;
    validateAnswer: (answer: string) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
    roomCode: null,
    status: 'LOBBY',
    role: null,
    players: {},
    currentQuestionIndex: 0,
    questions: quizData,

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
    })),
    setPlayers: (players) => set({ players }),
    startGame: () => set({ status: 'PLAYING', currentQuestionIndex: 0 }),
    nextQuestion: () => set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1
    })),
    validateAnswer: (answer: string): boolean => {
        const state = get();
        const currentQuiz = state.questions[state.currentQuestionIndex];
        return currentQuiz.answer.trim().toLowerCase() === answer.trim().toLowerCase();
    }
}))
