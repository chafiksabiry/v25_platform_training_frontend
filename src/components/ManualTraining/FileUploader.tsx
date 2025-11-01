import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cloudinaryService, CloudinaryUploadResult, UploadProgress } from '../../lib/cloudinaryService';

interface FileUploaderProps {
  fileType: 'image' | 'video' | 'document';
  onUploadComplete: (result: CloudinaryUploadResult) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  fileType,
  onUploadComplete,
  onError,
  accept,
  maxSizeMB,
  folder,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptType = (): string => {
    if (accept) return accept;
    
    switch (fileType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
      default:
        return '*/*';
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="w-12 h-12 text-blue-500" />;
      case 'video':
        return <Video className="w-12 h-12 text-purple-500" />;
      case 'document':
        return <FileText className="w-12 h-12 text-green-500" />;
      default:
        return <File className="w-12 h-12 text-gray-500" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
      // ✨ Auto-upload immediately
      uploadFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setUploadSuccess(false);
      // ✨ Auto-upload immediately
      uploadFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const uploadFile = async (fileToUpload: File) => {
    if (!fileToUpload) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      let result: CloudinaryUploadResult;

      const uploadFolder = folder || `trainings/${fileType}s`;

      switch (fileType) {
        case 'image':
          result = await cloudinaryService.uploadImage(fileToUpload, uploadFolder, setProgress);
          break;
        case 'video':
          result = await cloudinaryService.uploadVideo(fileToUpload, uploadFolder, setProgress);
          break;
        case 'document':
          result = await cloudinaryService.uploadDocument(fileToUpload, uploadFolder, setProgress);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      setUploadSuccess(true);
      onUploadComplete(result);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setProgress(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setProgress(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      {!file && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptType()}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop {fileType} here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {accept || getAcceptType()}
                {maxSizeMB && ` • Max size: ${maxSizeMB}MB`}
              </p>
            </div>
            
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 inline-block mr-2" />
              Select File
            </button>
          </div>
        </div>
      )}

      {/* File Preview & Upload */}
      {file && !uploadSuccess && (
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {getIcon()}
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {cloudinaryService.formatFileSize(file.size)}
                </p>
                
                {/* Progress Bar */}
                {uploading && progress && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading... {progress.percentage}%
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-3 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {!uploading && (
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Uploading Indicator */}
          {uploading && (
            <div className="mt-4 flex items-center justify-center text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Uploading...</span>
            </div>
          )}
          
          {/* Retry Button on Error */}
          {error && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => file && uploadFile(file)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Retry Upload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-8 h-8 mr-3" />
            <div>
              <p className="font-medium text-lg">Upload Successful!</p>
              <p className="text-sm text-green-700">File uploaded to Cloudinary</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

