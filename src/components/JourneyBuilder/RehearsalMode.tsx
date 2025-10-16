import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, MessageSquare, Star, Eye, Users, Rocket, ArrowLeft, Clock, BarChart3, Zap, Video, BookOpen } from 'lucide-react';
import { TrainingJourney, TrainingModule, RehearsalFeedback } from '../../types';
import { TrainingMethodology } from '../../types/methodology';
import VideoScriptViewer from '../MediaGenerator/VideoScriptViewer';

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
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState({
    type: 'content' as RehearsalFeedback['type'],
    message: '',
    severity: 'medium' as RehearsalFeedback['severity']
  });
  const [rehearsalTime, setRehearsalTime] = useState(0);

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

  const addFeedback = () => {
    if (!currentFeedback.message.trim()) return;

    const newFeedback: RehearsalFeedback = {
      id: Date.now().toString(),
      moduleId: currentModule?.id || 'general',
      type: currentFeedback.type,
      message: currentFeedback.message,
      severity: currentFeedback.severity,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    setFeedback(prev => [...prev, newFeedback]);
    setCurrentFeedback({ type: 'content', message: '', severity: 'medium' });
    setShowFeedbackForm(false);
  };

  const handleFinishRehearsal = () => {
    onComplete(feedback, overallRating);
  };

  const generateRehearsalReport = () => {
    const report = {
      journey: journey.name,
      totalTime: formatTime(rehearsalTime),
      modulesCompleted: completedModules.length,
      totalModules: modules.length,
      feedback: feedback.length,
      rating: overallRating,
      readyForLaunch: overallRating >= 3 && feedback.filter(f => f.severity === 'high').length === 0,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rehearsal-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFeedbackIcon = (type: RehearsalFeedback['type']) => {
    switch (type) {
      case 'content':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'technical':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'engagement':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'suggestion':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: RehearsalFeedback['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      REHEARSAL MODE
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{journey.name}</h1>
                  <p className="text-gray-600">Test and review your training journey before launch</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Rehearsal Time</div>
                <div className="text-2xl font-bold text-gray-900">{formatTime(rehearsalTime)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {methodology && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">🎯 360° Methodology in Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {methodology.components.slice(0, 8).map((component, index) => (
                  <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-purple-900">{component.title}</div>
                    <div className="text-xs text-purple-700">{component.estimatedDuration}h • {component.competencyLevel}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-purple-700 text-sm">
                  Complete 360° approach covering foundational knowledge, regulatory compliance, 
                  contact centre excellence, and regional requirements
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Module Navigation */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Module {currentModuleIndex + 1} of {modules.length}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousModule}
                      disabled={currentModuleIndex === 0}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextModule}
                      disabled={currentModuleIndex === modules.length - 1}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {modules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleIndex(index)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        index === currentModuleIndex
                          ? 'bg-purple-600 text-white'
                          : completedModules.includes(module.id)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}. {module.title}
                      {completedModules.includes(module.id) && (
                        <CheckCircle className="h-4 w-4 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Module Content */}
              {currentModule && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentModule.title}</h2>
                      <p className="text-gray-600">{currentModule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentModule.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        currentModule.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentModule.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* AI-Generated Video Script */}
                  <div className="mb-6">
                    <VideoScriptViewer
                      moduleTitle={currentModule.title}
                      moduleDescription={currentModule.description}
                      learningObjectives={currentModule.learningObjectives}
                    />
                  </div>

                  {/* Module Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <RotateCcw className="h-4 w-4" />
                        <span>Restart</span>
                      </button>
                    </div>
                    <button
                      onClick={handleModuleComplete}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>

                  {/* Module Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-blue-600">{currentModule.duration}</div>
                      <div className="text-sm text-gray-600">Duration (min)</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-green-600">{currentModule.content.length}</div>
                      <div className="text-sm text-gray-600">Content Items</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-purple-600">{currentModule.assessments.length}</div>
                      <div className="text-sm text-gray-600">Assessments</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Add Feedback */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Feedback</h3>
                
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Add Feedback</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={currentFeedback.type}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, type: e.target.value as RehearsalFeedback['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="content">Content Issue</option>
                      <option value="technical">Technical Issue</option>
                      <option value="engagement">Engagement</option>
                      <option value="suggestion">Suggestion</option>
                    </select>

                    <select
                      value={currentFeedback.severity}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, severity: e.target.value as RehearsalFeedback['severity'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>

                    <textarea
                      value={currentFeedback.message}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe the issue or suggestion..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={addFeedback}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback List */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feedback ({feedback.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {feedback.map((item) => (
                    <div key={item.id} className={`p-3 border rounded-lg ${getSeverityColor(item.severity)}`}>
                      <div className="flex items-start space-x-2">
                        {getFeedbackIcon(item.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">{item.type}</div>
                          <div className="text-sm mt-1">{item.message}</div>
                          <div className="text-xs mt-2 opacity-75">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {feedback.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No feedback yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Rating */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
                
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setOverallRating(rating)}
                      className={`p-2 transition-colors ${
                        rating <= overallRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                
                <div className="text-center text-sm text-gray-600 mb-4">
                  {overallRating === 0 && 'Rate the training journey'}
                  {overallRating === 1 && 'Needs significant improvement'}
                  {overallRating === 2 && 'Below expectations'}
                  {overallRating === 3 && 'Meets expectations'}
                  {overallRating === 4 && 'Exceeds expectations'}
                  {overallRating === 5 && 'Outstanding quality'}
                </div>

                <button
                  onClick={handleFinishRehearsal}
                  disabled={overallRating === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Finish Rehearsal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}