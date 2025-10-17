import { ApiClient } from '../../lib/api';

export interface DocumentAnalysis {
  keyTopics: string[];
  difficulty: number;
  estimatedReadTime: number;
  learningObjectives: string[];
  prerequisites: string[];
  suggestedModules: string[];
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CurriculumModule {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentItems: number;
  assessments: number;
  enhancedElements: string[];
  learningObjectives: string[];
}

export interface Curriculum {
  success: boolean;
  title: string;
  description: string;
  totalDuration: number;
  methodology: string;
  modules: CurriculumModule[];
}

export interface VideoScene {
  timestamp: string;
  title: string;
  visual: string;
  narration: string;
  onScreenText: string[];
}

export interface VideoScript {
  success: boolean;
  type: 'gpt4-script' | 'fallback';
  title: string;
  duration: number;
  description: string;
  scenes: VideoScene[];
}

export class AIService {
  /**
   * Analyse un document avec l'IA (OpenAI GPT-4)
   */
  static async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await ApiClient.upload('/ai/analyze-document', formData);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Analysis failed');
    }

    return response.data.analysis;
  }

  /**
   * Améliore du contenu texte avec l'IA
   */
  static async enhanceContent(content: string): Promise<string> {
    const response = await ApiClient.post('/ai/enhance-content', { content });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Enhancement failed');
    }

    return response.data.enhancedContent;
  }

  /**
   * Génère des questions de quiz avec l'IA
   */
  static async generateQuiz(content: string, count: number = 5): Promise<QuizQuestion[]> {
    const response = await ApiClient.post('/ai/generate-quiz', { content, count });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Quiz generation failed');
    }

    return response.data.questions;
  }

  /**
   * Génère un audio à partir de texte (ElevenLabs)
   */
  static async generateAudio(text: string): Promise<Blob> {
    const token = ApiClient.getToken();
    const apiUrl = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://38.242.208.242:5010';
    
    const response = await fetch(`${apiUrl}/api/ai/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Audio generation failed');
    }

    return await response.blob();
  }

  /**
   * Chat avec l'AI Tutor
   */
  static async chat(message: string, context: string = ''): Promise<string> {
    const response = await ApiClient.post('/ai/chat', { message, context });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Chat failed');
    }

    return response.data.response;
  }

  /**
   * Génère un curriculum complet basé sur l'analyse du document
   */
  static async generateCurriculum(
    analysis: DocumentAnalysis, 
    industry: string = 'General'
  ): Promise<Curriculum> {
    const response = await ApiClient.post('/ai/generate-curriculum', { 
      analysis, 
      industry 
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Curriculum generation failed');
    }

    return response.data as Curriculum;
  }

  /**
   * Génère un script vidéo détaillé avec GPT-4
   */
  static async generateVideoScript(
    title: string,
    description: string,
    learningObjectives: string[]
  ): Promise<VideoScript> {
    const response = await ApiClient.post('/ai/generate-video-script', {
      title,
      description,
      learningObjectives
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Video script generation failed');
    }

    return response.data as VideoScript;
  }
}

