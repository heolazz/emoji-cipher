export interface QuizItem {
    id: string;
    emojis: string;
    answer: string;
    clue: string;
    category: 'Movie' | 'Music' | 'Brand' | 'Proverb';
}

export const quizData: QuizItem[] = [
    { id: '1', emojis: '🧙‍♂️⚡👓', answer: 'HARRY POTTER', clue: 'The boy who lived', category: 'Movie' },
    { id: '2', emojis: '🦇🌑🏙️', answer: 'BATMAN', clue: 'The Dark Knight', category: 'Movie' },
    { id: '3', emojis: '🍔🍟🤡', answer: 'MCDONALDS', clue: 'I\'m Lovin\' It', category: 'Brand' },
    { id: '4', emojis: '🚢🧊💔', answer: 'TITANIC', clue: 'Unsinkable Ship?', category: 'Movie' },
    { id: '5', emojis: '🍎💻📱', answer: 'APPLE', clue: 'Think Different', category: 'Brand' },
];
