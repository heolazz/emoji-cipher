export interface QuizItem {
    id: string;
    emojis: string;
    answer: string;
    clue: string;
    category: 'Movie' | 'Music' | 'Brand' | 'Proverb';
}

export const quizData: QuizItem[] = [
    { id: '1', emojis: '🧙‍♂️⚡👓', answer: 'HARRY POTTER', clue: 'Buku/Film tentang penyihir', category: 'Movie' },
    { id: '2', emojis: '🦇🌑🏙️', answer: 'BATMAN', clue: 'Pahlawan malam hari', category: 'Movie' },
    { id: '3', emojis: '🍔🍟🤡', answer: 'MCDONALDS', clue: 'Fast food terkenal', category: 'Brand' },
    { id: '4', emojis: '🚢🧊💔', answer: 'TITANIC', clue: 'Kisah cinta tragis di laut', category: 'Movie' },
    { id: '5', emojis: '🍎💻📱', answer: 'APPLE', clue: 'Raksasa teknologi', category: 'Brand' },
];
