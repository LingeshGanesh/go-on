import React, { useState } from 'react';
import { ArrowLeft, Volume2, RotateCcw, CheckCircle, MessageCircle } from 'lucide-react';
import { Scenario } from '../types';

interface PracticeSessionProps {
  scenario: Scenario;
  onBack: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({ scenario, onBack }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState<Set<string>>(new Set());

  const currentPhrase = scenario.phrases[currentPhraseIndex];
  const isLastPhrase = currentPhraseIndex === scenario.phrases.length - 1;

  const handleNext = () => {
    setCompletedPhrases(prev => new Set([...prev, currentPhrase.id]));
    
    if (!isLastPhrase) {
      setCurrentPhraseIndex(prev => prev + 1);
    }
    setShowTranslation(false);
  };

  const handlePrevious = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(prev => prev - 1);
    }
    setShowTranslation(false);
  };

  const progress = ((currentPhraseIndex + 1) / scenario.phrases.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bauhaus Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <button
              onClick={onBack}
              className="bauhaus-button bg-black text-white px-4 py-2 font-bold uppercase tracking-wide flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-black text-black uppercase">{scenario.title}</h1>
              <p className="font-bold text-gray-600 uppercase text-sm">
                PHRASE {currentPhraseIndex + 1} OF {scenario.phrases.length}
              </p>
            </div>
            
            <div className="flex justify-end">
              <div className="w-32 h-4 bg-gray-200 border-2 border-black">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Context Card */}
        <div className="bauhaus-card blue bg-white border-2 border-black p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center mr-4">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-black uppercase">CONTEXT</h2>
          </div>
          <p className="text-lg font-medium text-gray-700 leading-relaxed">
            {currentPhrase.context}
          </p>
        </div>

        {/* Phrase Card */}
        <div className="bauhaus-card red bg-white border-2 border-black p-8 mb-8">
          {/* Geometric decoration */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-6 h-6 bg-red-500"></div>
            <button className="w-8 h-8 bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
              <Volume2 className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-wide mb-2">ENGLISH</h3>
            <p className="text-2xl font-bold text-black leading-relaxed mb-6">
              {currentPhrase.english}
            </p>
            
            {showTranslation && (
              <div className="border-t-2 border-black pt-6">
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-wide mb-2">SPANISH</h3>
                <p className="text-2xl font-bold text-black leading-relaxed">
                  {currentPhrase.translations.es}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentPhraseIndex === 0}
              className="bauhaus-button bg-gray-200 text-black px-6 py-3 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PREVIOUS
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="bauhaus-button bg-yellow-400 text-black px-6 py-3 font-bold uppercase tracking-wide flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {showTranslation ? 'HIDE' : 'SHOW'}
              </button>

              {completedPhrases.has(currentPhrase.id) && (
                <div className="flex items-center bg-green-500 text-white px-4 py-3">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-bold uppercase text-sm">DONE</span>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={isLastPhrase}
              className="bauhaus-button bg-red-500 text-white px-6 py-3 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastPhrase ? 'FINISHED' : 'NEXT'}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="inline-flex space-x-2">
            {scenario.phrases.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 border-2 border-black ${
                  index <= currentPhraseIndex ? 'bg-red-500' : 'bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
