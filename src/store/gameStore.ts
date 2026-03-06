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
