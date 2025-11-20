// src/components/Trainer/TrainerView.tsx
import React, { useState, useEffect } from 'react';
import { TrainingJourney, TrainingModule, Rep } from '../../types';
import TrainerDashboard from './TrainerDashboard';
import LaunchedJourneyDashboard from '../Dashboard/LaunchedJourneyDashboard';
import JourneyBuilder from '../JourneyBuilder/JourneyBuilder';
import JourneySuccess from '../JourneyBuilder/JourneySuccess';
import TraineePortal from '../Trainee/TraineePortal';
import { TrainerService } from '../../infrastructure/services/TrainerService';
import Cookies from 'js-cookie';
import { Sparkles, Upload, Wand2, Zap, Eye } from 'lucide-react';
import { ManualTrainingSetup, ManualTrainingBuilder } from '../ManualTraining';

interface TrainerViewProps {
  onBack?: () => void;
}

export default function TrainerView({ onBack }: TrainerViewProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);
  const [showJourneySuccess, setShowJourneySuccess] = useState(false);
  const [showLaunchedDashboard, setShowLaunchedDashboard] = useState(false);
  const [showTraineePortal, setShowTraineePortal] = useState(false);
  const [showManualTraining, setShowManualTraining] = useState(false);
  const [manualTrainingSetupComplete, setManualTrainingSetupComplete] = useState(false);
  const [manualTrainingSetupData, setManualTrainingSetupData] = useState<any>(null);
  const [selectedTrainee, setSelectedTrainee] = useState<Rep | null>(null);
  const [launchedJourney, setLaunchedJourney] = useState<{
    journey: TrainingJourney;
    modules: TrainingModule[];
    enrolledReps: Rep[];
  } | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [gigId, setGigId] = useState<string | null>(null);

  useEffect(() => {
    const companyIdFromCookie = Cookies.get('companyId');
    const gigIdFromCookie = Cookies.get('currentGigId');
    setCompanyId(companyIdFromCookie || null);
    setGigId(gigIdFromCookie || null);
    
    // Check if setup was already completed (from localStorage or cookie)
    const setupCompleted = Cookies.get('trainingSetupCompleted') === 'true' || localStorage.getItem('trainingSetupCompleted') === 'true';
    if (setupCompleted) {
      setHasCompletedSetup(true);
      setShowWelcome(false);
    }
  }, []);

  const handleJourneyComplete = (journey: TrainingJourney, modules: TrainingModule[], enrolledReps: Rep[]) => {
    setShowJourneyBuilder(false);
    setLaunchedJourney({
      journey: {
        ...journey,
        targetRoles: journey.targetRoles || []
      },
      modules: modules || [],
      enrolledReps: enrolledReps || []
    });
    setShowJourneySuccess(true);
  };

  const handleViewDashboard = () => {
    setShowJourneySuccess(false);
    setShowLaunchedDashboard(true);
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

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    setHasCompletedSetup(true);
    Cookies.set('trainingSetupCompleted', 'true', { expires: 365 });
    localStorage.setItem('trainingSetupCompleted', 'true');
  };

  // Show Welcome Screen for trainers (first time)
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
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Your Creation Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowJourneyBuilder(true);
                    setShowWelcome(false);
                  }}
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

                <button
                  onClick={() => {
                    setShowManualTraining(true);
                    setShowWelcome(false);
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

              <button
                onClick={handleSkipWelcome}
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

  // Show Manual Training Setup
  if (showManualTraining) {
    if (!manualTrainingSetupComplete) {
      return (
        <ManualTrainingSetup
          onComplete={(setupData) => {
            setManualTrainingSetupData(setupData);
            setManualTrainingSetupComplete(true);
          }}
          onBack={() => {
            setShowManualTraining(false);
            setShowWelcome(true);
          }}
        />
      );
    }

    return (
      <ManualTrainingBuilder 
        companyId={companyId || "company-123"}
        setupData={manualTrainingSetupData}
        onBack={() => {
          setShowManualTraining(false);
          setManualTrainingSetupComplete(false);
          setManualTrainingSetupData(null);
          setShowWelcome(true);
        }}
      />
    );
  }

  // Show Journey Success
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

  // Show Launched Dashboard
  if (showLaunchedDashboard && launchedJourney) {
    return (
      <LaunchedJourneyDashboard
        journey={launchedJourney.journey}
        modules={launchedJourney.modules}
        enrolledReps={launchedJourney.enrolledReps}
        onViewProgress={(repId) => {
          const trainee = launchedJourney.enrolledReps.find(rep => rep.id === repId);
          if (trainee) handleViewTraineePortal(trainee);
        }}
      />
    );
  }

  // Show Trainee Portal (for preview)
  if (showTraineePortal && selectedTrainee && launchedJourney) {
    return (
      <TraineePortal
        trainee={selectedTrainee}
        journey={launchedJourney.journey}
        modules={launchedJourney.modules}
        onProgressUpdate={() => {}}
        onModuleComplete={() => {}}
        onAssessmentComplete={() => {}}
        onBack={handleBackFromTraineePortal}
      />
    );
  }

  // Show Journey Builder
  if (showJourneyBuilder) {
    return (
      <JourneyBuilder
        onComplete={handleJourneyComplete}
      />
    );
  }

  // Default: Show Trainer Dashboard
  return (
    <TrainerDashboard
      onTraineeSelect={(trainee) => console.log('Selected trainee:', trainee)}
      companyId={companyId || undefined}
      gigId={gigId || undefined}
    />
  );
}

