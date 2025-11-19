import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  Target, 
  BarChart3, 
  Brain, 
  Users, 
  Calendar,
  Video,
  Headphones,
  FileText,
  Zap,
  Star,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Eye,
  Rocket,
  Shield,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { TrainingJourney, TrainingModule, Rep, OnboardingStep, Assessment } from '../../types';
import { TrainingMethodology } from '../../types/methodology';
import TraineeModulePlayer from './TraineeModulePlayer';
import TraineeAssessmentView from './TraineeAssessmentView';
import TraineeProgressDashboard from './TraineeProgressDashboard';
import TraineeLiveSession from './TraineeLiveSession';

interface TraineePortalProps {
  trainee: Rep;
  journey: TrainingJourney;
  modules: TrainingModule[];
  methodology?: TrainingMethodology;
  onProgressUpdate: (moduleId: string, progress: number) => void;
  onModuleComplete: (moduleId: string) => void;
  onAssessmentComplete: (assessmentId: string, score: number) => void;
  onBack: () => void;
}

export default function TraineePortal({ 
  trainee, 
  journey, 
  modules, 
  methodology,
  onProgressUpdate, 
  onModuleComplete, 
  onAssessmentComplete,
  onBack
}: TraineePortalProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [traineeProgress, setTraineeProgress] = useState({
    overallProgress: 35,
    completedModules: 2,
    currentStreak: 5,
    totalTimeSpent: 180, // minutes
    averageScore: 87,
    engagementLevel: 92,
    nextDeadline: '2024-01-28',
    certificationsEarned: 1,
    skillsAcquired: ['Customer Service', 'Product Knowledge']
  });

  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(
    modules.find(m => !m.completed && m.progress > 0) || modules.find(m => !m.completed) || null
  );

  const handleModuleSelect = (module: TrainingModule) => {
    setSelectedModule(module);
    setActiveView('module');
  };

  const handleAssessmentSelect = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setActiveView('assessment');
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setSelectedAssessment(null);
    setActiveView('dashboard');
  };

  const getModuleStatusIcon = (module: TrainingModule) => {
    if (module.completed) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (module.progress > 0) return <Play className="h-5 w-5 text-blue-500" />;
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getModuleStatusColor = (module: TrainingModule) => {
    if (module.completed) return 'border-green-200 bg-green-50';
    if (module.progress > 0) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-white';
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {trainee.name}! 👋</h1>
            <p className="text-blue-100 text-lg mb-4">{journey.name}</p>
            {methodology && (
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 w-fit">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">{methodology.name} • 360° Methodology</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{traineeProgress.overallProgress}%</div>
            <div className="text-blue-200">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{traineeProgress.completedModules}</div>
          <div className="text-sm text-gray-600">Modules Completed</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{traineeProgress.averageScore}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{traineeProgress.currentStreak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="h-6 w-6 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{traineeProgress.certificationsEarned}</div>
          <div className="text-sm text-gray-600">Certifications</div>
        </div>
      </div>

      {/* Current Module Focus */}
      {currentModule && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Continue Your Learning</h2>
              <p className="text-gray-600">Pick up where you left off</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">{currentModule.progress}%</div>
              <div className="text-sm text-gray-600">Module Progress</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentModule.title}</h3>
                  <p className="text-gray-600">{currentModule.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{currentModule.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${currentModule.progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleModuleSelect(currentModule)}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
                <Play className="h-5 w-5" />
                <span>{currentModule.progress > 0 ? 'Continue Learning' : 'Start Module'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Duration</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{currentModule.duration}</div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Difficulty</span>
                </div>
                <div className="text-lg font-bold text-green-600 capitalize">{currentModule.difficulty}</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Type</span>
                </div>
                <div className="text-lg font-bold text-purple-600 capitalize">{currentModule.type}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Journey Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Training Journey</h2>
            
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-md cursor-pointer ${getModuleStatusColor(module)}`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          module.completed ? 'bg-green-500 text-white' :
                          module.progress > 0 ? 'bg-blue-500 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        {getModuleStatusIcon(module)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-gray-600 text-sm">{module.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span className="capitalize">{module.difficulty}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            {module.type === 'video' && <Video className="h-3 w-3" />}
                            {module.type === 'interactive' && <Zap className="h-3 w-3" />}
                            {module.type === 'ai-tutor' && <Brain className="h-3 w-3" />}
                            <span className="capitalize">{module.type}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{module.progress}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            module.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Module Topics Preview */}
                  {Array.isArray(module.topics) && module.topics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {module.topics.slice(0, 4).map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        {module.topics.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{module.topics.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-3">
              {modules
                .filter(m => !m.completed)
                .slice(0, 3)
                .map((module, index) => (
                  <div key={module.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{module.title}</div>
                      <div className="text-xs text-gray-600">{module.duration}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium text-green-900 text-sm">Module Master</div>
                  <div className="text-xs text-green-700">Completed 2 modules</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900 text-sm">High Performer</div>
                  <div className="text-xs text-blue-700">87% average score</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900 text-sm">AI Learner</div>
                  <div className="text-xs text-purple-700">92% engagement</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Calendar className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-medium text-amber-900 text-sm">Final Assessment</div>
                  <div className="text-xs text-amber-700">Due: {traineeProgress.nextDeadline}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Components (if applicable) */}
      {methodology && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">🎯 Your 360° Training Methodology</h2>
            <p className="text-gray-600">{methodology.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {methodology && Array.isArray(methodology.components) && methodology.components.length > 0 ? (
              methodology.components.slice(0, 8).map((component, index) => (
                <div key={component.id} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  index < traineeProgress.completedModules ? 'bg-green-500 text-white' :
                  index === traineeProgress.completedModules ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index < traineeProgress.completedModules ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="font-medium text-gray-900 text-sm">{component.title}</div>
                <div className="text-xs text-gray-600">{component.estimatedDuration}h</div>
                <div className="text-xs text-gray-500 capitalize">{component.competencyLevel}</div>
              </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-full text-center">No methodology components available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderModuleView = () => {
    if (!selectedModule) return null;
    
    return (
      <TraineeModulePlayer
        module={selectedModule}
        trainee={trainee}
        onProgress={(progress) => {
          onProgressUpdate(selectedModule.id, progress);
          setTraineeProgress(prev => ({ ...prev, overallProgress: prev.overallProgress + 1 }));
        }}
        onComplete={() => {
          onModuleComplete(selectedModule.id);
          setTraineeProgress(prev => ({ 
            ...prev, 
            completedModules: prev.completedModules + 1,
            overallProgress: Math.min(prev.overallProgress + 15, 100)
          }));
          handleBackToDashboard();
        }}
        onBack={handleBackToDashboard}
      />
    );
  };

  const renderAssessmentView = () => {
    if (!selectedAssessment) return null;
    
    return (
      <TraineeAssessmentView
        assessment={selectedAssessment}
        trainee={trainee}
        onComplete={(score) => {
          onAssessmentComplete(selectedAssessment.id, score);
          setTraineeProgress(prev => ({ 
            ...prev, 
            averageScore: Math.round((prev.averageScore + score) / 2)
          }));
          handleBackToDashboard();
        }}
        onBack={handleBackToDashboard}
      />
    );
  };

  const renderProgressView = () => (
    <TraineeProgressDashboard
      trainee={trainee}
      journey={journey}
      modules={modules}
      methodology={methodology}
      progress={traineeProgress}
      onBack={handleBackToDashboard}
    />
  );

  const renderLiveSessionView = () => (
    <TraineeLiveSession
      trainee={trainee}
      onBack={handleBackToDashboard}
    />
  );

  // Main render logic
  switch (activeView) {
    case 'module':
      return renderModuleView();
    case 'assessment':
      return renderAssessmentView();
    case 'progress':
      return renderProgressView();
    case 'live-session':
      return renderLiveSessionView();
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Manager View</span>
                  </button>
                  <button
                    onClick={() => setActiveView('progress')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeView === 'progress' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Progress</span>
                  </button>
                  <button
                    onClick={() => setActiveView('live-session')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeView === 'live-session' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>Live Sessions</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{trainee.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 text-sm">{trainee.department}</span>
                </div>
              </div>

              {renderDashboard()}
            </div>
          </div>
        </div>
      );
  }
}