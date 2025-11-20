// Service pour gérer la sauvegarde automatique des brouillons de formation
import { Company, TrainingJourney, ContentUpload, TrainingModule, TrainingMethodology } from '../../types';
import { JourneyService } from './JourneyService';
import Cookies from 'js-cookie';

const DRAFT_STORAGE_KEY = 'training_journey_draft';
const DRAFT_SAVE_INTERVAL = 30000; // Sauvegarder toutes les 30 secondes

export interface JourneyDraft {
  company: Company | null;
  journey: TrainingJourney | null;
  methodology: TrainingMethodology | null;
  uploads: ContentUpload[];
  modules: TrainingModule[];
  currentStep: number;
  selectedGigId: string | null;
  lastSaved: string;
  draftId?: string; // ID du brouillon sauvegardé dans le backend
}

export class DraftService {
  private static saveTimeout: NodeJS.Timeout | null = null;

  /**
   * Sauvegarder le brouillon localement (localStorage)
   */
  static saveDraftLocally(draft: Partial<JourneyDraft>): void {
    try {
      const existingDraft = this.getDraftLocally();
      const updatedDraft: JourneyDraft = {
        ...existingDraft,
        ...draft,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDraft));
      // Removed verbose logging
    } catch (error) {
      console.error('[DraftService] Error saving draft locally:', error);
    }
  }

  /**
   * Récupérer le brouillon depuis localStorage
   */
  static getDraftLocally(): JourneyDraft {
    try {
      const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftJson) {
        return JSON.parse(draftJson);
      }
    } catch (error) {
      console.error('[DraftService] Error loading draft from localStorage:', error);
    }
    return {
      company: null,
      journey: null,
      methodology: null,
      uploads: [],
      modules: [],
      currentStep: 0,
      selectedGigId: null,
      lastSaved: new Date().toISOString()
    };
  }

  /**
   * Sauvegarder le brouillon dans le backend (avec debounce)
   */
  static async saveDraftToBackend(draft: Partial<JourneyDraft>): Promise<void> {
    // Annuler la sauvegarde précédente si elle est en attente
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Programmer une sauvegarde après un délai
    this.saveTimeout = setTimeout(async () => {
      // Prevent concurrent saves
      if (this.isSaving) {
        console.log('[DraftService] Save already in progress, skipping debounced save...');
        return;
      }

      this.isSaving = true;

      try {
        const fullDraft = this.getDraftLocally();
        const updatedDraft: JourneyDraft = {
          ...fullDraft,
          ...draft,
          lastSaved: new Date().toISOString()
        };

        // Sauvegarder localement d'abord
        this.saveDraftLocally(updatedDraft);

        // Si on a un journey et des modules, sauvegarder dans le backend
        if (updatedDraft.journey && updatedDraft.modules.length > 0) {
          const companyId = Cookies.get('companyId');
          const gigId = updatedDraft.selectedGigId || null;

          // Préparer le journey avec status="draft"
          const journeyToSave: TrainingJourney = {
            ...updatedDraft.journey,
            status: 'draft',
            title: (updatedDraft.journey as any).title || updatedDraft.journey.name
          };

          try {
            // CRITICAL: Re-read draft from localStorage to get the most recent draftId
            // This ensures we don't create duplicates if draftId was saved by another call
            const latestDraft = this.getDraftLocally();
            const existingJourneyId = latestDraft.draftId || updatedDraft.draftId || (updatedDraft.journey as any).id || (updatedDraft.journey as any)._id;
            
            console.log('[DraftService] DraftId sources (debounced):', {
              fromLatestDraft: latestDraft.draftId,
              fromUpdatedDraft: updatedDraft.draftId,
              fromJourney: (updatedDraft.journey as any).id || (updatedDraft.journey as any)._id,
              finalJourneyId: existingJourneyId
            });
            
            if (!existingJourneyId) {
              console.warn('[DraftService] ⚠️ No draftId found (debounced), will create new journey.');
            } else {
              console.log('[DraftService] ✓ Found existing draftId (debounced):', existingJourneyId);
            }
            
            console.log('[DraftService] Saving draft (debounced) with journeyId:', existingJourneyId || 'NEW');
            
            const response = await JourneyService.saveJourney(
              journeyToSave,
              updatedDraft.modules,
              companyId,
              gigId,
              undefined, // finalExam
              existingJourneyId // Pass existing journeyId to update instead of create
            );

            if (response.success && (response.journey?.id || response.journeyId)) {
              // Sauvegarder l'ID du brouillon
              const savedJourneyId = response.journey?.id || response.journeyId || response.journey?._id;
              
              // CRITICAL: Re-read draft again to merge with any concurrent updates
              const finalDraft = this.getDraftLocally();
              finalDraft.draftId = savedJourneyId;
              finalDraft.modules = updatedDraft.modules; // Update modules
              finalDraft.lastSaved = new Date().toISOString();
              this.saveDraftLocally(finalDraft);
              
              console.log('[DraftService] ✓ Draft saved successfully (debounced), journeyId:', savedJourneyId);
              console.log('[DraftService] ✓ draftId saved to localStorage (debounced):', savedJourneyId);
            }
          } catch (error) {
            console.warn('[DraftService] Could not save draft to backend (will retry):', error);
            // Ne pas bloquer l'utilisateur si la sauvegarde backend échoue
          }
        }
      } catch (error) {
        console.error('[DraftService] Error saving draft to backend:', error);
      } finally {
        this.isSaving = false;
      }
    }, DRAFT_SAVE_INTERVAL);
  }

  /**
   * Sauvegarder immédiatement (sans debounce)
   * Prevents concurrent saves to avoid creating multiple journeys
   */
  static async saveDraftImmediately(draft: Partial<JourneyDraft>): Promise<void> {
    // Prevent concurrent saves
    if (this.isSaving) {
      console.log('[DraftService] Save already in progress, skipping...');
      return;
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    this.isSaving = true;

    try {
      // CRITICAL: Always get the latest draft from localStorage to ensure we have the most recent draftId
      const fullDraft = this.getDraftLocally();
      
      // CRITICAL: Preserve draftId if it exists - don't overwrite it
      // Priority: draft.draftId (explicitly passed) > fullDraft.draftId (from localStorage)
      const updatedDraft: JourneyDraft = {
        ...fullDraft,
        ...draft,
        draftId: draft.draftId || fullDraft.draftId, // Preserve existing draftId
        lastSaved: new Date().toISOString()
      };

      // Sauvegarder localement AVANT de sauvegarder dans le backend
      this.saveDraftLocally(updatedDraft);
      
      console.log('[DraftService] Local draft updated, draftId:', updatedDraft.draftId);

      // Sauvegarder dans le backend si possible
      // IMPORTANT: Only save if we have both journey AND modules (to avoid creating empty journeys)
      if (updatedDraft.journey && updatedDraft.modules.length > 0) {
        const companyId = Cookies.get('companyId');
        const gigId = updatedDraft.selectedGigId || null;

        const journeyToSave: TrainingJourney = {
          ...updatedDraft.journey,
          status: 'draft',
          title: (updatedDraft.journey as any).title || updatedDraft.journey.name
        };

          try {
            // CRITICAL: Re-read draft from localStorage MULTIPLE TIMES to get the most recent draftId
            // This ensures we don't create duplicates if draftId was saved by another call
            let latestDraft = this.getDraftLocally();
            let existingJourneyId = draft.draftId || updatedDraft.draftId || latestDraft.draftId || (updatedDraft.journey as any).id || (updatedDraft.journey as any)._id;
            
            // Double-check: read again right before saving to catch any last-second updates
            latestDraft = this.getDraftLocally();
            existingJourneyId = draft.draftId || latestDraft.draftId || existingJourneyId || (updatedDraft.journey as any).id || (updatedDraft.journey as any)._id;
            
            console.log('[DraftService] DraftId sources:', {
              fromParam: draft.draftId,
              fromUpdatedDraft: updatedDraft.draftId,
              fromLatestDraft: latestDraft.draftId,
              fromJourney: (updatedDraft.journey as any).id || (updatedDraft.journey as any)._id,
              finalJourneyId: existingJourneyId
            });
            
            if (!existingJourneyId) {
              console.warn('[DraftService] ⚠️ No draftId found, will create new journey. Make sure draftId is saved after first creation.');
            } else {
              console.log('[DraftService] ✓ Found existing draftId:', existingJourneyId);
            }
            
            console.log('[DraftService] Saving draft with journeyId:', existingJourneyId || 'NEW');
            
            const response = await JourneyService.saveJourney(
              journeyToSave,
              updatedDraft.modules,
              companyId,
              gigId,
              undefined, // finalExam
              existingJourneyId // Pass existing journeyId to update instead of create
            );

            if (response.success && (response.journey?.id || response.journeyId)) {
              const savedJourneyId = response.journey?.id || response.journeyId || response.journey?._id;
              
              // CRITICAL: Save draftId immediately to localStorage to prevent duplicate creation
              // Re-read draft again to merge with any concurrent updates
              const finalDraft = this.getDraftLocally();
              finalDraft.draftId = savedJourneyId;
              finalDraft.modules = updatedDraft.modules; // Update modules
              finalDraft.lastSaved = new Date().toISOString();
              this.saveDraftLocally(finalDraft);
              
              console.log('[DraftService] ✓ Draft saved immediately, journeyId:', savedJourneyId);
              console.log('[DraftService] ✓ draftId saved to localStorage:', savedJourneyId);
            } else {
              console.error('[DraftService] ✗ Save failed - response:', response);
            }
          } catch (error) {
            console.warn('[DraftService] Could not save draft immediately to backend:', error);
          }
      } else {
        console.log('[DraftService] Skipping save - missing journey or modules:', {
          hasJourney: !!updatedDraft.journey,
          modulesCount: updatedDraft.modules.length
        });
      }
    } catch (error) {
      console.error('[DraftService] Error saving draft immediately:', error);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Restaurer le brouillon
   */
  static getDraft(): JourneyDraft {
    return this.getDraftLocally();
  }

  /**
   * Supprimer le brouillon
   */
  static clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      // Draft cleared
    } catch (error) {
      console.error('[DraftService] Error clearing draft:', error);
    }
  }

  /**
   * Vérifier si un brouillon existe
   */
  static hasDraft(): boolean {
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
      return draft !== null && draft !== '{}';
    } catch (error) {
      return false;
    }
  }
}

