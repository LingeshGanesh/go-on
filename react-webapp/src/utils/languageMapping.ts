// Map language codes to speech recognition and synthesis language codes
export const getLanguageCode = (languageCode: string): string => {
  const languageMap: Record<string, string> = {
    'es': 'es-ES',
    'fr': 'fr-FR', 
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'ru': 'ru-RU',
    'ar': 'ar-SA'
  };
  
  return languageMap[languageCode] || 'en-US';
};

export const getVoiceLanguage = (languageCode: string): string => {
  return getLanguageCode(languageCode);
};
