import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  BookOpen,
  Video,
  Headphones,
  Zap,
  Target,
  Clock,
  Award,
  Brain,
  MessageSquare,
  ThumbsUp,
  Heart,
  Lightbulb,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Eye,
  Star
} from 'lucide-react';
import { TrainingModule, Rep, Exercise, Quiz } from '../../types';

interface TraineeModulePlayerProps {
  module: TrainingModule;
  trainee: Rep;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function TraineeModulePlayer({ 
  module, 
  trainee, 
  onProgress, 
  onComplete, 
  onBack 
}: TraineeModulePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [engagementScore, setEngagementScore] = useState(85);
  const [comprehensionScore, setComprehensionScore] = useState(78);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const totalDuration = parseInt(module.duration) * 60; // Convert to seconds
          const progress = Math.min((newTime / totalDuration) * 100, 100);
          
          onProgress(progress);
          setSectionProgress(progress);
          
          // Update engagement based on interaction
          if (newTime % 30 === 0) { // Every 30 seconds
            setEngagementScore(prev => Math.max(prev - 1, 0));
          }
          
          return newTime;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, module.duration, onProgress, playbackSpeed]);

  const handleInteraction = () => {
    setEngagementScore(prev => Math.min(prev + 2, 100));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionComplete = () => {
    handleInteraction();
    if (currentSection < module.topics.length - 1) {
      setCurrentSection(prev => prev + 1);
      setSectionProgress(0);
    } else {
      onComplete();
    }
  };

  const startQuiz = (quiz: Quiz) => {
    handleInteraction();
    setCurrentQuiz(quiz);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setIsPlaying(false);
  };

  const submitQuizAnswer = () => {
    handleInteraction();
    if (quizAnswer !== null && currentQuiz) {
      setShowQuizResult(true);
      const isCorrect = quizAnswer === currentQuiz.correctAnswer;
      if (isCorrect) {
        setComprehensionScore(prev => Math.min(prev + 10, 100));
        setEngagementScore(prev => Math.min(prev + 5, 100));
      }
    }
  };

  const addBookmark = () => {
    handleInteraction();
    if (!bookmarks.includes(currentTime)) {
      setBookmarks(prev => [...prev, currentTime]);
    }
  };

  const jumpToBookmark = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(true);
  };

  const getModuleTypeIcon = () => {
    switch (module.type) {
      case 'video':
        return <Video className="h-6 w-6 text-red-500" />;
      case 'interactive':
        return <Zap className="h-6 w-6 text-purple-500" />;
      case 'ai-tutor':
        return <Brain className="h-6 w-6 text-blue-500" />;
      case 'simulation':
        return <Target className="h-6 w-6 text-green-500" />;
      default:
        return <BookOpen className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                {getModuleTypeIcon()}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                  <p className="text-gray-600">{module.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(sectionProgress)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{engagementScore}%</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Video/Content Player */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
                <div className="bg-gray-900 aspect-video relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
                  />
                  
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 group">
                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          handleInteraction();
                          setIsPlaying(!isPlaying);
                        }}
                        className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause className="h-10 w-10 text-gray-900 ml-1" />
                        ) : (
                          <Play className="h-10 w-10 text-gray-900 ml-2" />
                        )}
                      </button>
                    </div>

                    {/* Top Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                        <div className="text-sm">Section {currentSection + 1}: {module.topics[currentSection]}</div>
                      </div>
                      <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                        <div className="text-sm">{formatTime(currentTime)} / {module.duration}</div>
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black bg-opacity-75 rounded-lg p-4">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sectionProgress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                handleInteraction();
                                setIsPlaying(!isPlaying);
                              }}
                              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </button>

                            <button
                              onClick={() => {
                                handleInteraction();
                                setCurrentTime(0);
                                setSectionProgress(0);
                              }}
                              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                              <RotateCcw className="h-5 w-5" />
                            </button>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                              >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                className="w-20"
                              />
                            </div>

                            <select
                              value={playbackSpeed}
                              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                              className="bg-white bg-opacity-20 text-white rounded px-2 py-1 text-sm"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={addBookmark}
                              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                              <Star className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => setShowTranscript(!showTranscript)}
                              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => setShowNotes(!showNotes)}
                              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                              <BookOpen className="h-4 w-4" />
                            </button>

                            <button className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
                              <Maximize className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module Content Sections */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Section {currentSection + 1}: {module.topics[currentSection]}
                    </h2>
                    <button
                      onClick={handleSectionComplete}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>

                  {/* Interactive Elements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Practice Exercises */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Practice Exercises</span>
                      </h3>
                      <div className="space-y-3">
                        {Array.isArray(module.practicalExercises) && module.practicalExercises.length > 0 ? (
                          module.practicalExercises.slice(0, 2).map((exercise) => (
                          <button
                            key={exercise.id}
                            onClick={() => handleInteraction()}
                            className="w-full text-left p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{exercise.title}</div>
                                <div className="text-sm text-gray-600">{exercise.type} • Difficulty: {exercise.difficulty}/10</div>
                              </div>
                              {exercise.completed && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No exercises available</p>
                        )}
                      </div>
                    </div>

                    {/* Knowledge Checks / QCM */}
                    {module.assessments && 
                     Array.isArray(module.assessments) && 
                     module.assessments.length > 0 && 
                     module.assessments[0] && 
                     Array.isArray(module.assessments[0].questions) && 
                     module.assessments[0].questions.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                        <h3 className="font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                          <Brain className="h-5 w-5" />
                          <span>QCM - Quiz ({module.assessments[0].questions.length} Questions)</span>
                        </h3>
                        <div className="space-y-3">
                          {module.assessments[0].questions.slice(0, 5).map((question: any, index: number) => (
                            <button
                              key={`quiz-${index}`}
                              onClick={() => startQuiz({
                                id: `quiz-${index}`,
                                question: question.text,
                                options: question.options,
                                correctAnswer: question.correctAnswer,
                                explanation: question.explanation || 'Good job!',
                                difficulty: question.difficulty === 'easy' ? 3 : question.difficulty === 'medium' ? 5 : 8
                              })}
                              className="w-full text-left p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 pr-4">
                                  <div className="font-medium text-gray-900 mb-1">Question {index + 1}</div>
                                  <div className="text-sm text-gray-600 line-clamp-2">{question.text}</div>
                                  <div className="text-xs text-purple-600 mt-1">
                                    {question.difficulty} • {question.points || 10} points
                                  </div>
                                </div>
                                <Brain className="h-5 w-5 text-purple-500 flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                          {module.assessments[0].questions.length > 5 && (
                            <div className="text-center text-sm text-gray-600 py-2">
                              +{module.assessments[0].questions.length - 5} autres questions disponibles
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Section QCM Complète */}
              {module.assessments && module.assessments.length > 0 && module.assessments[0].questions && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-500 p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-green-900 flex items-center">
                        <Brain className="h-8 w-8 mr-3 text-green-600" />
                        QCM - Évaluation du Module
                      </h2>
                      <p className="text-green-700 mt-2">
                        {module.assessments[0].questions.length} questions • 
                        Score de passage: {module.assessments[0].passingScore || 70}% • 
                        Durée: {module.assessments[0].timeLimit || 30} min
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{module.assessments[0].questions.length}</div>
                      <div className="text-sm text-green-700">Questions</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {module.assessments[0].questions.map((question: any, index: number) => (
                      <button
                        key={`full-quiz-${index}`}
                        onClick={() => startQuiz({
                          id: `quiz-${index}`,
                          question: question.text,
                          options: question.options,
                          correctAnswer: question.correctAnswer,
                          explanation: question.explanation || 'Good job!',
                          difficulty: question.difficulty === 'easy' ? 3 : question.difficulty === 'medium' ? 5 : 8
                        })}
                        className="group bg-white border-2 border-green-200 rounded-lg p-5 hover:border-green-400 hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                question.difficulty === 'easy' ? 'bg-blue-100 text-blue-800' :
                                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {question.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {question.points || 10} pts
                          </div>
                        </div>
                        
                        <p className="text-gray-900 font-medium mb-3 line-clamp-3">
                          {question.text}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{question.options?.length || 4} options</span>
                          <div className="flex items-center text-green-600 group-hover:text-green-700 font-medium">
                            <span className="mr-1">Commencer</span>
                            <Brain className="h-4 w-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-green-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{module.assessments[0].questions.length}</div>
                        <div className="text-sm text-gray-600">Questions Totales</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {module.assessments[0].questions.reduce((sum: number, q: any) => sum + (q.points || 10), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Points Totaux</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{module.assessments[0].passingScore || 70}%</div>
                        <div className="text-sm text-gray-600">Score Minimum</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{module.assessments[0].timeLimit || 30}</div>
                        <div className="text-sm text-gray-600">Minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Learning Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Module Progress</span>
                      <span className="text-sm font-bold text-gray-900">{Math.round(sectionProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${sectionProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">{engagementScore}%</div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{comprehensionScore}%</div>
                      <div className="text-xs text-gray-600">Comprehension</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Sections */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Module Sections</h3>
                <div className="space-y-2">
                  {module.topics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleInteraction();
                        setCurrentSection(index);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentSection 
                          ? 'bg-blue-100 border border-blue-300 text-blue-900' 
                          : index < currentSection
                          ? 'bg-green-100 border border-green-300 text-green-900'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < currentSection ? 'bg-green-500 text-white' :
                          index === currentSection ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {index < currentSection ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="font-medium">{topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Bookmarks</h3>
                  <div className="space-y-2">
                    {bookmarks.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => jumpToBookmark(time)}
                        className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            Bookmark {index + 1} - {formatTime(time)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Learning Objectives</h3>
                <ul className="space-y-2">
                  {module.learningObjectives?.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          {showNotes && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Module Notes</h3>
                    <button
                      onClick={() => setShowNotes(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      handleInteraction();
                    }}
                    placeholder="Take notes about this module..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setShowNotes(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleInteraction();
                        setShowNotes(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Modal */}
          {currentQuiz && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Knowledge Check</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{currentQuiz.question}</p>
                  
                  <div className="space-y-2 mb-4">
                    {currentQuiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleInteraction();
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
                        {quizAnswer === currentQuiz.correctAnswer ? 'Correct! 🎉' : 'Incorrect 😔'}
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
                        onClick={() => {
                          setCurrentQuiz(null);
                          setIsPlaying(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Continue Learning
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentQuiz(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}