import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';

const FileUploader = ({ label, field, currentUrl, onUpload, uploadProgress, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload({ target: { files } }, field);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Get filename from URL
  const getFileName = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    // Attempt to remove ID-TIMESTAMP prefix, but fallback to lastPart if result is empty
    const cleanName = lastPart.split('-').slice(1).join('-');
    return cleanName || lastPart;
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const isDone = currentUrl && !isUploading;

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-gray-400 text-xs font-medium">File upload</h3>
        <div className="h-px bg-gray-50 w-full mt-2"></div>
      </div>

      <div 
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer relative group ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onClick={(e) => {
            e.target.value = null;
            e.stopPropagation();
          }}
          onChange={(e) => onUpload(e, field)}
          accept=".pdf,.doc,.docx"
        />
        
        {isUploading ? (
          <div className="text-center w-full">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
            <p className="text-xs font-bold text-gray-800 mb-2">Uploading...</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 px-0.5 py-0.5">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <Upload className="w-8 h-8 text-blue-500 mx-auto" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-gray-400 text-center">
              Drag and drop or <span className="text-blue-500 font-bold">browse</span>
            </p>
          </>
        )}
      </div>

      {isDone && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-100 relative">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <File className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-700 truncate">{getFileName(currentUrl)}</p>
              <div className="w-full bg-blue-100 h-1 mt-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-full"></div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(field);
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(currentUrl.startsWith('http') ? currentUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${currentUrl}`, '_blank');
            }}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-full text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase tracking-wider"
          >
            OPEN
          </button>
        </div>
      )}

      {/* Label at bottom for context */}
      <div className="mt-2 text-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
      </div>
    </div>
  );
};

export default FileUploader;
