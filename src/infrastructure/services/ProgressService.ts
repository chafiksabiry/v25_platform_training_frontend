// src/infrastructure/services/ProgressService.ts
import { ApiClient } from '../../lib/api';

export interface RepProgress {
  repId: string;
  journeyId: string;
  moduleId: string;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number; // 0-100
  timeSpent: number; // in minutes
  engagementScore?: number; // 0-100
}

export interface UpdateProgressRequest {
  repId: string;
  journeyId: string;
  moduleId: string;
  progress?: number;
  status?: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent?: number;
  engagementScore?: number;
}

export interface RepProgressOverview {
  repId: string;
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  notStartedTrainings: number;
  overallProgress: number;
  overallEngagement: number;
  totalTimeSpent: number;
  trainingsProgress: Record<string, {
    journeyId: string;
    journeyTitle: string;
    status: string;
    progress: number;
    engagementScore: number;
    timeSpent: number;
  }>;
}

export interface GigProgress {
  repId: string;
  gigId: string;
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  notStartedTrainings: number;
  overallProgress: number;
  totalTimeSpent: number;
  trainings: Array<{
    journeyId: string;
    journeyTitle: string;
    description?: string;
    status: string;
    progress: number;
    timeSpent: number;
    modulesProgress?: Array<{
      moduleId: string;
      progress: number;
      status: string;
      timeSpent: number;
    }>;
  }>;
}

export class ProgressService {
  private static readonly BASE_URL = '/training_journeys';

  /**
   * Get progress for a specific rep and journey
   */
  static async getRepProgress(repId: string, journeyId?: string): Promise<RepProgress[]> {
    const params = journeyId 
      ? `?repId=${repId}&journeyId=${journeyId}`
      : `?repId=${repId}`;
    
    const response = await ApiClient.get(`${this.BASE_URL}/rep-progress${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  }

  /**
   * Get overall progress overview for a rep
   */
  static async getRepProgressOverview(repId: string): Promise<RepProgressOverview | null> {
    try {
      const response = await ApiClient.get(`${this.BASE_URL}/rep/${repId}/progress/overview`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching rep progress overview:', error);
      return null;
    }
  }

  /**
   * Get progress for a rep filtered by gigId
   */
  static async getRepProgressByGig(repId: string, gigId: string): Promise<GigProgress | null> {
    try {
      const response = await ApiClient.get(`${this.BASE_URL}/rep/${repId}/progress/gig/${gigId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching rep progress by gig:', error);
      return null;
    }
  }

  /**
   * Update or create progress for a rep
   */
  static async updateProgress(request: UpdateProgressRequest): Promise<RepProgress | null> {
    try {
      const response = await ApiClient.post(`${this.BASE_URL}/rep-progress/update`, request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating progress:', error);
      return null;
    }
  }

  /**
   * Calculate progress percentage based on completed sections
   */
  static calculateProgress(completedSections: number, totalSections: number): number {
    if (totalSections === 0) return 0;
    return Math.round((completedSections / totalSections) * 100);
  }

  /**
   * Determine status based on progress
   */
  static getStatusFromProgress(progress: number): 'not-started' | 'in-progress' | 'completed' {
    if (progress === 0) return 'not-started';
    if (progress >= 100) return 'completed';
    return 'in-progress';
  }
}

