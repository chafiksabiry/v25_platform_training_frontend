import React, { useState, useEffect } from 'react';
import { Building2, Users, Target, ArrowRight, CheckCircle, Sparkles, Zap, Video, FileText, Loader2, Briefcase } from 'lucide-react';
import { Company, TrainingJourney } from '../../types/core';
import { Industry, GigFromApi } from '../../types';
import { TrainingMethodology } from '../../types/methodology';
import MethodologySelector from './MethodologySelector';
import MethodologyBuilder from '../Methodology/MethodologyBuilder';
import { OnboardingService } from '../../infrastructure/services/OnboardingService';
import GigSelector from '../Dashboard/GigSelector';

interface SetupWizardProps {
  onComplete: (company: Company, journey: TrainingJourney, methodology?: TrainingMethodology) => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [company, setCompany] = useState<Partial<Company>>({});
  const [companyData, setCompanyData] = useState<any>(null);
  const [journey, setJourney] = useState<Partial<TrainingJourney>>({});
  const [selectedMethodology, setSelectedMethodology] = useState<TrainingMethodology | null>(null);
  const [showMethodologySelector, setShowMethodologySelector] = useState(false);
  const [showMethodologyBuilder, setShowMethodologyBuilder] = useState(false);
  
  // Industries and Gigs state
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [selectedGig, setSelectedGig] = useState<GigFromApi | null>(null);
  const [showGigSelector, setShowGigSelector] = useState(false);

