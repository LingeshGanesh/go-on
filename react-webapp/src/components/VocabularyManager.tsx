import React, { useState } from 'react';
import { Plus, Search, BookOpen, FileText, Trash2, Edit3, Target } from 'lucide-react';
import { Language, VocabularyItem } from '../types';
import { useVocabulary } from '../hooks/useVocabulary';
import { VocabularyTestSetup } from './VocabularyTestSetup';
import { VocabularyTest } from './VocabularyTest';

interface VocabularyManagerProps {
  language: Language;
  onBack: () => void;
}

export const VocabularyManager: React.FC<VocabularyManagerProps> = ({ language, onBack }) => {
  const {
    vocabularyList,
    addVocabularyItem,
    removeVocabularyItem,
    updateVocabularyItem,
    getVocabularyByLanguage,
    getVocabularyByCategory
  } = useVocabulary();

  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar'>('vocabulary');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [showTestSetup, setShowTestSetup] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [testWords, setTestWords] = useState<VocabularyItem[]>([]);
  const [newItem, setNewItem] = useState({
    word: '',
    translation: '',
    context: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    notes: ''
  });

  const languageItems = getVocabularyByLanguage(language.code);
  const filteredItems = languageItems
    .filter(item => item.category === activeTab)
    .filter(item => 
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleAddItem = () => {
    if (!newItem.word.trim() || !newItem.translation.trim()) return;

    addVocabularyItem({
      word: newItem.word,
      translation: newItem.translation,
      language: language.code,
      context: newItem.context,
      category: activeTab,
      difficulty: newItem.difficulty,
      notes: newItem.notes
    });

    setNewItem({
      word: '',
      translation: '',
      context: '',
      difficulty: 'medium',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEditItem = (item: VocabularyItem) => {
    setEditingItem(item);
    setNewItem({
      word: item.word,
      translation: item.translation,
      context: item.context || '',
      difficulty: item.difficulty || 'medium',
      notes: item.notes || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItem.word.trim() || !newItem.translation.trim()) return;

    updateVocabularyItem(editingItem.id, {
      word: newItem.word,
      translation: newItem.translation,
      context: newItem.context,
      difficulty: newItem.difficulty,
      notes: newItem.notes
    });

    setEditingItem(null);
    setNewItem({
      word: '',
      translation: '',
      context: '',
      difficulty: 'medium',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleStartTest = (selectedWords: VocabularyItem[]) => {
    setTestWords(selectedWords);
    setShowTestSetup(false);
    setShowTest(true);
  };

  const handleBackFromTest = () => {
    setShowTest(false);
    setShowTestSetup(false);
    setTestWords([]);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showTest) {
    return (
      <VocabularyTest
        vocabularyItems={testWords}
        onBack={handleBackFromTest}
      />
    );
  }

  if (showTestSetup) {
    return (
      <VocabularyTestSetup
        vocabularyItems={languageItems}
        onStartTest={handleStartTest}
        onBack={() => setShowTestSetup(false)}
      />
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-xl font-medium text-gray-900">Personal Learning</h1>
            <p className="text-sm text-gray-500">
              {language.flag} {language.name} • {filteredItems.length} items
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTestSetup(true)}
              disabled={languageItems.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors font-medium flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Target className="w-4 h-4 mr-2" />
              Test
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'vocabulary' ? 'Word' : 'Rule'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-full p-1 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'vocabulary'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Vocabulary ({getVocabularyByCategory('vocabulary').filter(item => item.language === language.code).length})
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'grammar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Grammar ({getVocabularyByCategory('grammar').filter(item => item.language === language.code).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'vocabulary' ? 'Vocabulary' : 'Grammar Rule'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'vocabulary' ? 'Word/Phrase' : 'Grammar Rule'}
                </label>
                <input
                  type="text"
                  value={newItem.word}
                  onChange={(e) => setNewItem({ ...newItem, word: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder={activeTab === 'vocabulary' ? 'Enter word or phrase' : 'Enter grammar rule'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Translation/Explanation</label>
                <input
                  type="text"
                  value={newItem.translation}
                  onChange={(e) => setNewItem({ ...newItem, translation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Enter translation or explanation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context (Optional)</label>
                <input
                  type="text"
                  value={newItem.context}
                  onChange={(e) => setNewItem({ ...newItem, context: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Where did you encounter this?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={newItem.difficulty}
                  onChange={(e) => setNewItem({ ...newItem, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                rows={3}
                placeholder="Add any additional notes or examples"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                {editingItem ? 'Update' : 'Add'} {activeTab === 'vocabulary' ? 'Word' : 'Rule'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setNewItem({
                    word: '',
                    translation: '',
                    context: '',
                    difficulty: 'medium',
                    notes: ''
                  });
                }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              {activeTab === 'vocabulary' ? (
                <BookOpen className="w-8 h-8 text-gray-400" />
              ) : (
                <FileText className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">
              No {activeTab} items yet
            </h3>
            <p className="text-gray-600 font-light mb-6">
              Start building your personal {activeTab} collection
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Add Your First {activeTab === 'vocabulary' ? 'Word' : 'Rule'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{item.word}</h3>
                    <p className="text-gray-600 font-light">{item.translation}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                </div>

                {item.context && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 font-light italic">"{item.context}"</p>
                  </div>
                )}

                {item.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-light">{item.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-light">
                    Added {item.dateAdded.toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeVocabularyItem(item.id)}
                      className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
