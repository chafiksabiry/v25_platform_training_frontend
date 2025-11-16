import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, MessageSquare, Star, Eye, Users, Rocket, ArrowLeft, ArrowRight, Clock, BarChart3, Zap, Video, BookOpen, Edit3, Save, X as XIcon, Trash2, Plus, Download, FileText, Image as ImageIcon, Youtube, Sparkles, Loader2, FileQuestion } from 'lucide-react';
import DocumentViewer from '../DocumentViewer/DocumentViewer';
import { TrainingJourney, TrainingModule, RehearsalFeedback, ContentUpload, Assessment, Question } from '../../types';
import { TrainingMethodology } from '../../types/methodology';
import ModuleContentViewer from '../Training/ModuleContentViewer';
import { TrainingSection, SectionContent, ContentFile } from '../../types/manualTraining';
import { AIService } from '../../infrastructure/services/AIService';
import axios from 'axios';

interface SlideData {
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
}

// Extended module interface to support sections
interface ModuleWithSections extends TrainingModule {
  sections?: TrainingSection[];
}

interface RehearsalModeProps {
  journey: TrainingJourney;
  modules: TrainingModule[];
  uploads?: ContentUpload[];
  methodology?: TrainingMethodology;
  onComplete: (feedback: RehearsalFeedback[], rating: number) => void;
  onBack: () => void;
}

