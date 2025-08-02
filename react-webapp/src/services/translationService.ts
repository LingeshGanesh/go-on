// LibreTranslate API Service
interface TranslationRequest {
  q: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
  api_key?: string;
}

interface TranslationResponse {
  translatedText: string;
}

interface DetectLanguageRequest {
  q: string;
  api_key?: string;
}

interface DetectLanguageResponse {
  confidence: number;
  language: string;
}

interface SupportedLanguage {
  code: string;
  name: string;
}

class TranslateService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
    this.apiKey = apiKey || import.meta.env.VITE_LIBRETRANSLATE_API_KEY;
    console.log('Translate Service initialized:', { baseUrl: this.baseUrl, hasApiKey: !!this.apiKey });
  }

  // async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  //   try {
  //     console.log('Translate API Request:', {
  //       text: text.substring(0, 50) + '...',
  //       source: sourceLanguage,
  //       target: targetLanguage,
  //       url: this.baseUrl
  //     });

  //     const requestBody: TranslationRequest = {
  //       q: text,
  //       source: sourceLanguage,
  //       target: targetLanguage,
  //       format: 'text'
  //     };

  //     if (this.apiKey) {
  //       requestBody.api_key = this.apiKey;
  //     }

  //     const response = await fetch(this.baseUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestBody)
  //     });

  //     console.log('LibreTranslate API Response Status:', response.status, response.statusText);

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('LibreTranslate API Error Response:', errorText);
  //       throw new Error(`Translation failed: ${response.status} ${response.statusText} - ${errorText}`);
  //     }

  //     const data: TranslationResponse = await response.json();
  //     console.log('LibreTranslate API Success:', {
  //       originalText: text.substring(0, 50) + '...',
  //       translatedText: data.translatedText?.substring(0, 50) + '...'
  //     });

  //     return data.translatedText;
  //   } catch (error) {
  //     console.error('Translation error details:', {
  //       error,
  //       text: text.substring(0, 50),
  //       source: sourceLanguage,
  //       target: targetLanguage,
  //       url: this.baseUrl
  //     });
      
  //     // Return a more informative error message
  //     if (error instanceof Error) {
  //       throw new Error(`LibreTranslate API failed: ${error.message}`);
  //     } else {
  //       throw new Error(`LibreTranslate API failed: Unknown error`);
  //     }
  //   }
  // }
  async translate(text: string): Promise<string> {
    try {
      console.log('Translate API Request:', {
        text: text.substring(0, 50) + '...',
        url: `${import.meta.env.VITE_API_URL}/translate`
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      console.log('Custom Translate API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Custom Translate API Error Response:', errorText);
        throw new Error(`Translation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Expecting data to be { translatedText: "..." }
      if (!data.translatedText) {
        throw new Error('Translation API did not return a translatedText field.');
      }

      console.log('Custom Translate API Success:', {
        originalText: text.substring(0, 50) + '...',
        translatedText: data.translatedText.substring(0, 50) + '...'
      });

      return data.translatedText;
    } catch (error) {
      console.error('Translation error details:', {
        error,
        text: text.substring(0, 50),
        url: `${import.meta.env.VITE_API_URL}/translate`
      });

      if (error instanceof Error) {
        throw new Error(`Custom Translate API failed: ${error.message}`);
      } else {
        throw new Error(`Custom Translate API failed: Unknown error`);
      }
    }
  }


  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    try {
      const requestBody: DetectLanguageRequest = {
        q: text
      };

      if (this.apiKey) {
        requestBody.api_key = this.apiKey;
      }

      const detectUrl = this.baseUrl.replace('/translate', '/detect');
      const response = await fetch(detectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.status} ${response.statusText}`);
      }

      const data: DetectLanguageResponse = await response.json();
      return {
        language: data.language,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'auto', confidence: 0 };
    }
  }

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const languagesUrl = this.baseUrl.replace('/translate', '/languages');
      const response = await fetch(languagesUrl);

      if (!response.ok) {
        throw new Error(`Failed to get supported languages: ${response.status} ${response.statusText}`);
      }

      const languages: SupportedLanguage[] = await response.json();
      return languages;
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      // Return common languages as fallback
      return [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' }
      ];
    }
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; error?: string; supportedLanguages?: string[] }> {
    try {
      console.log('Testing LibreTranslate connection...');
      
      // Test with a simple translation
      const testResult = await this.translate('Hello');
      console.log('Connection test result:', testResult);
      
      // Get supported languages
      const languages = await this.getSupportedLanguages();
      const languageCodes = languages.map(l => l.code);
      
      return {
        success: true,
        supportedLanguages: languageCodes
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
export const translationService = new TranslateService();

// Utility function to map our language codes to LibreTranslate codes
export const mapToLibreTranslateCode = (languageCode: string): string => {
  const codeMap: Record<string, string> = {
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ja': 'ja',
    'ko': 'ko',
    'zh': 'zh',
    'ru': 'ru',
    'ar': 'ar',
    'en': 'en'
  };
  
  const mappedCode = codeMap[languageCode] || 'en';
  console.log('Language code mapping:', { input: languageCode, output: mappedCode });
  return mappedCode;
};

// Helper function to translate text to English
export const translateToEnglish = async (text: string, sourceLanguage: string): Promise<string> => {
  const sourceCode = mapToLibreTranslateCode(sourceLanguage);
  if (sourceCode === 'en') {
    return text; // Already in English
  }
  
  return await translationService.translate(text);
};

// Helper function to translate text from English to target language
export const translateFromEnglish = async (text: string, targetLanguage: string): Promise<string> => {
  const targetCode = mapToLibreTranslateCode(targetLanguage);
  if (targetCode === 'en') {
    return text; // Already in English
  }
  
  return await translationService.translate(text);
};

// Helper function for bidirectional translation
export const translateBetweenLanguages = async (
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<string> => {
  const sourceCode = mapToLibreTranslateCode(sourceLanguage);
  const targetCode = mapToLibreTranslateCode(targetLanguage);
  
  if (sourceCode === targetCode) {
    return text; // Same language
  }
  
  return await translationService.translate(text);
};

// Test the service on initialization
translationService.testConnection().then(result => {
  if (result.success) {
    console.log('✅ Translate service is working!', result.supportedLanguages);
  } else {
    console.error('❌ Translate service failed:', result.error);
  }
});
