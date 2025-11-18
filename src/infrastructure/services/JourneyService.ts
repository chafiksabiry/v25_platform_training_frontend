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
  companyId?: string;
  gigId?: string;
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
    const response = await ApiClient.get('/training_journeys');
    return response.data;
  }

  /**
   * Get a specific journey by ID
   */
  static async getJourneyById(id: string): Promise<any> {
    const response = await ApiClient.get(`/training_journeys/${id}`);
    return response.data;
  }

  /**
   * Get journeys by status
   */
  static async getJourneysByStatus(status: string): Promise<any[]> {
    const response = await ApiClient.get(`/training_journeys/status/${status}`);
    return response.data;
  }

  /**
   * Create or save a journey
   */
  static async saveJourney(journey: TrainingJourney, modules: TrainingModule[], companyId?: string, gigId?: string): Promise<any> {
    const payload = {
      title: journey.title,
      description: journey.description,
      industry: journey.industry,
      status: journey.status,
      company: journey.company,
      vision: journey.vision,
      companyId: companyId,
      gigId: gigId,
      modules: modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        difficulty: m.difficulty,
        learningObjectives: m.learningObjectives,
        prerequisites: m.prerequisites,
        topics: m.topics,
        content: m.content,
        sections: (m as any).sections || [], // Include sections with documents
        assessments: m.assessments || [] // Include assessments/quizzes
      }))
    };

    const response = await ApiClient.post('/training_journeys', payload);
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
        companyId: request.companyId,
        gigId: request.gigId,
        modules: request.modules.map(m => {
          // Convert sections to content format for backend compatibility
          const sections = (m as any).sections || [];
          const contentFromSections = sections.map((section: any, index: number) => ({
            id: section.id || `content-${m.id}-${index}`,
            type: section.type || 'document',
            title: section.title || `Section ${index + 1}`,
            content: {
              text: section.content?.text || '',
              file: section.content?.file || null,
              youtubeUrl: section.content?.youtubeUrl || null,
              keyPoints: section.content?.keyPoints || []
            },
            duration: section.estimatedDuration || 10
          }));
          
          // Combine existing content with sections
          const combinedContent = [
            ...(m.content || []),
            ...contentFromSections
          ];
          
          return {
            id: m.id,
            title: m.title,
            description: m.description,
            duration: m.duration,
            difficulty: m.difficulty,
            learningObjectives: m.learningObjectives,
            prerequisites: m.prerequisites,
            topics: m.topics,
            content: combinedContent, // Include sections converted to content
            sections: sections, // Also include sections for frontend compatibility
            assessments: m.assessments || [] // Include assessments/quizzes
          };
        })
      },
      enrolledRepIds: request.enrolledRepIds
    };

    const response = await ApiClient.post('/training_journeys/launch', payload);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to launch journey');
    }

    return response.data;
  }

  /**
   * Archive a journey
   */
  static async archiveJourney(id: string): Promise<any> {
    const response = await ApiClient.post(`/training_journeys/${id}/archive`);
    return response.data;
  }

  /**
   * Delete a journey
   */
  static async deleteJourney(id: string): Promise<any> {
    const response = await ApiClient.delete(`/training_journeys/${id}`);
    return response.data;
  }

  /**
   * Get journeys by company ID
   */
  static async getJourneysByCompany(companyId: string): Promise<any> {
    const endpoint = `/training_journeys/trainer/companyId/${companyId}`;
    console.log('[JourneyService] Fetching journeys by company from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      console.log('[JourneyService] Response:', response);
      return response.data;
    } catch (error: any) {
      console.error('[JourneyService] Error fetching journeys by company:', error);
      throw error;
    }
  }

  /**
   * Get journeys by company ID and gig ID
   */
  static async getJourneysByCompanyAndGig(companyId: string, gigId: string): Promise<any> {
    const endpoint = `/training_journeys/trainer/companyId/${companyId}/gigId/${gigId}`;
    console.log('[JourneyService] Fetching journeys by company and gig from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      console.log('[JourneyService] Response:', response);
      return response.data;
    } catch (error: any) {
      console.error('[JourneyService] Error fetching journeys by company and gig:', error);
      throw error;
    }
  }

  /**
   * Get trainer dashboard statistics
   */
  static async getTrainerDashboard(companyId: string, gigId?: string): Promise<any> {
    const params = new URLSearchParams({ companyId });
    if (gigId) {
      params.append('gigId', gigId);
    }
    const endpoint = `/training_journeys/trainer/dashboard?${params.toString()}`;
    console.log('[JourneyService] Fetching trainer dashboard from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      console.log('[JourneyService] Response:', response);
      // The backend returns {success: true, data: {...}}
      // ApiClient wraps it in response.data, so we have response.data = {success: true, data: {...}}
      // Return the full response structure
      return response.data;
    } catch (error: any) {
      console.error('[JourneyService] Error fetching trainer dashboard:', error);
      throw error;
    }
  }
}

