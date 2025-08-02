import { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

export const useVocabulary = () => {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('lingualife-vocabulary');
    if (saved) {
      const parsed = JSON.parse(saved);
      setVocabularyList(parsed.map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded)
      })));
    }
  }, []);

  const saveToStorage = (items: VocabularyItem[]) => {
    localStorage.setItem('lingualife-vocabulary', JSON.stringify(items));
  };

  const addVocabularyItem = (item: Omit<VocabularyItem, 'id' | 'dateAdded'>) => {
    const newItem: VocabularyItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date()
    };
    
    const updatedList = [...vocabularyList, newItem];
    setVocabularyList(updatedList);
    saveToStorage(updatedList);
  };

  const removeVocabularyItem = (id: string) => {
    const updatedList = vocabularyList.filter(item => item.id !== id);
    setVocabularyList(updatedList);
    saveToStorage(updatedList);
  };

  const updateVocabularyItem = (id: string, updates: Partial<VocabularyItem>) => {
    const updatedList = vocabularyList.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setVocabularyList(updatedList);
    saveToStorage(updatedList);
  };

  const getVocabularyByLanguage = (language: string) => {
    return vocabularyList.filter(item => item.language === language);
  };

  const getVocabularyByCategory = (category: 'vocabulary' | 'grammar') => {
    return vocabularyList.filter(item => item.category === category);
  };

  return {
    vocabularyList,
    addVocabularyItem,
    removeVocabularyItem,
    updateVocabularyItem,
    getVocabularyByLanguage,
    getVocabularyByCategory
  };
};
