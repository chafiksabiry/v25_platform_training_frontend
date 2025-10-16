import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Brain, Zap, Target } from 'lucide-react';
import { TrainingModule, Exercise, Quiz } from '../../types';
import { useTrainingProgress } from '../../hooks/useTrainingProgress';

interface InteractiveModuleProps {
  module: TrainingModule;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export default function InteractiveModule({ module, onProgress, onComplete }: InteractiveModuleProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [engagementScore, setEngagementScore] = useState(0);
  const [userInteractions, setUserInteractions] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          const progress = Math.min((newTime / (parseInt(module.duration) * 60)) * 100, 100);
          onProgress(progress);
          
          // Real engagement tracking based on interactions
          const timeSinceLastInteraction = Date.now() - lastInteraction;
          if (timeSinceLastInteraction > 60000) { // 1 minute without interaction
            setEngagementScore(prev => Math.max(prev - 2, 0));
          } else if (userInteractions > 0) {
            setEngagementScore(prev => Math.min(prev + 1, 100));
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, module.duration, onProgress, lastInteraction, userInteractions]);

  const trackInteraction = () => {
    setUserInteractions(prev => prev + 1);
    setLastInteraction(Date.now());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionComplete = () => {
    trackInteraction();
    if (currentSection < module.topics.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const startExercise = (exercise: Exercise) => {
    trackInteraction();
    setCurrentExercise(exercise);
    setIsPlaying(false);
  };

  const startQuiz = (quiz: Quiz) => {
    trackInteraction();
    setCurrentQuiz(quiz);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setIsPlaying(false);
  };

  const submitQuizAnswer = () => {
    trackInteraction();
    if (quizAnswer !== null && currentQuiz) {
      setShowQuizResult(true);
      const isCorrect = quizAnswer === currentQuiz.correctAnswer;
      if (isCorrect) {
        setEngagementScore(prev => Math.min(prev + 15, 100));
      } else {
        setEngagementScore(prev => Math.max(prev - 5, 0));
      }
    }
  };

  const closeQuiz = () => {
    trackInteraction();
    setCurrentQuiz(null);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setIsPlaying(true);
  };

  const getModuleTypeIcon = () => {
    switch (module.type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'interactive':
        return <Zap className="h-5 w-5" />;
      case 'simulation':
        return <Target className="h-5 w-5" />;
      case 'ai-tutor':
        return <Brain className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getModuleTypeIcon()}
            <div>
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <p className="text-blue-100">{module.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(module.progress)}%</div>
            <div className="text-sm text-blue-100">Complete</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2">
        <div
          className="bg-gradient-to-r from-green-400 to-green-500 h-2 transition-all duration-300"
          style={{ width: `${module.progress}%` }}
        />
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Current Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Section {currentSection + 1}: {module.topics[currentSection]}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Time: {formatTime(timeSpent)}</span>
              <span>Engagement: {Math.round(engagementScore)}%</span>
            </div>
          </div>

          {/* Video/Content Player */}
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </div>
              <p className="text-lg font-medium">{module.topics[currentSection]}</p>
              <p className="text-gray-300">Interactive content simulation</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  trackInteraction();
                  setIsPlaying(!isPlaying);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => {
                  trackInteraction();
                  setTimeSpent(0);
                  setEngagementScore(0);
                  setUserInteractions(0);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restart</span>
              </button>
            </div>
            <button
              onClick={handleSectionComplete}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark Complete</span>
            </button>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exercises */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Practice Exercises</h4>
            <div className="space-y-2">
              {module.practicalExercises.slice(0, 3).map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => startExercise(exercise)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{exercise.title}</div>
                      <div className="text-sm text-gray-600">{exercise.type}</div>
                    </div>
                    {exercise.completed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI-Generated Quizzes */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Knowledge Check</h4>
            <div className="space-y-2">
              {module.aiGeneratedQuizzes.slice(0, 3).map((quiz, index) => (
                <button
                  key={quiz.id}
                  onClick={() => startQuiz(quiz)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Quiz {index + 1}</div>
                      <div className="text-sm text-gray-600">
                        Difficulty: {quiz.difficulty}/10 {quiz.aiGenerated && '• AI Generated'}
                      </div>
                    </div>
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Check</h3>
            <p className="text-gray-700 mb-4">{currentQuiz.question}</p>
            
            <div className="space-y-2 mb-4">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    trackInteraction();
                    setQuizAnswer(index);
                  }}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    quizAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {showQuizResult && (
              <div className={`p-3 rounded-lg mb-4 ${
                quizAnswer === currentQuiz.correctAnswer
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${
                  quizAnswer === currentQuiz.correctAnswer ? 'text-green-800' : 'text-red-800'
                }`}>
                  {quizAnswer === currentQuiz.correctAnswer ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-gray-700 mt-1">{currentQuiz.explanation}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {!showQuizResult ? (
                <button
                  onClick={submitQuizAnswer}
                  disabled={quizAnswer === null}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={closeQuiz}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue Learning
                </button>
              )}
              <button
                onClick={closeQuiz}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {currentExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentExercise.title}</h3>
            <p className="text-gray-700 mb-4">{currentExercise.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                Type: {currentExercise.type} • Difficulty: {currentExercise.difficulty}/10
                {currentExercise.aiGenerated && ' • AI Generated'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentExercise(null)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Exercise
              </button>
              <button
                onClick={() => setCurrentExercise(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}