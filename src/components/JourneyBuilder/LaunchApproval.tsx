import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, MessageSquare, Star, Users, Rocket, ArrowLeft, Clock, BarChart3, Eye, Play, Zap, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { TrainingJourney, TrainingModule, RehearsalFeedback, Rep } from '../../types';
import VideoScriptViewer from '../MediaGenerator/VideoScriptViewer';
import { JourneyService } from '../../infrastructure/services/JourneyService';

interface LaunchApprovalProps {
  journey: TrainingJourney;
  modules: TrainingModule[];
  rehearsalFeedback: RehearsalFeedback[];
  rehearsalRating: number;
  onLaunch: (journey: TrainingJourney, enrolledReps: Rep[]) => void;
  onBackToRehearsal: () => void;
  onBack: () => void;
}

export default function LaunchApproval({ 
  journey, 
  modules, 
  rehearsalFeedback, 
  rehearsalRating, 
  onLaunch, 
  onBackToRehearsal,
  onBack 
}: LaunchApprovalProps) {
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showModulePreviews, setShowModulePreviews] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSettings, setLaunchSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    sendNotifications: true,
    allowSelfPaced: true,
    enableLiveStreaming: true,
    recordSessions: true,
    aiTutorEnabled: true
  });

  // Mock REPs data
  const availableReps: Rep[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Customer Success Rep',
      department: 'Customer Success',
      enrolledJourneys: [],
      progress: []
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'Sales Rep',
      department: 'Sales',
      enrolledJourneys: [],
      progress: []
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      email: 'lisa@company.com',
      role: 'Support Agent',
      department: 'Support',
      enrolledJourneys: [],
      progress: []
    },
    {
      id: '4',
      name: 'David Park',
      email: 'david@company.com',
      role: 'Account Manager',
      department: 'Sales',
      enrolledJourneys: [],
      progress: []
    }
  ];

  const handleRepToggle = (repId: string) => {
    setSelectedReps(prev => 
      prev.includes(repId) 
        ? prev.filter(id => id !== repId)
        : [...prev, repId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReps.length === availableReps.length) {
      setSelectedReps([]);
    } else {
      setSelectedReps(availableReps.map(rep => rep.id));
    }
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const enrolledReps = availableReps.filter(rep => selectedReps.includes(rep.id));
      const updatedJourney: TrainingJourney = {
        ...journey,
        status: 'active',
        steps: journey.steps.map(step => ({ ...step, status: 'completed' }))
      };
      
      // ✅ Sauvegarder dans MongoDB
      const launchResponse = await JourneyService.launchJourney({
        journey: updatedJourney,
        modules: modules,
        enrolledRepIds: enrolledReps.map(r => r.id),
        launchSettings: launchSettings,
        rehearsalData: {
          rating: rehearsalRating,
          modulesCompleted: modules.length,
          feedback: rehearsalFeedback.map(f => f.message)
        }
      });
      
      console.log('✅ Journey saved to MongoDB:', launchResponse);
      
      onLaunch(updatedJourney, enrolledReps);
    } catch (error) {
      console.error('❌ Failed to save journey to MongoDB:', error);
      alert('Erreur lors de la sauvegarde du training. Veuillez réessayer.');
    } finally {
      setIsLaunching(false);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const highPriorityIssues = rehearsalFeedback.filter(f => f.severity === 'high');
  const mediumPriorityIssues = rehearsalFeedback.filter(f => f.severity === 'medium');
  const suggestions = rehearsalFeedback.filter(f => f.type === 'suggestion');

  const isReadyForLaunch = rehearsalRating >= 3 && highPriorityIssues.length === 0;

  const getFeedbackIcon = (type: RehearsalFeedback['type']) => {
    switch (type) {
      case 'content':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Rehearsal Complete - Ready for Launch</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Launch Approval</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Review your rehearsal results and approve the training journey for deployment to your team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Rehearsal Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Rehearsal Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <Play className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-600 mb-1">{modules.length}</div>
                    <div className="text-sm text-gray-600">Modules Tested</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                    <MessageSquare className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-600 mb-1">{rehearsalFeedback.length}</div>
                    <div className="text-sm text-gray-600">Feedback Items</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                    <Star className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{rehearsalRating}/5</div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {isReadyForLaunch ? 'Ready' : 'Review'}
                    </div>
                    <div className="text-sm text-gray-600">Launch Status</div>
                  </div>
                </div>

                {/* Launch Readiness */}
                <div className={`p-6 rounded-xl border-2 ${
                  isReadyForLaunch 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {isReadyForLaunch ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    )}
                    <h4 className={`text-lg font-semibold ${
                      isReadyForLaunch ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {isReadyForLaunch ? 'Ready for Launch!' : 'Review Required'}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    isReadyForLaunch ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {isReadyForLaunch 
                      ? 'Your training journey has passed rehearsal and is ready for deployment to your team.'
                      : 'Please address high-priority issues or improve the overall rating before launching.'
                    }
                  </p>
                </div>
              </div>

              {/* Feedback Analysis */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Feedback Analysis</h3>
                
                {highPriorityIssues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      High Priority Issues ({highPriorityIssues.length})
                    </h4>
                    <div className="space-y-3">
                      {highPriorityIssues.map((feedback) => (
                        <div key={feedback.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {getFeedbackIcon(feedback.type)}
                            <div className="flex-1">
                              <div className="font-medium text-red-900 capitalize">{feedback.type}</div>
                              <div className="text-red-700 mt-1">{feedback.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediumPriorityIssues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-3">
                      Medium Priority Issues ({mediumPriorityIssues.length})
                    </h4>
                    <div className="space-y-3">
                      {mediumPriorityIssues.map((feedback) => (
                        <div key={feedback.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {getFeedbackIcon(feedback.type)}
                            <div className="flex-1">
                              <div className="font-medium text-yellow-900 capitalize">{feedback.type}</div>
                              <div className="text-yellow-700 mt-1">{feedback.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-purple-900 mb-3">
                      Suggestions for Improvement ({suggestions.length})
                    </h4>
                    <div className="space-y-3">
                      {suggestions.map((feedback) => (
                        <div key={feedback.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {getFeedbackIcon(feedback.type)}
                            <div className="flex-1">
                              <div className="font-medium text-purple-900 capitalize">{feedback.type}</div>
                              <div className="text-purple-700 mt-1">{feedback.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rehearsalFeedback.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No feedback was provided during rehearsal.</p>
                  </div>
                )}
              </div>

              {/* Module Previews with Video Scripts */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Video className="h-6 w-6 text-purple-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">Training Modules</h3>
                  </div>
                  <button
                    onClick={() => setShowModulePreviews(!showModulePreviews)}
                    className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium px-4 py-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all"
                  >
                    {showModulePreviews ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Hide Modules</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Show Modules ({modules.length})</span>
                      </>
                    )}
                  </button>
                </div>

                {showModulePreviews && (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModuleExpansion(module.id)}
                          className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-800">{module.title}</h4>
                              <p className="text-sm text-gray-500">{module.duration} min • {module.difficulty}</p>
                            </div>
                          </div>
                          {expandedModules.includes(module.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {/* Module Content */}
                        {expandedModules.includes(module.id) && (
                          <div className="p-6 bg-white">
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Description</h5>
                              <p className="text-gray-600">{module.description}</p>
                            </div>

                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-700 mb-2">Learning Objectives</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {module.learningObjectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>

                            {/* AI-Generated Video Script */}
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                                <Video className="h-5 w-5 text-purple-600" />
                                <span>AI-Generated Video Script</span>
                              </h5>
                              <VideoScriptViewer
                                moduleTitle={module.title}
                                moduleDescription={module.description}
                                learningObjectives={module.learningObjectives}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!showModulePreviews && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="mb-2">Click "Show Modules" to preview video scripts</p>
                    <p className="text-sm text-gray-400">{modules.length} training modules ready</p>
                  </div>
                )}
              </div>

              {/* Team Selection */}
              {isReadyForLaunch && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Select Team Members</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      {selectedReps.length === availableReps.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableReps.map((rep) => (
                      <label key={rep.id} className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={selectedReps.includes(rep.id)}
                          onChange={() => handleRepToggle(rep.id)}
                          className="mr-4 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {rep.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{rep.name}</div>
                            <div className="text-sm text-gray-600">{rep.role} • {rep.department}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedReps.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          {selectedReps.length} team member{selectedReps.length !== 1 ? 's' : ''} selected for enrollment
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Launch Settings */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={launchSettings.startDate}
                      onChange={(e) => setLaunchSettings(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Send notifications</span>
                      <input
                        type="checkbox"
                        checked={launchSettings.sendNotifications}
                        onChange={(e) => setLaunchSettings(prev => ({ ...prev, sendNotifications: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Self-paced learning</span>
                      <input
                        type="checkbox"
                        checked={launchSettings.allowSelfPaced}
                        onChange={(e) => setLaunchSettings(prev => ({ ...prev, allowSelfPaced: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Live streaming</span>
                      <input
                        type="checkbox"
                        checked={launchSettings.enableLiveStreaming}
                        onChange={(e) => setLaunchSettings(prev => ({ ...prev, enableLiveStreaming: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">AI tutor</span>
                      <input
                        type="checkbox"
                        checked={launchSettings.aiTutorEnabled}
                        onChange={(e) => setLaunchSettings(prev => ({ ...prev, aiTutorEnabled: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🚀 Ready for Deployment</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>• 360° methodology components integrated</div>
                      <div>• Regional compliance and contact centre training included</div>
                      <div>• Real-time progress tracking and AI tutor enabled</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={onBackToRehearsal}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Back to Rehearsal</span>
                  </button>

                  {!isReadyForLaunch ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">Review Required</span>
                      </div>
                      <p className="text-xs text-yellow-700">
                        Address high-priority issues or improve rating to enable launch.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleLaunch}
                      disabled={selectedReps.length === 0 || isLaunching}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLaunching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          <span>Launch Training Journey</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Back to Curriculum
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">
                Rehearsal Rating: {rehearsalRating}/5 stars
              </div>
              <div className="flex items-center space-x-2">
                {isReadyForLaunch ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Ready for Launch</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">Review Required</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-32"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>
    </div>
  );
}