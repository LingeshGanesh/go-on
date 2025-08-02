import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Volume2, BookOpen, FileText } from 'lucide-react';
import { Language } from '../types';
import { useVocabulary } from '../hooks/useVocabulary';

interface TextHighlighterProps {
  text: string;
  language: Language;
  context?: string;
  className?: string;
}

interface HighlightPopup {
  selectedText: string;
  x: number;
  y: number;
  translation: string;
  isVisible: boolean;
}

export const TextHighlighter: React.FC<TextHighlighterProps> = ({ 
  text, 
  language, 
  context = '',
  className = '' 
}) => {
  const [popup, setPopup] = useState<HighlightPopup>({
    selectedText: '',
    x: 0,
    y: 0,
    translation: '',
    isVisible: false
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const { addVocabularyItem } = useVocabulary();
  const textRef = useRef<HTMLDivElement>(null);

  const getEnglishTranslation = async (selectedText: string, langCode: string): Promise<string> => {
    // Comprehensive translation dictionary with English translations
    const translations: Record<string, Record<string, string>> = {
      es: {
        'hola': 'hello',
        'gracias': 'thank you',
        'por favor': 'please',
        'disculpe': 'excuse me',
        'buenos días': 'good morning',
        'buenas tardes': 'good afternoon',
        'buenas noches': 'good evening',
        'adiós': 'goodbye',
        'sí': 'yes',
        'no': 'no',
        'agua': 'water',
        'comida': 'food',
        'restaurante': 'restaurant',
        'hotel': 'hotel',
        'ayuda': 'help',
        'trabajo': 'work',
        'casa': 'house',
        'tiempo': 'time',
        'dinero': 'money',
        'familia': 'family',
        'bienvenido': 'welcome',
        'puedo': 'I can',
        'ayudarle': 'help you',
        'hoy': 'today',
        'qué': 'what',
        'gustaría': 'would like',
        'beber': 'to drink',
        'excelente': 'excellent',
        'elección': 'choice',
        'algo': 'something',
        'más': 'more',
        'prefiere': 'prefer',
        'mesa': 'table',
        'junto': 'next to',
        'ventana': 'window'
      },
      fr: {
        'bonjour': 'hello',
        'merci': 'thank you',
        's\'il vous plaît': 'please',
        'excusez-moi': 'excuse me',
        'au revoir': 'goodbye',
        'oui': 'yes',
        'non': 'no',
        'eau': 'water',
        'nourriture': 'food',
        'restaurant': 'restaurant',
        'hôtel': 'hotel',
        'aide': 'help',
        'travail': 'work',
        'maison': 'house',
        'temps': 'time',
        'argent': 'money',
        'famille': 'family',
        'bienvenue': 'welcome',
        'comment': 'how',
        'puis-je': 'can I',
        'vous': 'you',
        'aider': 'help',
        'aujourd\'hui': 'today',
        'que': 'what',
        'désirez-vous': 'do you want',
        'boire': 'to drink',
        'excellent': 'excellent',
        'choix': 'choice',
        'autre': 'other',
        'chose': 'thing'
      },
      de: {
        'hallo': 'hello',
        'danke': 'thank you',
        'bitte': 'please',
        'entschuldigung': 'excuse me',
        'auf wiedersehen': 'goodbye',
        'ja': 'yes',
        'nein': 'no',
        'wasser': 'water',
        'essen': 'food',
        'restaurant': 'restaurant',
        'hotel': 'hotel',
        'hilfe': 'help',
        'arbeit': 'work',
        'haus': 'house',
        'zeit': 'time',
        'geld': 'money',
        'familie': 'family',
        'willkommen': 'welcome',
        'wie': 'how',
        'kann': 'can',
        'ich': 'I',
        'ihnen': 'you',
        'helfen': 'help',
        'heute': 'today',
        'was': 'what',
        'möchten': 'would like',
        'sie': 'you',
        'trinken': 'to drink',
        'ausgezeichnete': 'excellent',
        'wahl': 'choice',
        'noch': 'still',
        'etwas': 'something'
      },
      it: {
        'ciao': 'hello',
        'grazie': 'thank you',
        'per favore': 'please',
        'scusi': 'excuse me',
        'arrivederci': 'goodbye',
        'sì': 'yes',
        'no': 'no',
        'acqua': 'water',
        'cibo': 'food',
        'ristorante': 'restaurant',
        'hotel': 'hotel',
        'aiuto': 'help',
        'lavoro': 'work',
        'casa': 'house',
        'tempo': 'time',
        'soldi': 'money',
        'famiglia': 'family',
        'benvenuto': 'welcome',
        'come': 'how',
        'posso': 'I can',
        'aiutarla': 'help you',
        'oggi': 'today',
        'cosa': 'what',
        'desidera': 'desire',
        'da': 'from',
        'bere': 'to drink',
        'ottima': 'excellent',
        'scelta': 'choice',
        'altro': 'other'
      },
      pt: {
        'olá': 'hello',
        'obrigado': 'thank you',
        'por favor': 'please',
        'desculpe': 'excuse me',
        'tchau': 'goodbye',
        'sim': 'yes',
        'não': 'no',
        'água': 'water',
        'comida': 'food',
        'restaurante': 'restaurant',
        'hotel': 'hotel',
        'ajuda': 'help',
        'trabalho': 'work',
        'casa': 'house',
        'tempo': 'time',
        'dinheiro': 'money',
        'família': 'family',
        'bem-vindo': 'welcome',
        'como': 'how',
        'posso': 'I can',
        'ajudá-lo': 'help you',
        'hoje': 'today',
        'o que': 'what',
        'gostaria': 'would like',
        'de': 'of',
        'beber': 'to drink',
        'excelente': 'excellent',
        'escolha': 'choice',
        'mais': 'more',
        'alguma': 'some',
        'coisa': 'thing'
      },
      ja: {
        'こんにちは': 'hello',
        'ありがとう': 'thank you',
        'お願いします': 'please',
        'すみません': 'excuse me',
        'さようなら': 'goodbye',
        'はい': 'yes',
        'いいえ': 'no',
        '水': 'water',
        '食べ物': 'food',
        'レストラン': 'restaurant',
        'ホテル': 'hotel',
        '助け': 'help',
        '仕事': 'work',
        '家': 'house',
        '時間': 'time',
        'お金': 'money',
        '家族': 'family',
        'いらっしゃいませ': 'welcome',
        '今日': 'today',
        'いかが': 'how about',
        'なさいます': 'do',
        'か': 'question particle',
        'お飲み物': 'drinks',
        'いい': 'good',
        'お選び': 'choice',
        'です': 'is/are',
        'ね': 'right?',
        '他': 'other',
        'には': 'for',
        '窓際': 'by the window',
        'お席': 'seat',
        'ご予約': 'reservation',
        'ございます': 'have (polite)',
        '何泊': 'how many nights',
        'ご予定': 'plan',
        'かしこまりました': 'understood',
        'お部屋': 'room',
        '鍵': 'key',
        'お荷物': 'luggage',
        'お手伝い': 'help',
        'ご経験': 'experience',
        'について': 'about',
        '教えて': 'tell me',
        'ください': 'please',
        'なぜ': 'why',
        '弊社': 'our company',
        '働きたい': 'want to work',
        '思われます': 'think',
        'ご質問': 'questions',
        '人気': 'popular',
        '商品': 'product',
        'サイズ': 'size',
        'お支払い': 'payment',
        'いかがなさいます': 'how will you do',
        '次': 'next',
        '電車': 'train',
        '分後': 'minutes later',
        '番線': 'platform',
        'から': 'from',
        'ICカード': 'IC card',
        'お持ち': 'have',
        'いつから': 'since when',
        'その': 'that',
        '症状': 'symptoms',
        'あります': 'there is/are',
        '気になる': 'concerning',
        'こと': 'thing',
        'お薬': 'medicine',
        '処方': 'prescribe',
        'いたします': 'will do (humble)'
      }
    };

    const langTranslations = translations[langCode] || {};
    const lowerText = selectedText.toLowerCase().trim();
    
    // Try exact match first
    if (langTranslations[lowerText]) {
      return langTranslations[lowerText];
    }
    
    // Try partial matches for compound words or phrases
    for (const [key, value] of Object.entries(langTranslations)) {
      if (lowerText.includes(key) || key.includes(lowerText)) {
        return value;
      }
    }
    
    // Return a generic English translation message if no match found
    return `English: "${selectedText}"`;
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) {
      setPopup(prev => ({ ...prev, isVisible: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setIsTranslating(true);
    setShowSaveOptions(false);
    setPopup({
      selectedText,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      translation: '',
      isVisible: true
    });

    try {
      const englishTranslation = await getEnglishTranslation(selectedText, language.code);
      setPopup(prev => ({
        ...prev,
        translation: englishTranslation
      }));
    } catch (error) {
      setPopup(prev => ({
        ...prev,
        translation: 'Translation unavailable'
      }));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveToCategory = (category: 'vocabulary' | 'grammar') => {
    if (!popup.selectedText || !popup.translation) return;

    addVocabularyItem({
      word: popup.selectedText,
      translation: popup.translation,
      language: language.code,
      context: context,
      category: category
    });

    // Show success feedback
    setShowSaveOptions(false);
    setPopup(prev => ({ ...prev, isVisible: false }));
    window.getSelection()?.removeAllRanges();

    // Optional: Show a brief success message
    // You could add a toast notification here
  };

  const handleClosePopup = () => {
    setPopup(prev => ({ ...prev, isVisible: false }));
    setShowSaveOptions(false);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popup.isVisible && !event.target) {
        handleClosePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup.isVisible]);

  return (
    <div className="relative">
      <div
        ref={textRef}
        className={`select-text cursor-text ${className}`}
        onMouseUp={handleTextSelection}
        style={{ userSelect: 'text' }}
      >
        {text}
      </div>

      {/* Translation Popup */}
      {popup.isVisible && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleClosePopup}
          />
          
          {/* Popup */}
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 max-w-sm"
            style={{
              left: `${popup.x}px`,
              top: `${popup.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  "{popup.selectedText}"
                </h4>
                {isTranslating ? (
                  <div className="flex items-center text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                    Translating to English...
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm font-light">
                    {popup.translation}
                  </p>
                )}
              </div>
              <button
                onClick={handleClosePopup}
                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>

            {!isTranslating && popup.translation && (
              <div className="space-y-3">
                {!showSaveOptions ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSaveOptions(true)}
                      className="flex-1 bg-black text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Save to Learning
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Volume2 className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium mb-2">Save to:</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveToCategory('vocabulary')}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Vocabulary
                      </button>
                      <button
                        onClick={() => handleSaveToCategory('grammar')}
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Grammar
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSaveOptions(false)}
                      className="w-full text-gray-500 text-xs hover:text-gray-700 transition-colors py-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
