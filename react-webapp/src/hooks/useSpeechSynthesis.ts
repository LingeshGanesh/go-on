// import { useState, useEffect } from 'react';

// interface SpeechSynthesisHook {
//   speak: (text: string, language?: string) => void;
//   stop: () => void;
//   isSpeaking: boolean;
//   isSupported: boolean;
//   voices: SpeechSynthesisVoice[];
// }

// export const useSpeechSynthesis = (): SpeechSynthesisHook => {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

//   const isSupported = 'speechSynthesis' in window;

//   useEffect(() => {
//     if (!isSupported) return;

//     const updateVoices = () => {
//       setVoices(speechSynthesis.getVoices());
//     };

//     updateVoices();
//     speechSynthesis.addEventListener('voiceschanged', updateVoices);

//     return () => {
//       speechSynthesis.removeEventListener('voiceschanged', updateVoices);
//     };
//   }, [isSupported]);

//   const speak = (text: string, language: string = 'en-US') => {
//     if (!isSupported) return;

//     // Stop any current speech
//     speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
    
//     // Find appropriate voice for the language
//     const voice = voices.find(v => v.lang.startsWith(language.split('-')[0])) || voices[0];
//     if (voice) {
//       utterance.voice = voice;
//     }
    
//     utterance.lang = language;
//     utterance.rate = 0.9;
//     utterance.pitch = 1;
//     utterance.volume = 1;

//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);

//     speechSynthesis.speak(utterance);
//   };

//   const stop = () => {
//     if (isSupported) {
//       speechSynthesis.cancel();
//       setIsSpeaking(false);
//     }
//   };

//   return {
//     speak,
//     stop,
//     isSpeaking,
//     isSupported,
//     voices
//   };
// };

import { useState } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const API_KEY = import.meta.env.VITE_API_URL; // 🔒 Replace with your actual key or use environment variables
const DEFAULT_VOICE_ID = 'bhJUNIXWQQ94l8eI2VUf'; // 👤 Change to desired voice ID (e.g., Rachel)

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const isSupported = typeof window !== 'undefined' && !!window.Audio;

  const speak = async (text: string, language: string = 'en') => {
    console.log(`Requested language: ${language}`);

    if (!isSupported || !text.trim()) return;
    setIsSpeaking(true);

    try {
      let voiceId = '';
      let apiKey = '';

      // Language-based voice and API key selection
      switch (language.toLowerCase()) {
        case 'zh': // Chinese
          voiceId = 'bhJUNIXWQQ94l8eI2VUf';
          apiKey = 'sk_0ba0592a0198d90af8e3e7d0d351fe662cbcb2f15e44b0c0';
          break;
        case 'ja': // Japanese
          voiceId = 'Mv8AjrYZCBkdsmDHNwcB';
          apiKey = 'sk_7aa8922db672727edf8e86fb2e4c93d94e718668998c7069';
          break;
        case 'my': // Malay
          voiceId = 'NpVSXJvYSdIbjOaMbShj';
          apiKey = 'sk_7aa8922db672727edf8e86fb2e4c93d94e718668998c7069';
          break;
        default: // Fallback for other languages (English, etc.)
          voiceId = 'NpVSXJvYSdIbjOaMbShj'; // You can set a general voice here
          apiKey = 'sk_7aa8922db672727edf8e86fb2e4c93d94e718668998c7069';
          break;
      }

      const payload = {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      };

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`TTS request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audioEl = new Audio(url);

      audioEl.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      audioEl.onerror = () => {
        setIsSpeaking(false);
        console.error('Error playing audio');
      };

      setAudio(audioEl);
      audioEl.play();
    } catch (err) {
      console.error('TTS Error:', err);
      setIsSpeaking(false);
    }
  };


  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
