// src/infrastructure/services/RepService.ts
import { ApiClient } from '../../lib/api';

/**
 * Service for Rep (Trainee) API endpoints
 * All endpoints are prefixed with /api/rep
 */
export class RepService {
  /**
   * Get all journeys for a specific rep
   */
  static async getJourneys(repId: string): Promise<any> {
    const endpoint = `/api/rep/journeys?repId=${repId}`;
    console.log('[RepService] Fetching journeys from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RepService] Error fetching journeys:', error);
      throw error;
    }
  }

  /**
   * Get a specific journey by ID (only if the rep is enrolled)
   */
  static async getJourneyById(journeyId: string, repId: string): Promise<any> {
    const endpoint = `/api/rep/journeys/${journeyId}?repId=${repId}`;
    console.log('[RepService] Fetching journey from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RepService] Error fetching journey:', error);
      throw error;
    }
  }

  /**
   * Get progress for a rep across all journeys or a specific journey
   */
  static async getProgress(repId: string, journeyId?: string): Promise<any> {
    const params = new URLSearchParams({ repId });
    if (journeyId) {
      params.append('journeyId', journeyId);
    }
    const endpoint = `/api/rep/progress?${params.toString()}`;
    console.log('[RepService] Fetching progress from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RepService] Error fetching progress:', error);
      throw error;
    }
  }

  /**
   * Get rep dashboard with overall progress and statistics
   */
  static async getDashboard(repId: string): Promise<any> {
    const endpoint = `/api/rep/dashboard?repId=${repId}`;
    console.log('[RepService] Fetching dashboard from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[RepService] Error fetching dashboard:', error);
      throw error;
    }
  }
}

