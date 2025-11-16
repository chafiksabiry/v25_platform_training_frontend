import React, { useState, useEffect } from 'react';
import { Target, ArrowLeft, ArrowRight } from 'lucide-react';

interface TrainingDetailsFormProps {
  onComplete: (data: { trainingName: string; trainingDescription: string; estimatedDuration: string }) => void;
  onBack: () => void;
  gigData?: any;
}

export default function TrainingDetailsForm({ onComplete, onBack, gigData }: TrainingDetailsFormProps) {
  const [trainingName, setTrainingName] = useState(gigData?.title || gigData?.name || '');
  const [trainingDescription, setTrainingDescription] = useState(gigData?.description || '');
  const [estimatedDuration, setEstimatedDuration] = useState('120'); // Quick Start default (1-2 hours = 120 min)

  const handleSubmit = () => {
    onComplete({
      trainingName,
      trainingDescription,
      estimatedDuration
    });
  };

  const canProceed = trainingName.trim() && estimatedDuration;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-4 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Training Details</h3>
              <p className="text-gray-600">Define your training program</p>
            </div>

            <div className="space-y-6">
              {/* Training Program Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Program Name *
                </label>
                <input
                  type="text"
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="e.g., Customer Success Mastery Program"
                />
              </div>

              {/* Program Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Description
                </label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the goals, outcomes, and key benefits of this training program..."
                />
              </div>

              {/* Expected Program Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Program Duration
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '120', label: 'Quick Start', desc: '1-2 hours' },
                    { value: '240', label: 'Half Day', desc: '3-4 hours' },
                    { value: '480', label: 'Full Day', desc: '6-8 hours' },
                    { value: '2400', label: 'One Week', desc: 'Multi-session' },
                    { value: '4800', label: 'Two Weeks', desc: 'Comprehensive' },
                    { value: '9600', label: 'One Month', desc: 'Deep Learning' },
                  ].map((duration) => (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => setEstimatedDuration(duration.value)}
                      className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                        estimatedDuration === duration.value
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold text-sm">{duration.label}</div>
                      <div className="text-xs text-gray-600">{duration.desc}</div>
                    </button>
                  ))}
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

