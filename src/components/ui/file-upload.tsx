import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload?: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, className }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    onFileUpload?.(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-primary bg-primary/5 scale-105"
          : "border-border hover:border-primary hover:bg-primary/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        {uploadedFiles.length > 0 ? (
          <>
            <CheckCircle className="w-12 h-12 text-success" />
            <div>
              <p className="text-lg font-medium text-foreground">
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready for analysis
              </p>
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <Upload className={cn(
              "w-12 h-12 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? "Drop your documents here" : "Drop documents or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, Word, PowerPoint files supported
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};