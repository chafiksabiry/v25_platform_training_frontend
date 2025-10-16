import React from 'react';
import { Play, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { TrainingModule } from '../../types';

interface TrainingModulesProps {
  modules: TrainingModule[];
  onModuleSelect?: (moduleId: string) => void;
}

export default function TrainingModules({ modules, onModuleSelect }: TrainingModulesProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Training Modules</h1>
        <div className="text-sm text-gray-600">
          {modules.filter(m => m.completed).length} of {modules.length} completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Training</span>
                </div>
                {module.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{module.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{module.duration}</span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs text-gray-600">{module.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      module.completed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Topics Covered:</h4>
                <div className="flex flex-wrap gap-1">
                  {module.topics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {module.topics.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{module.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                  module.completed
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : module.progress > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onModuleSelect?.(module.id)}
              >
                <Play className="h-4 w-4" />
                <span>
                  {module.completed
                    ? 'Review'
                    : module.progress > 0
                    ? 'Continue'
                    : 'Start Training'
                  }
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}