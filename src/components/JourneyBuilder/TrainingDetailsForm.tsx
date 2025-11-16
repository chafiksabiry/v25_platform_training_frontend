import React, { useState } from 'react';
import { Target, ArrowLeft, ArrowRight } from 'lucide-react';

interface TrainingDetailsFormProps {
  onComplete: (data: { trainingName: string; trainingDescription: string; estimatedDuration: string }) => void;
  onBack: () => void;
  gigData?: any;
}

export default function TrainingDetailsForm({ onComplete, onBack, gigData }: TrainingDetailsFormProps) {
  const [trainingName, setTrainingName] = useState(gigData?.title || gigData?.name || '');
  const [trainingDescription, setTrainingDescription] = useState(gigData?.description || '');
  const [estimatedDuration, setEstimatedDuration] = useState('2400'); // 1 week default

  const handleSubmit = () => {
    onComplete({
      trainingName,
      trainingDescription,
      estimatedDuration
    });
  };

  const canProceed = trainingName.trim() && estimatedDuration;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Training Details</h3>
              <p className="text-gray-600">Define your training program</p>
            </div>

            <div className="space-y-6">
              {/* Training Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Name *
                </label>
                <input
                  type="text"
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="e.g., Sales Onboarding Program"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what this training covers..."
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (in minutes) *
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="e.g., 60, 120, 480..."
                  min="1"
                />
                <p className="mt-2 text-sm text-gray-600 mb-3">
                  Enter the duration in minutes
                </p>
                
                {/* Duration Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Suggestions:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { label: '30 minutes', value: '30' },
                      { label: '1 hour (60 min)', value: '60' },
                      { label: '2 hours (120 min)', value: '120' },
                      { label: '3 hours (180 min)', value: '180' },
                      { label: '4 hours (240 min)', value: '240' },
                      { label: '1 day (480 min)', value: '480' },
                      { label: '2 days (960 min)', value: '960' },
                      { label: '3 days (1440 min)', value: '1440' },
                      { label: '1 week (2400 min)', value: '2400' },
                      { label: '2 weeks (4800 min)', value: '4800' },
                      { label: '1 month (9600 min)', value: '9600' },
                      { label: '3 months (28800 min)', value: '28800' },
                    ].map((suggestion) => (
                      <button
                        key={suggestion.value}
                        type="button"
                        onClick={() => setEstimatedDuration(suggestion.value)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          estimatedDuration === suggestion.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                            : 'border-gray-300 hover:border-purple-300 text-gray-700'
                        }`}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg flex items-center space-x-2"
              >
                <span>Continue to Curriculum</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

