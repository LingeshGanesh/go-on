import React from 'react';
import { Clock, Users, MessageCircle, Play, Edit, Trash2 } from 'lucide-react';
import { Scenario } from '../types';

interface CustomScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  onStartConversation: (scenario: Scenario) => void;
  onEdit?: (scenario: Scenario) => void;
  onDelete?: (scenarioId: string) => void;
}

export const CustomScenarioCard: React.FC<CustomScenarioCardProps> = ({ 
  scenario, 
  onSelect, 
  onStartConversation,
  onEdit,
  onDelete
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img 
          src={scenario.imageUrl} 
          alt={scenario.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
            {scenario.difficulty}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Custom
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{scenario.title}</h3>
          <p className="text-gray-600 font-light text-sm leading-relaxed">{scenario.description}</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onStartConversation(scenario)}
            className="flex-1 bg-black text-white py-3 px-4 rounded-full hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Conversation
          </button>
          {/* <button
            onClick={() => onSelect(scenario)}
            className="px-4 py-3 border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
          >
            <Play className="w-4 h-4 text-gray-600" />
          </button> */}
          {onEdit && (
            <button
              onClick={() => onEdit(scenario)}
              className="px-4 py-3 border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(scenario.id)}
              className="px-4 py-3 border border-red-200 rounded-full hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
