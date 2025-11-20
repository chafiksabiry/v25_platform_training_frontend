import React from 'react';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Users, 
  FileText, 
  Calendar,
  Award,
  BarChart3,
  Wand2,
  Video,
  Target,
  Presentation
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'training', label: 'Journey Training', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: CheckSquare },
  { id: 'live-sessions', label: 'Live Training', icon: Users },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: FileText },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'curriculum-builder', label: 'Curriculum Builder', icon: Wand2 },
  { id: 'streaming', label: 'Live Streaming', icon: Video },
  { id: 'document-transformer', label: 'Document Transformer', icon: Wand2 },
  { id: 'methodology', label: '360° Methodology', icon: Target },
];

export default function Sidebar({ activeTab, onTabChange, isOpen }: SidebarProps) {
  return (
    <aside className={`bg-gray-900 text-white w-64 min-h-screen p-4 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } md:translate-x-0 fixed z-40 top-0 left-0 overflow-y-auto h-screen`}>
      <div className="mb-8">
        <h2 className="text-xl font-bold">Learning Portal</h2>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}