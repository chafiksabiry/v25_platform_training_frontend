// src/infrastructure/services/TrainerService.ts
import { ApiClient } from '../../lib/api';

/**
 * Service for Trainer (Company) API endpoints
 * All endpoints are prefixed with /api/trainer
 */
export class TrainerService {
  /**
   * Get trainer dashboard statistics
   */
  static async getDashboard(companyId: string, gigId?: string): Promise<any> {
    const params = new URLSearchParams({ companyId });
    if (gigId) {
      params.append('gigId', gigId);
    }
    const endpoint = `/api/trainer/dashboard?${params.toString()}`;
    console.log('[TrainerService] Fetching dashboard from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error fetching dashboard:', error);
      throw error;
    }
  }

  /**
   * Get all journeys for a company, optionally filtered by gigId
   */
  static async getJourneys(companyId: string, gigId?: string): Promise<any> {
    const params = new URLSearchParams({ companyId });
    if (gigId) {
      params.append('gigId', gigId);
    }
    const endpoint = `/api/trainer/journeys?${params.toString()}`;
    console.log('[TrainerService] Fetching journeys from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error fetching journeys:', error);
      throw error;
    }
  }

  /**
   * Get a specific journey by ID
   */
  static async getJourneyById(journeyId: string, companyId: string): Promise<any> {
    const endpoint = `/api/trainer/journeys/${journeyId}?companyId=${companyId}`;
    console.log('[TrainerService] Fetching journey from:', endpoint);
    try {
      const response = await ApiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error fetching journey:', error);
      throw error;
    }
  }

  /**
   * Create a new training journey
   */
  static async createJourney(journeyData: any, companyId: string): Promise<any> {
    const endpoint = `/api/trainer/journeys?companyId=${companyId}`;
    console.log('[TrainerService] Creating journey:', endpoint);
    try {
      const response = await ApiClient.post(endpoint, journeyData);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error creating journey:', error);
      throw error;
    }
  }

  /**
   * Update an existing training journey
   */
  static async updateJourney(journeyId: string, journeyData: any, companyId: string): Promise<any> {
    const endpoint = `/api/trainer/journeys/${journeyId}?companyId=${companyId}`;
    console.log('[TrainerService] Updating journey:', endpoint);
    try {
      const response = await ApiClient.put(endpoint, journeyData);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error updating journey:', error);
      throw error;
    }
  }

  /**
   * Delete a training journey
   */
  static async deleteJourney(journeyId: string, companyId: string): Promise<any> {
    const endpoint = `/api/trainer/journeys/${journeyId}?companyId=${companyId}`;
    console.log('[TrainerService] Deleting journey:', endpoint);
    try {
      const response = await ApiClient.delete(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error deleting journey:', error);
      throw error;
    }
  }

  /**
   * Launch a training journey with enrolled reps
   */
  static async launchJourney(journeyId: string, enrolledRepIds: string[], companyId: string): Promise<any> {
    const endpoint = `/api/trainer/journeys/${journeyId}/launch?companyId=${companyId}`;
    console.log('[TrainerService] Launching journey:', endpoint);
    try {
      const response = await ApiClient.post(endpoint, { enrolledRepIds });
      return response.data;
    } catch (error: any) {
      console.error('[TrainerService] Error launching journey:', error);
      throw error;
    }
  }
}

