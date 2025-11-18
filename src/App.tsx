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
import PPTExportTester from './components/Demo/PPTExportTester';
import QuickPPTExport from './components/Demo/QuickPPTExport';
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

  const { progress, updateModuleProgress, updateStepProgress, updateAssessmentResult } = useTrainingProgress({
    modules: mockTrainingModules,
    steps: mockOnboardingSteps,
    assessments: mockAssessments,
  });

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
    setSelectedModule(null);
  };

  const handleAssessmentComplete = (assessmentId: string, result: any) => {
    updateAssessmentResult(assessmentId, result.score, result.status);
  };

  const handleRoleSwitch = (role: 'trainee' | 'trainer' | 'admin') => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleJourneyComplete = (journey: TrainingJourney, modules: TrainingModule[], enrolledReps: Rep[]) => {
    console.log('🎉 Journey completed, redirecting to success page:', {
      journey: journey.name,
      modules: modules.length,
      enrolledReps: enrolledReps.length
    });
    // Hide welcome screen and journey builder
    setShowWelcome(false);
    setShowJourneyBuilder(false);
    // Set journey data and show success page
    setLaunchedJourney({ journey, modules, enrolledReps });
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
    setShowLaunchedDashboard(true);
    setHasCompletedSetup(true);
    setShowWelcome(false);
    setActiveTab('dashboard');
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
  if (showJourneySuccess && launchedJourney) {
    return (
      <JourneySuccess
        journey={launchedJourney.journey}
        modules={launchedJourney.modules}
        enrolledReps={launchedJourney.enrolledReps}
        onViewDashboard={handleViewDashboard}
        onCreateAnother={handleCreateAnotherJourney}
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
      const module = progress.modules.find(m => m.id === selectedModule);
      if (module) {
        return (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedModule(null)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Training Modules
            </button>
            <InteractiveModule
              module={module}
              onProgress={(progress) => handleModuleProgress(selectedModule, progress)}
              onComplete={() => handleModuleComplete(selectedModule)}
            />
          </div>
        );
      }
    }

    if (userRole === 'trainer') {
      switch (activeTab) {
        case 'dashboard':
          return <TrainerDashboard onTraineeSelect={(trainee) => console.log('Selected trainee:', trainee)} />;
        case 'training':
          return <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />;
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
          return <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />;
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
            <TrainingModules modules={progress.modules} onModuleSelect={setSelectedModule} />
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
      
      {/* Bouton flottant pour export PPT */}
      <QuickPPTExport />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
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
                    {role.charAt(0).toUpperCase() + role.slice(1)}
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
        
        <Header 
          repName={getCurrentUserName()} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 flex gap-6">
          <div className="flex-1">
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