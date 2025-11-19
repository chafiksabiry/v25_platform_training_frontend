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
      console.log('[DraftService] Draft saved locally:', updatedDraft);
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
            const response = await JourneyService.saveJourney(
              journeyToSave,
              updatedDraft.modules,
              companyId,
              gigId
            );

            if (response.success && response.journey?.id) {
              // Sauvegarder l'ID du brouillon
              updatedDraft.draftId = response.journey.id;
              this.saveDraftLocally(updatedDraft);
              console.log('[DraftService] Draft saved to backend:', response.journey.id);
            }
          } catch (error) {
            console.warn('[DraftService] Could not save draft to backend (will retry):', error);
            // Ne pas bloquer l'utilisateur si la sauvegarde backend échoue
          }
        }
      } catch (error) {
        console.error('[DraftService] Error saving draft to backend:', error);
      }
    }, DRAFT_SAVE_INTERVAL);
  }

  /**
   * Sauvegarder immédiatement (sans debounce)
   */
  static async saveDraftImmediately(draft: Partial<JourneyDraft>): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    try {
      const fullDraft = this.getDraftLocally();
      const updatedDraft: JourneyDraft = {
        ...fullDraft,
        ...draft,
        lastSaved: new Date().toISOString()
      };

      // Sauvegarder localement
      this.saveDraftLocally(updatedDraft);

      // Sauvegarder dans le backend si possible
      if (updatedDraft.journey && updatedDraft.modules.length > 0) {
        const companyId = Cookies.get('companyId');
        const gigId = updatedDraft.selectedGigId || null;

        const journeyToSave: TrainingJourney = {
          ...updatedDraft.journey,
          status: 'draft',
          title: (updatedDraft.journey as any).title || updatedDraft.journey.name
        };

        try {
          const response = await JourneyService.saveJourney(
            journeyToSave,
            updatedDraft.modules,
            companyId,
            gigId
          );

          if (response.success && response.journey?.id) {
            updatedDraft.draftId = response.journey.id;
            this.saveDraftLocally(updatedDraft);
            console.log('[DraftService] Draft saved immediately to backend:', response.journey.id);
          }
        } catch (error) {
          console.warn('[DraftService] Could not save draft immediately to backend:', error);
        }
      }
    } catch (error) {
      console.error('[DraftService] Error saving draft immediately:', error);
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
      console.log('[DraftService] Draft cleared');
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

