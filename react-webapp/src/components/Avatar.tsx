import React, { useState, useEffect } from 'react';

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  isListening, 
  isSpeaking, 
  voiceEnabled, 
  className = "" 
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthState, setMouthState] = useState<'closed' | 'open' | 'smile'>('closed');

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation based on voice state
  useEffect(() => {
    if (isSpeaking) {
      // Animate mouth while speaking
      const speakInterval = setInterval(() => {
        setMouthState(prev => prev === 'open' ? 'closed' : 'open');
      }, 200);
      return () => clearInterval(speakInterval);
    } else if (isListening) {
      // Slight smile while listening
      setMouthState('smile');
    } else {
      // Default smile when voice is enabled, closed when not
      setMouthState(voiceEnabled ? 'smile' : 'closed');
    }
  }, [isSpeaking, isListening, voiceEnabled]);

  if (!voiceEnabled) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-24 h-24 mx-auto">
        {/* Head */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 border-2 border-orange-400 transition-all duration-300 ${
          isListening ? 'scale-105 shadow-lg' : ''
        } ${
          isSpeaking ? 'animate-pulse' : ''
        }`}>
          
          {/* Eyes */}
          <div className="absolute top-6 left-4 right-4 flex justify-between">
            <div className={`w-3 h-3 bg-gray-800 rounded-full transition-all duration-150 ${
              isBlinking ? 'h-0.5' : ''
            }`} />
            <div className={`w-3 h-3 bg-gray-800 rounded-full transition-all duration-150 ${
              isBlinking ? 'h-0.5' : ''
            }`} />
          </div>

          {/* Nose */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />

          {/* Mouth */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            {mouthState === 'closed' && (
              <div className="w-4 h-0.5 bg-gray-700 rounded-full" />
            )}
            {mouthState === 'open' && (
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
            )}
            {mouthState === 'smile' && (
              <div className="w-6 h-3 border-b-2 border-gray-700 rounded-b-full" />
            )}
          </div>

          {/* Cheeks when smiling */}
          {mouthState === 'smile' && (
            <>
              <div className="absolute top-12 left-2 w-2 h-2 bg-pink-300 rounded-full opacity-60" />
              <div className="absolute top-12 right-2 w-2 h-2 bg-pink-300 rounded-full opacity-60" />
            </>
          )}
        </div>

        {/* Voice activity indicator */}
        {isListening && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Avatar status text */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to chat'}
        </p>
      </div>
    </div>
  );
};
