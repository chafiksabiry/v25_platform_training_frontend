// src/components/Rep/RepView.tsx
import React, { useState, useEffect } from 'react';
import { TrainingJourney, TrainingModule } from '../../types';
import TraineePortal from '../Trainee/TraineePortal';
import { RepService } from '../../infrastructure/services/RepService';
import Cookies from 'js-cookie';
import { getRepId } from '../../utils/userUtils';

interface RepViewProps {
  onBack?: () => void;
}

export default function RepView({ onBack }: RepViewProps) {
  const [repId, setRepId] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<TrainingJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<TrainingJourney | null>(null);
  const [selectedModules, setSelectedModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get repId from cookies or userUtils
        const repIdFromCookie = Cookies.get('repId') || Cookies.get('agentId');
        const repIdFromUtils = getRepId();
        const effectiveRepId = repIdFromCookie || repIdFromUtils;

        if (!effectiveRepId) {
          setError('Rep ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        setRepId(effectiveRepId);

        // Fetch journeys for this rep
        const response = await RepService.getJourneys(effectiveRepId);
        
        if (response.success && response.data) {
          const journeysList = Array.isArray(response.data) ? response.data : [];
          setJourneys(journeysList);
          
          // Auto-select first journey if available
          if (journeysList.length > 0) {
            const firstJourney = journeysList[0];
            setSelectedJourney(firstJourney);
            
            // Convert journey modules to TrainingModule format
            if (firstJourney.modules && Array.isArray(firstJourney.modules)) {
              const modules = firstJourney.modules.map((m: any, index: number) => ({
                id: m._id || m.id || `module-${index}`,
                title: m.title || `Module ${index + 1}`,
                description: m.description || '',
                duration: m.duration || 0,
                difficulty: m.difficulty || 'beginner',
                content: m.sections || [],
                topics: m.topics || [],
                assessments: m.quizzes || [],
                learningObjectives: m.learningObjectives || [],
                prerequisites: m.prerequisites || []
              }));
              setSelectedModules(modules);
            }
          }
        } else {
          setError('Failed to load journeys');
        }
      } catch (err: any) {
        console.error('[RepView] Error loading rep data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadRepData();
  }, []);

  const handleJourneySelect = (journey: TrainingJourney) => {
    setSelectedJourney(journey);
    
    // Convert journey modules to TrainingModule format
    if (journey.modules && Array.isArray(journey.modules)) {
      const modules = journey.modules.map((m: any, index: number) => ({
        id: m._id || m.id || `module-${index}`,
        title: m.title || `Module ${index + 1}`,
        description: m.description || '',
        duration: m.duration || 0,
        difficulty: m.difficulty || 'beginner',
        content: m.sections || [],
        topics: m.topics || [],
        assessments: m.quizzes || [],
        learningObjectives: m.learningObjectives || [],
        prerequisites: m.prerequisites || []
      }));
      setSelectedModules(modules);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no journeys, show message
  if (journeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No training journeys available.</p>
          <p className="text-sm text-gray-500">Please contact your trainer to enroll you in a training journey.</p>
        </div>
      </div>
    );
  }

  // If journey selected, show TraineePortal
  if (selectedJourney && selectedModules.length > 0 && repId) {
    // Create a mock rep object for TraineePortal
    const mockRep = {
      id: repId,
      name: Cookies.get('userName') || 'Rep',
      email: Cookies.get('userEmail') || '',
      department: Cookies.get('userDepartment') || '',
      role: 'rep'
    };

    return (
      <TraineePortal
        trainee={mockRep as any}
        journey={selectedJourney}
        modules={selectedModules}
        onProgressUpdate={() => {}}
        onModuleComplete={() => {}}
        onAssessmentComplete={() => {}}
        onBack={() => {
          setSelectedJourney(null);
          setSelectedModules([]);
        }}
      />
    );
  }

  // Show journey selection
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Training Journeys</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {journeys.map((journey) => (
          <div
            key={journey.id || (journey as any)._id}
            onClick={() => handleJourneySelect(journey)}
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{journey.title || journey.name}</h2>
            <p className="text-gray-600 text-sm mb-4">{journey.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {journey.modules?.length || 0} modules
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                journey.status === 'active' ? 'bg-green-100 text-green-800' :
                journey.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {journey.status || 'draft'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

