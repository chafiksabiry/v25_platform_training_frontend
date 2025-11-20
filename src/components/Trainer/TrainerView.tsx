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

interface TrainerViewProps {
  onBack?: () => void;
}

export default function TrainerView({ onBack }: TrainerViewProps) {
  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);
  const [showJourneySuccess, setShowJourneySuccess] = useState(false);
  const [showLaunchedDashboard, setShowLaunchedDashboard] = useState(false);
  const [showTraineePortal, setShowTraineePortal] = useState(false);
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

