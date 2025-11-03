import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, ArrowRight, Edit2, Trash2, Save, X, FileText, Video, Image, Youtube, Type, Play, ChevronDown, ChevronUp, GripVertical, Move, Award, Sparkles } from 'lucide-react';
import { ManualTraining, ManualTrainingModule, TrainingSection, SectionContent, ContentFile } from '../../types/manualTraining';
import { CloudinaryUploadResult } from '../../lib/cloudinaryService';
import { FileUploader } from './FileUploader';
import { QuizBuilder } from './QuizBuilder';
import { FinalExamGenerator } from './FinalExamGenerator';
import ManualTrainingSimulator from './ManualTrainingSimulator';
import axios from 'axios';

// Détection automatique de l'environnement
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  return isDevelopment ? 'http://localhost:5010' : 'https://votre-api-production.com';
};

const API_BASE = getApiBaseUrl();

interface ModuleEditorProps {
  training: ManualTraining;
  onBack: () => void;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({ training, onBack }) => {
  const [modules, setModules] = useState<ManualTrainingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ManualTrainingModule | null>(null);
  const [editingModule, setEditingModule] = useState(false);
  const [editingSection, setEditingSection] = useState<TrainingSection | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showFinalExamGenerator, setShowFinalExamGenerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizzesCount, setQuizzesCount] = useState<Map<string, number>>(new Map());
  const [finalExamExists, setFinalExamExists] = useState(false);
  const [sectionCreationStep, setSectionCreationStep] = useState(0); // 0: button only, 1: title only, 2: full form
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [draggedSection, setDraggedSection] = useState<{ section: TrainingSection; fromModuleId: string; sectionIndex: number } | null>(null);
  const [editingSectionInList, setEditingSectionInList] = useState<{ section: TrainingSection; moduleId: string } | null>(null);
  const [sectionEditForm, setSectionEditForm] = useState({ title: '', description: '' });
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);
  
  // ✨ Track which modules are currently generating quizzes to avoid duplicate requests
  const [generatingQuizzes, setGeneratingQuizzes] = useState<Set<string>>(new Set());
  
  // ✨ Simulator state
  const [showSimulator, setShowSimulator] = useState(false);

  // Module Form
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    estimatedDuration: 0,
  });

  // Section Form
  const [sectionForm, setSectionForm] = useState<Partial<TrainingSection>>({
    title: '',
    type: 'video' as any,
    content: {},
  });

  useEffect(() => {
    if (training.id) {
      loadModules();
    }
  }, [training.id]);

  // ✨ Auto-open module creation form if no modules exist
  useEffect(() => {
    if (modules.length === 0 && !editingModule && !loading) {
      setEditingModule(true);
    }
  }, [modules.length, loading]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/manual-trainings/${training.id}/modules`);
      if (response.data.success) {
        setModules(response.data.data);
        
        // Load quiz counts for each module
        loadQuizCounts(response.data.data);
        
        // Check if final exam exists
        loadFinalExamStatus();
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadQuizCounts = async (modulesList: ManualTrainingModule[]) => {
    const counts = new Map<string, number>();
    
    for (const module of modulesList) {
      try {
        const response = await axios.get(`${API_BASE}/manual-trainings/modules/${module.id}/quizzes`);
        if (response.data.success) {
          const quizCount = response.data.data.length;
          counts.set(module.id!, quizCount);
          
          // ✨ AUTO-GENERATE quiz if module has sections but no quiz yet
          // 🚫 TEMPORARILY DISABLED - OpenAI quota exceeded
          // Uncomment when quota is recharged
          /*
          if (quizCount === 0 && module.sections && module.sections.length > 0 && !generatingQuizzes.has(module.id!)) {
            console.log(`📝 Module "${module.title}" has sections but no quiz - auto-generating...`);
            setGeneratingQuizzes(prev => new Set(prev).add(module.id!));
            generateQuizForModule(module.id!, module.title);
          }
          */
        }
      } catch (error) {
        console.error(`Error loading quizzes for module ${module.id}:`, error);
      }
    }
    
    setQuizzesCount(counts);
  };
  
  const loadFinalExamStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/manual-trainings/${training.id}/quizzes`);
      if (response.data.success) {
        // Check if there's a quiz without moduleId (final exam)
        const hasFinalExam = response.data.data.some((quiz: any) => !quiz.moduleId);
        setFinalExamExists(hasFinalExam);
      }
    } catch (error) {
      console.error('Error checking final exam status:', error);
    }
  };

  // ✨ Helper function to generate quiz for a single module (background, non-blocking)
  const generateQuizForModule = async (moduleId: string, moduleTitle: string) => {
    try {
      console.log(`🤖 Auto-generating quiz for module: ${moduleTitle}`);
      
      const response = await axios.post(`${API_BASE}/manual-trainings/ai/generate-quiz`, {
        moduleId: moduleId,
        numberOfQuestions: 5,
        difficulty: 'medium',
        questionTypes: {
          multipleChoice: true,
          trueFalse: true,
          shortAnswer: false,
        },
      });

      if (response.data.success) {
        console.log(`✅ Quiz auto-generated for ${moduleTitle}`);
        // Remove from generating set
        setGeneratingQuizzes(prev => {
          const newSet = new Set(prev);
          newSet.delete(moduleId);
          return newSet;
        });
        // ✨ Update quiz count for this specific module only (no full reload)
        setQuizzesCount(prev => new Map(prev).set(moduleId, 1));
      }
    } catch (error: any) {
      console.error(`❌ Error auto-generating quiz for ${moduleTitle}:`, error);
      // ✨ Log detailed error information
      if (error.response?.data) {
        console.error('📝 Backend error details:', error.response.data);
      }
      // Remove from generating set even on error to allow retry
      setGeneratingQuizzes(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
      // Don't show error to user - silent background operation
    }
  };

  const handleCreateModule = async (autoOpenSection: boolean = false) => {
    if (!moduleForm.title) {
      alert('Please enter a module title');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/manual-trainings/${training.id}/modules`,
        {
          ...moduleForm,
          trainingId: training.id,
          sections: [],
        }
      );

      if (response.data.success) {
        await loadModules();
        setEditingModule(false);
        setModuleForm({ title: '', description: '', estimatedDuration: 0 });
        
        const newModule = response.data.data;
        
        // ✨ AUTO-GENERATE QUIZ for new module (in background, don't wait)
        generateQuizForModule(newModule.id, newModule.title);
        
        if (autoOpenSection) {
          // ✨ Automatically select the newly created module
          setSelectedModule(newModule);
          
          // ✨ Auto-open section creation - start at step 1 (title input)
          setSectionForm({
            title: '',
            type: 'video' as any,
            content: {},
          });
          setSectionCreationStep(1); // Start with title input
        }
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error creating module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/manual-trainings/modules/${moduleId}`);
      await loadModules();
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Error deleting module');
    }
  };

  const handleAddSection = async (goToQuiz: boolean = false) => {
    if (!selectedModule?.id || !sectionForm.title) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/manual-trainings/modules/${selectedModule.id}/sections`,
        sectionForm
      );

      if (response.data.success) {
        const updatedModule = response.data.data;
        setSelectedModule(updatedModule);
        await loadModules();
        
        // ✨ AUTO-REGENERATE QUIZ when a new section is added
        generateQuizForModule(selectedModule.id, selectedModule.title);
        
        if (goToQuiz) {
          // ✨ Go to quiz builder
          setShowQuizBuilder(true);
          setSectionCreationStep(0);
        } else {
          // ✨ Reset form and go back to button only
          setSectionForm({
            title: '',
            type: 'video',
            content: {},
          });
          
          setSectionCreationStep(0); // Back to button view
        }
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Error adding section');
    }
  };

  const handleFileUpload = async (result: CloudinaryUploadResult) => {
    const contentFile: ContentFile = {
      id: crypto.randomUUID(),
      name: result.publicId.split('/').pop() || 'file',
      type: sectionForm.type === 'video' ? 'video' : sectionForm.type === 'document' ? 'pdf' : 'image',
      url: result.secureUrl,
      publicId: result.publicId,
      thumbnailUrl: result.thumbnailUrl,
      size: result.bytes,
      mimeType: result.format,
      metadata: {
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    };

    setSectionForm({
      ...sectionForm,
      content: {
        ...sectionForm.content!,
        file: contentFile,
      },
    });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!selectedModule?.id || !confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE}/manual-trainings/modules/${selectedModule.id}/sections/${sectionId}`
      );

      if (response.data.success) {
        setSelectedModule(response.data.data);
        await loadModules();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'powerpoint':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'text':
        return <Type className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Drag & Drop handlers
  const handleSectionDragStart = (section: TrainingSection, moduleId: string, sectionIndex: number, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedSection({ section, fromModuleId: moduleId, sectionIndex });
  };

  const handleModuleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSectionDragOver = (targetModuleId: string, targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection) return;
    
    const { fromModuleId, sectionIndex } = draggedSection;
    
    // Don't show drop indicator if dropping on itself
    if (fromModuleId === targetModuleId && sectionIndex === targetIndex) {
      setDragOverSectionIndex(null);
      return;
    }
    
    setDragOverSectionIndex(targetIndex);
  };

  const handleSectionDrop = async (targetModuleId: string, targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionIndex(null);
    
    if (!draggedSection) return;
    
    const { section, fromModuleId, sectionIndex } = draggedSection;
    
    // If same module and same position, do nothing
    if (fromModuleId === targetModuleId && sectionIndex === targetIndex) {
      setDraggedSection(null);
      return;
    }

    console.log('Dropping section:', {
      sectionId: section.id,
      from: { moduleId: fromModuleId, index: sectionIndex },
      to: { moduleId: targetModuleId, index: targetIndex }
    });

    try {
      if (fromModuleId === targetModuleId) {
        // Reorder within same module
        console.log('Reordering within same module');
        const response = await axios.post(`${API_BASE}/manual-trainings/modules/${targetModuleId}/sections/reorder`, {
          sectionId: section.id,
          newIndex: targetIndex
        });
        console.log('Reorder response:', response.data);
      } else {
        // Move to different module
        console.log('Moving to different module');
        const response = await axios.post(`${API_BASE}/manual-trainings/modules/${targetModuleId}/sections/move`, {
          sectionId: section.id,
          fromModuleId: fromModuleId,
          targetIndex: targetIndex
        });
        console.log('Move response:', response.data);
      }
      
      await loadModules();
      
      // ✨ Refresh the selected module to update the right side view
      if (selectedModule) {
        const updatedModuleResponse = await axios.get(`${API_BASE}/manual-trainings/modules/${selectedModule.id}`);
        if (updatedModuleResponse.data.success) {
          setSelectedModule(updatedModuleResponse.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error moving/reordering section:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setDraggedSection(null);
    }
  };

  const handleModuleDrop = async (targetModuleId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection) return;
    
    const { section, fromModuleId } = draggedSection;
    
    // If dropping in the same module (not on a specific section), do nothing
    if (fromModuleId === targetModuleId) {
      setDraggedSection(null);
      return;
    }

    try {
      // Move section to new module (at the end)
      await axios.post(`${API_BASE}/manual-trainings/modules/${targetModuleId}/sections/move`, {
        sectionId: section.id,
        fromModuleId: fromModuleId
      });
      
      await loadModules();
      
      // ✨ Refresh the selected module to update the right side view
      if (selectedModule) {
        const updatedModuleResponse = await axios.get(`${API_BASE}/manual-trainings/modules/${selectedModule.id}`);
        if (updatedModuleResponse.data.success) {
          setSelectedModule(updatedModuleResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error moving section:', error);
    } finally {
      setDraggedSection(null);
    }
  };

  // Section editing handlers
  const handleStartEditSection = (section: TrainingSection, moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSectionInList({ section, moduleId });
    setSectionEditForm({
      title: section.title,
      description: section.description || ''
    });
  };

  const handleSaveEditSection = async () => {
    if (!editingSectionInList) return;
    
    try {
      await axios.put(
        `${API_BASE}/manual-trainings/modules/${editingSectionInList.moduleId}/sections/${editingSectionInList.section.id}`,
        {
          title: sectionEditForm.title,
          description: sectionEditForm.description
        }
      );
      
      await loadModules();
      setEditingSectionInList(null);
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Error updating section');
    }
  };

  const handleCancelEditSection = () => {
    setEditingSectionInList(null);
    setSectionEditForm({ title: '', description: '' });
  };

  if (showQuizBuilder && selectedModule) {
    return (
      <QuizBuilder
        module={selectedModule}
        training={training}
        onBack={() => setShowQuizBuilder(false)}
      />
    );
  }

  // ✨ Simulator Mode
  if (showSimulator) {
    return (
      <ManualTrainingSimulator
        trainingId={training.id!}
        trainingTitle={training.trainingName}
        onClose={() => setShowSimulator(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{training.title}</h1>
              <p className="text-gray-600">Manage Modules & Content</p>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Final Exam Button */}
            <button
              onClick={() => setShowFinalExamGenerator(true)}
              className={`flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105 relative ${
                finalExamExists ? 'ring-2 ring-green-400' : ''
              }`}
            >
              <Award className="w-5 h-5 mr-2" />
              Examen Final
              {finalExamExists && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </button>

            {/* View Button */}
            <button
              onClick={() => alert('View functionality - Coming soon!')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>

            {/* Simulate as Learner */}
            <button
              onClick={() => setShowSimulator(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Simulate
            </button>

            {/* Publish Button */}
            <button
              onClick={() => {
                if (confirm('Publish this training? It will be available to learners.')) {
                  alert('Publish functionality - Coming soon!');
                }
              }}
              className="flex items-center px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Content with padding-top to account for fixed header */}
      <div className="pt-32 pb-6">
        {/* Modules List - Fixed Left Column */}
        <div className="fixed left-6 top-32 bottom-6 w-80 z-40">
          <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold">Modules</h2>
              <button
                onClick={() => setEditingModule(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Modules List - Scrollable */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  onDragOver={handleModuleDragOver}
                  onDrop={(e) => handleModuleDrop(module.id!, e)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedModule?.id === module.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  } ${draggedSection && draggedSection.fromModuleId !== module.id ? 'ring-2 ring-green-300' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {module.sections?.length || 0} sections • {module.estimatedDuration} min
                        </p>
                        {quizzesCount.get(module.id!) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ✓ {quizzesCount.get(module.id!)} Quiz{quizzesCount.get(module.id!)! > 1 ? 'zes' : ''}
                          </span>
                        ) : null}
                      </div>
                      
                      {/* Section Titles - Draggable & Editable */}
                      {module.sections && module.sections.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          {[...module.sections]
                            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                            .map((section, idx) => (
                            <div key={section.id || idx}>
                              {editingSectionInList?.section.id === section.id ? (
                                // Edit Mode
                                <div className="bg-white p-3 rounded-lg border-2 border-blue-400 space-y-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={sectionEditForm.title}
                                    onChange={(e) => setSectionEditForm({ ...sectionEditForm, title: e.target.value })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    placeholder="Section title"
                                  />
                                  <textarea
                                    value={sectionEditForm.description}
                                    onChange={(e) => setSectionEditForm({ ...sectionEditForm, description: e.target.value })}
                                    className="w-full px-2 py-1 border rounded text-xs resize-none"
                                    rows={2}
                                    placeholder="Description (optional)"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={handleSaveEditSection}
                                      className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                    >
                                      <Save className="w-3 h-3 inline mr-1" />
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEditSection}
                                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // View Mode - Draggable & Clickable
                                <div
                                  draggable
                                  onDragStart={(e) => handleSectionDragStart(section, module.id!, idx, e)}
                                  onDragOver={(e) => handleSectionDragOver(module.id!, idx, e)}
                                  onDrop={(e) => handleSectionDrop(module.id!, idx, e)}
                                  onDragLeave={() => setDragOverSectionIndex(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedModule(module);
                                    // Scroll to section in main view
                                    const sectionElement = document.getElementById(`section-${section.id}`);
                                    if (sectionElement) {
                                      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }}
                                  className={`flex items-center text-xs group hover:bg-white hover:shadow-sm p-2 rounded transition-all cursor-move ${
                                    dragOverSectionIndex === idx 
                                      ? 'border-t-2 border-blue-500' 
                                      : ''
                                  }`}
                                >
                                  <GripVertical className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                                  <span className="text-gray-400 mr-2 flex-shrink-0">{idx + 1}.</span>
                                  <span className="text-gray-700 line-clamp-1 flex-1">{section.title}</span>
                                  <button
                                    onClick={(e) => handleStartEditSection(section, module.id!, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded ml-2 flex-shrink-0"
                                  >
                                    <Edit2 className="w-3 h-3 text-blue-600" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id!);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {modules.length === 0 && !editingModule && (
                <p className="text-center text-gray-500 py-8">No modules yet</p>
              )}
            </div>

            {/* Create Module Form - Displayed at bottom */}
            {editingModule && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3 border-2 border-blue-200">
                <h3 className="font-medium text-gray-900 mb-2">New Module</h3>
                <input
                  type="text"
                  placeholder="Module title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <textarea
                  placeholder="Module description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={moduleForm.estimatedDuration}
                  onChange={(e) => setModuleForm({ ...moduleForm, estimatedDuration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleCreateModule(true)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                  >
                    Save & Add Sections
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCreateModule(false)}
                      className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingModule(false)}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Another Module Button */}
            {!editingModule && modules.length > 0 && (
              <button
                onClick={() => setEditingModule(true)}
                className="w-full mt-4 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Module
              </button>
            )}
          </div>
        </div>

        {/* Module Content - With left margin for fixed sidebar */}
        <div className="ml-96 px-6">
          {selectedModule ? (
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col overflow-hidden" style={{ minHeight: 'calc(100vh - 10rem)' }}>
              {/* Header - Fixed */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                <button
                  onClick={() => setShowQuizBuilder(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Manage Quizzes
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-gray-600 mb-6">{selectedModule.description}</p>

                {/* Add Section Form - Progressive Steps */}
                <div className="mb-6">
                {/* Step 0: Button Only */}
                {sectionCreationStep === 0 && (
                  <button
                    onClick={() => {
                      setSectionForm({
                        title: '',
                        type: 'video',
                        content: {},
                      });
                      setSectionCreationStep(1);
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-lg font-semibold"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Create New Section
                  </button>
                )}

                {/* Step 1: Title Only */}
                {sectionCreationStep === 1 && (
                  <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="font-medium mb-4 text-blue-900">Step 1: Enter Section Title</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Section title"
                        value={sectionForm.title}
                        onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                        autoFocus
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            if (!sectionForm.title) {
                              alert('Please enter a section title');
                              return;
                            }
                            setSectionCreationStep(2);
                          }}
                          disabled={!sectionForm.title}
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                        >
                          Next: Choose Type
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                        <button
                          onClick={() => {
                            setSectionCreationStep(0);
                            setSectionForm({
                              title: '',
                              type: 'video',
                              content: {},
                            });
                          }}
                          className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Full Form */}
                {sectionCreationStep === 2 && (
                  <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Step 2: Add Content for "{sectionForm.title}"
                      </h3>
                      <button
                        onClick={() => setSectionCreationStep(1)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Title
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <select
                        value={sectionForm.type}
                        onChange={(e) => setSectionForm({
                          ...sectionForm,
                          type: e.target.value as any,
                          content: { text: '', keyPoints: [] }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="video">🎥 Video Upload</option>
                        <option value="image">🖼️ Image Upload</option>
                        <option value="document">📄 Document (PDF/Word/Excel)</option>
                        <option value="powerpoint">📊 PowerPoint Presentation</option>
                        <option value="youtube">▶️ YouTube Video</option>
                      </select>

                      {/* Content based on type */}
                      {sectionForm.type === 'youtube' && (
                        <input
                          type="text"
                          placeholder="YouTube URL"
                          value={sectionForm.content?.youtubeUrl || ''}
                          onChange={(e) => setSectionForm({
                            ...sectionForm,
                            content: { ...sectionForm.content!, youtubeUrl: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      )}

                      {(sectionForm.type === 'video' || sectionForm.type === 'document' || sectionForm.type === 'image' || sectionForm.type === 'powerpoint') && (
                        <FileUploader
                          fileType={
                            sectionForm.type === 'video' ? 'video' : 
                            sectionForm.type === 'image' ? 'image' : 
                            'document'
                          }
                          onUploadComplete={handleFileUpload}
                        />
                      )}

                      {sectionForm.content?.file && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">✓ File uploaded: {sectionForm.content.file.name}</p>
                        </div>
                      )}

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAddSection(true)}
                          disabled={!sectionForm.title || (sectionForm.type !== 'youtube' && !sectionForm.content?.file)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          Save & Add Quiz
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        <button
                          onClick={() => handleAddSection(false)}
                          disabled={!sectionForm.title || (sectionForm.type !== 'youtube' && !sectionForm.content?.file)}
                          className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4 inline mr-2" />
                          Save & Continue
                        </button>
                        <button
                          onClick={() => {
                            setSectionCreationStep(0);
                            setSectionForm({
                              title: '',
                              type: 'video',
                              content: {},
                            });
                          }}
                          className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                <h3 className="font-medium">Sections</h3>
                
                {selectedModule.sections && selectedModule.sections.length > 0 ? (
                  [...selectedModule.sections]
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((section) => {
                    const isExpanded = expandedSections.has(section.id!);
                    const youtubeId = section.content.youtubeUrl ? extractYouTubeId(section.content.youtubeUrl) : null;
                    
                    return (
                      <div key={section.id} id={`section-${section.id}`} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden scroll-mt-24">
                        {/* Section Header */}
                        <div className="p-4 flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getSectionIcon(section.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{section.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">Type: {section.type}</p>
                              
                              {section.content.text && !isExpanded && (
                                <p className="text-sm text-gray-700 mt-2">{section.content.text.substring(0, 100)}...</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Play/Expand Button */}
                            {(section.type === 'video' || section.type === 'youtube' || section.type === 'document' || section.type === 'image' || section.type === 'powerpoint') && (
                              <button
                                onClick={() => toggleSectionExpanded(section.id!)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span className="text-xs">Hide</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    <span className="text-xs">{section.type === 'image' ? 'View' : 'Play'}</span>
                                  </>
                                )}
                              </button>
                            )}
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteSection(section.id!)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-200 bg-white">

                            {/* Video Player */}
                            {section.type === 'video' && section.content.file && (
                              <div className="mt-4">
                                <video
                                  controls
                                  className="w-full rounded-lg shadow-lg"
                                  style={{ maxHeight: '400px' }}
                                >
                                  <source src={section.content.file.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <a
                                  href={section.content.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  Open in new tab →
                                </a>
                              </div>
                            )}

                            {/* YouTube Player */}
                            {section.type === 'youtube' && youtubeId && (
                              <div className="mt-4">
                                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                  <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title={section.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                                <a
                                  href={section.content.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  Watch on YouTube →
                                </a>
                              </div>
                            )}

                            {/* Document Viewer */}
                            {section.type === 'document' && section.content.file && (
                              <div className="mt-4">
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                  <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(section.content.file.url)}&embedded=true`}
                                    className="w-full"
                                    style={{ height: '500px' }}
                                    title={section.title}
                                  />
                                </div>
                                <div className="mt-2 flex items-center space-x-3">
                                  <a
                                    href={section.content.file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Open in new tab →
                                  </a>
                                  <a
                                    href={section.content.file.url}
                                    download
                                    className="text-xs text-green-600 hover:underline"
                                  >
                                    Download →
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* PowerPoint Viewer via Google Docs */}
                            {section.type === 'powerpoint' && section.content.file && (
                              <div className="mt-4">
                                <div className="border-2 border-orange-300 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
                                  {/* Header with Title */}
                                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                                    <div className="flex items-center space-x-3">
                                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M9.5,11C10.16,11 10.67,11.5 10.67,12.17V17.83C10.67,18.5 10.16,19 9.5,19C8.83,19 8.33,18.5 8.33,17.83V12.17C8.33,11.5 8.83,11 9.5,11M12.83,11H15.17C15.84,11 16.33,11.5 16.33,12.17V17.83C16.33,18.5 15.84,19 15.17,19H12.83C12.17,19 11.67,18.5 11.67,17.83V12.17C11.67,11.5 12.17,11 12.83,11Z"/>
                                      </svg>
                                      <div>
                                        <h3 className="font-bold text-lg">{section.content.file.name}</h3>
                                        <p className="text-xs text-orange-100">
                                          PowerPoint Presentation • {(section.content.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* PowerPoint Preview Card */}
                                  <div className="relative bg-gradient-to-br from-white via-orange-50 to-yellow-50 p-6">
                                    {/* Large Preview Icon */}
                                    <div className="flex items-center justify-center mb-6">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-orange-400 blur-2xl opacity-30 rounded-full"></div>
                                        <svg className="w-32 h-32 relative z-10 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M9.5,11C10.16,11 10.67,11.5 10.67,12.17V17.83C10.67,18.5 10.16,19 9.5,19C8.83,19 8.33,18.5 8.33,17.83V12.17C8.33,11.5 8.83,11 9.5,11M12.83,11H15.17C15.84,11 16.33,11.5 16.33,12.17V17.83C16.33,18.5 15.84,19 15.17,19H12.83C12.17,19 11.67,18.5 11.67,17.83V12.17C11.67,11.5 12.17,11 12.83,11Z"/>
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    {/* File Info */}
                                    <div className="text-center mb-6">
                                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                                        📊 PowerPoint Presentation
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        File ready to view • {(section.content.file.size / (1024 * 1024)).toFixed(2)} MB
                                      </p>
                                    </div>
                                    
                                    {/* Quick Actions */}
                                    <div className="space-y-3">
                                      <a
                                        href={section.content.file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-700 hover:from-purple-700 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1"
                                      >
                                        <Play className="w-6 h-6 mr-3" />
                                        View Presentation in Browser
                                      </a>
                                      
                                      <a
                                        href={section.content.file.url}
                                        download={section.content.file.name}
                                        className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1"
                                      >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download to Your Device
                                      </a>
                                    </div>
                                    
                                    {/* Info Box */}
                                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                      <div className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                          <p className="text-sm font-bold text-blue-900 mb-2">
                                            💡 How to view this PowerPoint:
                                          </p>
                                          <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                                            <li><strong>In Browser:</strong> Click "View Presentation" to open it in a new tab</li>
                                            <li><strong>Download:</strong> Save the file and open with PowerPoint, Google Slides, or LibreOffice</li>
                                            <li><strong>Best Quality:</strong> For full animations and transitions, download and use PowerPoint</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Image Display */}
                            {section.type === 'image' && section.content.file && (
                              <div className="mt-4">
                                <img
                                  src={section.content.file.url}
                                  alt={section.title}
                                  className="w-full rounded-lg shadow-lg"
                                  style={{ maxHeight: '600px', objectFit: 'contain' }}
                                />
                                <div className="mt-2 flex items-center space-x-3">
                                  <a
                                    href={section.content.file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View full size →
                                  </a>
                                  <a
                                    href={section.content.file.url}
                                    download
                                    className="text-xs text-green-600 hover:underline"
                                  >
                                    Download →
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  sectionCreationStep === 0 && (
                    <p className="text-center text-gray-500 py-8">No sections yet. Click "Create New Section" above to get started.</p>
                  )
                )}

                {/* Add Another Section Button */}
                {sectionCreationStep === 0 && selectedModule.sections && selectedModule.sections.length > 0 && (
                  <button
                    onClick={() => {
                      setSectionForm({
                        title: '',
                        type: 'text',
                        content: { text: '', keyPoints: [] },
                      });
                      setSectionCreationStep(1); // Start at title input
                    }}
                    className="w-full mt-4 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Section
                  </button>
                )}
              </div>
              </div>
              {/* End of Scrollable Content */}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 10rem)' }}>
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl text-gray-600">Select a module to manage its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Exam Generator Modal */}
      {showFinalExamGenerator && (
        <FinalExamGenerator
          training={training}
          onExamGenerated={(exam) => {
            setShowFinalExamGenerator(false);
            alert('Examen final créé avec succès! ' + exam.questions?.length + ' questions générées.');
          }}
          onClose={() => setShowFinalExamGenerator(false)}
        />
      )}
    </div>
  );
};

