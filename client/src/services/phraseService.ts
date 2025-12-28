import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Phrase {
  id: string;
  phrase: string;
  category: string;
  author?: string;
}

const PHRASES_COLLECTION = 'romantic_phrases';

// Default phrases to seed the database
const DEFAULT_PHRASES: Omit<Phrase, 'id'>[] = [
  {
    phrase: 'O amor não se vê com os olhos, mas com o coração.',
    category: 'Amor',
    author: 'William Shakespeare',
  },
  {
    phrase: 'Você é meu hoje e todos os meus amanhãs.',
    category: 'Compromisso',
  },
  {
    phrase: 'Em todos os mundos, em todas as vidas, eu te escolheria novamente.',
    category: 'Eternidade',
  },
  {
    phrase: 'Amar você é a melhor decisão que já tomei.',
    category: 'Amor',
  },
  {
    phrase: 'Você é a razão pela qual acredito no amor.',
    category: 'Inspiração',
  },
  {
    phrase: 'Cada momento ao seu lado é um presente precioso.',
    category: 'Gratidão',
  },
  {
    phrase: 'Meu coração é e sempre será seu.',
    category: 'Compromisso',
  },
  {
    phrase: 'Você faz minha vida mais bonita só por estar nela.',
    category: 'Admiração',
  },
  {
    phrase: 'Contigo aprendi que o amor verdadeiro existe.',
    category: 'Inspiração',
  },
  {
    phrase: 'Você é o meu para sempre e sempre.',
    category: 'Eternidade',
  },
  {
    phrase: 'Amar é encontrar na felicidade de outro a própria felicidade.',
    category: 'Amor',
    author: 'Gottfried Leibniz',
  },
  {
    phrase: 'Com você, até os dias difíceis são mais fáceis.',
    category: 'Parceria',
  },
  {
    phrase: 'Você é a resposta para todas as minhas orações.',
    category: 'Gratidão',
  },
  {
    phrase: 'Nosso amor é a minha história favorita.',
    category: 'Romance',
  },
  {
    phrase: 'Você me completa de formas que nem sabia que precisava.',
    category: 'Admiração',
  },
];

export const phraseService = {
  /**
   * Get all phrases
   */
  async getAllPhrases(): Promise<Phrase[]> {
    try {
      const snapshot = await getDocs(collection(db, PHRASES_COLLECTION));

      if (snapshot.empty) {
        // Return default phrases if none exist in database
        return DEFAULT_PHRASES.map((phrase, index) => ({
          id: `default-${index}`,
          ...phrase,
        }));
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Phrase[];
    } catch (error) {
      console.error('Error getting phrases:', error);
      // Return default phrases on error
      return DEFAULT_PHRASES.map((phrase, index) => ({
        id: `default-${index}`,
        ...phrase,
      }));
    }
  },

  /**
   * Get phrases by category
   */
  async getPhrasesByCategory(category: string): Promise<Phrase[]> {
    try {
      const allPhrases = await this.getAllPhrases();
      return allPhrases.filter((phrase) => phrase.category === category);
    } catch (error) {
      console.error('Error getting phrases by category:', error);
      throw error;
    }
  },

  /**
   * Get random phrase
   */
  async getRandomPhrase(category?: string): Promise<Phrase> {
    try {
      const phrases = category
        ? await this.getPhrasesByCategory(category)
        : await this.getAllPhrases();

      const randomIndex = Math.floor(Math.random() * phrases.length);
      return phrases[randomIndex];
    } catch (error) {
      console.error('Error getting random phrase:', error);
      // Return a fallback phrase
      return {
        id: 'fallback',
        phrase: 'O amor é a ponte entre você e tudo.',
        category: 'Amor',
        author: 'Rumi',
      };
    }
  },
};

