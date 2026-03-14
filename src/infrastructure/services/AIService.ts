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
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📄 Analyzing document:', file.name, 'Size:', file.size, 'Type:', file.type);

      const response = await ApiClient.upload('/api/ai/analyze-document', formData);

      const data = response.data as any;
      if (!data.success) {
        const errorMsg = data.error || data.message || 'Analysis failed';
        console.error('❌ Analysis failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Document analyzed successfully');
      return data.analysis || data.data?.analysis;
    } catch (error: any) {
      console.error('❌ Error in analyzeDocument:', error);

      // Provide more specific error messages
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to the AI service. Please check your internet connection and try again.');
      }

      if (error.status === 0) {
        throw new Error('Network error: Unable to reach the server. Please check your connection.');
      }

      if (error.status === 413) {
        throw new Error('File too large. Please upload a smaller file.');
      }

      if (error.status === 415) {
        throw new Error('Unsupported file type. Please upload a supported document format.');
      }

      // Re-throw with original message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Document analysis failed. Please try again.');
    }
  }

  /**
   * Analyse a URL (YouTube or HTML page) with AI
   */
  static async analyzeUrl(url: string): Promise<DocumentAnalysis> {
    const response = await ApiClient.post('/api/ai/analyze-url', { url });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'URL analysis failed');
    }

    return data.analysis;
  }

  /**
   * Améliore du contenu texte avec l'IA
   */
  static async enhanceContent(content: string): Promise<string> {
    const response = await ApiClient.post('/api/ai/enhance-content', { content });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'Enhancement failed');
    }

    return data.enhancedContent;
  }

  /**
   * Génère des questions de quiz avec l'IA
   */
  static async generateQuiz(
    content: string | object,
    count: number = 5,
    questionDistribution?: {
      multipleChoice?: number;
      trueFalse?: number;
      multipleCorrect?: number;
    }
  ): Promise<QuizQuestion[]> {
    // If content is a string, convert it to the expected format
    let moduleContent: any;
    if (typeof content === 'string') {
      // For simple string content, create a basic structure
      moduleContent = {
        title: 'Training Module',
        description: content,
        sections: []
      };
    } else {
      // If it's already an object, use it as is
      moduleContent = content;
    }

    // Build question types configuration
    const questionTypes: any = {
      multipleChoice: questionDistribution?.multipleChoice !== undefined ? questionDistribution.multipleChoice > 0 : true,
      trueFalse: questionDistribution?.trueFalse !== undefined ? questionDistribution.trueFalse > 0 : true,
      shortAnswer: false,
      multipleCorrect: questionDistribution?.multipleCorrect !== undefined ? questionDistribution.multipleCorrect > 0 : false
    };

    const requestBody: any = {
      moduleContent: moduleContent,
      numberOfQuestions: count,
      difficulty: 'medium',
      questionTypes: questionTypes
    };

    // Add question distribution if provided
    if (questionDistribution) {
      requestBody.questionDistribution = {
        multipleChoice: questionDistribution.multipleChoice || 0,
        trueFalse: questionDistribution.trueFalse || 0,
        multipleCorrect: questionDistribution.multipleCorrect || 0
      };
    }

    const response = await ApiClient.post('/api/ai/generate-quiz', requestBody);

    const data = response.data as any;
    const questions = data.data?.questions || data.questions || [];

    // Always log mismatch as error for debugging
    if (questions.length !== count) {
      console.error(`[AIService] ⚠️ Mismatch: Requested ${count} questions but received ${questions.length}`);
    } else if (count >= 20) {
      // Log success for large quizzes (like final exams)
      console.log(`[AIService] ✅ Successfully received ${questions.length} questions`);
    }

    if (!data.success) {
      throw new Error(data.error || data.message || 'Quiz generation failed');
    }

    const normalizedQuestions = questions.map((q: any) => ({
      ...q,
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer,
      moduleTitle: q.moduleTitle !== undefined ? q.moduleTitle : q.module_title
    }));

    return normalizedQuestions;
  }

  /**
   * Génère un audio à partir de texte (ElevenLabs)
   */
  static async generateAudio(text: string): Promise<Blob> {
    const token = ApiClient.getToken();
    const apiUrl = import.meta.env.VITE_API_URL || 'https://v25platformtrainingbackend-production.up.railway.app';

    const response = await fetch(`${apiUrl}/api/ai/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
    const response = await ApiClient.post('/api/ai/chat', { message, context });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'Chat failed');
    }

    return data.response;
  }

  /**
   * Génère un curriculum complet basé sur l'analyse du document
   */
  static async generateCurriculum(
    analysis: DocumentAnalysis,
    industry: string = 'General'
  ): Promise<Curriculum> {
    const response = await ApiClient.post('/api/ai/generate-curriculum', {
      analysis,
      industry
    });

    const data = response.data as any;
    // Check if response indicates failure
    if (data.success === false) {
      throw new Error(data.error || 'Curriculum generation failed');
    }

    // Show a console message if using fallback mode
    if (data.fallbackMode) {
      console.warn('⚠️ Using fallback curriculum generation (OpenAI quota exceeded or unavailable)');
    }

    // Extraction robuste des données
    const curriculumData = data.curriculum || data.data?.curriculum || data.data || data;
    
    if (curriculumData && curriculumData.modules) {
      return curriculumData as Curriculum;
    }
    
    return data as Curriculum;
  }

  /**
   * Génère un script vidéo détaillé avec GPT-4
   */
  static async generateVideoScript(
    title: string,
    description: string,
    learningObjectives: string[]
  ): Promise<VideoScript> {
    const response = await ApiClient.post('/api/ai/generate-video-script', {
      title,
      description,
      learningObjectives
    });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'Video script generation failed');
    }

    return data as VideoScript;
  }

  /**
   * Génère le contenu détaillé d'un module avec des sections personnalisées
   * Utilise l'IA pour créer des titres de sections spécifiques basés sur le contenu réel
   */
  static async generateModuleContent(
    moduleTitle: string,
    moduleDescription: string,
    fullTranscription: string,
    learningObjectives: string[]
  ): Promise<any[]> {
    const response = await ApiClient.post('/api/ai/generate-module-content', {
      moduleTitle,
      moduleDescription,
      fullTranscription,
      learningObjectives
    });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'Module content generation failed');
    }

    return data.sections || data.content;
  }

  /**
   * Génère un EXAMEN FINAL GLOBAL pour toute la formation
   * Couvre tous les modules avec 20-30 questions
   */
  static async generateFinalExam(modules: any[], formationTitle: string = 'Training Program'): Promise<any> {
    const response = await ApiClient.post('/api/ai/generate-final-exam', {
      modules,
      formationTitle
    });

    const data = response.data as any;
    if (!data.success) {
      throw new Error(data.error || 'Final exam generation failed');
    }

    // Extraction robuste des données (supporte {data: {exam: ...}} ou {exam: ...} ou direct payload)
    const examData = data.exam || data.data?.exam || data.data || data;

    // Normalisation proactive des clés (snake_case -> camelCase)
    if (examData && typeof examData === 'object') {
      if (examData.question_count !== undefined && examData.questionCount === undefined) {
        examData.questionCount = examData.question_count;
      }
      if (examData.total_points !== undefined && examData.totalPoints === undefined) {
        examData.totalPoints = examData.total_points;
      }
      if (examData.passing_score !== undefined && examData.passingScore === undefined) {
        examData.passingScore = examData.passing_score;
      }
    }

    console.log('[AIService] Extracted exam data:', examData);
    return examData;
  }

  /**
   * Exporte un curriculum en PowerPoint (.pptx)
   * Génère un fichier PowerPoint professionnel avec slides animées
   */
  static async exportToPowerPoint(curriculum: Curriculum): Promise<Blob> {
    const token = ApiClient.getToken();
    const apiUrl = import.meta.env.VITE_API_URL || 'https://v25platformtrainingbackend-production.up.railway.app';

    const response = await fetch(`${apiUrl}/ai/export-powerpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ curriculum })
    });

    if (!response.ok) {
      throw new Error('PowerPoint export failed');
    }

    return await response.blob();
  }
}

