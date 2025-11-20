// src/infrastructure/services/JourneyService.ts
import { ApiClient } from '../../lib/api';
import { TrainingJourney, TrainingModule, Rep } from '../../types';
import { TrainingModuleService, TrainingSection } from './TrainingModuleService';

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

// Helper function to validate MongoDB ObjectId format (24 hex characters)
const isValidMongoId = (id: string | undefined): boolean => {
  return !!(id && /^[0-9a-fA-F]{24}$/.test(id));
};

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
   * Now creates modules and sections in separate collections
   * @param journeyId Optional: if provided, updates existing journey instead of creating new one
   */
  static async saveJourney(journey: TrainingJourney, modules: TrainingModule[], companyId?: string, gigId?: string, finalExam?: any, journeyId?: string): Promise<any> {
    const journeyPayload = {
      title: journey.title,
      description: journey.description,
      industry: journey.industry,
      status: journey.status || 'draft',
      company: journey.company,
      vision: journey.vision,
      companyId: companyId,
      gigId: gigId,
      moduleIds: [], // Will be populated after creating modules
      finalExamId: null // Will be populated after creating final exam
    };

    let existingJourneyId: string | null = null;
    let isUpdate = false;
    
    // If journeyId is provided, validate it's a MongoDB ObjectId format (24 hex characters)
    // Don't use timestamps or other non-MongoDB IDs
    const isValidJourneyId = journeyId && isValidMongoId(journeyId);
    
    if (journeyId && isValidJourneyId) {
      try {
        console.log('[JourneyService] Checking if journey exists:', journeyId);
        const existingJourneyResponse = await ApiClient.get(`/training_journeys/${journeyId}`);
        
        // Backend can return either:
        // 1. Direct entity: {id: "...", title: "...", ...} (Spring Data MongoDB maps _id to id)
        // 2. Wrapped response: {success: true, journey: {...}}
        const journeyData = existingJourneyResponse.data.journey || existingJourneyResponse.data;
        // Spring Data MongoDB uses 'id' (not '_id') in Java entities
        const hasJourneyId = journeyData && (journeyData.id || journeyData._id);
        const isSuccess = existingJourneyResponse.data.success !== false && hasJourneyId;
        
        console.log('[JourneyService] Journey check response:', {
          hasData: !!existingJourneyResponse.data,
          hasJourney: !!existingJourneyResponse.data.journey,
          hasDirectJourney: !!hasJourneyId,
          journeyId: journeyData?.id || journeyData?._id,
          isSuccess: isSuccess
        });
        
        if (isSuccess && journeyData) {
          existingJourneyId = journeyId;
          isUpdate = true;
          console.log('[JourneyService] ✓ Journey exists, will UPDATE:', journeyId);
          
          // Delete old modules and sections before creating new ones
          const oldModuleIds = journeyData.moduleIds || [];
          if (oldModuleIds.length > 0) {
            console.log('[JourneyService] Deleting old modules:', oldModuleIds.length);
            for (const oldModuleId of oldModuleIds) {
              try {
                // Get module to find its sections
                const oldModule = await TrainingModuleService.getModuleById(oldModuleId);
                if (oldModule && oldModule.sectionIds) {
                  // Delete sections
                  for (const sectionId of oldModule.sectionIds) {
                    try {
                      await TrainingModuleService.deleteSection(sectionId);
                    } catch (error) {
                      console.warn(`[JourneyService] Could not delete section ${sectionId}:`, error);
                    }
                  }
                }
                // Delete module
                await TrainingModuleService.deleteModule(oldModuleId);
                console.log(`[JourneyService] ✓ Deleted old module: ${oldModuleId}`);
              } catch (error) {
                console.warn(`[JourneyService] Could not delete module ${oldModuleId}:`, error);
              }
            }
          } else {
            console.log('[JourneyService] No old modules to delete');
          }
        } else {
          console.warn('[JourneyService] Journey check returned no valid journey data');
        }
      } catch (error: any) {
        console.warn('[JourneyService] Journey not found (404 or error), will create new one:', {
          journeyId,
          errorMessage: error?.message,
          errorStatus: error?.response?.status,
          errorData: error?.response?.data
        });
      }
    } else if (journeyId && !isValidJourneyId) {
      console.warn('[JourneyService] Invalid journeyId format (not a MongoDB ObjectId):', journeyId, '- will create new journey');
    } else {
      console.log('[JourneyService] No journeyId provided, will create new journey');
    }

    let response;
    if (existingJourneyId && isUpdate) {
      // Update existing journey
      response = await ApiClient.put(`/training_journeys/${existingJourneyId}`, journeyPayload);
      if (!response.data.success) {
        throw new Error('Failed to update journey');
      }
      console.log('[JourneyService] Updated journey:', existingJourneyId);
    } else {
      // Create new journey
      console.log('[JourneyService] Creating new journey with payload:', JSON.stringify(journeyPayload, null, 2));
      response = await ApiClient.post('/training_journeys', journeyPayload);
      
      // Spring Data MongoDB uses 'id' (not '_id') in Java entities
      // Backend can return journey directly or wrapped in response.data.journey
      const createdJourney = response.data.journey || response.data;
      
      console.log('[JourneyService] Create journey response:', {
        success: response.data.success,
        hasJourney: !!response.data.journey,
        journeyId: createdJourney?.id || createdJourney?._id,
        fullResponse: response.data
      });
      
      if (!response.data.success) {
        console.error('[JourneyService] Create journey failed:', response.data);
        throw new Error(`Failed to create journey: ${response.data.error || 'Unknown error'}`);
      }
      
      // Spring Data MongoDB uses 'id' (not '_id') in Java entities
      if (!createdJourney?.id && !createdJourney?._id) {
        console.error('[JourneyService] No journey ID in response:', response.data);
        throw new Error('Failed to create journey: No journey ID returned');
      }
      
      // Spring Data MongoDB maps MongoDB _id to Java 'id' field
      existingJourneyId = createdJourney.id || createdJourney._id;
      
      // Validate that it's a MongoDB ObjectId
      if (!isValidMongoId(existingJourneyId)) {
        console.error('[JourneyService] ⚠️ Invalid journeyId returned from backend:', existingJourneyId);
        throw new Error(`Invalid journeyId returned from backend: ${existingJourneyId}`);
      }
      
      console.log('[JourneyService] Created new journey:', existingJourneyId);
    }

    const trainingId = existingJourneyId; // Use journey ID as training ID

    // Create modules in training_modules collection
    const moduleIds: string[] = [];
    
    for (let index = 0; index < modules.length; index++) {
      const m = modules[index];
      const sections = (m as any).sections || m.content || [];
      const sectionIds: string[] = [];
      
      console.log(`[JourneyService] Creating module ${index + 1}/${modules.length}: ${m.title}`);
      
      // Step 1: Create module first (without sections and quizzes)
      const moduleData = {
        trainingJourneyId: existingJourneyId, // Use existingJourneyId, not journeyId
        title: m.title,
        description: m.description || '',
        duration: m.duration ? Math.round(m.duration * 60) : 0, // Convert hours to minutes
        difficulty: m.difficulty || 'beginner',
        learningObjectives: m.learningObjectives || [],
        prerequisites: m.prerequisites || [],
        topics: m.topics || [],
        sectionIds: [], // Will be populated after creating sections
        quizIds: [], // Will be populated after creating quizzes
        order: index
      };

      const createdModule = await TrainingModuleService.createModule(moduleData);
      const moduleId = createdModule._id || createdModule.id;
      moduleIds.push(moduleId);
      console.log(`[JourneyService] ✓ Created module: ${moduleId} - ${m.title}`);

      // Step 2: Create sections for this module
      if (sections.length > 0) {
        console.log(`[JourneyService] Creating ${sections.length} sections for module ${m.title}`);
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const section = sections[sectionIndex];
          try {
            const sectionData: TrainingSection = {
              moduleId: moduleId,
              title: section.title || section.content?.title || `Section ${sectionIndex + 1}`,
              type: section.type || 'document',
              order: sectionIndex,
              content: section.content || section,
              duration: section.duration || section.estimatedDuration || 0
            };
            
            const createdSection = await TrainingModuleService.createSection(moduleId, sectionData);
            sectionIds.push(createdSection._id || createdSection.id);
            console.log(`[JourneyService] ✓ Created section: ${createdSection._id} - ${sectionData.title}`);
          } catch (error) {
            console.error(`[JourneyService] ✗ Error creating section ${sectionIndex}:`, error);
          }
        }

        // Update module with sectionIds
        await TrainingModuleService.updateModule(moduleId, { sectionIds });
        console.log(`[JourneyService] ✓ Updated module with ${sectionIds.length} sectionIds`);
      }

      // Step 3: Create quizzes for this module
      const quizIds = await this.createQuizzesForModule(moduleId, trainingId, m.assessments || []);
      console.log(`[JourneyService] ✓ Created ${quizIds.length} quizzes for module ${m.title}`);

      // Update module with quizIds
      await TrainingModuleService.updateModule(moduleId, { quizIds });
      console.log(`[JourneyService] ✓ Updated module with ${quizIds.length} quizIds`);
    }

    // Create final exam if provided
    let finalExamId: string | null = null;
    if (finalExam) {
      finalExamId = await this.createFinalExam(trainingId, finalExam);
      console.log('[JourneyService] Created final exam:', finalExamId);
    }

    // Update journey with moduleIds and finalExamId (NOT the full modules)
    const updatePayload = {
      ...journeyPayload,
      moduleIds: moduleIds,
      finalExamId: finalExamId
    };

    console.log('[JourneyService] Updating journey with moduleIds:', moduleIds);
    const updateResponse = await ApiClient.put(`/training_journeys/${existingJourneyId}`, updatePayload);
    
    if (!updateResponse.data.success) {
      throw new Error('Failed to update journey');
    }
    
    // CRITICAL: Spring Data MongoDB uses 'id' (not '_id') in Java entities
    // Backend can return journey directly or wrapped in response.data.journey
    const updatedJourney = updateResponse.data.journey || updateResponse.data;
    const returnedJourneyId = updatedJourney?.id || updatedJourney?._id || existingJourneyId;
    
    // Validate that it's a MongoDB ObjectId
    if (!returnedJourneyId || !isValidMongoId(returnedJourneyId)) {
      console.error('[JourneyService] ⚠️ Invalid journeyId returned from backend:', returnedJourneyId);
      throw new Error('Invalid journeyId returned from backend');
    }
    
    return {
      ...updateResponse.data,
      success: true,
      journey: {
        ...updatedJourney,
        _id: returnedJourneyId,
        id: returnedJourneyId
      },
      journeyId: returnedJourneyId,
      journey_id: returnedJourneyId, // Also include as journey_id for clarity
      moduleIds: moduleIds,
      finalExamId: finalExamId
    };
  }

  /**
   * Launch a training journey
   * Now creates modules and sections in separate collections
   * @param journeyId Optional: if provided, updates existing journey instead of creating new one
   */
  static async launchJourney(request: LaunchJourneyRequest, finalExam?: any, journeyId?: string): Promise<LaunchJourneyResponse> {
    const journeyPayload = {
      title: (request.journey as any).title || request.journey.name || 'Untitled Journey',
      description: request.journey.description,
      industry: (request.journey as any).industry || (request.journey as any).company?.industry || null,
      status: 'active',
      company: (request.journey as any).company,
      vision: (request.journey as any).vision,
      companyId: request.companyId,
      gigId: request.gigId,
      moduleIds: [], // Will be populated after creating modules
      finalExamId: null, // Will be populated after creating final exam
      launchSettings: request.launchSettings,
      rehearsalData: request.rehearsalData
    };

    let existingJourneyId: string | null = null;
    let isUpdate = false;
    
    // If journeyId is provided, check if journey exists and update it
    // IMPORTANT: Only use MongoDB ObjectId format (24 hex characters)
    // Don't use timestamps or other non-MongoDB IDs from journey.id
    
    // Priority: journeyId parameter > journey._id (never use journey.id as it might be a timestamp)
    let journeyIdToUse = journeyId || (request.journey as any)._id;
    
    // Validate that it's a MongoDB ObjectId
    if (journeyIdToUse && !isValidMongoId(journeyIdToUse)) {
      console.warn('[JourneyService] Invalid journeyId format (launch, not MongoDB ObjectId):', journeyIdToUse, '- will create new journey');
      journeyIdToUse = null;
    }
    
    if (journeyIdToUse) {
      try {
        const existingJourney = await ApiClient.get(`/training_journeys/${journeyIdToUse}`);
        if (existingJourney.data.success && existingJourney.data.journey) {
          existingJourneyId = journeyIdToUse;
          isUpdate = true;
          console.log('[JourneyService] Launching existing journey:', journeyIdToUse);
          
          // Delete old modules and sections before creating new ones
          const oldModuleIds = existingJourney.data.journey.moduleIds || [];
          if (oldModuleIds.length > 0) {
            console.log('[JourneyService] Deleting old modules before launch:', oldModuleIds.length);
            for (const oldModuleId of oldModuleIds) {
              try {
                // Get module to find its sections
                const oldModule = await TrainingModuleService.getModuleById(oldModuleId);
                if (oldModule && oldModule.sectionIds) {
                  // Delete sections
                  for (const sectionId of oldModule.sectionIds) {
                    try {
                      await TrainingModuleService.deleteSection(sectionId);
                    } catch (error) {
                      console.warn(`[JourneyService] Could not delete section ${sectionId}:`, error);
                    }
                  }
                }
                // Delete module
                await TrainingModuleService.deleteModule(oldModuleId);
                console.log(`[JourneyService] ✓ Deleted old module: ${oldModuleId}`);
              } catch (error) {
                console.warn(`[JourneyService] Could not delete module ${oldModuleId}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.warn('[JourneyService] Journey not found, will create new one:', error);
      }
    }

    let response;
    if (existingJourneyId && isUpdate) {
      // Update existing journey
      response = await ApiClient.put(`/training_journeys/${existingJourneyId}`, journeyPayload);
      if (!response.data.success) {
        throw new Error('Failed to update journey');
      }
      console.log('[JourneyService] Updated journey for launch:', existingJourneyId);
    } else {
      // Create new journey
      response = await ApiClient.post('/training_journeys', journeyPayload);
      // Backend can return journey with 'id' (Spring Data MongoDB) or '_id' (MongoDB)
      const createdJourney = response.data.journey || response.data;
      const returnedJourneyId = createdJourney?.id || createdJourney?._id;
      if (!response.data.success || !returnedJourneyId) {
        console.error('[JourneyService] Failed to create journey. Response:', response.data);
        throw new Error('Failed to create journey');
      }
      existingJourneyId = returnedJourneyId;
      console.log('[JourneyService] Created new journey for launch:', existingJourneyId);
    }

    const trainingId = existingJourneyId;

    console.log('[JourneyService] Launching journey with trainingId:', trainingId);

    // Create modules in training_modules collection
    const moduleIds: string[] = [];
    
    for (let index = 0; index < request.modules.length; index++) {
      const m = request.modules[index];
      const sections = (m as any).sections || m.content || [];
      const sectionIds: string[] = [];
      
      console.log(`[JourneyService] Creating module ${index + 1}/${request.modules.length}: ${m.title}`);
      
      // Step 1: Create module first (without sections and quizzes)
      const moduleData = {
        trainingJourneyId: trainingId, // Use trainingId instead of journeyId parameter
        title: m.title,
        description: m.description || '',
        duration: m.duration ? Math.round(m.duration * 60) : 0, // Convert hours to minutes
        difficulty: m.difficulty || 'beginner',
        learningObjectives: m.learningObjectives || [],
        prerequisites: m.prerequisites || [],
        topics: m.topics || [],
        sectionIds: [], // Will be populated after creating sections
        quizIds: [], // Will be populated after creating quizzes
        order: index
      };

      const createdModule = await TrainingModuleService.createModule(moduleData);
      const moduleId = createdModule._id || createdModule.id;
      moduleIds.push(moduleId);
      console.log(`[JourneyService] ✓ Created module: ${moduleId} - ${m.title}`);

      // Step 2: Create sections for this module
      if (sections.length > 0) {
        console.log(`[JourneyService] Creating ${sections.length} sections for module ${m.title}`);
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const section = sections[sectionIndex];
          try {
            const sectionData: TrainingSection = {
              moduleId: moduleId,
              title: section.title || section.content?.title || `Section ${sectionIndex + 1}`,
              type: section.type || 'document',
              order: sectionIndex,
              content: section.content || section,
              duration: section.duration || section.estimatedDuration || 0
            };
            
            const createdSection = await TrainingModuleService.createSection(moduleId, sectionData);
            sectionIds.push(createdSection._id || createdSection.id);
            console.log(`[JourneyService] ✓ Created section: ${createdSection._id} - ${sectionData.title}`);
          } catch (error) {
            console.error(`[JourneyService] ✗ Error creating section ${sectionIndex}:`, error);
          }
        }

        // Update module with sectionIds
        await TrainingModuleService.updateModule(moduleId, { sectionIds });
        console.log(`[JourneyService] ✓ Updated module with ${sectionIds.length} sectionIds`);
      }

      // Step 3: Create quizzes for this module
      const quizIds = await this.createQuizzesForModule(moduleId, trainingId, m.assessments || []);
      console.log(`[JourneyService] ✓ Created ${quizIds.length} quizzes for module ${m.title}`);

      // Update module with quizIds
      await TrainingModuleService.updateModule(moduleId, { quizIds });
      console.log(`[JourneyService] ✓ Updated module with ${quizIds.length} quizIds`);
    }

    // Create final exam if provided
    let finalExamId: string | null = null;
    if (finalExam) {
      finalExamId = await this.createFinalExam(trainingId, finalExam);
      console.log('[JourneyService] Created final exam:', finalExamId);
    }

    // Launch the journey with enrolled reps
    const launchPayload = {
      journey: {
        ...journeyPayload,
        id: existingJourneyId, // Include journey ID for update
        _id: existingJourneyId, // Also include _id for MongoDB compatibility
        moduleIds: moduleIds,
        finalExamId: finalExamId
      },
      enrolledRepIds: request.enrolledRepIds
    };

    console.log('[JourneyService] Launching journey with ID:', existingJourneyId, 'moduleIds:', moduleIds);
    const launchResponse = await ApiClient.post('/training_journeys/launch', launchPayload);
    
    if (!launchResponse.data.success) {
      throw new Error(launchResponse.data.error || 'Failed to launch journey');
    }

    return {
      ...launchResponse.data,
      journeyId: existingJourneyId, // Use existingJourneyId instead of journeyId parameter
      journey_id: existingJourneyId, // Also include as journey_id for clarity
      moduleIds: moduleIds,
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