  // Fetch company data on mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoadingCompany(true);
        const response = await OnboardingService.fetchCompanyData();
        if (response.success && response.data) {
          setCompanyData(response.data);
          // Set company name and industry from API
          setCompany(prev => ({ 
            ...prev, 
            name: response.data.name,
            industry: response.data.industry 
          }));
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const response = await OnboardingService.fetchIndustries();
        if (response.success && response.data) {
          setIndustries(response.data.filter(ind => ind.isActive));
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  const steps = [
    { 
      id: 1, 
      title: 'Company Information', 
      icon: Building2, 
      description: 'Select your industry',
      features: ['Auto-load company data', 'Industry-specific templates', 'Smart defaults']
    },
    { 
      id: 2, 
      title: 'Select Gig/Role', 
      icon: Briefcase, 
      description: 'Choose the position this training is for',
      features: ['Filtered by industry', 'Role-based paths', 'Skill assessments']
    }
  ];

  const handleNext = () => {
    if (currentStep === 2) {
      // Complete setup and move to content upload
      const completeCompany: Company = {
        id: Date.now().toString(),
        name: companyData?.name || company.name || '',
        industry: company.industry || '',
        size: company.size || 'medium',
        setupComplete: true,
      };

      const completeJourney: TrainingJourney = {
        id: Date.now().toString(),
        companyId: completeCompany.id,
        name: selectedGig?.title || 'New Training Journey',
        description: selectedGig?.description || '',
        status: 'draft',
        steps: [
          {
            id: '1',
            title: 'Upload & Transform Content',
            description: 'Upload existing materials and let AI transform them into engaging content',
            type: 'content-upload',
            status: 'pending',
            order: 1,
            estimatedTime: '15 minutes',
            requirements: ['Documents', 'Videos', 'Presentations'],
            outputs: ['Enhanced content', 'Media elements', 'Interactive components']
          },
          {
            id: '2',
            title: 'AI Content Enhancement',
            description: 'AI analyzes and enhances your content with multimedia elements',
            type: 'ai-analysis',
            status: 'pending',
            order: 2,
            estimatedTime: '10 minutes',
            requirements: ['Uploaded content'],
            outputs: ['Videos', 'Audio narration', 'Infographics', 'Interactive elements']
          },
          {
            id: '3',
            title: 'Curriculum Design',
            description: 'Structure your enhanced content into learning modules',
            type: 'curriculum-design',
            status: 'pending',
            order: 3,
            estimatedTime: '20 minutes',
            requirements: ['Enhanced content'],
            outputs: ['Learning modules', 'Assessments', 'Progress tracking']
          },
          {
            id: '4',
            title: 'Live Training Setup',
            description: 'Configure live streaming and interactive sessions',
            type: 'live-setup',
            status: 'pending',
            order: 4,
            estimatedTime: '10 minutes',
            requirements: ['Curriculum'],
            outputs: ['Live sessions', 'Interactive features', 'Recording setup']
          },
          {
            id: '5',
            title: 'Launch & Monitor',
            description: 'Deploy your training program and track progress',
            type: 'launch',
            status: 'pending',
            order: 5,
            estimatedTime: '5 minutes',
            requirements: ['Complete setup'],
            outputs: ['Live training program', 'Analytics dashboard', 'Progress reports']
          }
        ],
        createdAt: new Date().toISOString(),
        estimatedDuration: journey.estimatedDuration || '1 hour total setup',
        targetRoles: journey.targetRoles || [],
      };

      onComplete(completeCompany, completeJourney, selectedMethodology || undefined);
    } else if (currentStep === 3) {
      setShowMethodologySelector(true);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGigSelect = (gig: GigFromApi) => {
    setSelectedGig(gig);
  };

  const handleMethodologySelect = (methodology: TrainingMethodology) => {
    setSelectedMethodology(methodology);
    setShowMethodologySelector(false);
    // Move to next step after methodology selection
    setCurrentStep(4);
  };

  const handleMethodologyApply = (methodology: TrainingMethodology) => {
    setSelectedMethodology(methodology);
    setShowMethodologyBuilder(false);
    // Move to next step after methodology application
    setCurrentStep(4);
  };

  const handleCustomMethodology = () => {
    setShowMethodologySelector(false);
    // Continue without methodology
    setCurrentStep(4);
  };

  if (showMethodologySelector) {
    return (
      <MethodologySelector
        onMethodologySelect={handleMethodologySelect}
        onCustomMethodology={handleCustomMethodology}
      />
    );
  }

  if (showMethodologyBuilder) {
    return (
      <MethodologyBuilder
        onApplyMethodology={handleMethodologyApply}
        selectedIndustry={company.industry}
      />
    );
  }
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Training Journey</h3>
              <p className="text-gray-600">Select your training industry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {steps[0].features.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 font-medium">{feature}</p>
                </div>
              ))}
            </div>

            {loadingCompany ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading company information...</p>
              </div>
            ) : companyData ? (
              <div className="space-y-6">
                {/* Display Company Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    {companyData.logo && (
                      <img 
                        src={companyData.logo} 
                        alt={companyData.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{companyData.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{companyData.industry}</p>
                      <p className="text-gray-700 leading-relaxed">{companyData.overview}</p>
                    </div>
                  </div>
                </div>

                {/* Industry Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Training Industry *
                  </label>
                  {loadingIndustries ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                      <span className="text-gray-600">Loading industries...</span>
                    </div>
                  ) : (
                    <select
                      value={company.industry || ''}
                      onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">Select the industry for training</option>
                      {industries.map((industry) => (
                        <option key={industry._id} value={industry.name}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Failed to load company information</p>
              </div>
            )}

            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'startup', label: 'Startup', desc: '1-10 employees' },
                    { value: 'small', label: 'Small Business', desc: '11-50 employees' },
                    { value: 'medium', label: 'Medium Company', desc: '51-200 employees' },
                    { value: 'large', label: 'Large Enterprise', desc: '201-1000 employees' },
                    { value: 'enterprise', label: 'Enterprise', desc: '1000+ employees' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setCompany({ ...company, size: size.value as Company['size'] })}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        company.size === size.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">{size.label}</div>
                      <div className="text-sm text-gray-600">{size.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gig Selection */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                  Select Your Gig *
                </h3>
                <GigSelector
                  industryFilter={company.industry}
                  onGigSelect={handleGigSelect}
                  selectedGigId={selectedGig?._id}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Gig/Role</h3>
              <p className="text-gray-600">Choose the position this training is for</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {steps[1].features.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-green-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">{feature}</p>
                </div>
              ))}
            </div>

            <GigSelector
              industryFilter={company.industry}
              onGigSelect={handleGigSelect}
              selectedGigId={selectedGig?._id}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return companyData && company.industry && selectedGig !== null;
      case 2:
        return true; // Gig selected, can proceed
      default:
        return true;
    }
  };

