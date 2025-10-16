// src/infrastructure/services/JourneyService.ts
import { ApiClient } from '../../lib/api';
import { TrainingJourney, TrainingModule, Rep } from '../../types';

export interface LaunchJourneyRequest {
  journey: TrainingJourney;
  modules: TrainingModule[];
  enrolledRepIds: string[];
  launchSettings: {
    startDate: string;
    sendNotifications: boolean;
    allowSelfPaced: boolean;
    enableLiveStreaming: boolean;
    recordSessions: boolean;
    aiTutorEnabled: boolean;
  };
  rehearsalData: {
    rating: number;
    modulesCompleted: number;
    feedback: string[];
  };
}

export interface LaunchJourneyResponse {
  success: boolean;
  journey: any;
  message: string;
  enrolledCount: number;
}

export class JourneyService {
  /**
   * Get all training journeys
   */
  static async getAllJourneys(): Promise<any[]> {
    const response = await ApiClient.get('/journeys');
    return response.data;
  }

  /**
   * Get a specific journey by ID
   */
  static async getJourneyById(id: string): Promise<any> {
    const response = await ApiClient.get(`/journeys/${id}`);
    return response.data;
  }

  /**
   * Get journeys by status
   */
  static async getJourneysByStatus(status: string): Promise<any[]> {
    const response = await ApiClient.get(`/journeys/status/${status}`);
    return response.data;
  }

  /**
   * Create or save a journey
   */
  static async saveJourney(journey: TrainingJourney, modules: TrainingModule[]): Promise<any> {
    const payload = {
      title: journey.title,
      description: journey.description,
      industry: journey.industry,
      status: journey.status,
      company: journey.company,
      vision: journey.vision,
      modules: modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        difficulty: m.difficulty,
        learningObjectives: m.learningObjectives,
        prerequisites: m.prerequisites,
        topics: m.topics,
        content: m.content
      }))
    };

    const response = await ApiClient.post('/journeys', payload);
    return response.data;
  }

  /**
   * Launch a training journey
   */
  static async launchJourney(request: LaunchJourneyRequest): Promise<LaunchJourneyResponse> {
    const payload = {
      journey: {
        title: request.journey.title,
        description: request.journey.description,
        industry: request.journey.industry,
        status: 'active',
        company: request.journey.company,
        vision: request.journey.vision,
        launchSettings: request.launchSettings,
        rehearsalData: request.rehearsalData,
        modules: request.modules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          duration: m.duration,
          difficulty: m.difficulty,
          learningObjectives: m.learningObjectives,
          prerequisites: m.prerequisites,
          topics: m.topics,
          content: m.content
        }))
      },
      enrolledRepIds: request.enrolledRepIds
    };

    const response = await ApiClient.post('/journeys/launch', payload);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to launch journey');
    }

    return response.data;
  }

  /**
   * Archive a journey
   */
  static async archiveJourney(id: string): Promise<any> {
    const response = await ApiClient.post(`/journeys/${id}/archive`);
    return response.data;
  }

  /**
   * Delete a journey
   */
  static async deleteJourney(id: string): Promise<any> {
    const response = await ApiClient.delete(`/journeys/${id}`);
    return response.data;
  }
}

