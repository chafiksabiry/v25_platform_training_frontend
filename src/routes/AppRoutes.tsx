import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TrainerDashboard from '../components/Trainer/TrainerDashboard';
import TraineePortal from '../components/Trainee/TraineePortal';
import ProgressOverview from '../components/Dashboard/ProgressOverview';
import CurrentGig from '../components/Dashboard/CurrentGig';
import OnboardingSteps from '../components/Dashboard/OnboardingSteps';
import TrainingModules from '../components/Training/TrainingModules';
import AssessmentCenter from '../components/Assessment/AssessmentCenter';
import KnowledgeBase from '../components/KnowledgeBase/KnowledgeBase';
import LiveSessions from '../components/LiveSessions/LiveSessions';
import AITutor from '../components/AI/AITutor';
import AIInsights from '../components/AI/AIInsights';
import CompanyAnalytics from '../components/Analytics/CompanyAnalytics';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import { getCurrentUserName } from '../utils/userUtils';
import Cookies from 'js-cookie';
import { mockRep } from '../data/mockData';

/**
 * Trainee Dashboard Component
 * Main dashboard for trainees showing their progress and available training
 */
function TraineeDashboardRoute() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        repName={getCurrentUserName()} 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <ProgressOverview />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CurrentGig />
                <OnboardingSteps steps={mockOnboardingSteps} />
              </div>
              <div>
                <TrainingModules modules={mockTrainingModules} onModuleSelect={() => {}} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Trainer Dashboard Route Component
 * Wrapper for TrainerDashboard with routing support
 */
function TrainerDashboardRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId') || Cookies.get('companyId') || undefined;
  const gigId = searchParams.get('gigId') || undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        repName={getCurrentUserName()} 
        onMenuToggle={() => {}}
      />
      <TrainerDashboard 
        companyId={companyId}
        gigId={gigId}
        onTraineeSelect={(trainee) => {
          // Navigate to trainee portal or show trainee details
          console.log('Selected trainee:', trainee);
        }}
      />
    </div>
  );
}

/**
 * Main App Routes Component
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" element={<TrainerDashboardRoute />} />
      
      {/* Trainee Routes */}
      <Route path="/trainee/dashboard" element={<TraineeDashboardRoute />} />
      
      {/* Default redirect - can be customized based on user role */}
      <Route path="/" element={<Navigate to="/trainee/dashboard" replace />} />
      
      {/* Catch all - redirect to trainee dashboard */}
      <Route path="*" element={<Navigate to="/trainee/dashboard" replace />} />
    </Routes>
  );
}

