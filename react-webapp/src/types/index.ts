export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Phrase {
  id: string;
  english: string;
  translations: Record<string, string>;
  context: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  situations: number;
  imageUrl: string;
  phrases: Phrase[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  language: string;
  context?: string;
  dateAdded: Date;
  category: 'vocabulary' | 'grammar';
  difficulty?: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export interface HighlightedText {
  id: string;
  text: string;
  translation: string;
  language: string;
  context: string;
  timestamp: Date;
}
