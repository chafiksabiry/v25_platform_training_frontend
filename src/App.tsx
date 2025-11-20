import React, { useState, useEffect } from 'react';
import { User, Sparkles, Zap, Upload, Wand2, Rocket, Eye, Target } from 'lucide-react';
// import { useAuth } from './hooks/useAuth';
import JourneyBuilder from './components/JourneyBuilder/JourneyBuilder';
import { TrainingHub } from './components/Training';
import { ManualTrainingSetup, ManualTrainingBuilder } from './components/ManualTraining';
import MethodologyBuilder from './components/Methodology/MethodologyBuilder';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ProgressOverview from './components/Dashboard/ProgressOverview';
import CurrentGig from './components/Dashboard/CurrentGig';
import OnboardingSteps from './components/Dashboard/OnboardingSteps';
import TrainingModules from './components/Training/TrainingModules';
import JourneyTraining from './components/Training/JourneyTraining';
import InteractiveModule from './components/Training/InteractiveModule';
import AssessmentCenter from './components/Assessment/AssessmentCenter';
import KnowledgeBase from './components/KnowledgeBase/KnowledgeBase';
import LiveSessions from './components/LiveSessions/LiveSessions';
import AITutor from './components/AI/AITutor';
import AIInsights from './components/AI/AIInsights';
import TrainerDashboard from './components/Trainer/TrainerDashboard';
import CompanyAnalytics from './components/Analytics/CompanyAnalytics';
import CurriculumBuilder from './components/CurriculumBuilder/CurriculumBuilder';
import LiveStreamStudio from './components/LiveStreaming/LiveStreamStudio';
import StreamingDashboard from './components/LiveStreaming/StreamingDashboard';
import CourseStreamingStudio from './components/LiveStreaming/CourseStreamingStudio';
import CourseStreamingDashboard from './components/LiveStreaming/CourseStreamingDashboard';
import CourseParticipantView from './components/LiveStreaming/CourseParticipantView';
import DocumentTransformer from './components/DocumentTransformer/DocumentTransformer';
import LaunchedJourneyDashboard from './components/Dashboard/LaunchedJourneyDashboard';
import JourneySuccess from './components/JourneyBuilder/JourneySuccess';
import TraineePortal from './components/Trainee/TraineePortal';
import { TrainingMethodology } from './types/methodology';
import { healthInsuranceMethodology } from './data/healthInsuranceMethodology';
import { 
  mockRep, 
  mockGig, 
  mockOnboardingSteps, 
  mockTrainingModules,
  mockAssessments,
  mockKnowledgeBase,
  mockLiveSessions,
  mockAIInsights,
  mockAITutor,
  mockTrainerDashboard,
  mockCompanyAnalytics,
  mockCurriculumBuilder,
  mockLiveStreamSessions
} from './data/mockData';
import { useTrainingProgress } from './hooks/useTrainingProgress';
import { Company, TrainingJourney, TrainingModule, Rep } from './types';
import { getCurrentUserName } from './utils/userUtils';
import { JourneyService } from './infrastructure/services/JourneyService';
// TrainingModuleService no longer needed - using embedded structure
import Cookies from 'js-cookie';
import { extractObjectId } from './lib/mongoUtils';