export default function RehearsalMode({ journey, modules, uploads = [], methodology, onComplete, onBack }: RehearsalModeProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<RehearsalFeedback[]>([]);
  const [overallRating, setOverallRating] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState({
    type: 'content' as RehearsalFeedback['type'],
    message: '',
    severity: 'medium' as RehearsalFeedback['severity']
  });
  const [rehearsalTime, setRehearsalTime] = useState(0);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  // Removed activeTab state - only sections tab now
  const [slideData, setSlideData] = useState<SlideData[]>([]);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [showPPTViewer, setShowPPTViewer] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [generatingQuizForModule, setGeneratingQuizForModule] = useState<string | null>(null);
  const [generatingFinalExam, setGeneratingFinalExam] = useState(false);
  const [updatedModules, setUpdatedModules] = useState<TrainingModule[]>(modules);

  // Convert uploads to sections if modules don't have sections
  const modulesWithSections = useMemo(() => {
    return updatedModules.map((module, moduleIndex) => {
      const moduleWithSections = module as ModuleWithSections;
      
      // If module already has sections, use them
      if (moduleWithSections.sections && moduleWithSections.sections.length > 0) {
        return moduleWithSections;
      }
      
      // Otherwise, create sections from uploads
      // Match uploads to modules based on index or content
      const relevantUploads = uploads.filter((upload, uploadIndex) => {
        // Try to match by module title or use index-based matching
        const moduleTitleLower = module.title.toLowerCase();
        const uploadNameLower = upload.name.toLowerCase();
        return moduleTitleLower.includes(uploadNameLower.replace(/\.[^/.]+$/, '')) || 
               uploadIndex === moduleIndex;
      });
      
      // If no direct match, use all uploads for first module, or distribute
      const uploadsToUse = relevantUploads.length > 0 
        ? relevantUploads 
        : (moduleIndex === 0 ? uploads : []);
      
      const sections: TrainingSection[] = uploadsToUse.map((upload, uploadIdx) => {
        // Determine section type based on upload type
        let sectionType: TrainingSection['type'] = 'document';
        if (upload.type === 'video') {
          sectionType = 'video';
        } else if (upload.type === 'document' || upload.type === 'presentation') {
          sectionType = 'document';
        }
        
        // Get AI description from upload analysis (formatted nicely)
        const aiDescription = upload.aiAnalysis 
          ? `📚 **Key Topics:**\n${upload.aiAnalysis.keyTopics?.map(topic => `• ${topic}`).join('\n') || 'N/A'}\n\n` +
            `🎯 **Learning Objectives:**\n${upload.aiAnalysis.learningObjectives?.map(obj => `• ${obj}`).join('\n') || 'N/A'}\n\n` +
            `⏱️ **Estimated Duration:** ${upload.aiAnalysis.estimatedReadTime || 0} minutes\n\n` +
            `📊 **Difficulty Level:** ${upload.aiAnalysis.difficulty || 'N/A'}/10`
          : `Document: ${upload.name}`;
        
        // Create content file from upload
        // Try to get URL from file object or use empty string (will be handled in renderSectionContent)
        let fileUrl = '';
        if (upload.file) {
          try {
            fileUrl = URL.createObjectURL(upload.file);
          } catch (e) {
            console.warn('Could not create object URL for file:', upload.name);
          }
        }
        
        const contentFile: ContentFile = {
          id: upload.id,
          name: upload.name,
          type: upload.type === 'video' ? 'video' : 
                upload.type === 'presentation' ? 'pdf' : 
                upload.type === 'document' ? 'pdf' : 'pdf',
          url: fileUrl,
          publicId: upload.id,
          size: upload.size || 0,
          mimeType: upload.type === 'video' ? 'video/mp4' : 
                   upload.type === 'document' ? 'application/pdf' : 
                   upload.type === 'presentation' ? 'application/pdf' : 'application/pdf'
        };
        
        const sectionContent: SectionContent = {
          text: aiDescription,
          file: contentFile,
          keyPoints: upload.aiAnalysis?.keyTopics || []
        };
        
        return {
          id: `section-${moduleIndex}-${uploadIdx}`,
          title: upload.name.replace(/\.[^/.]+$/, ''),
          type: sectionType,
          content: sectionContent,
          orderIndex: uploadIdx + 1,
          estimatedDuration: upload.aiAnalysis?.estimatedReadTime || 10
        };
      });
      
      return {
        ...moduleWithSections,
        sections: sections.length > 0 ? sections : undefined
      };
    });
  }, [updatedModules, uploads]);

  const currentModule = modulesWithSections[currentModuleIndex];
  const isLastModule = currentModuleIndex === updatedModules.length - 1;
  const hasSections = currentModule?.sections && currentModule.sections.length > 0;
  const currentSection = hasSections ? currentModule.sections[currentSectionIndex] : null;
  const progress = (completedModules.length / updatedModules.length) * 100;
  
  // Calculate section progress
  const sectionProgress = hasSections && currentModule.sections.length > 0
    ? (completedSections.size / currentModule.sections.length) * 100
    : 0;

  // Auto-display content viewer on load
  useEffect(() => {
    setShowContentViewer(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setRehearsalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModuleComplete = () => {
    // Don't scroll when marking complete
    shouldScrollRef.current = false;
    
    if (currentModule && !completedModules.includes(currentModule.id)) {
      setCompletedModules(prev => [...prev, currentModule.id]);
    }
    
    if (currentModuleIndex < updatedModules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentSectionIndex(0);
    }
  };

  const handleSectionComplete = () => {
    // Don't scroll when marking complete
    shouldScrollRef.current = false;
    
    if (currentSection?.id) {
      setCompletedSections(prev => new Set(prev).add(currentSection.id!));
    }
    
    if (hasSections && currentSectionIndex < currentModule.sections!.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleModuleComplete();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1] as ModuleWithSections;
      if (prevModule.sections && prevModule.sections.length > 0) {
        setCurrentModuleIndex(prev => prev - 1);
        setCurrentSectionIndex(prevModule.sections.length - 1);
      } else {
        setCurrentModuleIndex(prev => prev - 1);
      }
    }
  };

  const handleNextSection = () => {
    if (hasSections && currentSectionIndex < currentModule.sections!.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentSectionIndex(0);
    }
  };

  // Track if we should scroll (don't scroll when marking complete)
  const shouldScrollRef = React.useRef(true);

  // Reset section index when module changes and scroll to top
  useEffect(() => {
    setCurrentSectionIndex(0);
    if (shouldScrollRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    shouldScrollRef.current = true; // Reset for next time
  }, [currentModuleIndex]);

  // Scroll to top when section changes (only if shouldScroll is true)
  useEffect(() => {
    if (shouldScrollRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    shouldScrollRef.current = true; // Reset for next time
  }, [currentSectionIndex]);

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < updatedModules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  // Get API base URL
  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    return 'https://api-training.harx.ai';
  };
  const API_BASE = getApiBaseUrl();

  // Generate quiz for a module
  const generateModuleQuiz = async (module: TrainingModule, isFinalExam: boolean = false) => {
    const moduleId = module.id;
    setGeneratingQuizForModule(moduleId);
    if (isFinalExam) {
      setGeneratingFinalExam(true);
    }

    try {
      // Prepare module content for quiz generation
      const moduleContent = `${module.title}\n\n${module.description}\n\n${
        module.learningObjectives?.join('\n') || ''
      }`;

      // Calculate number of questions (10-15 for modules, 20-30 for final exam)
      const questionCount = isFinalExam ? 25 : 12;

      console.log(`📝 Generating ${isFinalExam ? 'final exam' : 'quiz'} for module: ${module.title}`);

      // Generate quiz using AI service
      const questions = await AIService.generateQuiz(moduleContent, questionCount);

      // Convert to Assessment format
      const assessmentQuestions: Question[] = questions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        text: q.text || q.question,
        type: 'multiple-choice' as const,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 10
      }));

      // Calculate passing score (70% of total points)
      const totalPoints = assessmentQuestions.reduce((sum, q) => sum + (q.points || 10), 0);
      const passingScore = Math.floor(totalPoints * 0.7);

      // Create assessment
      const assessment: Assessment = {
        id: isFinalExam 
          ? `final-exam-${journey.id}` 
          : `assessment-${moduleId}-${Date.now()}`,
        title: isFinalExam 
          ? `Examen Final - ${journey.name}` 
          : `Quiz - ${module.title}`,
        type: 'quiz',
        questions: assessmentQuestions,
        passingScore: passingScore,
        timeLimit: assessmentQuestions.length * 2 // 2 minutes per question
      };

      // Update module with new assessment
      const updatedModulesList = updatedModules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            assessments: [...(m.assessments || []), assessment]
          };
        }
        return m;
      });

      setUpdatedModules(updatedModulesList);

      // Save to server
      try {
        const saveData = {
          moduleId: moduleId,
          journeyId: journey.id,
          assessment: assessment,
          isFinalExam: isFinalExam
        };

        // Try to save to server (adjust endpoint based on your API structure)
        await axios.post(`${API_BASE}/api/training-journeys/${journey.id}/modules/${moduleId}/assessments`, saveData);
        console.log(`✅ ${isFinalExam ? 'Final exam' : 'Quiz'} saved to server`);
      } catch (saveError) {
        console.warn('⚠️ Could not save to server, but quiz is generated locally:', saveError);
        // Continue even if save fails - quiz is still available locally
      }

      console.log(`✅ ${isFinalExam ? 'Final exam' : 'Quiz'} generated successfully`);
    } catch (error) {
      console.error(`❌ Error generating ${isFinalExam ? 'final exam' : 'quiz'}:`, error);
      alert(`Erreur lors de la génération du ${isFinalExam ? 'examen final' : 'quiz'}. Veuillez réessayer.`);
    } finally {
      setGeneratingQuizForModule(null);
      setGeneratingFinalExam(false);
    }
  };

  const addFeedback = () => {
    if (!currentFeedback.message.trim()) return;

    const newFeedback: RehearsalFeedback = {
      id: Date.now().toString(),
      moduleId: currentModule?.id || 'general',
      type: currentFeedback.type,
      message: currentFeedback.message,
      severity: currentFeedback.severity,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    setFeedback(prev => [...prev, newFeedback]);
    setCurrentFeedback({ type: 'content', message: '', severity: 'medium' });
    setShowFeedbackForm(false);
  };

  const handleFinishRehearsal = () => {
    onComplete(feedback, overallRating);
  };

  const handlePlayContent = () => {
    setShowContentViewer(true);
    setActiveTab('ppt');
    setIsPlaying(true);
    console.log('▶️ Displaying content viewer');
  };

  const handleContentComplete = () => {
    alert('🎉 All content completed! Great job!');
    handleFinishRehearsal();
  };

  // Generate slides from modules
  const generateSlides = (): SlideData[] => {
    const colors = ['#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#A855F7'];
    
    const slides: SlideData[] = [
      {
        title: 'Training Curriculum',
        content: journey.name || 'Professional Training',
        bgColor: '#6366F1',
        textColor: '#FFFFFF'
      },
      {
        title: 'Overview',
        content: `Complete training with ${updatedModules.length} modules • Total: ${updatedModules.reduce((sum, m) => sum + m.duration, 0)} min`,
        bgColor: '#8B5CF6',
        textColor: '#FFFFFF'
      }
    ];
    
    // Generate detailed slides for each module
    updatedModules.forEach((module, index) => {
      const moduleColor = colors[index % colors.length];
      
      // Module title slide
      slides.push({
        title: `Module ${index + 1}: ${module.title}`,
        content: `Duration: ${module.duration} min • Level: ${module.difficulty}`,
        bgColor: moduleColor,
        textColor: '#FFFFFF'
      });
      
      // Module description slide
      slides.push({
        title: 'Introduction',
        content: module.description,
        bgColor: moduleColor,
        textColor: '#FFFFFF'
      });
      
      // Learning objectives slide
      if (module.learningObjectives && module.learningObjectives.length > 0) {
        slides.push({
          title: 'Learning Objectives',
          content: '• ' + module.learningObjectives.join('\n• '),
          bgColor: moduleColor,
          textColor: '#FFFFFF'
        });
      }
      
      // Content items - Create a slide for each content item with its full text
      if (module.content && module.content.length > 0) {
        module.content.forEach((contentItem, contentIndex) => {
          // Extract text content from the item
          let contentText = '';
          
          // Generate descriptive text based on content type
          if (typeof contentItem.content === 'string') {
            contentText = contentItem.content;
          } else if (typeof contentItem.content === 'object' && contentItem.content !== null) {
            // Handle different content types
            if ('text' in contentItem.content) {
              contentText = contentItem.content.text;
            } else if ('description' in contentItem.content) {
              contentText = contentItem.content.description;
            } else if ('questionCount' in contentItem.content) {
              contentText = `This assessment contains ${contentItem.content.questionCount} questions to evaluate your understanding of the module content.\n\nTopics covered:\n• Key concepts and principles\n• Practical applications\n• Best practices\n\nDuration: ${contentItem.duration} minutes`;
            } else if ('modules' in contentItem.content && Array.isArray(contentItem.content.modules)) {
              contentText = `Interactive learning module covering:\n\n• ${contentItem.content.modules.join('\n• ')}\n\nThis hands-on activity helps reinforce your understanding through practical exercises.`;
            } else if ('generatedByAI' in contentItem.content) {
              // Generate descriptive content based on type
              const typeDescriptions: Record<string, string> = {
                'video': `This AI-generated video provides a comprehensive visual explanation of ${contentItem.title}.\n\nKey points covered:\n• Visual demonstrations\n• Step-by-step explanations\n• Real-world examples\n• Best practices\n\nDuration: ${contentItem.duration} minutes`,
                'infographic': `This interactive infographic presents key information about ${contentItem.title} in a visually engaging format.\n\nFeatures:\n• Data visualizations\n• Key statistics\n• Process flows\n• Important concepts\n\nExplore the infographic to discover insights.`,
                'interactive': `This interactive exercise allows you to practice ${contentItem.title} concepts.\n\nActivities include:\n• Scenario-based learning\n• Decision-making exercises\n• Problem-solving tasks\n• Real-world simulations\n\nEstimated time: ${contentItem.duration} minutes`,
                'audio': `Audio content covering ${contentItem.title}.\n\nListen to expert explanations and insights about:\n• Core concepts\n• Practical applications\n• Industry best practices\n• Case studies\n\nDuration: ${contentItem.duration} minutes`
              };
              
              contentText = typeDescriptions[contentItem.type] || `This ${contentItem.type} content covers important aspects of ${contentItem.title}.\n\nDuration: ${contentItem.duration} minutes\nType: AI-Enhanced ${contentItem.type}\n\nEngage with this content to deepen your understanding of the subject matter.`;
            } else {
              // Default description
              contentText = `This learning content focuses on ${contentItem.title}.\n\nType: ${contentItem.type.toUpperCase()}\nDuration: ${contentItem.duration} minutes\n\nThis material is designed to help you understand and apply key concepts effectively.`;
            }
          } else {
            // Fallback for undefined content
            contentText = `${contentItem.title}\n\nThis ${contentItem.type} element is part of the training module.\n\nDuration: ${contentItem.duration} minutes\n\nEngage with this content to build your knowledge and skills in this area.`;
          }
          
          // ✅ Create slide with FULL TEXT CONTENT (no truncation for rich content)
          slides.push({
            title: contentItem.title,
            content: contentText.substring(0, 800), // Increased limit for detailed content
            bgColor: moduleColor,
            textColor: '#FFFFFF'
          });
        });
      }
      
      // Prerequisites slide if any
      if (module.prerequisites && module.prerequisites.length > 0) {
        slides.push({
          title: 'Prerequisites',
          content: '• ' + module.prerequisites.join('\n• '),
          bgColor: moduleColor,
          textColor: '#FFFFFF'
        });
      }
    });
    
    // Final slide
    slides.push({
      title: 'Thank You!',
      content: `Training complete • ${updatedModules.length} modules covered`,
      bgColor: '#6366F1',
      textColor: '#FFFFFF'
    });
    
    return slides;
  };

  // Initialize slides when module changes (removed - no longer using PowerPoint viewer)
  // useEffect(() => {
  //   if (currentModule && activeTab === 'ppt') {
  //     const slides = generateSlides();
  //     setSlideData(slides);
  //     setSlideImages(slides.map(() => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzYzNjZGMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2xpZGUgUHJldmlldzwvdGV4dD48L3N2Zz4='));
  //     setCurrentSlideIndex(0);
  //     setShowPPTViewer(true);
  //   }
  // }, [currentModule, activeTab]);

  const updateCurrentSlide = (field: keyof SlideData, value: string) => {
    const newSlideData = [...slideData];
    newSlideData[currentSlideIndex] = {
      ...newSlideData[currentSlideIndex],
      [field]: value
    };
    setSlideData(newSlideData);
    
    // In a real implementation, regenerate preview using PowerPointService
    // For now, just update the data
  };

  const addNewSlide = () => {
    const newSlide: SlideData = {
      title: 'New Slide',
      content: 'Slide content',
      bgColor: '#6366F1',
      textColor: '#FFFFFF'
    };
    
    const newSlideData = [...slideData, newSlide];
    setSlideData(newSlideData);
    
    // Generate preview image (simplified)
    setSlideImages([...slideImages, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzYzNjZGMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TmV3IFNsaWRlPC90ZXh0Pjwvc3ZnPg==']);
    setCurrentSlideIndex(slideImages.length);
  };

  const downloadPowerPoint = async () => {
    if (slideData.length === 0) {
      alert('No slides to export!');
      return;
    }

    setIsGeneratingPPT(true);
    try {
      console.log('📥 Generating PowerPoint file...');
      // In a real implementation, use PowerPointService.generatePowerPoint
      // For now, just show an alert
      alert('✅ PowerPoint generation would happen here. Install PowerPointService to enable this feature.');
    } catch (error) {
      console.error('❌ Error generating PowerPoint:', error);
      alert('❌ Error generating PowerPoint.');
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  const deleteCurrentSlide = () => {
    if (slideData.length <= 1) {
      alert('Cannot delete the last slide!');
      return;
    }
    
    const newSlideData = slideData.filter((_, index) => index !== currentSlideIndex);
    const newSlideImages = slideImages.filter((_, index) => index !== currentSlideIndex);
    
    setSlideData(newSlideData);
    setSlideImages(newSlideImages);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const goToPreviousSlide = () => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => Math.min(slideImages.length - 1, prev + 1));
  };

  const handlePlayPPT = () => {
    if (slideData.length === 0) {
      const slides = generateSlides();
      setSlideData(slides);
      setSlideImages(slides.map(() => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzYzNjZGMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2xpZGUgUHJldmlldzwvdGV4dD48L3N2Zz4='));
      setCurrentSlideIndex(0);
      setShowPPTViewer(true);
    }
    setIsPlaying(!isPlaying);
  };

  const generateRehearsalReport = () => {
    const report = {
      journey: journey.name,
      totalTime: formatTime(rehearsalTime),
      modulesCompleted: completedModules.length,
      totalModules: updatedModules.length,
      feedback: feedback.length,
      rating: overallRating,
      readyForLaunch: overallRating >= 3 && feedback.filter(f => f.severity === 'high').length === 0,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rehearsal-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'interactive':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderSectionContent = (section: TrainingSection) => {
    const content = section.content;
    
    switch (section.type) {
      case 'document':
        if (content?.file && content.file.url) {
          return (
            <div className="w-full h-full" style={{ minHeight: '400px' }}>
              <DocumentViewer
                fileUrl={content.file.url}
                fileName={content.file.name}
                mimeType={content.file.mimeType}
              />
            </div>
          );
        }
        return (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No document available for this section</p>
          </div>
        );

      case 'text':
        return (
          <div className="prose max-w-none">
            {content?.text ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {content.text.split('\n').map((line, idx) => {
                    // Format markdown-like syntax
                    if (line.startsWith('📚') || line.startsWith('🎯') || line.startsWith('⏱️') || line.startsWith('📊')) {
                      return <div key={idx} className="font-semibold text-gray-900 mt-3 mb-2">{line}</div>;
                    } else if (line.startsWith('•')) {
                      return <div key={idx} className="ml-4 text-gray-700">{line}</div>;
                    } else if (line.trim() === '') {
                      return <br key={idx} />;
                    } else {
                      return <div key={idx} className="text-gray-700">{line}</div>;
                    }
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No text content available</p>
            )}
            {content?.keyPoints && content.keyPoints.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Key Points:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-blue-800">
                  {content.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'video':
        const videoUrl = content?.file?.url || content?.url;
        if (videoUrl) {
          return (
            <div className="w-full h-full" style={{ minHeight: '400px' }}>
              <DocumentViewer
                fileUrl={videoUrl}
                fileName={content?.file?.name}
                mimeType={content?.file?.mimeType || 'video/mp4'}
              />
            </div>
          );
        }
        return (
          <div className="text-center py-12 text-gray-500">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No video available</p>
          </div>
        );

      case 'youtube':
        const youtubeUrl = content?.youtubeUrl || content?.url || content?.file?.url;
        if (youtubeUrl) {
          return (
            <div className="w-full h-full" style={{ minHeight: '400px' }}>
              <DocumentViewer
                fileUrl={youtubeUrl}
                fileName={content?.file?.name}
                mimeType={content?.file?.mimeType}
              />
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Youtube className="w-16 h-16" />
          </div>
        );

      case 'interactive':
        return (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interactive Content</h4>
            {content?.embedCode ? (
              <div dangerouslySetInnerHTML={{ __html: content.embedCode }} />
            ) : (
              <p className="text-gray-600">Interactive content will be displayed here</p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>Content type not supported: {section.type}</p>
          </div>
        );
    }
  };

  const getFeedbackIcon = (type: RehearsalFeedback['type']) => {
    switch (type) {
      case 'content':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'technical':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'engagement':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'suggestion':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: RehearsalFeedback['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      REHEARSAL MODE
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{journey.name}</h1>
                  <p className="text-gray-600">Test and review your training journey before launch</p>
                  </div>
                </div>
              
                <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Rehearsal Time</div>
                <div className="text-2xl font-bold text-gray-900">{formatTime(rehearsalTime)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {methodology && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">🎯 360° Methodology in Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {methodology.components.slice(0, 8).map((component, index) => (
                  <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-purple-900">{component.title}</div>
                    <div className="text-xs text-purple-700">{component.estimatedDuration}h • {component.competencyLevel}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-purple-700 text-sm">
                  Complete 360° approach covering foundational knowledge, regulatory compliance, 
                  contact centre excellence, and regional requirements
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Module Navigation */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Module {currentModuleIndex + 1} of {updatedModules.length}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousModule}
                      disabled={currentModuleIndex === 0}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextModule}
                      disabled={currentModuleIndex === modules.length - 1}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {updatedModules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setCurrentModuleIndex(index);
                        setCurrentSectionIndex(0);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        index === currentModuleIndex
                          ? 'bg-purple-600 text-white'
                          : completedModules.includes(module.id)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}. {module.title}
                      {completedModules.includes(module.id) && (
                        <CheckCircle className="h-4 w-4 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Module Content */}
              {currentModule && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentModule.title}</h2>
                      <p className="text-gray-600">{currentModule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                        currentModule.difficulty === 'beginner' ? 'bg-green-500 text-white' :
                        currentModule.difficulty === 'intermediate' ? 'bg-yellow-500 text-gray-900' :
                        currentModule.difficulty === 'advanced' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {currentModule.difficulty || 'intermediate'}
                      </span>
                    </div>
                  </div>

                  {/* Sections Navigation (if module has sections) */}
                  {hasSections && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Section {currentSectionIndex + 1} of {currentModule.sections!.length}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePreviousSection}
                            disabled={currentSectionIndex === 0 && currentModuleIndex === 0}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNextSection}
                            disabled={currentSectionIndex === currentModule.sections!.length - 1 && currentModuleIndex === updatedModules.length - 1}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentModule.sections!.map((section, index) => (
                          <button
                            key={section.id || index}
                            onClick={() => setCurrentSectionIndex(index)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              index === currentSectionIndex
                                ? 'bg-purple-600 text-white'
                                : completedSections.has(section.id || '')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}. {section.title}
                            {completedSections.has(section.id || '') && (
                              <CheckCircle className="h-4 w-4 inline ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-6">
                    {hasSections && currentSection ? (
                      <div className="bg-gray-50 rounded-xl p-6">
                        {/* Section Content - Display document directly without header */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          {renderSectionContent(currentSection)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sections Available</h3>
                        <p className="text-gray-600">This module doesn't have any sections with documents yet.</p>
                        {uploads.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">Please upload documents in the previous step.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Module Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {hasSections && (
                        <div className="text-sm text-gray-600">
                          Section {currentSectionIndex + 1} of {currentModule.sections?.length || 0}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleModuleComplete}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>

                  {/* Module Statistics - Bottom Section */}
                  <div className="mt-8 space-y-6">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-blue-600">{currentModule.duration || 0}</div>
                        <div className="text-sm text-gray-600">Duration (min)</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-green-600">{hasSections ? (currentModule.sections?.length || 0) : (currentModule.content?.length || 0)}</div>
                        <div className="text-sm text-gray-600">{hasSections ? 'Sections' : 'Content Items'}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-purple-600">{currentModule.assessments?.length || 0}</div>
                        <div className="text-sm text-gray-600">Assessments</div>
                      </div>
                    </div>

                    {/* AI-Generated Assessments */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                          AI-Generated Assessments {currentModule.assessments && currentModule.assessments.length > 0 && `(${currentModule.assessments.length})`}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => generateModuleQuiz(currentModule, false)}
                            disabled={generatingQuizForModule === currentModule.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {generatingQuizForModule === currentModule.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Génération...</span>
                              </>
                            ) : (
                              <>
                                <FileQuestion className="h-4 w-4" />
                                <span>Générer Quiz</span>
                              </>
                            )}
                          </button>
                          {isLastModule && (
                            <button
                              onClick={() => generateModuleQuiz(currentModule, true)}
                              disabled={generatingFinalExam}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {generatingFinalExam ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Génération...</span>
                                </>
                              ) : (
                                <>
                                  <FileQuestion className="h-4 w-4" />
                                  <span>Examen Final</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {currentModule.assessments && currentModule.assessments.length > 0 ? (
                        <div className="space-y-3">
                          {currentModule.assessments.map((assessment, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200 flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{assessment.title}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                    {assessment.questions?.length || 0} questions
                                  </span>
                                  <span>Type: {assessment.type || 'quiz'}</span>
                                  <span>Passing Score: {assessment.passingScore || 80}%</span>
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <FileQuestion className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm">Aucun quiz généré pour ce module</p>
                          <p className="text-xs mt-1">Cliquez sur "Générer Quiz" pour créer un quiz avec l'IA</p>
                        </div>
                      )}
                    </div>

                    {/* Prerequisites */}
                    {currentModule.prerequisites && currentModule.prerequisites.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                          Prerequisites
                        </h3>
                        <ul className="space-y-2">
                          {currentModule.prerequisites.map((prerequisite, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-orange-600 mr-2">•</span>
                              <span className="text-gray-700">{prerequisite}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Add Feedback */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Feedback</h3>
                
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Add Feedback</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={currentFeedback.type}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, type: e.target.value as RehearsalFeedback['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="content">Content Issue</option>
                      <option value="technical">Technical Issue</option>
                      <option value="engagement">Engagement</option>
                      <option value="suggestion">Suggestion</option>
                    </select>

                    <select
                      value={currentFeedback.severity}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, severity: e.target.value as RehearsalFeedback['severity'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>

                    <textarea
                      value={currentFeedback.message}
                      onChange={(e) => setCurrentFeedback(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe the issue or suggestion..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={addFeedback}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback List */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feedback ({feedback.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {feedback.map((item) => (
                    <div key={item.id} className={`p-3 border rounded-lg ${getSeverityColor(item.severity)}`}>
                      <div className="flex items-start space-x-2">
                        {getFeedbackIcon(item.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">{item.type}</div>
                          <div className="text-sm mt-1">{item.message}</div>
                          <div className="text-xs mt-2 opacity-75">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {feedback.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No feedback yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Rating */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
                
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setOverallRating(rating)}
                      className={`p-2 transition-colors ${
                        rating <= overallRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                
                <div className="text-center text-sm text-gray-600 mb-4">
                  {overallRating === 0 && 'Rate the training journey'}
                  {overallRating === 1 && 'Needs significant improvement'}
                  {overallRating === 2 && 'Below expectations'}
                  {overallRating === 3 && 'Meets expectations'}
                  {overallRating === 4 && 'Exceeds expectations'}
                  {overallRating === 5 && 'Outstanding quality'}
                </div>

                <button
                  onClick={handleFinishRehearsal}
                  disabled={overallRating === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Finish Rehearsal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
