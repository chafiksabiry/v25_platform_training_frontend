import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { TrainingModule, Quiz } from '../../types';
import DocumentViewer from '../DocumentViewer/DocumentViewer';

interface InteractiveModuleProps {
  module: TrainingModule;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export default function InteractiveModule({ module, onProgress, onComplete }: InteractiveModuleProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | number[] | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Get sections from module.content or module.sections
  const sections = (module.sections && Array.isArray(module.sections) && module.sections.length > 0)
    ? module.sections
    : (module.content && Array.isArray(module.content) && module.content.length > 0)
      ? module.content
      : [];

  // Get current section data
  const currentSectionData = sections[currentSection] || null;

  // Calculate real progress percentage based on completed sections
  const realProgress = sections.length > 0 
    ? Math.round((completedSections.size / sections.length) * 100)
    : module.progress || 0;

  // Get quizzes from module assessments
  const quizzes = module.assessments && Array.isArray(module.assessments) && module.assessments.length > 0
    ? module.assessments.flatMap((assessment: any) => 
        assessment.questions && Array.isArray(assessment.questions) 
          ? assessment.questions.map((q: any, idx: number) => ({
              id: q.id || `quiz-${idx}`,
              question: q.question || q.text || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || '',
              type: q.type || 'multiple-choice',
              points: q.points || 10
            }))
          : []
      )
    : [];

  // Debug log
  useEffect(() => {
    console.log('[InteractiveModule] Module state:', {
      moduleTitle: module.title,
      sectionsCount: sections.length,
      currentSection: currentSection,
      currentSectionData: currentSectionData,
      hasFile: !!currentSectionData?.content?.file?.url,
      fileUrl: currentSectionData?.content?.file?.url,
      moduleContent: module.content?.length || 0,
      moduleSections: module.sections?.length || 0,
      showQuizzes: showQuizzes,
      quizzesCount: quizzes.length,
      currentQuiz: currentQuiz,
      realProgress: realProgress,
      completedSections: Array.from(completedSections)
    });
  }, [sections, currentSection, currentSectionData, module.content, module.sections, showQuizzes, quizzes, currentQuiz, realProgress, completedSections]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  // Update progress when sections are completed (this is now handled in handleNext, but keep for initial state)
  useEffect(() => {
    if (sections.length > 0 && completedSections.size > 0) {
      const progress = (completedSections.size / sections.length) * 100;
      onProgress(progress);
    }
  }, [completedSections, sections.length, onProgress]);


  const handleNext = () => {
    if (showQuizzes) {
      // If showing quizzes, move to next quiz
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setQuizAnswer(null);
        setShowQuizResult(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // All quizzes completed, finish module
        // Mark all sections as completed for final progress update
        if (sections.length > 0) {
          const allSectionsCompleted = new Set(Array.from({ length: sections.length }, (_, i) => i));
          setCompletedSections(allSectionsCompleted);
          onProgress(100);
        }
        onComplete();
      }
    } else {
      // If no sections but quizzes available, start quizzes
      if (sections.length === 0 && quizzes.length > 0) {
        setShowQuizzes(true);
        setCurrentQuizIndex(0);
        setCurrentQuiz(quizzes[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Mark current section as completed
      if (sections.length > 0) {
        const newCompletedSections = new Set([...completedSections, currentSection]);
        setCompletedSections(newCompletedSections);
        // Update progress immediately
        const newProgress = (newCompletedSections.size / sections.length) * 100;
        onProgress(newProgress);
      }
      
      // Check if this is the last section
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Last section completed, show quizzes
        if (quizzes.length > 0) {
          setShowQuizzes(true);
          setCurrentQuizIndex(0);
          setCurrentQuiz(quizzes[0]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // No quizzes, complete module
          if (sections.length > 0) {
            onProgress(100);
          }
          onComplete();
        }
      }
    }
  };

  const handlePrevious = () => {
    if (showQuizzes) {
      // If showing quizzes, go back to previous quiz
      if (currentQuizIndex > 0) {
        setCurrentQuizIndex(prev => prev - 1);
        setCurrentQuiz(quizzes[currentQuizIndex - 1]);
        setQuizAnswer(null);
        setShowQuizResult(false);
      } else {
        // Go back to last section
        setShowQuizzes(false);
        setCurrentSection(sections.length - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Go to previous section
      if (currentSection > 0) {
        setCurrentSection(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Update current quiz when quiz index changes
  useEffect(() => {
    if (showQuizzes && quizzes.length > 0 && currentQuizIndex < quizzes.length) {
      setCurrentQuiz(quizzes[currentQuizIndex]);
    }
  }, [showQuizzes, currentQuizIndex, quizzes]);

  const submitQuizAnswer = () => {
    if (quizAnswer !== null && currentQuiz) {
      setShowQuizResult(true);
    }
  };

  const getModuleTypeIcon = () => {
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="bg-white overflow-hidden flex flex-col w-full h-full" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Content Area - Only Document */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col w-full" style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Show Quizzes or Sections */}
        {showQuizzes && currentQuiz ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quiz {currentQuizIndex + 1} of {quizzes.length}
                </h3>
              </div>
              
              {/* Quiz Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 mb-6 text-lg font-medium">{currentQuiz.question}</p>
                
                {currentQuiz.options && currentQuiz.options.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {currentQuiz.options.map((option, index) => {
                    const isMultipleCorrect = currentQuiz.type === 'multiple-correct';
                    const isChecked = Array.isArray(quizAnswer) 
                      ? quizAnswer.includes(index)
                      : quizAnswer === index;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (isMultipleCorrect) {
                            setQuizAnswer(prev => {
                              const prevArray = Array.isArray(prev) ? prev : [];
                              if (prevArray.includes(index)) {
                                return prevArray.filter(i => i !== index);
                              } else {
                                return [...prevArray, index];
                              }
                            });
                          } else {
                            setQuizAnswer(index);
                          }
                        }}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type={isMultipleCorrect ? 'checkbox' : 'radio'}
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                          <span className="text-gray-700">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No options available for this quiz</p>
                  </div>
                )}

                {showQuizResult && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    (Array.isArray(quizAnswer)
                      ? JSON.stringify([...quizAnswer].sort()) === JSON.stringify([...(Array.isArray(currentQuiz.correctAnswer) ? currentQuiz.correctAnswer : [currentQuiz.correctAnswer])].sort())
                      : quizAnswer === currentQuiz.correctAnswer)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium ${
                      (Array.isArray(quizAnswer)
                        ? JSON.stringify([...quizAnswer].sort()) === JSON.stringify([...(Array.isArray(currentQuiz.correctAnswer) ? currentQuiz.correctAnswer : [currentQuiz.correctAnswer])].sort())
                        : quizAnswer === currentQuiz.correctAnswer)
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}>
                      {(Array.isArray(quizAnswer)
                        ? JSON.stringify([...quizAnswer].sort()) === JSON.stringify([...(Array.isArray(currentQuiz.correctAnswer) ? currentQuiz.correctAnswer : [currentQuiz.correctAnswer])].sort())
                        : quizAnswer === currentQuiz.correctAnswer)
                        ? 'Correct!'
                        : 'Incorrect'}
                    </p>
                    {currentQuiz.explanation && (
                      <p className="text-sm text-gray-700 mt-2">{currentQuiz.explanation}</p>
                    )}
                  </div>
                )}

                {!showQuizResult && (
                  <button
                    onClick={submitQuizAnswer}
                    disabled={quizAnswer === null}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Current Section - Only Document */
          sections.length > 0 && currentSectionData ? (
            currentSectionData.content?.file?.url ? (
              <div className="flex-1 overflow-hidden min-h-0 w-full" style={{ flex: '1 1 auto', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <DocumentViewer
                  fileUrl={currentSectionData.content.file.url}
                  fileName={currentSectionData.content.file.name}
                  mimeType={currentSectionData.content.file.mimeType}
                />
              </div>
            ) : currentSectionData.content?.text ? (
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="prose max-w-none">
                  {currentSectionData.content.text.split('\n\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="text-gray-700 text-base leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No content available for this section</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No sections available in this module</p>
                {quizzes.length > 0 && (
                  <button
                    onClick={() => {
                      setShowQuizzes(true);
                      setCurrentQuizIndex(0);
                      setCurrentQuiz(quizzes[0]);
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Quizzes ({quizzes.length})
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0" style={{ flexShrink: 0 }}>
          <button
            onClick={handlePrevious}
            disabled={!showQuizzes && currentSection === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              (!showQuizzes && currentSection === 0)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>
          <span className="text-sm text-gray-600">
            {showQuizzes 
              ? (quizzes.length > 0 ? `Quiz ${currentQuizIndex + 1} of ${quizzes.length}` : 'No quizzes')
              : sections.length > 0 
                ? `Section ${currentSection + 1} of ${sections.length}`
                : 'No sections'
            }
          </span>
          <button
            onClick={handleNext}
            disabled={!showQuizzes && sections.length === 0 && quizzes.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              (!showQuizzes && sections.length === 0 && quizzes.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span>
              {showQuizzes && currentQuizIndex === quizzes.length - 1 
                ? 'Complete' 
                : (!showQuizzes && sections.length === 0 && quizzes.length > 0)
                  ? 'Start Quizzes'
                  : 'Next'
              }
            </span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
    </div>
  );
}