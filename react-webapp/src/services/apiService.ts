import { ApiService } from './apiService';

// ElevenLabs API Service Configuration
export const elevenLabsService = new ApiService({
  baseUrl: import.meta.env.VITE_ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1',
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  headers: {
    'Accept': 'application/json',
    'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY // ElevenLabs uses xi-api-key header
  }
});

// Step 3: Define TypeScript interfaces for ElevenLabs API
interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: Record<string, string>;
  samples?: Array<{
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    hash: string;
  }>;
}

interface VoicesResponse {
  voices: Voice[];
}

interface TTSRequest {
  text: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface Agent {
  agent_id: string;
  name: string;
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
      };
      first_message: string;
      language: string;
    };
  };
  platform_settings: any;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

interface ConversationHistoryItem {
  agent_id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  last_interaction_at: string;
}

// Step 4: ElevenLabs API Functions

// Get all available voices
export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await elevenLabsService.get<VoicesResponse>('/voices');
    if (response.status === 200) {
      return response.data.voices;
    }
    throw new Error(`Failed to get voices: ${response.message}`);
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

// Get specific voice details
export async function getVoice(voiceId: string): Promise<Voice> {
  try {
    const response = await elevenLabsService.get<Voice>(`/voices/${voiceId}`);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`Failed to get voice: ${response.message}`);
  } catch (error) {
    console.error('Error fetching voice:', error);
    throw error;
  }
}

// Text-to-Speech with specific voice
export async function generateSpeech(
  text: string, 
  voiceId: string, 
  options: Partial<TTSRequest> = {}
): Promise<Blob> {
  try {
    const requestBody: TTSRequest = {
      text,
      model_id: options.model_id || 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true,
        ...options.voice_settings
      }
    };

    // Direct fetch for binary response (audio)
    const response = await fetch(
      `${import.meta.env.VITE_ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS generation failed: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Agent-specific functions using your agent ID
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '6qpxBH5KUSDb40bij36w';

// Get agent details
export async function getAgent(): Promise<Agent> {
  try {
    const response = await elevenLabsService.get<Agent>(`/convai/agents/${AGENT_ID}`);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`Failed to get agent: ${response.message}`);
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}

// Get conversation history for the agent
export async function getConversationHistory(): Promise<ConversationHistoryItem[]> {
  try {
    const response = await elevenLabsService.get<ConversationHistoryItem[]>(
      `/convai/agents/${AGENT_ID}/conversations`
    );
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`Failed to get conversation history: ${response.message}`);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}

// Create a new conversation with the agent
export async function createConversation(): Promise<{ conversation_id: string }> {
  try {
    const response = await elevenLabsService.post<{ conversation_id: string }>(
      `/convai/agents/${AGENT_ID}/conversations`
    );
    if (response.status === 201 || response.status === 200) {
      return response.data;
    }
    throw new Error(`Failed to create conversation: ${response.message}`);
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

// Step 5: React Component Example
/*
import React, { useState, useEffect } from 'react';
import { 
  getVoices, 
  generateSpeech, 
  getAgent, 
  createConversation 
} from './elevenLabsService';

export function ElevenLabsDemo() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState('Hello, this is a test of ElevenLabs text-to-speech!');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // Load voices and agent info on component mount
    loadVoices();
    loadAgent();
  }, []);

  const loadVoices = async () => {
    try {
      const voiceList = await getVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0].voice_id);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadAgent = async () => {
    try {
      const agentData = await getAgent();
      setAgent(agentData);
    } catch (error) {
      console.error('Failed to load agent:', error);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!selectedVoice || !text) return;
    
    setLoading(true);
    try {
      const audioBlob = await generateSpeech(text, selectedVoice);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to generate speech:', error);
      alert('Failed to generate speech. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation();
      alert(`Created conversation: ${conversation.conversation_id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to create conversation. Check console for details.');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ElevenLabs API Integration</h1>
      
      {agent && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Agent Info</h2>
          <p><strong>Agent ID:</strong> {agent.agent_id}</p>
          <p><strong>Name:</strong> {agent.name}</p>
          <button 
            onClick={handleCreateConversation}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Conversation
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Voice:</label>
        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {voices.map(voice => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} ({voice.category})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text to Speech:</label>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded h-24"
          placeholder="Enter text to convert to speech..."
        />
      </div>

      <button 
        onClick={handleGenerateSpeech}
        disabled={loading || !selectedVoice || !text}
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Generate Speech'}
      </button>

      {audioUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Generated Audio:</h3>
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
*/

// Step 6: Utility functions for error handling
export function handleElevenLabsError(error: any): string {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return 'Invalid API key. Please check your ElevenLabs API key.';
      case 403:
        return 'Access forbidden. Check your subscription and permissions.';
      case 429:
        return 'Rate limit exceeded. Please wait before making more requests.';
      case 422:
        return 'Invalid request parameters. Check your input data.';
      default:
        return `API error: ${error.response.status} - ${error.message}`;
    }
  }
  return `Network error: ${error.message}`;
}

// Export the agent ID for use in other files
export const ELEVENLABS_AGENT_ID = AGENT_ID;
