import React, { useState } from 'react';
import { MessageCircle, Search, Globe, Plus, BookOpen, Wrench, Home, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Language, Scenario } from './types';
import { languages } from './data/languages';
import { scenarios } from './data/scenarios';
import { LanguageSelector } from './components/LanguageSelector';
import { HeaderLanguageSelector } from './components/HeaderLanguageSelector';
import { CategoryPopup } from './components/CategoryPopup';
import { ScenarioCard } from './components/ScenarioCard';
import { CustomScenarioCard } from './components/CustomScenarioCard';
import { PracticeSession } from './components/PracticeSession';
import { ConversationMode } from './components/ConversationMode';
import { FreeConversationMode } from './components/FreeConversationMode';
import { VocabularyManager } from './components/VocabularyManager';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { useCustomScenarios } from './hooks/useCustomScenarios';
import GoogleLoginButton from "./components/GoogleLoginButton";


type ActiveTab = 'home' | 'create-scenario' | 'my-learning';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [conversationScenario, setConversationScenario] = useState<Scenario | null>(null);
  const [showFreeConversation, setShowFreeConversation] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { customScenarios, saveCustomScenario, deleteCustomScenario } = useCustomScenarios();

  const allScenarios = [...scenarios, ...customScenarios];
  const categories = ['All', ...Array.from(new Set(allScenarios.map(s => s.category)))];
  
  const filteredScenarios = allScenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scenario.category === selectedCategory;
    const matchesCustomFilter = !showCustomOnly || customScenarios.some(cs => cs.id === scenario.id);
    return matchesSearch && matchesCategory && matchesCustomFilter;
  });

  const handleSaveScenario = (scenario: Scenario) => {
    saveCustomScenario(scenario);
    setActiveTab('home');
  };

  const handleDeleteCustomScenario = (scenarioId: string) => {
    if (window.confirm('Are you sure you want to delete this custom scenario?')) {
      deleteCustomScenario(scenarioId);
    }
  };

  if (showFreeConversation) {
    return (
      <FreeConversationMode 
        language={selectedLanguage}
        onBack={() => setShowFreeConversation(false)} 
      />
    );
  }

  if (conversationScenario) {
    return (
      <ConversationMode 
        scenario={conversationScenario} 
        language={selectedLanguage}
        onBack={() => setConversationScenario(null)} 
      />
    );
  }

  if (selectedScenario) {
    return (
      <PracticeSession 
        scenario={selectedScenario} 
        onBack={() => setSelectedScenario(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200 transition-all duration-300`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-lg font-bold text-gray-900">GO/ON</h1>
                <p className="text-xs text-gray-500">Language Practice</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className={`${sidebarCollapsed ? 'px-2' : 'px-4'} py-2 border-b border-gray-200`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'} rounded-xl text-left transition-all duration-200 transform ${
                activeTab === 'home'
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:scale-102 hover:-translate-y-0.5'
              }`}
              title={sidebarCollapsed ? 'Home' : ''}
            >
              <Home className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                activeTab === 'home' 
                  ? 'text-white' 
                  : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-110'
              }`} />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">Home</span>
                  {activeTab !== 'home' && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('create-scenario')}
              className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'} rounded-xl text-left transition-all duration-200 transform ${
                activeTab === 'create-scenario'
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:scale-102 hover:-translate-y-0.5'
              }`}
              title={sidebarCollapsed ? 'Create Scenario' : ''}
            >
              <Wrench className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                activeTab === 'create-scenario' 
                  ? 'text-white' 
                  : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-110'
              }`} />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">Create Scenario</span>
                  {activeTab !== 'create-scenario' && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my-learning')}
              className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'} rounded-xl text-left transition-all duration-200 transform ${
                activeTab === 'my-learning'
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:scale-102 hover:-translate-y-0.5'
              }`}
              title={sidebarCollapsed ? 'My Learning' : ''}
            >
              <BookOpen className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                activeTab === 'my-learning' 
                  ? 'text-white' 
                  : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-110'
              }`} />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">My Learning</span>
                  {activeTab !== 'my-learning' && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Language Selector */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 transition-opacity duration-300">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        )}

        {/* Collapsed Language Indicator */}
        {sidebarCollapsed && (
          <div className="p-2 border-t border-gray-200">
            <div 
              className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              title={`Current language: ${selectedLanguage.name}`}
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-gray-900">
                  {activeTab === 'home' && 'Practice Scenarios'}
                  {activeTab === 'create-scenario' && 'Create Custom Scenario'}
                  {activeTab === 'my-learning' && 'Personal Learning'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'home' && `Choose a scenario to practice ${selectedLanguage.name}`}
                  {activeTab === 'create-scenario' && 'Build your personalized practice scenarios'}
                  {activeTab === 'my-learning' && `Manage your ${selectedLanguage.name} vocabulary and grammar`}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {activeTab === 'home' && (
                  <HeaderLanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                )}
                
                {activeTab === 'home' && (
                  <button 
                    onClick={() => setShowFreeConversation(true)}
                    className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Free Conversation
                  </button>
                )}

                {/* {activeTab === 'home' && (
                  <button 
                    onClick={() => setShowFreeConversation(true)}
                    className="bg-green-800 text-white px-6 py-3 rounded-full hover:bg-green-900 transition-colors font-medium flex items-center"
                  >
                    Login
                  </button>
                )} */}
                <GoogleLoginButton />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="px-8 py-8">
              {/* Hero Section */}
              <section className="text-center mb-16">
                <h3 className="text-4xl font-light text-gray-900 mb-4 leading-tight">
                  Practice {selectedLanguage.name} through
                  <span className="block font-normal text-gray-600">natural conversation</span>
                </h3>
                <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed max-w-2xl mx-auto">
                  Engage with AI partners in realistic scenarios or start a free conversation 
                  to improve your fluency naturally.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setShowFreeConversation(true)}
                    className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start Free Conversation
                  </button>
                  <button 
                    onClick={() => setActiveTab('create-scenario')}
                    className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 transition-colors font-medium flex items-center justify-center"
                  >
                    <Wrench className="w-5 h-5 mr-2" />
                    Create Custom Scenario
                  </button>
                </div>
              </section>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">{scenarios.length}+</div>
                  <div className="text-gray-600 font-light">Built-in Scenarios</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">{customScenarios.length}</div>
                  <div className="text-gray-600 font-light">Custom Scenarios</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">50K+</div>
                  <div className="text-gray-600 font-light">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">95%</div>
                  <div className="text-gray-600 font-light">Fluency Rate</div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-6 items-center mb-12">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search scenarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                
                <CategoryPopup
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  showCustomOnly={showCustomOnly}
                  onCustomOnlyChange={setShowCustomOnly}
                />
              </div>

              {/* Scenarios Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredScenarios.map((scenario) => {
                  const isCustom = customScenarios.some(cs => cs.id === scenario.id);
                  
                  return isCustom ? (
                    <CustomScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={setSelectedScenario}
                      onStartConversation={setConversationScenario}
                      onDelete={handleDeleteCustomScenario}
                    />
                  ) : (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={setSelectedScenario}
                      onStartConversation={setConversationScenario}
                    />
                  );
                })}
              </div>

              {filteredScenarios.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-2">No scenarios found</h3>
                  <p className="text-gray-600 font-light mb-4">Try adjusting your search criteria</p>
                  {showCustomOnly && customScenarios.length === 0 && (
                    <button
                      onClick={() => setActiveTab('create-scenario')}
                      className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
                    >
                      Create Your First Scenario
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create-scenario' && (
            <div className="h-full">
              <ScenarioBuilder 
                onBack={() => setActiveTab('home')}
                onSave={handleSaveScenario}
              />
            </div>
          )}

          {activeTab === 'my-learning' && (
            <div className="h-full">
              <VocabularyManager 
                language={selectedLanguage}
                onBack={() => setActiveTab('home')} 
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 px-8">
          <div className="text-center">
            <p className="text-gray-500 font-light text-sm">
              © 2024 GO/ON - Built with ChatAndBuild
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
