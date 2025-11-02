import React, { useState } from 'react';
import { Upload, File, Image, Video, Loader2, CheckCircle2, AlertCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { cloudinaryService, CloudinaryUploadResult } from '../../lib/cloudinaryService';
import axios from 'axios';

const API_BASE = 'https://api-training.harx.ai';

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  publicId: string;
  size: number;
  cloudinaryResult: CloudinaryUploadResult;
}

interface AIContentOrganizerProps {
  trainingId: string;
  trainingTitle: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const AIContentOrganizer: React.FC<AIContentOrganizerProps> = ({
  trainingId,
  trainingTitle,
  onComplete,
  onSkip,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [checkingAI, setCheckingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if OpenAI is available
  const checkAIAvailability = async () => {
    setCheckingAI(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/ai/check-availability`);
      setAiAvailable(response.data.available);
      if (!response.data.available) {
        setError('OpenAI is not available. You can continue with manual creation.');
      }
    } catch (err) {
      setAiAvailable(false);
      setError('Cannot connect to AI service. Continuing with manual mode.');
    } finally {
      setCheckingAI(false);
    }
  };

  React.useEffect(() => {
    checkAIAvailability();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of files) {
      try {
        let result: CloudinaryUploadResult;
        const fileType = getFileType(file);

        switch (fileType) {
          case 'image':
            result = await cloudinaryService.uploadImage(file, 'trainings/ai-content');
            break;
          case 'video':
            result = await cloudinaryService.uploadVideo(file, 'trainings/ai-content');
            break;
          case 'document':
            result = await cloudinaryService.uploadDocument(file, 'trainings/ai-content');
            break;
          default:
            throw new Error('Unsupported file type');
        }

        const uploadedFile: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: fileType,
          url: result.secureUrl,
          publicId: result.publicId,
          size: file.size,
          cloudinaryResult: result,
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleProcessWithAI = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/api/ai/organize-training`, {
        trainingId,
        files: uploadedFiles.map(f => ({
          url: f.url,
          type: f.type,
          name: f.name,
          publicId: f.publicId,
        })),
      });

      if (response.data.success) {
        onComplete();
      } else {
        setError('Failed to organize content with AI');
      }
    } catch (err: any) {
      console.error('AI processing error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to process content with AI';
      setError(`Error organizing training content: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-green-500" />;
    }
  };

  if (checkingAI) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checking AI Availability...</h2>
          <p className="text-gray-600">Please wait while we connect to the AI service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Content Organization</h1>
          <p className="text-gray-600">Upload your content and let AI organize your training automatically</p>
          <p className="text-sm text-purple-600 font-medium mt-2">Training: {trainingTitle}</p>
        </div>

        {/* AI Status */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          aiAvailable === false 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            {aiAvailable === false ? (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">
                  OpenAI is not available. Click "Skip AI" to continue with manual creation.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  AI service is ready! Upload your files to get started.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Upload Area */}
        {aiAvailable !== false && (
          <>
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || processing}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for images, videos, PDFs, Word, Excel, PowerPoint
                  </p>
                </div>
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={processing}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="mb-6 flex items-center justify-center text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Uploading files...</span>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <button
            onClick={onSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            disabled={processing}
          >
            {aiAvailable === false ? 'Continue Manual Creation' : 'Skip AI & Create Manually'}
          </button>

          {aiAvailable !== false && (
            <button
              onClick={handleProcessWithAI}
              disabled={uploadedFiles.length === 0 || uploading || processing}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Organizing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Organize with AI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

