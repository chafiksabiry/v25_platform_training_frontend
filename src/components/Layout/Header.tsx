import React from 'react';
import { User, Bell, Search, Menu, Download } from 'lucide-react';
import { useState } from 'react';
import ExportModal from '../Export/ExportModal';

interface HeaderProps {
  repName: string;
  onMenuToggle: () => void;
}

export default function Header({ repName, onMenuToggle }: HeaderProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Onboarding Hub</h1>
            <p className="text-sm text-gray-600">Welcome back, {repName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-2 w-2"></span>
          </button>
          
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{repName}</span>
          </div>
        </div>
      </div>
    </header>
    
    <ExportModal 
      isOpen={showExportModal} 
      onClose={() => setShowExportModal(false)} 
    />
    </>
  );
}