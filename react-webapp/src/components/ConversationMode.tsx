import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Volume2, MessageCircle, Lightbulb, Mic, X, Loader2 } from 'lucide-react';
import { Scenario, Language } from '../types';
import { TextHighlighter } from './TextHighlighter';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getLanguageCode } from '../utils/languageMapping';
import { translateToEnglish, translateFromEnglish, mapToLibreTranslateCode, translationService } from '../services/translationService';
import { getUidFromUserProfile } from '../utils/getUserIdFromCookie';

interface ConversationModeProps {
  scenario: Scenario;
  language: Language;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  translation?: string;
  isTranslating?: boolean;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({ scenario, language, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechLang = getLanguageCode(language.code);
  const speechRecognition = useSpeechRecognition(speechLang);
  const speechSynthesis = useSpeechSynthesis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const userId = getUidFromUserProfile();
    setUid(userId);
  }, []);
  
  useEffect(() => {
    console.log(scenario);
    scrollToBottom();
  }, [messages]);

  // useEffect(() => {
  //   // Initialize with a welcome message
  //   if (scenario.language != "english") {
  //     addMessage(
  //       getWelcomeMessage(),
  //       false
  //     );
  //   }
  // }, []);

    useEffect(() => {
      // Initialize with welcome message when language changes
      setMessages([]);
        if (scenario.language != "english") {
        addMessage(
          getWelcomeMessage(),
          false
        );
      }
    }, [scenario.language]);
  

