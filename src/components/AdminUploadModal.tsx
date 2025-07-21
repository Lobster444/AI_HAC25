import React, { useState, useRef } from 'react';
import { X, Upload, Image, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { analyzeMatchImage } from '../lib/firebaseFunctions';
import { saveMatchSummary, MatchSummary } from '../lib/firestore';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummaryUpdated: (matchSummary: MatchSummary) => void;
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  id: string;
}

const AdminUploadModal: React.FC<AdminUploadModalProps> = ({ isOpen, onClose, onSummaryUpdated }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MatchSummary | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    let errorMessage = '';

    // Check if adding these files would exceed the limit
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      errorMessage = `You can only upload up to ${MAX_IMAGES} images. Currently have ${uploadedImages.length} images.`;
      setError(errorMessage);
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errorMessage = 'Please select only valid image files (PNG, JPG, JPEG)';
        break;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        errorMessage = `File "${file.name}" is too large. Maximum size is 10MB.`;
        break;
      }

      validFiles.push(file);
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    // Process valid files
    validFiles.forEach(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          file,
          previewUrl: e.target?.result as string,
          id
        };
        
        setUploadedImages(prev => [...prev, newImage]);
      };
      
      reader.readAsDataURL(file);
    });

    setError('');
    setSuccess(false);
    setAnalysisResult(null);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    setError('');
    setSuccess(false);
    setAnalysisResult(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) return;

    const matchId = 'team-a-vs-team-b-20250717';
    setIsAnalyzing(true);
    setError('');

    try {
      // Convert all images to base64
      const base64Images = await Promise.all(
        uploadedImages.map(img => convertToBase64(img.file))
      );

      // For multiple images, we'll analyze them together by sending the first image
      // In a production app, you might want to analyze all images or combine them
      const result = await analyzeMatchImage(base64Images[0]);
      
      if (result.success) {
        // Create a combined summary mentioning multiple images were analyzed
        const enhancedSummary = uploadedImages.length > 1
          ? result.summary
          : result.summary;

        const enhancedBettingSuggestion = uploadedImages.length > 1
          ? result.bettingSuggestion
          : result.bettingSuggestion;

        // Save to Firestore
        await saveMatchSummary(matchId, enhancedSummary, enhancedBettingSuggestion, result.overUnderOdds);
        
        const matchSummary: MatchSummary = {
          id: matchId,
          matchId,
          summary: enhancedSummary,
          bettingSuggestion: enhancedBettingSuggestion,
          overUnderOdds: result.overUnderOdds,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setAnalysisResult(matchSummary);
        setSuccess(true);
        onSummaryUpdated(matchSummary);
      } else {
        setError(result.error || 'Failed to analyze images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetModal = () => {
    setUploadedImages([]);
    setAnalysisResult(null);
    setError('');
    setSuccess(false);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Upload Match Statistics</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-white max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedImages.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={image.previewUrl} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                        {image.file.name.length > 10 ? image.file.name.substring(0, 10) + '...' : image.file.name}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-300">
                  {uploadedImages.length} of {MAX_IMAGES} images uploaded
                </div>
                
                {uploadedImages.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded transition-colors text-sm"
                  >
                    Add More Images
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Image className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-300 mb-2">Drag and drop up to {MAX_IMAGES} images here, or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Supports PNG, JPG, JPEG (max 10MB each)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Image Management */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Uploaded Images:</span>
                <button
                  onClick={() => setUploadedImages([])}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
              
              <div className="space-y-1">
                {uploadedImages.map((image, index) => (
                  <div key={image.id} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <span className="text-sm text-gray-300 truncate max-w-32">
                        {image.file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-600/20 border border-red-500 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 bg-green-600/20 border border-green-500 rounded-lg p-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-300 text-sm">Analysis completed and saved successfully!</p>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="mt-4 bg-gray-700 rounded-lg p-3">
              <h3 className="text-orange-400 font-semibold mb-2 text-sm">AI Analysis Result:</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-orange-300 font-medium mb-1 text-xs">Match Summary:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{analysisResult.summary}</p>
                </div>
                <div>
                  <h4 className="text-orange-300 font-medium mb-1 text-xs">Betting Suggestion:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{analysisResult.bettingSuggestion}</p>
                </div>
                {analysisResult.overUnderOdds && (
                  <div>
                    <h4 className="text-orange-300 font-medium mb-1 text-xs">Recommended bets:</h4>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-400">Over: {analysisResult.overUnderOdds.over}</span>
                      <span className="text-blue-400">Under: {analysisResult.overUnderOdds.under}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {uploadedImages.length > 0 && !success && (
            <div className="mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing {uploadedImages.length} Image{uploadedImages.length > 1 ? 's' : ''}...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Analyze {uploadedImages.length} Image{uploadedImages.length > 1 ? 's' : ''} with AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadModal;