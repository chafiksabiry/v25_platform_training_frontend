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
   * Create quizzes separately in module_quizzes collection and return their IDs
   */
  static async createQuizzesForModule(moduleId: string, trainingId: string, assessments: any[]): Promise<string[]> {
    const quizIds: string[] = [];
    
    if (!assessments || assessments.length === 0) {
      return quizIds;
    }

    for (const assessment of assessments) {
      if (!assessment.questions || assessment.questions.length === 0) {
        continue;
      }

      try {
        const quizPayload = {
          title: assessment.title || `${moduleId} - Quiz`,
          description: assessment.description || 'Module quiz',
          moduleId: moduleId,
          trainingId: trainingId,
          passingScore: assessment.passingScore || 70,
          timeLimit: assessment.timeLimit || 15,
          maxAttempts: assessment.maxAttempts || 3,
          questions: assessment.questions.map((q: any, idx: number) => ({
            _id: q._id || q.id || `q-${idx}`,
            id: q._id || q.id || `q-${idx}`,
            question: q.question || q.text || '',
            type: q.type || 'multiple-choice',
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points || 10,
            orderIndex: idx
          })),
          settings: {
            shuffleQuestions: assessment.settings?.shuffleQuestions || false,
            shuffleOptions: assessment.settings?.shuffleOptions || false,
            showCorrectAnswers: assessment.settings?.showCorrectAnswers !== false,
            allowReview: assessment.settings?.allowReview !== false,
            showExplanations: assessment.settings?.showExplanations !== false
          }
        };

        // Use endpoint for module_quizzes collection
        const response = await ApiClient.post(`/training_journeys/modules/${moduleId}/quizzes`, quizPayload);
        if (response.data.success && response.data.data?._id) {
          quizIds.push(response.data.data._id);
        }
      } catch (error) {
        console.error(`[JourneyService] Error creating quiz for module ${moduleId}:`, error);
      }
    }

    return quizIds;
  }

  /**
   * Create final exam quiz in exam_final_quizzes collection
   */
  static async createFinalExam(trainingId: string, finalExamData: any): Promise<string | null> {
    if (!finalExamData || !finalExamData.questions || finalExamData.questions.length === 0) {
      return null;
    }

    try {
      const quizPayload = {
        title: finalExamData.title || 'Final Exam',
        description: finalExamData.description || 'Final examination for the training journey',
        trainingId: trainingId,
        passingScore: finalExamData.passingScore || 70,
        timeLimit: finalExamData.timeLimit || 60,
        maxAttempts: finalExamData.maxAttempts || 1,
        questions: finalExamData.questions.map((q: any, idx: number) => ({
          _id: q._id || q.id || `q-${idx}`,
          id: q._id || q.id || `q-${idx}`,
          question: q.question || q.text || '',
          type: q.type || 'multiple-choice',
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points || 10,
          orderIndex: idx
        })),
        settings: {
          shuffleQuestions: finalExamData.settings?.shuffleQuestions || true,
          shuffleOptions: finalExamData.settings?.shuffleOptions || true,
          showCorrectAnswers: finalExamData.settings?.showCorrectAnswers !== false,
          allowReview: finalExamData.settings?.allowReview !== false,
          showExplanations: finalExamData.settings?.showExplanations !== false
        }
      };

      // Use endpoint for exam_final_quizzes collection
      const response = await ApiClient.post(`/training_journeys/${trainingId}/final-exam`, quizPayload);
      if (response.data.success && response.data.data?._id) {
        return response.data.data._id;
      }
    } catch (error) {
      console.error('[JourneyService] Error creating final exam:', error);
    }

    return null;
  }

  /**
   * Create or save a journey
   */
  static async saveJourney(journey: TrainingJourney, modules: TrainingModule[], companyId?: string, gigId?: string, finalExam?: any): Promise<any> {
    // First, create the journey to get its ID
    const journeyPayload = {
      title: journey.title,
      description: journey.description,
      industry: journey.industry,
      status: journey.status,
      company: journey.company,
      vision: journey.vision,
      companyId: companyId,
      gigId: gigId,
      modules: modules.map(m => ({
        _id: (m as any)._id || m.id,
        id: (m as any)._id || m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        difficulty: m.difficulty,
        learningObjectives: m.learningObjectives,
        prerequisites: m.prerequisites,
        topics: m.topics,
        content: m.content,
        sections: (m as any).sections || [],
        quizIds: [] // Will be populated after creating quizzes
      }))
    };

    const response = await ApiClient.post('/training_journeys', journeyPayload);
    
    if (!response.data.success || !response.data.journey?._id) {
      throw new Error('Failed to create journey');
    }

    const journeyId = response.data.journey._id;
    const trainingId = journeyId; // Use journey ID as training ID

    // Create quizzes for each module
    const updatedModules = await Promise.all(
      modules.map(async (m) => {
        const moduleId = (m as any)._id || m.id;
        const quizIds = await this.createQuizzesForModule(moduleId, trainingId, m.assessments || []);
        return {
          ...m,
          quizIds: quizIds
        };
      })
    );

    // Create final exam if provided
    let finalExamId: string | null = null;
    if (finalExam) {
      finalExamId = await this.createFinalExam(trainingId, finalExam);
    }

    // Update journey with quiz references
    const updatePayload = {
      ...journeyPayload,
      modules: updatedModules.map(m => ({
        _id: (m as any)._id || m.id,
        id: (m as any)._id || m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        difficulty: m.difficulty,
        learningObjectives: m.learningObjectives,
        prerequisites: m.prerequisites,
        topics: m.topics,
        content: m.content,
        sections: (m as any).sections || [],
        quizIds: (m as any).quizIds || []
      })),
      finalExamId: finalExamId
    };

    // Update the journey with quiz references
    const updateResponse = await ApiClient.put(`/training_journeys/${journeyId}`, updatePayload);
    
    return {
      ...response.data,
      quizIds: updatedModules.flatMap(m => (m as any).quizIds || []),
      finalExamId: finalExamId
    };
  }

  /**
   * Launch a training journey
   */
  static async launchJourney(request: LaunchJourneyRequest, finalExam?: any): Promise<LaunchJourneyResponse> {
      // First, create quizzes for each module and get their IDs
      const modulesWithQuizIds = await Promise.all(
        request.modules.map(async (m) => {
          const quizIds = await this.createQuizzesForModule(
            (m as any)._id || m.id,
            (request.journey as any)._id || request.journey.id || 'temp-id', // Will be updated after journey creation
            m.assessments || []
          );
          return {
            ...m,
            quizIds: quizIds
          };
        })
      );

      // Create final exam if provided
      let finalExamId: string | null = null;
      if (finalExam) {
        finalExamId = await this.createFinalExam(
          (request.journey as any)._id || request.journey.id || 'temp-id',
          finalExam
        );
      }

    const payload = {
      journey: {
        // Map name to title (frontend uses 'name', backend expects 'title')
        title: (request.journey as any).title || request.journey.name || 'Untitled Journey',
        description: request.journey.description,
        // Get industry from journey or company if available
        industry: (request.journey as any).industry || (request.journey as any).company?.industry || null,
        status: 'active',
        company: (request.journey as any).company,
        vision: (request.journey as any).vision,
        launchSettings: request.launchSettings,
        rehearsalData: request.rehearsalData,
        companyId: request.companyId,
        gigId: request.gigId,
        finalExamId: finalExamId,
        modules: modulesWithQuizIds.map(m => {
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
          
          const moduleId = (m as any)._id || m.id;
          return {
            _id: moduleId,
            id: moduleId,
            title: m.title,
            description: m.description,
            duration: m.duration,
            difficulty: m.difficulty,
            learningObjectives: m.learningObjectives,
            prerequisites: m.prerequisites,
            topics: m.topics,
            content: combinedContent, // Include sections converted to content
            sections: sections, // Also include sections for frontend compatibility
            quizIds: (m as any).quizIds || [] // Include quiz IDs instead of full assessments
          };
        })
      },
      enrolledRepIds: request.enrolledRepIds
    };

    const response = await ApiClient.post('/training_journeys/launch', payload);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to launch journey');
    }

    return {
      ...response.data,
      quizIds: modulesWithQuizIds.flatMap(m => (m as any).quizIds || []),
      finalExamId: finalExamId
    };
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
      // ApiClient.get returns {data: {...}, status: 200}
      // The backend returns {data: [...], success: true, count: N}
      // So we need to return response.data which contains {data: [...], success: true}
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

