import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { quizData } from '../data/quizData';
import type { QuizItem } from '../data/quizData';

export type RoomStatus = 'LOBBY' | 'PLAYING' | 'FINISHED'

interface Player {
    id: string
    name: string
    score: number
    isConnected: boolean
    streak: number
    lastResult: 'CORRECT' | 'INCORRECT' | 'NONE'
}

interface GameState {
    roomCode: string | null
    status: RoomStatus
    subStatus: 'QUESTION' | 'REVEAL' // Kahoot-like states
    role: 'HOST' | 'PLAYER' | null
    players: Record<string, Player>
    currentQuestionIndex: number
    timeLeft: number; // Added timeLeft state
    playerName: string | null;
    isVerified: boolean;
    isJoined: boolean;

    // Actions
    setRoomCode: (code: string) => void
    setRole: (role: 'HOST' | 'PLAYER') => void
    addPlayer: (id: string, name: string) => void; // Modified signature
    updatePlayerScore: (id: string, points: number) => void; // Modified signature
    setPlayers: (players: Record<string, Player>) => void
    questions: QuizItem[];
    startGame: () => void;
    nextQuestion: () => void;
    revealAnswer: () => void;
    setTimeLeft: (time: number) => void; // Added setTimeLeft action
    validateAnswer: (answer: string) => boolean;
    endGame: () => void;
    setPlayerName: (name: string) => void;
    setIsVerified: (val: boolean) => void;
    setIsJoined: (val: boolean) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            roomCode: null,
            status: 'LOBBY',
            subStatus: 'QUESTION',
            role: null,
            players: {},
            currentQuestionIndex: 0,
            timeLeft: 20, // Initial timeLeft
            questions: quizData,
            playerName: null,
            isVerified: false,
            isJoined: false,

            setRoomCode: (code) => set({ roomCode: code }),
            setRole: (role) => set({ role: role }),
            addPlayer: (id, name) => set((state) => ({
                players: { ...state.players, [id]: { id, name, score: 0, isConnected: true, streak: 0, lastResult: 'NONE' } }
            })),
            updatePlayerScore: (id, points) => set((state) => {
                const player = state.players[id];
                if (!player) return state;
                const isCorrect = points > 0;
                return {
                    players: {
                        ...state.players,
                        [id]: {
                            ...player,
                            score: player.score + points,
                            streak: isCorrect ? player.streak + 1 : 0,
                            lastResult: isCorrect ? 'CORRECT' : 'INCORRECT'
                        }
                    }
                };
            }),
            setPlayers: (players) => set({ players }),
            startGame: () => set({ status: 'PLAYING', subStatus: 'QUESTION', currentQuestionIndex: 0, timeLeft: 20 }), // Reset timeLeft on game start
            nextQuestion: () => set((state) => ({
                currentQuestionIndex: state.currentQuestionIndex + 1,
                timeLeft: 20, // Reset timeLeft on next question
                subStatus: 'QUESTION'
            })),
            revealAnswer: () => set({ subStatus: 'REVEAL' }),
            setTimeLeft: (time) => set({ timeLeft: time }), // setTimeLeft implementation
            validateAnswer: (answer: string): boolean => {
                const state = get();
                const currentQuiz = state.questions[state.currentQuestionIndex];
                return currentQuiz.answer.trim().toLowerCase() === answer.trim().toLowerCase();
            },
            endGame: () => set({ status: 'FINISHED' }),
            setPlayerName: (name) => set({ playerName: name }),
            setIsVerified: (val) => set({ isVerified: val }),
            setIsJoined: (val) => set({ isJoined: val }),
            resetGame: () => set({
                roomCode: null,
                status: 'LOBBY',
                role: null,
                players: {},
                currentQuestionIndex: 0,
                isVerified: false,
                isJoined: false,
                playerName: null
            })
        }),
        {
            name: 'emoji-cipher-storage', // key in localStorage
            partialize: (state) => ({
                roomCode: state.roomCode,
                role: state.role,
                status: state.status,
                players: state.players,
                playerName: state.playerName,
                isVerified: state.isVerified,
                isJoined: state.isJoined
            }),
        }
    )
)