  const handleGigSelect = (gig: GigFromApi) => {
    setSelectedGig(gig);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 mb-6">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Training Journey Builder</span>
                    { role: 'Product Specialists', dept: 'Product', icon: '⚙️' },
                    { role: 'New Hires', dept: 'All Departments', icon: '🌟' },
                    { role: 'Team Leaders', dept: 'Management', icon: '👥' },
                    { role: 'All Employees', dept: 'Company-wide', icon: '🏢' },
                  ].map((item) => (
                    <label key={item.role} className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={journey.targetRoles?.includes(item.role) || false}
                        onChange={(e) => {
                          const currentRoles = journey.targetRoles || [];
                          if (e.target.checked) {
                            setJourney({ ...journey, targetRoles: [...currentRoles, item.role] });
                          } else {
                            setJourney({ ...journey, targetRoles: currentRoles.filter(r => r !== item.role) });
                          }
                        }}
                        className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{item.role}</div>
                          <div className="text-sm text-gray-600">{item.dept}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  What Happens Next?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Upload & Transform</div>
                        <div className="text-sm text-blue-700">AI transforms your documents into engaging content</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Media Generation</div>
                        <div className="text-sm text-blue-700">Create videos, audio, and interactive elements</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Smart Curriculum</div>
                        <div className="text-sm text-blue-700">AI designs optimal learning paths</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Launch & Track</div>
                        <div className="text-sm text-blue-700">Deploy and monitor progress in real-time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
              <p className="text-gray-600">Your 360° training methodology is configured. Ready to transform your content!</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
              <h4 className="text-xl font-semibold text-green-900 mb-4">360° Methodology Applied Successfully</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Company Setup</h5>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>• {company.name}</div>
                    <div>• {company.industry}</div>
                    <div>• {company.size} company</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Selected Gig</h5>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>• {selectedGig?.title || 'No gig selected'}</div>
                    <div>• {selectedGig?.category || ''}</div>
                    <div>• {selectedGig?.seniority.level || ''}</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Training Program</h5>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>• {journey.name}</div>
                    <div>• {journey.estimatedDuration}</div>
                    <div>• {journey.targetRoles?.length || 0} target roles</div>
                  </div>
                </div>
              </div>
              
              {selectedMethodology && (
                <div className="mb-4">
                  <h5 className="font-semibold text-green-900 mb-3">360° Methodology Components:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMethodology.components.slice(0, 6).map((component, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{component.title} ({component.estimatedDuration}h)</span>
                      </div>
                    ))}
                    {selectedMethodology.components.length > 6 && (
                      <div className="text-sm text-green-600 font-medium">
                        +{selectedMethodology.components.length - 6} more components
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <p className="text-green-700 font-medium">
                  Next: Upload your content and AI will enhance it with {selectedMethodology ? '360° methodology components' : 'multimedia elements'}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return companyData && company.industry && selectedGig !== null;
      case 2:
        return true; // Gig selected, can proceed
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 mb-6">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Training Journey Builder</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Amazing Training in Minutes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your existing content into engaging, interactive training programs with the power of AI
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-lg'
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-8 w-8" />
                        ) : (
                          <Icon className="h-8 w-8" />
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <div className={`text-sm font-semibold ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 max-w-24">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Back
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Step {currentStep} of {steps.length}</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg flex items-center space-x-2"
            >
              <span>{currentStep === 4 ? 'Start Building' : currentStep === 3 ? 'Choose Methodology' : 'Continue'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}