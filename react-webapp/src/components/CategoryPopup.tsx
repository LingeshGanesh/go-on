import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface CategoryPopupProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showCustomOnly: boolean;
  onCustomOnlyChange: (show: boolean) => void;
}

export const CategoryPopup: React.FC<CategoryPopupProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  showCustomOnly,
  onCustomOnlyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-colors font-medium text-gray-700"
      >
        <Filter className="w-4 h-4 mr-2" />
        <span>Categories</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48 py-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
          </div>
          
          <div className="px-4 py-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCustomOnly}
                onChange={(e) => onCustomOnlyChange(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Custom Only</span>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <div className="px-4 py-1">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categories</h4>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
