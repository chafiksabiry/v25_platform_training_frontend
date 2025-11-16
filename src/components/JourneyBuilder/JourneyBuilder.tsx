import React, { useState } from 'react';
import { CheckCircle, Clock, ArrowRight, Sparkles, Upload, Wand2, Rocket } from 'lucide-react';
import SetupWizard from './SetupWizard';
import ContentUploader from './ContentUploader';
import CurriculumDesigner from './CurriculumDesigner';
import RehearsalMode from './RehearsalMode';
import LaunchApproval from './LaunchApproval';
import { Company, TrainingJourney, ContentUpload, TrainingModule, Rep, RehearsalFeedback } from '../../types';
import { TrainingMethodology } from '../../types/methodology';

interface JourneyBuilderProps {
  onComplete: (journey: TrainingJourney, modules: TrainingModule[], enrolledReps: Rep[]) => void;
}

export default function JourneyBuilder({ onComplete }: JourneyBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [company, setCompany] = useState<Company | null>(null);
  const [journey, setJourney] = useState<TrainingJourney | null>(null);
  const [methodology, setMethodology] = useState<TrainingMethodology | null>(null);
  const [uploads, setUploads] = useState<ContentUpload[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [rehearsalFeedback, setRehearsalFeedback] = useState<RehearsalFeedback[]>([]);
  const [rehearsalRating, setRehearsalRating] = useState(0);
  const [showLaunchApproval, setShowLaunchApproval] = useState(false);

  const steps = [
    { 
      title: 'Setup & Vision', 
      component: 'setup',
      icon: Sparkles,
      description: 'Define your company and training goals',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      title: 'Upload & Transform', 
      component: 'upload',
      icon: Upload,
      description: 'Upload content and let AI analyze it',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      title: 'Curriculum Design', 
      component: 'design',
      icon: Wand2,
      description: 'AI creates multimedia training modules',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Test & Launch', 
      component: 'rehearsal',
      icon: Rocket,
      description: 'Rehearse, approve, and deploy to your team',
      color: 'from-pink-500 to-red-500'
    }
  ];

  const handleSetupComplete = (newCompany: Company, newJourney: TrainingJourney, selectedMethodology?: TrainingMethodology) => {
    setCompany(newCompany);
    setJourney(newJourney);
    if (selectedMethodology) {
      setMethodology(selectedMethodology);
    }
    setCurrentStep(1);
  };

  const handleUploadComplete = (newUploads: ContentUpload[]) => {
    setUploads(newUploads);
    setCurrentStep(2); // Go directly to Curriculum Design
  };

  const handleCurriculumComplete = (newModules: TrainingModule[]) => {
    // If methodology is selected, enhance modules with methodology-specific content
    if (methodology) {
      const enhancedModules = enhanceModulesWithMethodology(newModules, methodology);
      setModules(enhancedModules);
    } else {
      setModules(newModules);
    }
    setModules(newModules);
    setCurrentStep(3); // Go to Test & Launch
  };

  const enhanceModulesWithMethodology = (modules: TrainingModule[], methodology: TrainingMethodology): TrainingModule[] => {
    return modules.map((module, index) => {
      const methodologyComponent = methodology.components[index % methodology.components.length];
      
      return {
        ...module,
        title: `${methodologyComponent.title} - ${module.title}`,
        description: `${module.description} Enhanced with ${methodology.name} methodology.`,
        duration: module.duration + methodologyComponent.estimatedDuration,
        difficulty: methodologyComponent.competencyLevel === 'expert' ? 'advanced' : 
                   methodologyComponent.competencyLevel === 'proficient' ? 'intermediate' : 'beginner',
        prerequisites: [...module.prerequisites, ...methodologyComponent.prerequisites],
        learningObjectives: [
          ...module.learningObjectives,
          ...methodology.learningFramework.learningObjectives
            .filter(obj => obj.level === 'apply' || obj.level === 'analyze')
            .map(obj => obj.description)
        ]
      };
    });
  };
  const handleRehearsalComplete = (feedback: RehearsalFeedback[], rating: number) => {
    setRehearsalFeedback(feedback);
    setRehearsalRating(rating);
    setShowLaunchApproval(true);
  };

  const handleLaunch = (finalJourney: TrainingJourney, enrolledReps: Rep[]) => {
    onComplete(finalJourney, modules, enrolledReps);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <SetupWizard onComplete={handleSetupComplete} />;
      case 1:
        return (
          <ContentUploader
            onComplete={handleUploadComplete}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <CurriculumDesigner
            uploads={uploads}
            methodology={methodology}
            onComplete={handleCurriculumComplete}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        if (!showLaunchApproval) {
          return journey ? (
            <RehearsalMode
              journey={journey}
              modules={modules}
              methodology={methodology}
              onComplete={handleRehearsalComplete}
              onBack={() => setCurrentStep(2)}
            />
          ) : null;
        } else {
          return journey ? (
            <LaunchApproval
              journey={journey}
              modules={modules}
              rehearsalFeedback={rehearsalFeedback}
              rehearsalRating={rehearsalRating}
              onLaunch={handleLaunch}
              onBackToRehearsal={() => setShowLaunchApproval(false)}
              onBack={() => setCurrentStep(2)}
            />
          ) : null;
        }
      default:
        return null;
    }
  };

  // Show setup wizard without progress for first step
  if (currentStep === 0) {
    return renderCurrentStep();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Company Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {company?.name?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {journey?.name || 'Training Journey Builder'}
                  </h1>
                  <p className="text-gray-600">
                    {company?.name} • {company?.industry} • Step {currentStep + 1} of {steps.length}
                    {methodology && ` • ${methodology.name}`}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  const isPending = currentStep < index;

                  return (
                    <div key={index} className="flex flex-col items-center relative z-10">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border-4 transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg scale-110'
                          : isActive
                          ? `bg-gradient-to-r ${step.color} border-transparent text-white shadow-xl scale-125`
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-8 w-8" />
                        ) : isActive ? (
                          <Icon className="h-8 w-8 animate-pulse" />
                        ) : (
                          <Icon className="h-8 w-8" />
                        )}
                      </div>
                      
                      <div className="mt-4 text-center max-w-32">
                        <div className={`text-sm font-bold transition-colors ${
                          isActive ? 'text-purple-600' : 
                          isCompleted ? 'text-green-600' : 
                          'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Line */}
              <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {renderCurrentStep()}
      </div>
    </div>
  );
}