function App() {
  // const { user, signOut } = useAuth();
  const user = { name: 'User', email: 'user@example.com' }; // Mock user - no auth required
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<'trainee' | 'trainer' | 'admin'>('trainee');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [selectedStreamSession, setSelectedStreamSession] = useState<string | null>(null);
  const [showCourseStreaming, setShowCourseStreaming] = useState(false);
  const [selectedCourseStream, setSelectedCourseStream] = useState<string | null>(null);
  const [showParticipantView, setShowParticipantView] = useState(false);
  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [launchedJourney, setLaunchedJourney] = useState<{
    journey: TrainingJourney;
    modules: TrainingModule[];
    enrolledReps: Rep[];
  } | null>(null);
  const [showJourneySuccess, setShowJourneySuccess] = useState(false);
  const [showLaunchedDashboard, setShowLaunchedDashboard] = useState(false);
  const [showTraineePortal, setShowTraineePortal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Rep | null>(null);
  const [showManualTraining, setShowManualTraining] = useState(false);
  const [manualTrainingSetupComplete, setManualTrainingSetupComplete] = useState(false);
  const [manualTrainingSetupData, setManualTrainingSetupData] = useState<any>(null);
  const [realModules, setRealModules] = useState<TrainingModule[]>([]);
  const [realJourneys, setRealJourneys] = useState<any[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<any | null>(null);
  const [selectedJourneyModules, setSelectedJourneyModules] = useState<TrainingModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Load real training journeys and convert them to modules
  useEffect(() => {
    const loadTrainingJourneys = async () => {
      try {
        setLoadingModules(true);
        const companyId = Cookies.get('companyId');
        if (!companyId) {
          console.warn('[App] No companyId found, using mock data');
          setRealModules([]);
          setLoadingModules(false);
          return;
        }

        const response = await JourneyService.getJourneysByCompany(companyId);
        console.log('[App] Raw response from JourneyService:', response);
        
        // Handle response format: {data: [...], success: true, count: 31}
        // JourneyService.getJourneysByCompany returns response.data which is the backend response
        let journeys: any[] = [];
        if (Array.isArray(response)) {
          journeys = response;
        } else if (response?.data && Array.isArray(response.data)) {
          // Direct array in data field
          journeys = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          // Nested data structure
          journeys = response.data.data;
        } else if (response?.journeys && Array.isArray(response.journeys)) {
          journeys = response.journeys;
        }
        
        console.log('[App] Extracted journeys:', journeys.length, 'journeys');
        if (journeys.length > 0) {
          console.log('[App] Sample journey:', journeys[0]);
          console.log('[App] Sample journey modules:', journeys[0]?.modules?.length || 0, 'modules');
        }
        
        // Filter active and completed journeys
        const filteredJourneys = journeys.filter((journey: any) => {
          const status = journey.status || journey.journeyStatus;
          return !status || status === 'active' || status === 'completed';
        });

        // Store journeys directly instead of transforming to modules
        setRealJourneys(filteredJourneys);
        console.log('[App] Loaded', filteredJourneys.length, 'journeys');
        if (filteredJourneys.length > 0) {
          console.log('[App] First journey sample:', filteredJourneys[0]);
        } else {
          console.warn('[App] No journeys found!');
        }
        
        // Also keep modules for backward compatibility (empty for now)
        setRealModules([]);
      } catch (error) {
        console.error('[App] Error loading training journeys:', error);
        setRealModules([]);
      } finally {
        setLoadingModules(false);
      }
    };

    loadTrainingJourneys();
  }, []);

  // Use real modules if available, otherwise fallback to mock
  const modulesToUse = realModules.length > 0 ? realModules : mockTrainingModules;
  
  console.log('[App] Using', modulesToUse.length, 'modules (real:', realModules.length, ', mock:', mockTrainingModules.length, ')');

  const { progress, updateModuleProgress, updateStepProgress, updateAssessmentResult } = useTrainingProgress({
    modules: modulesToUse,
    steps: mockOnboardingSteps,
    assessments: mockAssessments,
  });
  
  console.log('[App] Progress modules count:', progress.modules.length);

  const progressStats = {
    completed: progress.steps.filter(step => step.status === 'completed').length,
    inProgress: progress.steps.filter(step => step.status === 'in-progress').length,
    pending: progress.steps.filter(step => step.status === 'pending').length,
    totalModules: progress.totalModules,
    overallProgress: progress.overallProgress,
  };

  const handleModuleProgress = (moduleId: string, progress: number) => {
    updateModuleProgress(moduleId, progress);
  };

  const handleModuleComplete = (moduleId: string) => {
    updateModuleProgress(moduleId, 100);
    
    // Find current module index in selectedJourneyModules
    if (selectedJourneyModules.length > 0) {
      const currentIndex = selectedJourneyModules.findIndex(m => m.id === moduleId);
      if (currentIndex !== -1 && currentIndex < selectedJourneyModules.length - 1) {
        // Move to next module automatically
        const nextModule = selectedJourneyModules[currentIndex + 1];
        setSelectedModule(nextModule.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('[App] Module completed, moving to next module:', nextModule.title);
      } else {
        // Last module completed, redirect to journey training list
        console.log('[App] All modules completed, redirecting to journey training');
    setSelectedModule(null);
        setSelectedJourney(null);
        setSelectedJourneyModules([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // No journey modules, just complete and return to list
      setSelectedModule(null);
    }
  };

  const handleAssessmentComplete = (assessmentId: string, result: any) => {
    updateAssessmentResult(assessmentId, result.score, result.status);
  };

  const handleRoleSwitch = (role: 'trainee' | 'trainer' | 'admin') => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleJourneyComplete = (journey: TrainingJourney, modules: TrainingModule[], enrolledReps: Rep[]) => {
    // Removed verbose logging
    // Hide welcome screen and journey builder
    setShowWelcome(false);
    setShowJourneyBuilder(false);
    // Set journey data and show success page - ensure arrays are never undefined
    setLaunchedJourney({ 
      journey: {
        ...journey,
        targetRoles: journey.targetRoles || []
      }, 
      modules: modules || [], 
      enrolledReps: enrolledReps || [] 
    });
    setShowJourneySuccess(true);
    // Scroll to top when redirecting
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMethodologyApply = (methodology: TrainingMethodology) => {
    console.log('Methodology applied:', methodology);
    // In a real implementation, this would integrate the methodology into the training system
  };

  const handleViewDashboard = () => {
    setShowJourneySuccess(false);
    setShowLaunchedDashboard(false); // Don't show LaunchedJourneyDashboard, use main layout instead
    setHasCompletedSetup(true);
    setShowWelcome(false);
    setActiveTab('dashboard');
    // Reset selected journey/module to show main content
    setSelectedJourney(null);
    setSelectedModule(null);
    setSelectedJourneyModules([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateAnotherJourney = () => {
    setShowJourneySuccess(false);
    setLaunchedJourney(null);
    setShowJourneyBuilder(true);
  };

  const handleViewTraineePortal = (trainee: Rep) => {
    setSelectedTrainee(trainee);
    setShowTraineePortal(true);
  };

  const handleBackFromTraineePortal = () => {
    setShowTraineePortal(false);
    setSelectedTrainee(null);
  };

  // Handlers for JourneySuccess action buttons
  const handlePreviewAsLearner = () => {
    if (launchedJourney && launchedJourney.enrolledReps.length > 0) {
      // Preview as the first enrolled rep
      setSelectedTrainee(launchedJourney.enrolledReps[0]);
      setShowTraineePortal(true);
      setShowJourneySuccess(false);
    } else {
      alert('No enrolled participants to preview. Please enroll participants first.');
    }
  };

  const handleExportReport = () => {
    if (!launchedJourney) return;
    
    // Create a report object
    const report = {
      journey: {
        name: launchedJourney.journey.name,
        description: launchedJourney.journey.description,
        status: launchedJourney.journey.status,
        createdAt: launchedJourney.journey.createdAt
      },
      modules: launchedJourney.modules.map(m => ({
        title: m.title,
        description: m.description,
        duration: m.duration,
        difficulty: m.difficulty,
        learningObjectives: m.learningObjectives,
        assessments: m.assessments?.length || 0
      })),
      participants: launchedJourney.enrolledReps.map(r => ({
        name: r.name,
        email: r.email,
        role: r.role,
        department: r.department
      })),
      summary: {
        totalModules: launchedJourney.modules.length,
        totalParticipants: launchedJourney.enrolledReps.length,
        totalDuration: launchedJourney.modules.reduce((sum, m) => sum + (m.duration || 0), 0),
        totalAssessments: launchedJourney.modules.reduce((sum, m) => sum + (m.assessments?.length || 0), 0)
      },
      exportedAt: new Date().toISOString()
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-journey-report-${launchedJourney.journey.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareJourney = () => {
    if (!launchedJourney) return;
    
    const journeyUrl = `${window.location.origin}/training/journey/${launchedJourney.journey.id}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Training Journey: ${launchedJourney.journey.name}`,
        text: `Check out this training journey: ${launchedJourney.journey.description}`,
        url: journeyUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(journeyUrl);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(journeyUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Journey link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please copy manually: ' + text);
    });
  };

  const handleJourneySettings = () => {
    alert('Journey Settings feature coming soon!\n\nYou will be able to:\n- Edit journey details\n- Modify modules\n- Update launch settings\n- Change notification preferences');
  };

  const handleManageParticipants = () => {
    if (!launchedJourney) return;
    
    const participantList = launchedJourney.enrolledReps.map(r => `- ${r.name} (${r.email})`).join('\n');
    const message = `Current Participants (${launchedJourney.enrolledReps.length}):\n\n${participantList}\n\n\nManage Participants feature coming soon!\n\nYou will be able to:\n- Add new participants\n- Remove participants\n- View participant progress\n- Send individual messages`;
    alert(message);
  };

  const handleSendReminder = () => {
    if (!launchedJourney) return;
    
    const participantCount = launchedJourney.enrolledReps.length;
    if (participantCount === 0) {
      alert('No participants enrolled in this journey.');
      return;
    }

    if (confirm(`Send reminder to ${participantCount} participant(s)?`)) {
      // Simulate sending reminders
      console.log('Sending reminders to:', launchedJourney.enrolledReps.map(r => r.email));
      alert(`Reminders sent successfully to ${participantCount} participant(s)!`);
    }
  };

  // Scroll to top when welcome screen is shown
  useEffect(() => {
    if (!hasCompletedSetup && showWelcome && !showJourneyBuilder && !showManualTraining && !showJourneySuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasCompletedSetup, showWelcome, showJourneyBuilder, showManualTraining, showJourneySuccess]);

  // Show welcome screen for first-time users (but not if showing success page)
  if (!hasCompletedSetup && showWelcome && !showJourneyBuilder && !showManualTraining && !showJourneySuccess) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto p-6 text-center">
          <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to Your Training Platform
          </h1>
          <p className="text-base text-gray-600 mb-6">
            Transform your boring documents into engaging, interactive training experiences. 
            Our AI will help you create professional training programs in minutes, not weeks.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-blue-900 mb-1">Upload & Analyze</div>
              <div className="text-xs text-blue-700">AI analyzes your documents</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <Wand2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-purple-900 mb-1">AI Enhancement</div>
              <div className="text-xs text-purple-700">Creates videos, audio & graphics</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-green-900 mb-1">Interactive Elements</div>
              <div className="text-xs text-green-700">Quizzes, scenarios & simulations</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <Eye className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-orange-900 mb-1">Rehearsal & Launch</div>
              <div className="text-xs text-orange-700">Test before deploying to team</div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Titre de sélection */}
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Your Creation Method</h2>
            
            {/* Cards de choix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Creation */}
              <button
                onClick={() => setShowJourneyBuilder(true)}
                className="group p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-left"
              >
                <Sparkles className="h-8 w-8 mb-3 group-hover:rotate-12 transition-transform" />
                <h3 className="text-xl font-bold mb-2">🤖 AI-Powered Creation</h3>
                <p className="text-xs opacity-90 mb-3">
                  Let AI automatically generate modules, quizzes, and interactive content from your documents.
                </p>
                <div className="flex items-center text-xs font-semibold">
                  <span>Start with AI</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </button>

              {/* Manual Creation */}
              <button
                onClick={() => {
                  console.log('Manual Training clicked!');
                  setShowManualTraining(true);
                }}
                className="group p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-left"
              >
                <Upload className="h-8 w-8 mb-3 group-hover:-translate-y-1 transition-transform" />
                <h3 className="text-xl font-bold mb-2">✍️ Manual Creation</h3>
                <p className="text-xs opacity-90 mb-3">
                  Full control with manual uploads: videos, PDFs, Word docs, YouTube links, and custom quizzes.
                </p>
                <div className="flex items-center text-xs font-semibold">
                  <span>Create Manually</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </button>
            </div>

            {/* Skip button */}
            <button
              onClick={() => { setShowWelcome(false); setHasCompletedSetup(true); }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip setup and explore the platform
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // ✨ NOUVEAU : Afficher le Setup puis le ManualTrainingBuilder
  if (showManualTraining) {
    if (!manualTrainingSetupComplete) {
      return (
        <ManualTrainingSetup
          onComplete={(setupData) => {
            console.log('Setup complete:', setupData);
            setManualTrainingSetupData(setupData);
            setManualTrainingSetupComplete(true);
          }}
          onBack={() => setShowManualTraining(false)}
        />
      );
    }

    return (
      <ManualTrainingBuilder 
        companyId="company-123"
        setupData={manualTrainingSetupData}
        onBack={() => {
          setShowManualTraining(false);
          setManualTrainingSetupComplete(false);
          setManualTrainingSetupData(null);
        }}
      />
    );
  }

  // Check for JourneySuccess first (after launch)
  if (showJourneySuccess && launchedJourney && launchedJourney.journey) {
    return (
      <JourneySuccess
        journey={launchedJourney.journey}
        modules={Array.isArray(launchedJourney.modules) ? launchedJourney.modules : []}
        enrolledReps={Array.isArray(launchedJourney.enrolledReps) ? launchedJourney.enrolledReps.filter(rep => rep != null) : []}
        onViewDashboard={handleViewDashboard}
        onCreateAnother={handleCreateAnotherJourney}
        onPreviewAsLearner={handlePreviewAsLearner}
        onExportReport={handleExportReport}
        onShareJourney={handleShareJourney}
        onJourneySettings={handleJourneySettings}
        onManageParticipants={handleManageParticipants}
        onSendReminder={handleSendReminder}
      />
    );
  }

  if (showJourneyBuilder) {
    return <JourneyBuilder onComplete={handleJourneyComplete} />;
  }

  if (showTraineePortal && selectedTrainee && launchedJourney) {
    return (
      <TraineePortal
        trainee={selectedTrainee}
        journey={launchedJourney.journey}
        modules={launchedJourney.modules}
        methodology={undefined} // Would be passed from journey data
        onProgressUpdate={(moduleId, progress) => updateModuleProgress(moduleId, progress)}
        onModuleComplete={(moduleId) => updateModuleProgress(moduleId, 100)}
        onAssessmentComplete={(assessmentId, score) => updateAssessmentResult(assessmentId, score, score >= 80 ? 'passed' : 'failed')}
        onBack={handleBackFromTraineePortal}
      />
    );
  }

  if (showLaunchedDashboard && launchedJourney) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
        />
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Training Manager View</span>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Journey Active
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreateAnotherJourney}
                className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Rocket className="h-4 w-4" />
                <span>New Journey</span>
              </button>
            </div>
          </div>
          
          <Header 
            repName={user?.name || 'User'} 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 p-6">
            <LaunchedJourneyDashboard
              journey={launchedJourney.journey}
              modules={launchedJourney.modules}
              enrolledReps={launchedJourney.enrolledReps}
              onViewProgress={(repId) => {
                const trainee = launchedJourney.enrolledReps.find(rep => rep.id === repId);
                if (trainee) handleViewTraineePortal(trainee);
              }}
              onViewAnalytics={() => console.log('View analytics')}
            />
          </main>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedModule) {
      // Search in selectedJourneyModules first, then fallback to progress.modules
      const module = selectedJourneyModules.find(m => m.id === selectedModule) 
        || progress.modules.find(m => m.id === selectedModule);
      if (module) {
        return (
          <div className="h-full flex flex-col" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => {
                setSelectedModule(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-4 flex-shrink-0"
            >
              <span>←</span>
              <span>Back to Training Modules</span>
            </button>
            <div className="flex-1 overflow-hidden" style={{ height: '100%', minHeight: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
            <InteractiveModule
              module={module}
              onProgress={(progress) => handleModuleProgress(selectedModule, progress)}
              onComplete={() => handleModuleComplete(selectedModule)}
            />
            </div>
          </div>
        );
      }
    }

    if (userRole === 'trainer') {
      switch (activeTab) {
        case 'dashboard':
          return <TrainerDashboard onTraineeSelect={(trainee) => console.log('Selected trainee:', trainee)} />;
        case 'training':
          return (
            loadingModules ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading training modules...</span>
              </div>
            ) : selectedJourney && selectedJourneyModules.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedJourney(null);
                      setSelectedJourneyModules([]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>←</span>
                    <span>Back to Journeys</span>
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedJourney.title || selectedJourney.name || 'Untitled Journey'}
                  </h2>
                </div>
                <TrainingModules modules={selectedJourneyModules} onModuleSelect={setSelectedModule} />
              </div>
            ) : realJourneys.length > 0 ? (
              <JourneyTraining 
                journeys={realJourneys} 
                onJourneySelect={async (journeyId) => {
                  const journey = realJourneys.find(j => (j.id || j._id) === journeyId);
                  if (journey) {
                    console.log('[App] Journey selected:', journeyId, journey);
                    setSelectedJourney(journey);
                    setLoadingModules(true);
                    
                    try {
                      // Load modules from embedded structure (journey.modules)
                      const journeyIdStr = extractObjectId(journey.id || journey._id) || '';
                      const embeddedModules = journey.modules || [];
                      
                      console.log('[App] Loading modules from embedded structure:', {
                        journeyId: journeyIdStr,
                        modulesCount: embeddedModules.length
                      });
                      
                      let modules: TrainingModule[] = [];
                      
                      if (embeddedModules && Array.isArray(embeddedModules) && embeddedModules.length > 0) {
                        // New embedded structure: modules are directly in journey.modules
                        modules = embeddedModules.map((module: any, index: number) => {
                          // Extract module ID (may be _id or id)
                          const moduleId = extractObjectId(module._id || module.id) || `module-${journeyIdStr}-${index}`;
                          
                          // Extract sections from embedded module
                          const embeddedSections = module.sections || [];
                          const sections = embeddedSections.map((section: any, sectionIndex: number) => ({
                            id: extractObjectId(section._id || section.id) || `section-${moduleId}-${sectionIndex}`,
                            type: section.type || 'document',
                            title: section.title || `Section ${sectionIndex + 1}`,
                            content: section.content || {},
                            duration: section.duration || 0
                          }));
                          
                          // Extract quizzes from embedded module
                          const embeddedQuizzes = module.quizzes || [];
                          const assessments = embeddedQuizzes.map((quiz: any) => ({
                            id: extractObjectId(quiz._id || quiz.id) || `quiz-${moduleId}`,
                            title: quiz.title || 'Quiz',
                            description: quiz.description || '',
                            questions: (quiz.questions || []).map((q: any) => ({
                              id: extractObjectId(q._id || q.id) || `q-${Date.now()}`,
                              text: q.question || '',
                              type: q.type || 'multiple-choice',
                              options: q.options || [],
                              correctAnswer: q.correctAnswer,
                              explanation: q.explanation || '',
                              points: q.points || 10
                            })),
                            passingScore: quiz.passingScore || 70,
                            timeLimit: quiz.timeLimit || 15,
                            maxAttempts: quiz.maxAttempts || 3,
                            settings: quiz.settings || {}
                          }));
                          
                          const topics = Array.isArray(module.topics) 
                            ? module.topics 
                            : (Array.isArray(module.learningObjectives) 
                                ? module.learningObjectives.slice(0, 5).map((obj: any) => typeof obj === 'string' ? obj : obj.text || obj.title || '')
                                : []);
                          
                          const durationHours = module.duration ? Math.round(module.duration / 60 * 10) / 10 : 0;
                          
                          return {
                            id: moduleId,
                            title: module.title || 'Untitled Module',
                            description: module.description || '',
                            duration: durationHours,
                            difficulty: (module.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
                            prerequisites: Array.isArray(module.prerequisites) ? module.prerequisites : [],
                            learningObjectives: Array.isArray(module.learningObjectives) 
                              ? module.learningObjectives.map((obj: any) => typeof obj === 'string' ? obj : obj.text || obj.title || '')
                              : [],
                            assessments: assessments,
                            content: sections,
                            sections: sections,
                            topics: topics,
                            progress: 0,
                            completed: false,
                            order: module.order !== undefined ? module.order : index,
                            quizIds: assessments.map((a: any) => a.id).filter((id: string) => !!id)
                          };
                        });
                      } else {
                        console.warn('[App] Journey has no embedded modules');
                        modules = [];
                      }
                      
                      if (modules.length === 0) {
                        console.error('[App] No modules loaded for journey:', journeyIdStr);
                        alert('No modules found for this journey. Please check the journey configuration.');
                        return;
                      }
                      
                      setSelectedJourneyModules(modules);
                      console.log('[App] Selected journey:', journey.title || journey.name, 'with', modules.length, 'modules');
                      modules.forEach((m, idx) => {
                        const quizIds = (m as any).quizIds;
                        console.log(`[App] Module ${idx + 1} (${m.title}):`, {
                          quizIds: quizIds,
                          hasQuizIds: !!quizIds && Array.isArray(quizIds) && quizIds.length > 0,
                          quizIdsCount: Array.isArray(quizIds) ? quizIds.length : 0,
                          sectionsCount: m.sections?.length || 0,
                          contentCount: m.content?.length || 0
                        });
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                      console.error('[App] Error loading modules:', error);
                      alert('Error loading modules. Please try again.');
                    } finally {
                      setLoadingModules(false);
                    }
                  } else {
                    console.error('[App] Journey not found:', journeyId);
                  }
                }} 
              />
            ) : (
              <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />
            )
          );
        case 'assessments':
          return <AssessmentCenter assessments={progress.assessments} onAssessmentComplete={handleAssessmentComplete} />;
        case 'live-sessions':
          return <LiveSessions sessions={mockLiveSessions} />;
        case 'knowledge-base':
          return <KnowledgeBase items={mockKnowledgeBase} />;
        case 'curriculum-builder':
          return (
            <CurriculumBuilder
              curriculum={mockCurriculumBuilder}
              onSave={(curriculum) => console.log('Save curriculum:', curriculum)}
              onPublish={(curriculum) => console.log('Publish curriculum:', curriculum)}
            />
          );
        case 'streaming':
          if (selectedStreamSession) {
            const session = mockLiveStreamSessions.find(s => s.id === selectedStreamSession);
            if (session) {
              return (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedStreamSession(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Streaming Dashboard
                  </button>
                  <LiveStreamStudio
                    session={session}
                    isInstructor={true}
                    onSessionUpdate={(updatedSession) => console.log('Session updated:', updatedSession)}
                  />
                </div>
              );
            }
          }
          return (
            <StreamingDashboard
              sessions={mockLiveStreamSessions}
              onCreateSession={() => console.log('Create new session')}
              onEditSession={(session) => console.log('Edit session:', session)}
              onDeleteSession={(sessionId) => console.log('Delete session:', sessionId)}
              onStartStream={(sessionId) => setSelectedStreamSession(sessionId)}
            />
          );
        case 'course-streaming':
          if (selectedCourseStream) {
            const session = mockLiveStreamSessions.find(s => s.id === selectedCourseStream);
            const course = progress.modules[0]; // Use first module as example course
            if (session && course) {
              return (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedCourseStream(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Course Streaming
                  </button>
                  {showParticipantView ? (
                    <CourseParticipantView
                      session={session}
                      course={course}
                      participantId="participant-1"
                      onProgress={(progress) => console.log('Participant progress:', progress)}
                      onEngagement={(score) => console.log('Engagement score:', score)}
                    />
                  ) : (
                    <CourseStreamingStudio
                      session={session}
                      course={course}
                      isInstructor={true}
                      onSessionUpdate={(updatedSession) => console.log('Session updated:', updatedSession)}
                      onCourseProgress={(moduleId, progress) => console.log('Course progress:', moduleId, progress)}
                    />
                  )}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowParticipantView(!showParticipantView)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Switch to {showParticipantView ? 'Instructor' : 'Participant'} View
                    </button>
                  </div>
                </div>
              );
            }
          }
          return (
            <CourseStreamingDashboard
              sessions={mockLiveStreamSessions}
              courses={progress.modules}
              onCreateSession={() => console.log('Create new course session')}
              onEditSession={(session) => console.log('Edit course session:', session)}
              onDeleteSession={(sessionId) => console.log('Delete course session:', sessionId)}
              onStartStream={(sessionId) => setSelectedCourseStream(sessionId)}
            />
          );
        case 'document-transformer':
          return (
            <DocumentTransformer
              onComplete={(modules) => console.log('Enhanced modules:', modules)}
            />
          );
        case 'methodology':
          return (
            <MethodologyBuilder
              onApplyMethodology={handleMethodologyApply}
              selectedIndustry="health-insurance"
            />
          );
        default:
          return <TrainerDashboard onTraineeSelect={(trainee) => console.log('Selected trainee:', trainee)} />;
      }
    }

    if (userRole === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <CompanyAnalytics analytics={mockCompanyAnalytics} />;
        case 'training':
          return (
            loadingModules ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading training modules...</span>
              </div>
            ) : (
              realJourneys.length > 0 ? (
                <JourneyTraining 
                  journeys={realJourneys} 
                  onJourneySelect={(journeyId) => {
                    console.log('[App] Journey selected:', journeyId);
                  }} 
                />
              ) : (
                <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />
              )
            )
          );
        case 'assessments':
          return <AssessmentCenter assessments={progress.assessments} onAssessmentComplete={handleAssessmentComplete} />;
        case 'live-sessions':
          return <LiveSessions sessions={mockLiveSessions} />;
        case 'knowledge-base':
          return <KnowledgeBase items={mockKnowledgeBase} />;
        case 'curriculum-builder':
          return (
            <CurriculumBuilder
              curriculum={mockCurriculumBuilder}
              onSave={(curriculum) => console.log('Save curriculum:', curriculum)}
              onPublish={(curriculum) => console.log('Publish curriculum:', curriculum)}
            />
          );
        case 'streaming':
          if (selectedStreamSession) {
            const session = mockLiveStreamSessions.find(s => s.id === selectedStreamSession);
            if (session) {
              return (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedStreamSession(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Streaming Dashboard
                  </button>
                  <LiveStreamStudio
                    session={session}
                    isInstructor={true}
                    onSessionUpdate={(updatedSession) => console.log('Session updated:', updatedSession)}
                  />
                </div>
              );
            }
          }
          return (
            <StreamingDashboard
              sessions={mockLiveStreamSessions}
              onCreateSession={() => console.log('Create new session')}
              onEditSession={(session) => console.log('Edit session:', session)}
              onDeleteSession={(sessionId) => console.log('Delete session:', sessionId)}
              onStartStream={(sessionId) => setSelectedStreamSession(sessionId)}
            />
          );
        case 'course-streaming':
          if (selectedCourseStream) {
            const session = mockLiveStreamSessions.find(s => s.id === selectedCourseStream);
            const course = progress.modules[0]; // Use first module as example course
            if (session && course) {
              return (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedCourseStream(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Course Streaming
                  </button>
                  {showParticipantView ? (
                    <CourseParticipantView
                      session={session}
                      course={course}
                      participantId="participant-1"
                      onProgress={(progress) => console.log('Participant progress:', progress)}
                      onEngagement={(score) => console.log('Engagement score:', score)}
                    />
                  ) : (
                    <CourseStreamingStudio
                      session={session}
                      course={course}
                      isInstructor={true}
                      onSessionUpdate={(updatedSession) => console.log('Session updated:', updatedSession)}
                      onCourseProgress={(moduleId, progress) => console.log('Course progress:', moduleId, progress)}
                    />
                  )}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowParticipantView(!showParticipantView)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Switch to {showParticipantView ? 'Instructor' : 'Participant'} View
                    </button>
                  </div>
                </div>
              );
            }
          }
          return (
            <CourseStreamingDashboard
              sessions={mockLiveStreamSessions}
              courses={progress.modules}
              onCreateSession={() => console.log('Create new course session')}
              onEditSession={(session) => console.log('Edit course session:', session)}
              onDeleteSession={(sessionId) => console.log('Delete course session:', sessionId)}
              onStartStream={(sessionId) => setSelectedCourseStream(sessionId)}
            />
          );
        case 'document-transformer':
          return (
            <DocumentTransformer
              onComplete={(modules) => console.log('Enhanced modules:', modules)}
            />
          );
        case 'methodology':
          return (
            <MethodologyBuilder
              onApplyMethodology={handleMethodologyApply}
              selectedIndustry="health-insurance"
            />
          );
        default:
          return <CompanyAnalytics analytics={mockCompanyAnalytics} />;
      }
    }

    // Trainee view
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProgressOverview stats={progressStats} />
              </div>
              <div>
                <CurrentGig gig={mockGig} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OnboardingSteps steps={progress.steps} />
              </div>
              <div>
                <AIInsights insights={mockAIInsights} userRole={userRole} />
              </div>
            </div>
          </div>
        );
      case 'training':
        return (
          <div className="space-y-6">
            {loadingModules ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading journey training...</span>
              </div>
            ) : selectedJourney && selectedJourneyModules.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedJourney(null);
                      setSelectedJourneyModules([]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>←</span>
                    <span>Back to Journeys</span>
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedJourney.title || selectedJourney.name || 'Untitled Journey'}
                  </h2>
                </div>
                <TrainingModules modules={selectedJourneyModules} onModuleSelect={setSelectedModule} />
              </div>
            ) : realJourneys.length > 0 ? (
              <JourneyTraining 
                journeys={realJourneys} 
                onJourneySelect={(journeyId) => {
                  const journey = realJourneys.find(j => (j.id || j._id) === journeyId);
                  if (journey) {
                    setSelectedJourney(journey);
                    // Transform journey modules to TrainingModule format
                    const modules: TrainingModule[] = (journey.modules || []).map((module: any, index: number) => {
                      const topics = Array.isArray(module.topics) 
                        ? module.topics 
                        : (Array.isArray(module.learningObjectives) 
                            ? module.learningObjectives.slice(0, 5).map((obj: any) => typeof obj === 'string' ? obj : obj.text || obj.title || '')
                            : []);
                      
                      let duration = 0;
                      if (typeof module.duration === 'number') {
                        duration = module.duration;
                      } else if (Array.isArray(module.content) && module.content.length > 0) {
                        duration = module.content.reduce((sum: number, item: any) => {
                          return sum + (item.duration || 0);
                        }, 0);
                      }
                      const durationHours = duration > 0 ? Math.round(duration / 60 * 10) / 10 : 0;
                      
                      return {
                        id: module.id || module._id || `module-${journey.id || journey._id}-${index}`,
                        title: module.title || 'Untitled Module',
                        description: module.description || '',
                        duration: durationHours,
                        difficulty: (module.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
                        prerequisites: Array.isArray(module.prerequisites) ? module.prerequisites : [],
                        learningObjectives: Array.isArray(module.learningObjectives) 
                          ? module.learningObjectives.map((obj: any) => typeof obj === 'string' ? obj : obj.text || obj.title || '')
                          : [],
                        assessments: Array.isArray(module.assessments) ? module.assessments : [],
                        content: Array.isArray(module.content) ? module.content : [],
                        sections: Array.isArray(module.sections) ? module.sections : [],
                        topics: topics,
                        progress: 0,
                        completed: false,
                        order: index,
                        quizIds: Array.isArray(module.quizIds) ? module.quizIds : []
                      };
                    });
                    setSelectedJourneyModules(modules);
                    console.log('[App] Selected journey:', journey.title || journey.name, 'with', modules.length, 'modules');
                    // Scroll to top when selecting a journey
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }} 
              />
            ) : (
            <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />
            )}
          </div>
        );
      case 'assessments':
        return <AssessmentCenter assessments={progress.assessments} onAssessmentComplete={handleAssessmentComplete} />;
      case 'live-sessions':
        return <LiveSessions sessions={mockLiveSessions} />;
      case 'knowledge-base':
        return <KnowledgeBase items={mockKnowledgeBase} />;
      case 'schedule':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
            <p className="text-gray-600">Calendar integration coming soon...</p>
          </div>
        );
      case 'certificates':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificates</h2>
            <p className="text-gray-600">Your earned certificates will appear here...</p>
          </div>
        );
      case 'progress':
        return (
          <div className="space-y-6">
            <ProgressOverview stats={progressStats} />
            <AIInsights insights={mockAIInsights} userRole={userRole} />
          </div>
        );
      case 'document-transformer':
        return (
          <DocumentTransformer
            onComplete={(modules) => console.log('Enhanced modules:', modules)}
          />
        );
      case 'methodology':
        return (
          <MethodologyBuilder
            onApplyMethodology={handleMethodologyApply}
            selectedIndustry="health-insurance"
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Sidebar - Always rendered first */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content - Always has margin on md+ screens */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300 w-full">
        {/* Fixed Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">View as:</span>
              <div className="flex items-center space-x-2">
                {(['trainee', 'trainer', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      userRole === role
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAITutor(!showAITutor)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <User className="h-4 w-4" />
              <span>AI Tutor</span>
            </button>
            <button
              onClick={() => setShowJourneyBuilder(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>New Journey (IA)</span>
            </button>
            <button
              onClick={() => setShowManualTraining(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Manual Training</span>
            </button>
          </div>
        </div>
        
        {/* Fixed Header */}
        <div className="sticky top-[42px] z-10">
        <Header 
            repName={getCurrentUserName()} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        </div>
        
        <main className={`flex-1 flex gap-6 overflow-hidden ${selectedModule ? 'p-6 pb-0' : 'p-6'}`} style={{ display: 'flex', flexDirection: 'row', height: '100%', minHeight: 0 }}>
          <div className="flex-1 overflow-hidden" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
          
          {showAITutor && (
            <div className="w-96 flex-shrink-0">
              <AITutor 
                tutor={mockAITutor}
                currentModule={selectedModule || undefined}
                onSuggestion={(suggestion) => console.log('AI Suggestion:', suggestion)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;