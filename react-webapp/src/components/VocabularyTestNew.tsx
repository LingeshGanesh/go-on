import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Target } from 'lucide-react';
import { VocabularyItem } from '../types';

interface VocabularyTestProps {
  vocabularyItems: VocabularyItem[];
  onBack: () => void;
}

interface TestResult {
  correct: boolean;
  item: VocabularyItem;
  userAnswer: string;
}

export const VocabularyTest: React.FC<VocabularyTestProps> = ({ vocabularyItems, onBack }) => {
  const [testWords, setTestWords] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (vocabularyItems.length > 0 && testWords.length === 0) {
      setTestWords([...vocabularyItems]);
    }
  }, [vocabularyItems, testWords.length]);

  const currentWord = testWords[currentIndex];

  useEffect(() => {
    if (flashColor) {
      const timer = setTimeout(() => setFlashColor(null), 500);
      return () => clearTimeout(timer);
    }
  }, [flashColor]);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || !currentWord) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase().trim();
    const result: TestResult = {
      correct: isCorrect,
      item: currentWord,
      userAnswer: userAnswer.trim()
    };

    setResults([...results, result]);
    setShowResult(true);
    setFlashColor(isCorrect ? 'green' : 'red');

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setShowResult(false);
      setUserAnswer('');
      
      if (currentIndex + 1 >= testWords.length) {
        setTestComplete(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmitAnswer();
    }
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setResults([]);
    setShowResult(false);
    setTestComplete(false);
    setScore(0);
    setFlashColor(null);
    const shuffled = [...vocabularyItems].sort(() => Math.random() - 0.5);
    setTestWords(shuffled);
  };

  const renderTestComplete = () => {
    const percentage = Math.round((score / testWords.length) * 100);
    
    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Test Complete!</h1>
            <p className="text-lg text-gray-600">Here are your results</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">{score}</div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">{testWords.length - score}</div>
                <div className="text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className={`text-3xl font-light mb-2 ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-gray-600">Score</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Answers</h3>
            {results.map((result, index) => (
              <div key={index} className={`border rounded-xl p-4 ${result.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {result.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <span className="font-medium text-gray-900">{result.item.word}</span>
                        <div className="text-sm text-gray-600">
                          Your answer: <span className={result.correct ? 'text-green-700' : 'text-red-700'}>{result.userAnswer}</span>
                          {!result.correct && (
                            <span className="ml-2">
                              • Correct: <span className="text-green-700">{result.item.translation}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={restartTest}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Test Again
            </button>
            <button
              onClick={onBack}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:border-gray-400 transition-colors font-medium"
            >
              Back to Learning
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
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
  };

  const renderLoadingState = () => {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">Loading test...</h3>
            <p className="text-gray-600 font-light mb-6">Preparing your vocabulary test</p>
          </div>
        </div>
      </div>
    );
  };

  if (testComplete) {
    return renderTestComplete();
  }

  if (vocabularyItems.length === 0) {
    return renderEmptyState();
  }

  if (testWords.length === 0) {
    return renderLoadingState();
  }

  return (
    <div className={`h-full transition-all duration-500 ${
      flashColor === 'green' ? 'bg-green-100' : flashColor === 'red' ? 'bg-red-100' : 'bg-white'
    } overflow-y-auto`}>
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Vocabulary Test</h1>
          <p className="text-gray-600">
            Question {currentIndex + 1} of {testWords.length} • Score: {score}/{testWords.length}
          </p>
          
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / testWords.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className={`bg-white border-2 rounded-2xl p-8 shadow-lg transition-all duration-300 ${
            flashColor === 'green' ? 'border-green-400 shadow-green-200' : 
            flashColor === 'red' ? 'border-red-400 shadow-red-200' : 
            'border-gray-200'
          }`}>
            {currentWord && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-light text-gray-900 mb-4">{currentWord.word}</h2>
                  {currentWord.context && (
                    <p className="text-gray-600 italic">"{currentWord.context}"</p>
                  )}
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentWord.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      currentWord.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentWord.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translation in English:
                    </label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-500 transition-colors text-lg"
                      placeholder="Enter your answer..."
                      disabled={showResult}
                      autoFocus
                    />
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded-xl flex items-center space-x-3 ${
                      flashColor === 'green' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {flashColor === 'green' ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <div className="font-medium text-green-800">Correct!</div>
                            <div className="text-green-700">{currentWord.translation}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-red-600" />
                          <div>
                            <div className="font-medium text-red-800">Incorrect</div>
                            <div className="text-red-700">Correct answer: {currentWord.translation}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!showResult && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim()}
                      className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Learning
          </button>
        </div>
      </div>
    </div>
  );
};
