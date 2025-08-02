import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { languages } from '../data/languages';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        Learning Language
      </label>
      <div className="relative">
        <select
          value={selectedLanguage.code}
          onChange={(e) => {
            const language = languages.find(lang => lang.code === e.target.value);
            if (language) onLanguageChange(language);
          }}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-900 font-medium focus:outline-none focus:border-gray-400 transition-colors cursor-pointer hover:border-gray-300"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <Globe className="w-3 h-3 mr-1" />
        <span>Currently learning {selectedLanguage.name}</span>
      </div>
    </div>
  );
};
