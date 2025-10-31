import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, AlertTriangle, MessageSquare, Star, ArrowLeft, Users, Rocket } from 'lucide-react';
import { TrainingJourney, TrainingModule, RehearsalFeedback } from '../../types';
import { TrainingMethodology } from '../../types/methodology';
import ContentViewer from '../Training/ContentViewer';
import QuizGenerator from '../Assessment/QuizGenerator';

interface RehearsalModeProps {
  journey: TrainingJourney;
  modules: TrainingModule[];
  methodology?: TrainingMethodology;
  onComplete: (feedback: RehearsalFeedback[], rating: number) => void;
  onBack: () => void;
}

export default function RehearsalMode({ journey, modules, methodology, onComplete, onBack }: RehearsalModeProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<RehearsalFeedback[]>([]);
  const [overallRating, setOverallRating] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rehearsalTime, setRehearsalTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');

  const currentModule = modules[currentModuleIndex];
  const progress = (completedModules.length / modules.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setRehearsalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContentComplete = () => {
    alert('🎉 All content completed! Great job!');
    onComplete(feedback, overallRating);
  };

  const handleModuleComplete = () => {
    if (currentModule && !completedModules.includes(currentModule.id)) {
      setCompletedModules(prev => [...prev, currentModule.id]);
    }
    
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-yellow-500 text-gray-900';
      case 'advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  // Si on affiche le content, afficher en plein écran sans wrapper
  if (activeTab === 'content') {
    return (
      <ContentViewer 
        modules={modules}
        onComplete={handleContentComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={onBack}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                </button>
                  <h1 className="text-3xl font-bold text-gray-900">{journey.name}</h1>
                  </div>
                <p className="text-gray-600 ml-24">Review and refine your training content</p>
                </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Rehearsal Time</div>
                  <div className="text-2xl font-bold text-indigo-600">{formatTime(rehearsalTime)}</div>
              </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Overall Progress</span>
                <span className="font-semibold">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quiz Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex gap-2 border-b border-gray-200">
                    <button
                  onClick={() => setActiveTab('content')}
                  className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                  📖 Content
                    </button>
                    <button
                  onClick={() => setActiveTab('quiz')}
                  className="px-6 py-3 font-medium text-indigo-600 border-b-2 border-indigo-600 transition-colors"
                    >
                  ❓ Quiz
                    </button>
                  </div>
                </div>

              {currentModule && (
              <QuizGenerator
                      moduleTitle={currentModule.title}
                      moduleDescription={currentModule.description}
                moduleContent={currentModule.content.map(c => c.title).join('. ')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

