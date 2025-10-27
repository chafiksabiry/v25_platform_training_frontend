import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, CheckSquare, Play, Edit, Trash2, Plus, ArrowRight, Sparkles, Video, Music, BarChart3, Zap, Eye, Wand2, FileDown } from 'lucide-react';
import { ContentUpload, TrainingModule, ModuleContent, Assessment, Question } from '../../types/core';
import { TrainingMethodology } from '../../types/methodology';
import { AIService } from '../../infrastructure/services/AIService';
import PowerPointViewer from '../Export/PowerPointViewer';

interface CurriculumDesignerProps {
  uploads: ContentUpload[];
  methodology?: TrainingMethodology;
  onComplete: (modules: TrainingModule[]) => void;
  onBack: () => void;
}

export default function CurriculumDesigner({ uploads, methodology, onComplete, onBack }: CurriculumDesignerProps) {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [enhancementProgress, setEnhancementProgress] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('modules');
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [pptBlob, setPptBlob] = useState<Blob | null>(null);
  const [showPPTViewer, setShowPPTViewer] = useState(false);

  useEffect(() => {
    generateInitialCurriculum();
  }, [uploads]);

  const generateInitialCurriculum = async () => {
    setIsGenerating(true);
    setEnhancementProgress({ 'initializing': 10 });
    
    try {
      // ✅ SUPPORT DE PLUSIEURS FICHIERS : Combiner les analyses de tous les uploads
      const analyzedUploads = uploads.filter(u => u.aiAnalysis);
      
      if (analyzedUploads.length > 0) {
        // Combiner toutes les analyses en une seule
        const combinedAnalysis = analyzedUploads.length === 1 
          ? analyzedUploads[0].aiAnalysis!
          : {
              // Fusionner les key topics de tous les fichiers
              keyTopics: [...new Set(analyzedUploads.flatMap(u => u.aiAnalysis?.keyTopics || []))],
              
              // Prendre la difficulté moyenne
              difficulty: Math.round(
                analyzedUploads.reduce((sum, u) => sum + (u.aiAnalysis?.difficulty || 5), 0) / analyzedUploads.length
              ),
              
              // Additionner les temps de lecture
              estimatedReadTime: analyzedUploads.reduce((sum, u) => sum + (u.aiAnalysis?.estimatedReadTime || 0), 0),
              
              // Combiner tous les objectifs d'apprentissage
              learningObjectives: [...new Set(analyzedUploads.flatMap(u => u.aiAnalysis?.learningObjectives || []))],
              
              // Combiner les prérequis
              prerequisites: [...new Set(analyzedUploads.flatMap(u => u.aiAnalysis?.prerequisites || []))],
              
              // ✅ CORRECTION : Limiter à 6 modules suggérés maximum
              // Ne pas fusionner tous les modules de tous les uploads !
              suggestedModules: [
                'Module 1: Introduction and Foundations',
                'Module 2: Core Concepts and Theory',
                'Module 3: Advanced Techniques',
                'Module 4: Practical Applications',
                'Module 5: Mastery and Integration',
                'Module 6: Assessment and Conclusion'
              ]
            };
        
        console.log('📊 Combined Analysis:', {
          uploads: analyzedUploads.length,
          suggestedModules: combinedAnalysis.suggestedModules,
          keyTopics: combinedAnalysis.keyTopics,
          learningObjectives: combinedAnalysis.learningObjectives
        });
        
        const industry = methodology?.name || 'General';
        
        setEnhancementProgress({ 'generating': 30 });
        
        // ✅ APPEL API RÉEL pour générer le curriculum avec l'analyse combinée
        const curriculum = await AIService.generateCurriculum(combinedAnalysis, industry);
        
        console.log('📚 Curriculum API Response:', {
          modulesCount: curriculum.modules.length,
          suggestedCount: combinedAnalysis.suggestedModules.length,
          modules: curriculum.modules
        });
        
        setEnhancementProgress({ 'transforming': 60 });
        
        // ✅ CORRECTION : MAXIMUM 6 modules (pas plus !)
        // Si l'API retourne plus de 6 modules, on garde seulement les 6 premiers
        let modulesToUse = curriculum.modules.slice(0, 6);
        const targetModuleCount = 6; // TOUJOURS 6 modules
        
        if (modulesToUse.length > 6) {
          console.warn(`⚠️ API returned ${curriculum.modules.length} modules. Limiting to 6.`);
          modulesToUse = modulesToUse.slice(0, 6);
        }
        
        if (curriculum.modules.length < targetModuleCount) {
          console.warn(`⚠️ API returned ${curriculum.modules.length} modules, but ${targetModuleCount} were expected. Generating missing modules...`);
          
          // Si on a des suggestions, les utiliser
          const availableSuggestions = combinedAnalysis.suggestedModules;
          const missingCount = targetModuleCount - curriculum.modules.length;
          
          const missingModules = [];
          for (let i = 0; i < missingCount; i++) {
            const moduleIndex = curriculum.modules.length + i;
            const suggestedTitle = availableSuggestions[moduleIndex] || `Advanced Module ${moduleIndex + 1}`;
            
            missingModules.push({
              title: suggestedTitle,
              description: `Comprehensive training module covering ${suggestedTitle.toLowerCase()} concepts and practical applications`,
              duration: 60,
              difficulty: 'intermediate' as const,
              contentItems: 7,
              assessments: 3,
              enhancedElements: ['AI-Generated Video', 'Visual Infographic', 'Interactive Scenario', 'Knowledge Check'],
              learningObjectives: combinedAnalysis.learningObjectives.length > 0 
                ? combinedAnalysis.learningObjectives.slice(0, 4)
                : [`Master ${suggestedTitle} fundamentals`, `Apply ${suggestedTitle} in practice`, 'Complete hands-on exercises']
            });
          }
          
          modulesToUse = [...curriculum.modules, ...missingModules];
          console.log('✅ Generated missing modules:', missingModules.length, 'Total modules:', modulesToUse.length);
        }
        
        // Transformer le curriculum GPT-4 en modules TrainingModule
        const generatedModules: TrainingModule[] = modulesToUse.map((aiModule, index) => ({
          id: `ai-module-${index + 1}`,
          title: aiModule.title,
          description: aiModule.description,
          content: generateModuleContentFromAI(aiModule),
          duration: aiModule.duration,
          difficulty: aiModule.difficulty,
          prerequisites: combinedAnalysis.prerequisites,
          learningObjectives: aiModule.learningObjectives,
          topics: combinedAnalysis.keyTopics || [],
          assessments: generateEnhancedAssessments(aiModule.learningObjectives)
        }));
        
        console.log('✅ Final modules generated:', generatedModules.length);
        
        setEnhancementProgress({ 'finalizing': 90 });
        
        setModules(generatedModules);
        setEnhancementProgress({ 'complete': 100 });
      } else {
        // Fallback: générer des modules basiques si pas d'analyse
        const fallbackModules: TrainingModule[] = uploads.map((upload, i) => ({
          id: `fallback-module-${i + 1}`,
          title: `Module ${i + 1}: ${upload.name.replace(/\.[^/.]+$/, "")}`,
          description: `Training module based on uploaded content`,
          content: generateEnhancedModuleContent(upload),
          duration: 60,
          difficulty: 'intermediate',
          prerequisites: [],
          learningObjectives: ['Understand core concepts', 'Apply knowledge in practice'],
          topics: [],
          assessments: []
        }));
        
        setModules(fallbackModules);
      }
    } catch (error) {
      console.error('Failed to generate curriculum with AI:', error);
      
      // En cas d'erreur, créer des modules fallback
      const fallbackModules: TrainingModule[] = uploads.map((upload, i) => ({
        id: `fallback-module-${i + 1}`,
        title: `Module ${i + 1}: ${upload.name.replace(/\.[^/.]+$/, "")}`,
        description: `Training module based on uploaded content`,
        content: generateEnhancedModuleContent(upload),
        duration: 60,
        difficulty: 'intermediate',
        prerequisites: [],
        learningObjectives: ['Understand core concepts', 'Apply knowledge in practice'],
        topics: [],
        assessments: []
      }));
      
      setModules(fallbackModules);
    } finally {
      setIsGenerating(false);
    }
  };

  // Nouvelle fonction helper pour transformer le module AI en contenu
  const generateModuleContentFromAI = (aiModule: any): ModuleContent[] => {
    const content: ModuleContent[] = [];
    
    // Introduction
    content.push({
      id: 'intro',
      type: 'text',
      title: `${aiModule.title} Introduction`,
      content: aiModule.description,
      duration: 5
    });
    
    // Enhanced elements from AI
    if (aiModule.enhancedElements && Array.isArray(aiModule.enhancedElements)) {
      aiModule.enhancedElements.forEach((element: string, index: number) => {
        if (element.toLowerCase().includes('video')) {
          content.push({
            id: `video-${index}`,
            type: 'video',
            title: element,
            content: { videoUrl: '#', generatedByAI: true },
            duration: 10
          });
        } else if (element.toLowerCase().includes('infographic') || element.toLowerCase().includes('visual')) {
          content.push({
            id: `visual-${index}`,
            type: 'interactive',
            title: element,
            content: { type: 'infographic', generatedByAI: true },
            duration: 8
          });
        } else if (element.toLowerCase().includes('scenario') || element.toLowerCase().includes('interactive')) {
          content.push({
            id: `interactive-${index}`,
            type: 'interactive',
            title: element,
            content: { type: 'scenario', generatedByAI: true },
            duration: 15
          });
        } else {
          content.push({
            id: `content-${index}`,
            type: 'text',
            title: element,
            content: `AI-generated content for: ${element}`,
            duration: 7
          });
        }
      });
    }
    
    // Assessment
    content.push({
      id: 'assessment',
      type: 'quiz',
      title: `${aiModule.title} Assessment`,
      content: { questionCount: aiModule.assessments || 5 },
      duration: aiModule.assessments * 2 || 10
    });
    
    return content;
  };

  const generateMethodologyModuleContent = (component: any): ModuleContent[] => {
    return [
      {
        id: 'methodology-intro',
        type: 'text',
        title: `${component.title} Introduction`,
        content: `Welcome to ${component.title}. This module covers ${component.description.toLowerCase()} and is essential for achieving ${component.competencyLevel} level competency.`,
        duration: 5
      },
      {
        id: 'methodology-content',
        type: 'interactive',
        title: 'Core Learning Content',
        content: {
          modules: component.modules,
          interactiveElements: ['scenario-practice', 'knowledge-checks', 'real-world-applications'],
          assessmentIntegration: true
        },
        duration: Math.floor(component.estimatedDuration * 60 * 0.7) // 70% of total time
      },
      {
        id: 'methodology-assessment',
        type: 'quiz',
        title: 'Competency Assessment',
        content: {
          questions: Math.max(5, Math.floor(component.estimatedDuration * 2)),
          competencyLevel: component.competencyLevel,
          mandatoryForCertification: component.mandatoryForCertification
        },
        duration: Math.floor(component.estimatedDuration * 60 * 0.3) // 30% of total time
      }
    ];
  };

  const generateMethodologyAssessments = (component: any): Assessment[] => {
    return [{
      id: `methodology-assessment-${component.id}`,
      title: `${component.title} Competency Assessment`,
      type: 'quiz',
      questions: component.modules.map((module: string, index: number) => ({
        id: `q${index + 1}`,
        text: `Regarding ${module.toLowerCase()}, what is the most critical factor for success?`,
        type: 'multiple-choice' as const,
        options: [
          'Following established procedures exactly',
          'Understanding underlying principles and adapting to situations',
          'Memorizing all possible scenarios',
          'Relying on supervisor guidance for all decisions'
        ],
        correctAnswer: 1,
        explanation: `Success in ${module.toLowerCase()} requires understanding principles and adapting to unique situations while maintaining compliance.`,
        points: 20
      })),
      passingScore: component.mandatoryForCertification ? 85 : 75,
      timeLimit: Math.max(20, component.estimatedDuration * 10) // 10 minutes per hour of content
    }];
  };

  const generateAIEnhancedContent = async (upload: ContentUpload) => {
    // Simulate AI enhancement process
    const enhancements = [
      'Creating AI-generated videos with animations',
      'Generating professional voice narration',
      'Building interactive infographics',
      'Designing scenario-based exercises',
      'Creating adaptive quizzes',
      'Adding gamification elements'
    ];

    for (let i = 0; i < enhancements.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEnhancementProgress(prev => ({
        ...prev,
        [upload.id]: {
          step: i + 1,
          total: enhancements.length,
          description: enhancements[i]
        }
      }));
    }
  };

  const toggleEditMode = (moduleId: string) => {
    setEditingModuleId(editingModuleId === moduleId ? null : moduleId);
  };

  const exportCurriculum = () => {
    const curriculumData = {
      modules,
      methodology: methodology?.name,
      totalDuration: modules.reduce((sum, m) => sum + m.duration, 0),
      totalAssessments: modules.reduce((sum, m) => sum + m.assessments.length, 0),
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(curriculumData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training-curriculum.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPowerPoint = async () => {
    if (modules.length === 0) {
      alert('⚠️ Aucun module à exporter. Veuillez générer des modules d\'abord.');
      return;
    }

    setIsExportingPPT(true);
    
    try {
      // Préparer le curriculum pour l'API
      const curriculum = {
        title: methodology?.name || 'Formation Professionnelle',
        description: `Formation complète générée avec ${modules.length} modules`,
        totalDuration: modules.reduce((sum, m) => sum + m.duration, 0),
        methodology: methodology?.name || '360° Methodology',
        modules: modules.map(m => ({
          title: m.title,
          description: m.description,
          duration: m.duration,
          difficulty: m.difficulty,
          contentItems: m.content.length,
          assessments: m.assessments.length,
          enhancedElements: ['Video Introduction', 'Interactive Exercises', 'Knowledge Check'],
          learningObjectives: m.learningObjectives
        }))
      };

      console.log('📊 Generating PowerPoint for display:', curriculum);

      // Appeler l'API pour générer le PPT
      const blob = await AIService.exportToPowerPoint(curriculum as any);

      // ✅ AFFICHER LE PPT AU LIEU DE LE TÉLÉCHARGER
      setPptBlob(blob);
      setShowPPTViewer(true);

      console.log('✅ PowerPoint généré avec succès et prêt à être affiché!');

    } catch (error) {
      console.error('❌ Erreur lors de l\'export PowerPoint:', error);
      alert('❌ Erreur lors de la génération du PowerPoint. Vérifiez que le backend est lancé.');
    } finally {
      setIsExportingPPT(false);
    }
  };
  const generateEnhancedModuleContent = (upload: ContentUpload): ModuleContent[] => {
    const baseContent: ModuleContent[] = [
      {
        id: 'welcome',
        type: 'text',
        title: 'Welcome & Overview',
        content: `Welcome to this enhanced learning module based on "${upload.name}". This AI-transformed content includes multimedia elements and interactive components designed to maximize your learning experience.`,
        duration: 3
      },
      {
        id: 'ai-video',
        type: 'video',
        title: 'AI-Generated Explanation Video',
        content: { 
          videoUrl: 'ai-generated-video.mp4', 
          transcript: 'AI-generated video explaining key concepts with animations and visual aids.',
          aiGenerated: true,
          style: 'animated',
          duration: 8
        },
        duration: 8
      },
      {
        id: 'main-content',
        type: upload.type === 'video' ? 'video' : 'text',
        title: 'Core Learning Content',
        content: upload.type === 'video' 
          ? { videoUrl: 'original-content-enhanced.mp4', transcript: 'Enhanced version of original content...' }
          : 'Enhanced and restructured content with improved readability and engagement...',
        duration: upload.aiAnalysis?.estimatedReadTime || 15
      },
      {
        id: 'infographic',
        type: 'interactive',
        title: 'Visual Summary Infographic',
        content: { 
          type: 'infographic',
          imageUrl: 'ai-generated-infographic.png',
          interactiveElements: ['clickable-sections', 'hover-details', 'expandable-info'],
          aiGenerated: true
        },
        duration: 5
      },
      {
        id: 'audio-summary',
        type: 'interactive',
        title: 'Audio Summary & Key Takeaways',
        content: {
          type: 'audio',
          audioUrl: 'ai-narrated-summary.mp3',
          transcript: 'Professional AI narration summarizing key points and takeaways.',
          voice: 'professional-female',
          aiGenerated: true
        },
        duration: 4
      },
      {
        id: 'interactive-scenario',
        type: 'interactive',
        title: 'Interactive Learning Scenario',
        content: { 
          exerciseType: 'branching-scenario', 
          description: 'Apply what you\'ve learned in this realistic, interactive scenario with multiple decision points.',
          branches: 3,
          outcomes: ['excellent', 'good', 'needs-improvement']
        },
        duration: 12
      },
      {
        id: 'knowledge-check',
        type: 'quiz',
        title: 'AI-Powered Knowledge Check',
        content: { 
          questions: 5, 
          passingScore: 80,
          adaptiveQuestions: true,
          aiGenerated: true,
          difficulty: 'adaptive'
        },
        duration: 8
      }
    ];

    return baseContent;
  };

  const generateEnhancedAssessments = (keyTopics: string[]): Assessment[] => {
    const questions: Question[] = keyTopics.slice(0, 5).map((topic, index) => ({
      id: `q${index + 1}`,
      text: `In the context of ${topic.toLowerCase()}, what would be the most effective approach when faced with a challenging situation?`,
      type: 'multiple-choice',
      options: [
        'Apply the fundamental principles systematically',
        'Seek immediate supervisor guidance',
        'Use creative problem-solving techniques',
        'Combine multiple approaches strategically'
      ],
      correctAnswer: 3, // "Combine multiple approaches strategically"
      explanation: `The most effective approach combines systematic application of principles with creative problem-solving, demonstrating mastery of ${topic.toLowerCase()}.`,
      points: 20
    }));

    return [{
      id: 'enhanced-assessment',
      title: 'Comprehensive Module Assessment',
      type: 'quiz',
      questions,
      passingScore: 80,
      timeLimit: 20
    }];
  };

  const updateModule = (moduleId: string, updates: Partial<TrainingModule>) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    ));
  };

  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const addNewModule = () => {
    const newModule: TrainingModule = {
      id: `module-${modules.length + 1}`,
      title: 'New Enhanced Module',
      description: 'AI-powered training module with multimedia content',
      content: [
        {
          id: 'intro',
          type: 'text',
          title: 'Introduction',
          content: 'Module introduction content...',
          duration: 5
        }
      ],
      duration: 30,
      difficulty: 'intermediate',
      prerequisites: [],
      learningObjectives: ['New learning objective'],
      topics: [],
      assessments: []
    };
    
    setModules(prev => [...prev, newModule]);
  };

  const getDifficultyColor = (difficulty: TrainingModule['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-yellow-500 text-gray-900';
      case 'advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'interactive':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'quiz':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="relative mb-8">
            <Brain className="h-24 w-24 text-purple-500 mx-auto animate-pulse" />
            <Sparkles className="h-8 w-8 text-pink-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI is Creating Your {methodology ? '360° Methodology-Based' : 'Enhanced'} Curriculum
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Transforming your content into engaging, multimedia training modules with interactive elements
            {methodology && ` based on ${methodology.name} methodology`}...
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-3 text-purple-700">
              <Video className="h-5 w-5" />
              <span>Generating AI videos and animations</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-purple-700">
              <Music className="h-5 w-5" />
              <span>Creating professional voice narration</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-purple-700">
              <BarChart3 className="h-5 w-5" />
              <span>Building interactive infographics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-purple-700">
              <Zap className="h-5 w-5" />
              <span>Adding interactive scenarios and quizzes</span>
            </div>
            {methodology && (
              <div className="flex items-center justify-center space-x-3 text-purple-700">
                <CheckSquare className="h-5 w-5" />
                <span>Integrating {methodology.name} methodology</span>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Step 2: AI-Enhanced Curriculum Design</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Enhanced Training Curriculum</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI has transformed your content into engaging, multimedia training modules with interactive elements and assessments
              {methodology && ` following the ${methodology.name} methodology`}.
            </p>
          </div>

          {/* Methodology Banner */}
          {methodology && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎯 360° Methodology: {methodology.name}</h3>
                  <p className="text-blue-100 mb-3">{methodology.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold">{methodology.components.filter(c => c.category === 'foundational').length}</div>
                      <div className="text-blue-200">Foundational</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{methodology.components.filter(c => c.category === 'regulatory').length}</div>
                      <div className="text-blue-200">Regulatory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{methodology.components.filter(c => c.category === 'contact-centre').length}</div>
                      <div className="text-blue-200">Contact Centre</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{methodology.components.filter(c => c.category === 'regional-compliance').length}</div>
                      <div className="text-blue-200">Regional</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{methodology.components.reduce((sum, c) => sum + c.estimatedDuration, 0)}h</div>
                  <div className="text-blue-200 text-sm">Total Training</div>
                </div>
              </div>
            </div>
          )}
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <CheckSquare className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-900">Curriculum Enhanced Successfully!</h3>
                <p className="text-green-700">
                  Your content has been transformed with AI-generated videos, audio, infographics, and interactive elements
                  {methodology && ` following industry best practices and compliance requirements`}.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            {/* Module List */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Enhanced Training Modules ({modules.length} modules)</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={addNewModule}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                      title="Add Module"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Module</span>
                    </button>
                    <button
                      onClick={exportCurriculum}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Export as JSON"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={exportToPowerPoint}
                      disabled={isExportingPPT}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export as PowerPoint"
                    >
                      {isExportingPPT ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          <span>Export PPT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {modules.map((module, index) => {
                    const isEditing = editingModuleId === module.id;
                    
                    return (
                    <div key={module.id} className={`border-2 rounded-xl p-6 transition-all ${isEditing ? 'border-indigo-500 shadow-xl bg-indigo-50' : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                className="flex-1 text-xl font-semibold text-gray-900 px-3 py-2 border-2 border-indigo-400 rounded-lg focus:outline-none focus:border-indigo-600"
                                placeholder="Module Title"
                              />
                            ) : (
                            <h4 className="text-xl font-semibold text-gray-900">{module.title}</h4>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(module.difficulty)}`}>
                              {module.difficulty || 'intermediate'}
                            </span>
                            {module.id.startsWith('methodology-') && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                360° Methodology
                              </span>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-4 mb-4">
                              <textarea
                                value={module.description}
                                onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                rows={3}
                                className="w-full text-gray-600 px-3 py-2 border-2 border-indigo-400 rounded-lg focus:outline-none focus:border-indigo-600"
                                placeholder="Module Description"
                              />
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                  <select
                                    value={module.difficulty}
                                    onChange={(e) => updateModule(module.id, { difficulty: e.target.value as TrainingModule['difficulty'] })}
                                    className="w-full px-3 py-2 border-2 border-indigo-400 rounded-lg focus:outline-none focus:border-indigo-600"
                                  >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                  <input
                                    type="number"
                                    value={module.duration}
                                    onChange={(e) => updateModule(module.id, { duration: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-indigo-400 rounded-lg focus:outline-none focus:border-indigo-600"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                  <input
                                    type="number"
                                    value={module.order}
                                    onChange={(e) => updateModule(module.id, { order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-indigo-400 rounded-lg focus:outline-none focus:border-indigo-600"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                          <p className="text-gray-600 mb-4">{module.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                              <div className="text-sm font-medium text-blue-900">{module.duration} min</div>
                              <div className="text-xs text-gray-600">Duration</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <CheckSquare className="h-5 w-5 text-green-600 mx-auto mb-1" />
                              <div className="text-sm font-medium text-green-900">{module.content.length}</div>
                              <div className="text-xs text-gray-600">Content Items</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <Zap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                              <div className="text-sm font-medium text-purple-900">{module.assessments.length}</div>
                              <div className="text-xs text-gray-600">Assessments</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <Sparkles className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                              <div className="text-sm font-medium text-orange-900">AI Enhanced</div>
                              <div className="text-xs text-gray-600">Multimedia</div>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Enhanced Content Elements:</h5>
                            <div className="flex flex-wrap gap-2">
                              {module.content.map((content, idx) => (
                                <div key={idx} className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                  {getContentTypeIcon(content.type)}
                                  <span className="text-gray-700">{content.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleEditMode(module.id)}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                              isEditing 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title={isEditing ? "Save Changes" : "Edit Module"}
                          >
                            {isEditing ? (
                              <>
                                <CheckSquare className="h-4 w-4 inline mr-1" />
                                Save
                              </>
                            ) : (
                              <>
                                <Edit className="h-4 w-4 inline mr-1" />
                                Edit
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Learning Objectives:</h5>
                        <ul className="space-y-1">
                          {module.learningObjectives.map((objective, objIndex) => (
                            <li key={objIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                              <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Enhancement Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mt-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              AI Enhancement Summary {methodology && `- ${methodology.name}`}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                <Video className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-red-600 mb-1">{modules.length}</div>
                <div className="text-sm text-gray-600">AI Videos Created</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <Music className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600 mb-1">{modules.length}</div>
                <div className="text-sm text-gray-600">Audio Narrations</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <BarChart3 className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600 mb-1">{modules.length}</div>
                <div className="text-sm text-gray-600">Infographics</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <Zap className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-600 mb-1">{modules.reduce((sum, m) => sum + m.content.filter(c => c.type === 'interactive').length, 0)}</div>
                <div className="text-sm text-gray-600">Interactive Elements</div>
              </div>
            </div>
            
            {methodology && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Methodology Components Integrated:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {methodology.components.map((component, index) => (
                    <div key={component.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-1">{component.title}</h5>
                      <div className="text-sm text-blue-700">
                        {component.estimatedDuration}h • {component.weight}% weight • {component.competencyLevel} level
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Back to Upload
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">
                {modules.length} enhanced modules ready
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600 font-medium">
                  {methodology ? '360° Methodology' : 'AI Enhancement'} Complete
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onComplete(modules)}
              disabled={modules.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg flex items-center space-x-2"
            >
              <span>Continue to Rehearsal</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PowerPoint Viewer Modal */}
      {showPPTViewer && pptBlob && (
        <PowerPointViewer
          pptBlob={pptBlob}
          onClose={() => {
            setShowPPTViewer(false);
            setPptBlob(null);
          }}
        />
      )}
    </div>
  );
}