  // Handle speech recognition transcript
  useEffect(() => {
    if (speechRecognition.transcript && voiceInputEnabled) {
      setInputText(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript, voiceInputEnabled]);

  const getWelcomeMessage = () => {
    const welcomeMessages: Record<string, string> = {
      ja: "こんにちは！会話パートナーです。このモードは外部API統合の準備ができています。",
      zh: "你好！我是你的对话伙伴。此模式已准备好进行外部API集成。",
      my: "Hai! Saya ialah rakan perbualan anda. Mod ini telah bersedia untuk integrasi API luaran."
    };
    
    return welcomeMessages[scenario.lcode] || "Hello! I'm your conversation partner. This mode is ready for external API integration.";
  };

  const translateMessageWithLibreTranslate = async (text: string, isUserMessage: boolean): Promise<string> => {
    try {
      const conversationLangCode = mapToLibreTranslateCode(language.code);
      
      console.log('Translation request:', {
        text: text.substring(0, 50) + '...',
        conversationLang: language.code,
        mappedLangCode: conversationLangCode,
        isUserMessage,
        targetLang: 'en'
      });
      
      if (conversationLangCode === 'en') {
        console.log('Text already in English, returning as-is');
        return text; // Already in English
      }
      
      // Both user and AI messages: translate from conversation language to English
      const translation = await translationService.translate(text);
      console.log('Translation successful:', translation.substring(0, 50) + '...');
      return translation;
      
    } catch (error) {
      console.error('LibreTranslate API failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Translation failed: ${errorMessage}`;
    }
  };

  const addMessage = async (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      translation: undefined,
      isTranslating: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Speak AI messages if voice output is enabled
    if (!isUser && voiceOutputEnabled && speechSynthesis.isSupported) {
      setTimeout(() => {
        speechSynthesis.speak(text, speechLang);
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, true);
    setInputText('');
    speechRecognition.resetTranscript();

    try {
      const url = `${import.meta.env.VITE_API_URL}/chat`;
      console.log(url)

      let model = '';

      // Language-based voice and API key selection
      const payload = {
        uid: uid,
        model_name: scenario.id,
        message: userMessage,
        language: scenario.title, // You can customize how you handle language here
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Assuming data contains a message string
      // const formattedMessage = data.message.response.replace(/\n/g, '<br />');

      addMessage(data.response || JSON.stringify(data), false);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      addMessage("Sorry, something went wrong.", false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setVoiceInputEnabled(!voiceInputEnabled);
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    }
  };

  const toggleListening = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    } else {
      speechRecognition.startListening();
    }
  };

  const handleToggleTranslations = async () => {
    const newShowTranslations = !showTranslations;
    setShowTranslations(newShowTranslations);

    // If enabling translations, translate all existing messages using LibreTranslate
    if (newShowTranslations) {
      setIsTranslating(true);
      
      console.log('Starting batch translation for', messages.length, 'messages');
      
      // Mark all messages as translating
      setMessages(prev => 
        prev.map(msg => ({ ...msg, isTranslating: true }))
      );

      // Translate each message using LibreTranslate API
      const translationPromises = messages.map(async (message, index) => {
        if (!message.translation) {
          try {
            console.log(`Translating message ${index + 1}/${messages.length}:`, message.text.substring(0, 50) + '...');
            const translation = await translateMessageWithLibreTranslate(message.text, message.isUser);
            console.log(`Translation ${index + 1} result:`, translation.substring(0, 50) + '...');
            return { ...message, translation, isTranslating: false };
          } catch (error) {
            console.error(`Translation failed for message ${index + 1}:`, message.text, error);
            return { ...message, translation: `Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`, isTranslating: false };
          }
        }
        return { ...message, isTranslating: false };
      });

      try {
        const updatedMessages = await Promise.all(translationPromises);
        console.log('Batch translation completed successfully');
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Batch translation failed:', error);
        // Remove loading states even if translation fails
        setMessages(prev => 
          prev.map(msg => ({ ...msg, isTranslating: false, translation: msg.translation || 'Translation failed' }))
        );
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-medium text-gray-900">{scenario.title}</h1>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500">{scenario.lcode} {scenario.language} Practice</p>
                <div className="flex items-center text-xs text-green-500">
                  <div className="w-2 h-2 rounded-full mr-1 bg-green-500"></div>
                  Translate Active
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                voiceOutputEnabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Voice Output {voiceOutputEnabled ? 'On' : 'Off'}
            </button>
            
            <button
              onClick={handleToggleTranslations}
              disabled={isTranslating}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                showTranslations 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTranslating ? (
                <Loader2 className="w-4 h-4 mr-1 flex-shrink-0 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4 mr-1 flex-shrink-0" />
              )}
              <span>{showTranslations ? 'Hide' : 'Show'} Translations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.isUser ? (
                    <p className="font-light">{message.text}</p>
                  ) : (
                    <>
                      <TextHighlighter
                        text={message.text}
                        language={language}
                        context={scenario.title}
                        className="font-light text-gray-900"
                      />
                    </>
                  )}
                  
                  {showTranslations && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {message.isTranslating ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Translating with Custom Translate...
                        </div>
                      ) : message.translation ? (
                        <p className="text-sm italic text-gray-600">
                          <span className="text-xs text-gray-400 block mb-1">English:</span>
                          {message.translation}
                        </p>
                      ) : (
                        <p className="text-sm italic text-gray-400">
                          Translation unavailable
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-xs ${
                      message.isUser ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!message.isUser && (
                      <button 
                        onClick={() => speechSynthesis.speak(message.text, speechLang)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input with Voice Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message in ${language.name}...`}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 transition-colors resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {voiceInputEnabled && speechRecognition.isListening && (
                <div className="absolute top-2 right-2 flex items-center text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-xs">Listening...</span>
                </div>
              )}
            </div>
            
            {/* Voice Input Toggle */}
            <button
              onClick={toggleVoiceInput}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                voiceInputEnabled
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={voiceInputEnabled ? 'Disable voice input' : 'Enable voice input'}
            >
              {voiceInputEnabled ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Recording Button - Only show when voice input is enabled */}
            {voiceInputEnabled && speechRecognition.isSupported && (
              <button
                onClick={toggleListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  speechRecognition.isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title={speechRecognition.isListening ? 'Stop recording' : 'Start recording'}
              >
                {speechRecognition.isListening ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                    <Mic className="w-5 h-5" />
                  </div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
