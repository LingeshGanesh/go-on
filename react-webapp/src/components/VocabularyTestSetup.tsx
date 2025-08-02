import React, { useState } from 'react';
import { Target, Play, ArrowLeft } from 'lucide-react';
import { VocabularyItem } from '../types';

interface VocabularyTestSetupProps {
  vocabularyItems: VocabularyItem[];
  onStartTest: (selectedWords: VocabularyItem[]) => void;
  onBack: () => void;
}

export const VocabularyTestSetup: React.FC<VocabularyTestSetupProps> = ({ 
  vocabularyItems, 
  onStartTest, 
  onBack 
}) => {
  const [wordCount, setWordCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [category, setCategory] = useState<'all' | 'vocabulary' | 'grammar'>('all');

  const maxWords = vocabularyItems.length;

  const getFilteredItems = () => {
    let filtered = vocabularyItems;

    if (difficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficulty);
    }

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const availableWords = Math.min(wordCount, filteredItems.length);

  const handleStartTest = () => {
    const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, availableWords);
    onStartTest(selectedWords);
  };

  if (vocabularyItems.length === 0) {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">No vocabulary to test</h3>
            <p className="text-gray-600 font-light mb-6">Add some vocabulary items first to start testing</p>
            <button
              onClick={onBack}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Back to Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning
          </button>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Setup Vocabulary Test</h1>
          <p className="text-gray-600">Configure your test preferences</p>
        </div>

        {/* Setup Card */}
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Word Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Number of words to test
              </label>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max={maxWords}
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1</span>
                  <span className="font-medium text-gray-900">{wordCount} words</span>
                  <span>{maxWords}</span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['all', 'vocabulary', 'grammar'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      difficulty === diff
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Preview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-medium text-gray-900 mb-3">Test Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Available words:</span>
                  <span className="ml-2 font-medium text-gray-900">{filteredItems.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Test words:</span>
                  <span className="ml-2 font-medium text-gray-900">{availableWords}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {category === 'all' ? 'All categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {difficulty === 'all' ? 'All levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartTest}
              disabled={filteredItems.length === 0}
              className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Test ({availableWords} words)
            </button>

            {filteredItems.length === 0 && (
              <p className="text-center text-red-600 text-sm">
                No words match your current filters. Try adjusting your selection.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
