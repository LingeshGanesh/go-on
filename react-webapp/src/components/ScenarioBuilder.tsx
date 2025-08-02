import React, { useEffect, useState } from 'react';
import { Plus, X, Save, MessageCircle, Clock, Users, Trash2 } from 'lucide-react';
import { Scenario, Phrase } from '../types';
import { languages } from '../data/languages';
import { getUidFromUserProfile } from '../utils/getUserIdFromCookie';

interface ScenarioBuilderProps {
  onBack: () => void;
  onSave: (scenario: Scenario) => void;
}

interface NewPhrase {
  english: string;
  translations: Record<string, string>;
  context: string;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ onBack, onSave }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [phrases, setPhrases] = useState<NewPhrase[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState<NewPhrase>({
    english: '',
    translations: {},
    context: ''
  });
  const [showPhraseForm, setShowPhraseForm] = useState(false);

  const categories = ['Custom', 'Dining', 'Travel', 'Professional', 'Shopping', 'Healthcare', 'Education', 'Entertainment'];

  useEffect(() => {
    const userId = getUidFromUserProfile();
    setUid(userId);
  }, []);


  const handleTranslationChange = (langCode: string, value: string) => {
    setCurrentPhrase(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: value
      }
    }));
  };

  const handleSaveScenario = async () => {
    const url = `${import.meta.env.VITE_API_URL}/add-model`;

    if (!title.trim() || !description.trim()) return;
    const model_uid = Date.now().toString();

    const payload = {
      uid: uid, // ✅ use the state
      model_uid: model_uid,
      model_info: JSON.stringify({
        id: model_uid,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      })
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
    console.log(data);

    const scenario: Scenario = {
      id: model_uid,
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      language: "English",
      lcode: "en"
    };

    onSave(scenario);
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Coffee Shop Order"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this scenario teaches..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Phrases Section */}
            {/* <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Phrases ({phrases.length})</h2>
                <button
                  onClick={() => setShowPhraseForm(true)}
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Phrase
                </button>
              </div> */}

              {/* Phrase List */}
              {/* <div className="space-y-4 mb-6">
                {phrases.map((phrase, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{phrase.english}</p>
                        <p className="text-sm text-gray-600 mb-2">{phrase.context}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(phrase.translations).map(([lang, translation]) => (
                            <span key={lang} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {lang.toUpperCase()}: {translation}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePhrase(index)}
                        className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {phrases.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No phrases yet</h3>
                  <p className="text-gray-600 mb-4">Add phrases to make your scenario interactive</p>
                  <button
                    onClick={() => setShowPhraseForm(true)}
                    className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
                  >
                    Add Your First Phrase
                  </button>
                </div>
              )} */}

              {/* Add Phrase Form */}
              {/* {showPhraseForm && (
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Add New Phrase</h3>
                    <button
                      onClick={() => setShowPhraseForm(false)}
                      className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        English Phrase *
                      </label>
                      <input
                        type="text"
                        value={currentPhrase.english}
                        onChange={(e) => setCurrentPhrase(prev => ({ ...prev, english: e.target.value }))}
                        placeholder="e.g., I'd like a coffee, please"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Context *
                      </label>
                      <input
                        type="text"
                        value={currentPhrase.context}
                        onChange={(e) => setCurrentPhrase(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="e.g., When ordering at a coffee shop"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Translations (optional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {languages.slice(1).map(lang => (
                          <div key={lang.code}>
                            <label className="block text-xs text-gray-600 mb-1">
                              {lang.name}
                            </label>
                            <input
                              type="text"
                              value={currentPhrase.translations[lang.code] || ''}
                              onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                              placeholder={`Translation in ${lang.name}...`}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowPhraseForm(false)}
                        className="px-4 py-2 border border-gray-200 rounded-full hover:border-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPhrase}
                        disabled={!isPhraseValid}
                        className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Phrase
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>*/}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Preview</h3>
                <button
                  onClick={handleSaveScenario}
                  disabled={!isFormValid}
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
              </div>
              
              {title || description || phrases.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {title || 'Untitled Scenario'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {description || 'No description yet...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{Math.max(5, phrases.length * 2)} min</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{Math.max(1, Math.ceil(phrases.length / 3))} situations</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{category}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Fill out the form to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
