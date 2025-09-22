'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { Upload, Title, Person } from '@mui/icons-material';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '')
        }));
      }
    }
  };

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
    >
      <DialogTitle className="flex items-center gap-2">
        <Upload className="text-blue-600" />
        Upload Document
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-4 pt-4">
          {/* File Upload */}
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-medium">
              Select Document *
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="w-full p-2 border border-gray-300 rounded-md"
              id="file-upload"
            />
            {selectedFile && (
              <Typography variant="caption" className="text-green-600 mt-1 block">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </Typography>
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
                '& fieldset': {
                  borderColor: '#d1d5db',
                },
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
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
                '& fieldset': {
                  borderColor: '#d1d5db',
                },
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
            }}
          />

          {/* Upload Progress */}
          {uploadLoading && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={progress || 0}
                className="mb-2"
              />
              <Typography variant="caption" className="text-gray-500">
                Uploading... {progress || 0}%
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className="p-4">
        <Button
          onClick={handleClose}
          disabled={uploadLoading}
          sx={{ color: '#6b7280' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || !uploadForm.title || !uploadForm.signerEmail || uploadLoading}
          startIcon={<Upload />}
          sx={{
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          {uploadLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
