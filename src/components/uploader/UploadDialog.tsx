'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  LinearProgress,
  Fade,
  Zoom,
  Paper,
} from '@mui/material';
import { Upload, Title, Person, CloudUpload, CheckCircle, Error } from '@mui/icons-material';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, signerEmail: string) => void;
  uploadLoading: boolean;
  progress: number;
}

export default function UploadDialog({ 
  open, 
  onClose, 
  onUpload, 
  uploadLoading, 
  progress 
}: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    signerEmail: '',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a PDF, DOC, or DOCX file';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    if (!uploadForm.title) {
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadForm.title || !uploadForm.signerEmail) {
      return;
    }
    onUpload(selectedFile, uploadForm.title, uploadForm.signerEmail);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadForm({ title: '', signerEmail: '' });
    setFileError(null);
    setIsDragOver(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle 
        className="flex items-center gap-3 pb-4"
        sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: '#ffffff',
          borderRadius: '20px 20px 0 0',
          px: 3,
          py: 2
        }}
      >
        <Box 
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          sx={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CloudUpload sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="h6" className="font-bold">
          Upload Document
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box className="space-y-6">
          {/* Drag and Drop Area */}
          <Box>
            <Typography variant="subtitle2" className="mb-3 font-semibold text-gray-700">
              Select Document *
            </Typography>
            
            <Paper
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 4,
                textAlign: 'center',
                border: isDragOver ? '2px dashed #3b82f6' : '2px dashed #cbd5e1',
                borderRadius: '16px',
                background: isDragOver 
                  ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#3b82f6',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              
              {selectedFile ? (
                <Fade in={true} timeout={300}>
                  <Box>
                    <Box 
                      className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-2xl"
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                      }}
                    >
                      <CheckCircle sx={{ color: '#ffffff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" className="font-semibold text-green-600 mb-2">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <Box>
                  <Box 
                    className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-2xl"
                    sx={{
                      background: isDragOver 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      transition: 'all 0.3s ease-in-out',
                      transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <CloudUpload sx={{ color: isDragOver ? '#ffffff' : '#64748b', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                    {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mb-3">
                    or click to browse
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Supports PDF, DOC, DOCX (max 10MB)
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {fileError && (
              <Fade in={true} timeout={300}>
                <Box 
                  className="flex items-center gap-2 mt-3 p-3 rounded-lg"
                  sx={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '1px solid #fecaca'
                  }}
                >
                  <Error sx={{ color: '#dc2626', fontSize: 20 }} />
                  <Typography variant="body2" className="text-red-600 font-medium">
                    {fileError}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Document Title */}
          <TextField
            fullWidth
            label="Document Title"
            value={uploadForm.title}
            onChange={handleFormChange('title')}
            required
            InputProps={{
              startAdornment: <Title className="text-gray-400 mr-2" />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#d1d5db',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Signer Email */}
          <TextField
            fullWidth
            label="Signer Email"
            type="email"
            value={uploadForm.signerEmail}
            onChange={handleFormChange('signerEmail')}
            required
            InputProps={{
              startAdornment: <Person className="text-gray-400 mr-2" />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#d1d5db',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Upload Progress */}
          <Fade in={uploadLoading} timeout={300}>
            <Box>
              {uploadLoading && (
                <Box>
                  <Box className="relative">
                    <LinearProgress
                      variant="determinate"
                      value={progress || 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                        }
                      }}
                    />
                    <Box
                      className="absolute inset-0 rounded-full"
                      sx={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        animation: 'shimmer 2s infinite',
                        '@keyframes shimmer': {
                          '0%': { transform: 'translateX(-100%)' },
                          '100%': { transform: 'translateX(100%)' }
                        }
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="caption" 
                    className="text-gray-500 text-center block mt-2"
                    sx={{ fontWeight: 600 }}
                  >
                    Uploading... {progress || 0}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        </Box>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '0 0 20px 20px'
        }}
      >
        <Button
          onClick={handleClose}
          disabled={uploadLoading}
          sx={{ 
            color: '#6b7280',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: '#f3f4f6',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || !uploadForm.title || !uploadForm.signerEmail || uploadLoading}
          startIcon={uploadLoading ? <CloudUpload /> : <Upload />}
          sx={{
            height: 40,
            borderRadius: '12px',
            background: uploadLoading 
              ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
            fontWeight: 600,
            px: 3,
            py: 1,
            textTransform: 'none',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px 0 rgba(59, 130, 246, 0.5)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              boxShadow: 'none',
              transform: 'none',
            }
          }}
        >
          {uploadLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
