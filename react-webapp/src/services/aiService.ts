interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  translation?: string;
}

class AIService {
  private conversationHistory: Map<string, AIMessage[]> = new Map();
  private readonly proxyUrl = 'undefined';
  private readonly accessToken = import.meta.env.VITE_PROXY_SERVER_ACCESS_TOKEN || 'undefined';

  private async makeElevenLabsCall(messages: AIMessage[], language: string): Promise<string> {
    console.log('Making ElevenLabs Conversational AI call with messages:', messages);
    console.log('Target language:', language);
    
    try {
      // Build conversation context from messages
      const conversationContext = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = messages.find(msg => msg.role === 'system')?.content || '';
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()?.content || '';

      // Enhanced system prompt with explicit language instruction
      const enhancedSystemPrompt = `${systemPrompt}

CRITICAL: You MUST respond ONLY in ${language}. Never use English or any other language in your response. This is absolutely mandatory.`;

      const proxyRequestBody = {
        url: 'https://api.elevenlabs.io/v1/convai/conversation',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || ''
        },
        body: {
          agent_id: 'default',
          text: lastUserMessage,
          conversation_config: {
            agent_prompt: enhancedSystemPrompt,
            language: this.getElevenLabsLanguageCode(language),
            conversation_config_override: {
              agent: {
                prompt: {
                  prompt: enhancedSystemPrompt
                },
                language: this.getElevenLabsLanguageCode(language)
              }
            }
          },
          conversation_history: conversationContext
        }
      };

      console.log('ElevenLabs proxy request body:', proxyRequestBody);
      console.log('Language code being sent:', this.getElevenLabsLanguageCode(language));

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(proxyRequestBody)
      });

      console.log('ElevenLabs response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error response:', errorText);
        throw new Error(`ElevenLabs API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('ElevenLabs response data:', data);

      // ElevenLabs Conversational AI returns text response
      if (data.text || data.message) {
        return (data.text || data.message).trim();
      } else if (data.audio_url) {
        // If only audio is returned, we need text too
        throw new Error('ElevenLabs returned audio only, text response needed');
      } else {
        throw new Error('Invalid ElevenLabs response format');
      }
    } catch (error) {
      console.error('ElevenLabs API call failed:', error);
      throw error;
    }
  }

  private getElevenLabsLanguageCode(language: string): string {
    console.log('Converting language to ElevenLabs code:', language);
    
    const languageMap: Record<string, string> = {
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Malay': 'my',
      'Chinese': 'zh',
      'Russian': 'ru',
      'Arabic': 'ar',
      'English': 'en'
    };
    
    const code = languageMap[language] || 'en';
    console.log('Language code result:', code);
    return code;
  }

  private getConversationKey(language: string, scenario?: string): string {
    return `${language}-${scenario || 'free'}`;
  }

  private buildSystemPrompt(language: string, scenario?: string): string {
    console.log('Building system prompt for language:', language, 'scenario:', scenario);
    
    let basePrompt = `You are a helpful and engaging language learning conversation partner. You MUST respond ONLY in ${language}, never in English or any other language. This is absolutely critical.

Key guidelines:
- Respond EXCLUSIVELY in ${language} - this is mandatory
- Be natural, friendly, and conversational
- Ask follow-up questions to keep the conversation flowing
- Use vocabulary appropriate for language learners
- Vary your responses - don't be repetitive
- Show genuine interest in what the user says
- Make the conversation feel authentic and engaging
- Keep responses concise but meaningful
- NEVER use English words or phrases in your response`;

    if (scenario) {
      const scenarioPrompts: Record<string, string> = {
        'Restaurant Order': `You are a friendly ${language}-speaking waiter/waitress in a restaurant. You MUST respond ONLY in ${language}, never in English. 
- Greet customers warmly in ${language}
- Ask about their preferences in ${language}
- Make recommendations in ${language}
- Take orders naturally in ${language}
- Ask about drinks, appetizers, main courses, and desserts in ${language}
- Be helpful and professional but conversational
- NEVER use English words or phrases`,

        'Hotel Check-in': `You are a helpful ${language}-speaking hotel receptionist. You MUST respond ONLY in ${language}, never in English.
- Welcome guests warmly in ${language}
- Help with check-in process in ${language}
- Explain hotel amenities and services in ${language}
- Answer questions about the area in ${language}
- Provide recommendations for restaurants and attractions in ${language}
- Be professional but friendly
- NEVER use English words or phrases`,

        'Shopping': `You are a knowledgeable ${language}-speaking shop assistant. You MUST respond ONLY in ${language}, never in English.
- Greet customers and ask how you can help in ${language}
- Help them find what they're looking for in ${language}
- Explain product features and prices in ${language}
- Make suggestions based on their needs in ${language}
- Be helpful and patient
- NEVER use English words or phrases`,

        'Airport': `You are a helpful ${language}-speaking airport staff member. You MUST respond ONLY in ${language}, never in English.
- Assist with check-in and boarding procedures in ${language}
- Help with directions around the airport in ${language}
- Answer questions about flights and services in ${language}
- Be efficient but friendly
- NEVER use English words or phrases`,

        'Doctor Visit': `You are a caring ${language}-speaking medical professional. You MUST respond ONLY in ${language}, never in English.
- Ask about symptoms with empathy in ${language}
- Provide basic health advice in ${language}
- Explain procedures clearly in ${language}
- Be reassuring and professional
- NEVER use English words or phrases`,

        'Job Interview': `You are a professional ${language}-speaking hiring manager. You MUST respond ONLY in ${language}, never in English.
- Conduct a realistic job interview in ${language}
- Ask about experience and qualifications in ${language}
- Discuss the role and company in ${language}
- Be professional but approachable
- NEVER use English words or phrases`
      };

      const scenarioPrompt = scenarioPrompts[scenario];
      if (scenarioPrompt) {
        console.log('Using scenario-specific prompt for:', scenario);
        return scenarioPrompt;
      }
    }

    console.log('Using base prompt for language:', language);
    return basePrompt;
  }

  async generateResponse(
    userMessage: string,
    language: string,
    scenario?: string
  ): Promise<AIResponse> {
    console.log('=== AI Service Generate Response ===');
    console.log('User message:', userMessage);
    console.log('Target language:', language);
    console.log('Scenario:', scenario);
    
    const conversationKey = this.getConversationKey(language, scenario);
    let messages = this.conversationHistory.get(conversationKey) || [];
    
    // Initialize conversation with system prompt if it's the first message
    if (messages.length === 0) {
      const systemPrompt = this.buildSystemPrompt(language, scenario);
      console.log('System prompt:', systemPrompt);
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      console.log('Attempting ElevenLabs Conversational AI call...');
      const aiResponse = await this.makeElevenLabsCall(messages, language);
      
      // Add AI response to conversation history
      messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep conversation history manageable (last 10 messages + system prompt)
      if (messages.length > 11) {
        messages = [messages[0], ...messages.slice(-10)];
      }

      // Update conversation history
      this.conversationHistory.set(conversationKey, messages);

      // Generate translation hint
      const translation = this.getTranslationHint(aiResponse, language);

      console.log('Successfully got ElevenLabs AI response:', aiResponse);
      console.log('=== End AI Service Response ===');

      return {
        message: aiResponse,
        translation
      };
    } catch (error) {
      console.error('ElevenLabs API failed, using intelligent fallback:', error);
      
      // Use context-aware fallback
      const fallback = this.getContextualFallback(userMessage, language, scenario, messages);
      console.log('Using contextual fallback response:', fallback.message);
      console.log('=== End AI Service Response (Fallback) ===');
      
      return fallback;
    }
  }

  private getTranslationHint(text: string, language: string): string {
    // Enhanced translation hints for common phrases
    const translations: Record<string, Record<string, string>> = {
      Spanish: {
        'Hola': 'Hello',
        'Buenos días': 'Good morning',
        'Buenas tardes': 'Good afternoon',
        'Buenas noches': 'Good evening/night',
        'Gracias': 'Thank you',
        'De nada': 'You\'re welcome',
        '¿Cómo está?': 'How are you?',
        '¿Cómo estás?': 'How are you? (informal)',
        'Muy bien': 'Very well',
        'Bienvenido': 'Welcome',
        '¿En qué puedo ayudarle?': 'How can I help you?',
        'Por favor': 'Please',
        'Disculpe': 'Excuse me',
        'Lo siento': 'I\'m sorry',
        '¿Qué le gustaría?': 'What would you like?',
        'Perfecto': 'Perfect',
        'Excelente': 'Excellent'
      },
      French: {
        'Bonjour': 'Hello/Good morning',
        'Bonsoir': 'Good evening',
        'Salut': 'Hi/Bye (informal)',
        'Merci': 'Thank you',
        'De rien': 'You\'re welcome',
        'Comment allez-vous?': 'How are you?',
        'Comment ça va?': 'How are you? (informal)',
        'Ça va bien': 'I\'m doing well',
        'Bienvenue': 'Welcome',
        'Comment puis-je vous aider?': 'How can I help you?',
        'S\'il vous plaît': 'Please',
        'Excusez-moi': 'Excuse me',
        'Je suis désolé': 'I\'m sorry',
        'Qu\'est-ce que vous voulez?': 'What do you want?',
        'Parfait': 'Perfect',
        'Excellent': 'Excellent'
      },
      German: {
        'Hallo': 'Hello',
        'Guten Morgen': 'Good morning',
        'Guten Tag': 'Good day',
        'Guten Abend': 'Good evening',
        'Danke': 'Thank you',
        'Bitte': 'Please/You\'re welcome',
        'Wie geht es Ihnen?': 'How are you?',
        'Wie geht\'s?': 'How are you? (informal)',
        'Gut': 'Good',
        'Willkommen': 'Welcome',
        'Wie kann ich Ihnen helfen?': 'How can I help you?',
        'Entschuldigung': 'Excuse me/Sorry',
        'Es tut mir leid': 'I\'m sorry',
        'Was möchten Sie?': 'What would you like?',
        'Perfekt': 'Perfect',
        'Ausgezeichnet': 'Excellent'
      },
      Italian: {
        'Ciao': 'Hello/Bye',
        'Buongiorno': 'Good morning',
        'Buonasera': 'Good evening',
        'Grazie': 'Thank you',
        'Prego': 'You\'re welcome/Please',
        'Come sta?': 'How are you?',
        'Come stai?': 'How are you? (informal)',
        'Bene': 'Good/Well',
        'Benvenuto': 'Welcome',
        'Come posso aiutarla?': 'How can I help you?',
        'Scusi': 'Excuse me',
        'Mi dispiace': 'I\'m sorry',
        'Cosa desidera?': 'What would you like?',
        'Perfetto': 'Perfect',
        'Eccellente': 'Excellent'
      },
      Portuguese: {
        'Olá': 'Hello',
        'Bom dia': 'Good morning',
        'Boa tarde': 'Good afternoon',
        'Boa noite': 'Good evening/night',
        'Obrigado': 'Thank you (male)',
        'Obrigada': 'Thank you (female)',
        'De nada': 'You\'re welcome',
        'Como está?': 'How are you?',
        'Bem': 'Good/Well',
        'Bem-vindo': 'Welcome',
        'Como posso ajudar?': 'How can I help?',
        'Com licença': 'Excuse me',
        'Desculpe': 'Sorry',
        'O que gostaria?': 'What would you like?',
        'Perfeito': 'Perfect',
        'Excelente': 'Excellent'
      },
      Japanese: {
        'こんにちは': 'Hello',
        'おはよう': 'Good morning',
        'こんばんは': 'Good evening',
        'ありがとう': 'Thank you',
        'どういたしまして': 'You\'re welcome',
        'お元気ですか': 'How are you?',
        'はい': 'Yes',
        'いいえ': 'No',
        'すみません': 'Excuse me/Sorry',
        'いらっしゃいませ': 'Welcome',
        'お疲れ様': 'Good work/Thank you for your hard work'
      }
    };

    const langTranslations = translations[language];
    if (langTranslations) {
      for (const [foreign, english] of Object.entries(langTranslations)) {
        if (text.toLowerCase().includes(foreign.toLowerCase())) {
          return `Contains: "${foreign}" = "${english}"`;
        }
      }
    }

    return `AI response in ${language}`;
  }

  private getContextualFallback(userMessage: string, language: string, scenario?: string, conversationHistory: AIMessage[] = []): AIResponse {
    console.log('Using contextual fallback for:', { userMessage, language, scenario });
    
    // Analyze user message for context
    const isGreeting = /^(hi|hello|hola|bonjour|hallo|ciao|olá|こんにちは)/i.test(userMessage);
    const isQuestion = userMessage.includes('?') || /^(what|how|where|when|why|qué|cómo|dónde|cuándo|por qué|qu'est-ce|comment|où|quand|pourquoi|was|wie|wo|wann|warum)/i.test(userMessage);
    const isGoodbye = /^(bye|goodbye|adiós|au revoir|auf wiedersehen|ciao|tchau|さようなら)/i.test(userMessage);

    const contextualResponses: Record<string, any> = {
      Spanish: {
        greeting: [
          { text: "¡Hola! Me alegra mucho conocerte. ¿Cómo estás hoy?", translation: "Hello! I'm very happy to meet you. How are you today?" },
          { text: "¡Buenos días! ¿Qué tal? ¿En qué puedo ayudarte?", translation: "Good morning! How are things? How can I help you?" }
        ],
        question: [
          { text: "Esa es una pregunta muy interesante. Déjame pensar... ¿Qué opinas tú?", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "Me gusta tu curiosidad. ¿Puedes contarme más sobre lo que te interesa?", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "¡Hasta luego! Ha sido un placer hablar contigo. ¡Que tengas un buen día!", translation: "See you later! It's been a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "Entiendo lo que dices. Es muy interesante. ¿Qué más puedes contarme?", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "Me parece fascinante. ¿Cómo te sientes al respecto?", translation: "I find it fascinating. How do you feel about it?" },
          { text: "Qué perspectiva tan única. ¿Has pensado en esto antes?", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      },
      French: {
        greeting: [
          { text: "Bonjour ! Je suis ravi de vous rencontrer. Comment allez-vous aujourd'hui ?", translation: "Hello! I'm delighted to meet you. How are you today?" },
          { text: "Salut ! Ça va ? Comment puis-je vous aider ?", translation: "Hi! How are you? How can I help you?" }
        ],
        question: [
          { text: "C'est une question très intéressante. Laissez-moi réfléchir... Qu'en pensez-vous ?", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "J'aime votre curiosité. Pouvez-vous m'en dire plus sur ce qui vous intéresse ?", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "Au revoir ! C'était un plaisir de parler avec vous. Bonne journée !", translation: "Goodbye! It was a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "Je comprends ce que vous dites. C'est très intéressant. Que pouvez-vous me dire d'autre ?", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "Je trouve cela fascinant. Comment vous sentez-vous à ce sujet ?", translation: "I find it fascinating. How do you feel about it?" },
          { text: "Quelle perspective unique. Y avez-vous déjà pensé ?", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      },
      German: {
        greeting: [
          { text: "Hallo! Ich freue mich sehr, Sie kennenzulernen. Wie geht es Ihnen heute?", translation: "Hello! I'm very happy to meet you. How are you today?" },
          { text: "Guten Tag! Wie geht's? Wie kann ich Ihnen helfen?", translation: "Good day! How are you? How can I help you?" }
        ],
        question: [
          { text: "Das ist eine sehr interessante Frage. Lassen Sie mich nachdenken... Was denken Sie?", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "Ich mag Ihre Neugier. Können Sie mir mehr darüber erzählen, was Sie interessiert?", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "Auf Wiedersehen! Es war ein Vergnügen, mit Ihnen zu sprechen. Haben Sie einen schönen Tag!", translation: "Goodbye! It was a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "Ich verstehe, was Sie sagen. Das ist sehr interessant. Was können Sie mir noch erzählen?", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "Ich finde das faszinierend. Wie fühlen Sie sich dabei?", translation: "I find it fascinating. How do you feel about it?" },
          { text: "Was für eine einzigartige Perspektive. Haben Sie schon einmal darüber nachgedacht?", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      },
      Italian: {
        greeting: [
          { text: "Ciao! Sono molto felice di conoscerti. Come stai oggi?", translation: "Hello! I'm very happy to meet you. How are you today?" },
          { text: "Buongiorno! Come va? Come posso aiutarti?", translation: "Good morning! How are you? How can I help you?" }
        ],
        question: [
          { text: "È una domanda molto interessante. Fammi pensare... Cosa ne pensi?", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "Mi piace la tua curiosità. Puoi dirmi di più su quello che ti interessa?", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "Arrivederci! È stato un piacere parlare con te. Buona giornata!", translation: "Goodbye! It was a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "Capisco quello che dici. È molto interessante. Cos'altro puoi dirmi?", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "Lo trovo affascinante. Come ti senti al riguardo?", translation: "I find it fascinating. How do you feel about it?" },
          { text: "Che prospettiva unica. Ci hai mai pensato prima?", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      },
      Portuguese: {
        greeting: [
          { text: "Olá! Estou muito feliz em conhecê-lo. Como está hoje?", translation: "Hello! I'm very happy to meet you. How are you today?" },
          { text: "Bom dia! Como vai? Como posso ajudá-lo?", translation: "Good morning! How are you? How can I help you?" }
        ],
        question: [
          { text: "Essa é uma pergunta muito interessante. Deixe-me pensar... O que você acha?", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "Gosto da sua curiosidade. Pode me contar mais sobre o que lhe interessa?", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "Até logo! Foi um prazer falar com você. Tenha um bom dia!", translation: "See you later! It was a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "Entendo o que você está dizendo. É muito interessante. O que mais pode me contar?", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "Acho isso fascinante. Como se sente sobre isso?", translation: "I find it fascinating. How do you feel about it?" },
          { text: "Que perspectiva única. Já pensou nisso antes?", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      },
      Japanese: {
        greeting: [
          { text: "こんにちは！お会いできてとても嬉しいです。今日はいかがですか？", translation: "Hello! I'm very happy to meet you. How are you today?" },
          { text: "おはようございます！調子はどうですか？何かお手伝いできることはありますか？", translation: "Good morning! How are you? How can I help you?" }
        ],
        question: [
          { text: "とても興味深い質問ですね。考えさせてください...あなたはどう思いますか？", translation: "That's a very interesting question. Let me think... What do you think?" },
          { text: "あなたの好奇心が好きです。興味のあることについてもっと教えてもらえますか？", translation: "I like your curiosity. Can you tell me more about what interests you?" }
        ],
        goodbye: [
          { text: "さようなら！お話しできて楽しかったです。良い一日をお過ごしください！", translation: "Goodbye! It was a pleasure talking with you. Have a good day!" }
        ],
        general: [
          { text: "おっしゃることがよく分かります。とても興味深いですね。他に何か教えてもらえますか？", translation: "I understand what you're saying. It's very interesting. What else can you tell me?" },
          { text: "それは魅力的ですね。それについてどう感じますか？", translation: "I find it fascinating. How do you feel about it?" },
          { text: "ユニークな視点ですね。以前に考えたことはありますか？", translation: "What a unique perspective. Have you thought about this before?" }
        ]
      }
    };

    const langResponses = contextualResponses[language] || contextualResponses.Spanish;
    let responseCategory = 'general';

    if (isGreeting) responseCategory = 'greeting';
    else if (isQuestion) responseCategory = 'question';
    else if (isGoodbye) responseCategory = 'goodbye';

    const responses = langResponses[responseCategory] || langResponses.general;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse.text,
      translation: randomResponse.translation
    };
  }

  clearConversation(language: string, scenario?: string): void {
    const conversationKey = this.getConversationKey(language, scenario);
    this.conversationHistory.delete(conversationKey);
    console.log('Cleared conversation for:', conversationKey);
  }

  // Debug method to check API configuration
  debugConfiguration(): void {
    console.log('AI Service Configuration:', {
      hasElevenLabsKey: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
      elevenLabsKeyPreview: import.meta.env.VITE_ELEVENLABS_API_KEY ? 
        `${import.meta.env.VITE_ELEVENLABS_API_KEY.substring(0, 10)}...` : 'Not set',
      proxyUrl: this.proxyUrl,
      accessToken: this.accessToken
    });
  }
}

export const aiService = new AIService();

// Debug configuration on load
aiService.debugConfiguration();
