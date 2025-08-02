import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  onToggleVoiceInput: () => void;
  onToggleVoiceOutput: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  isSupported: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  voiceInputEnabled,
  voiceOutputEnabled,
  onToggleVoiceInput,
  onToggleVoiceOutput,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  isSupported
}) => {
  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <MicOff className="w-4 h-4" />
        <span className="text-xs">Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Input Toggle */}
      <button
        onClick={onToggleVoiceInput}
        className={`p-2 rounded-full transition-colors ${
          voiceInputEnabled
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
        title={voiceInputEnabled ? 'Voice input enabled' : 'Voice input disabled'}
      >
        {voiceInputEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>

      {/* Voice Output Toggle */}
      <button
        onClick={onToggleVoiceOutput}
        className={`p-2 rounded-full transition-colors ${
          voiceOutputEnabled
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
        title={voiceOutputEnabled ? 'Voice output enabled' : 'Voice output disabled'}
      >
        {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Listening Indicator */}
      {voiceInputEnabled && (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`p-2 rounded-full transition-colors ${
            isListening
              ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
              <Mic className="w-4 h-4" />
            </div>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          title="Stop speaking"
        >
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
            <Volume2 className="w-4 h-4" />
          </div>
        </button>
      )}
    </div>
  );
};
