'use client';

import React from 'react';
import { Card, CardContent, CardActions, Button, Box, Typography, LinearProgress } from '@mui/material';
import { FileUpload } from '@mui/icons-material';

interface UploadSectionProps {
  onUploadClick: () => void;
  uploadLoading: boolean;
  progress: number;
}

export default function UploadSection({ onUploadClick, uploadLoading, progress }: UploadSectionProps) {
  return (
    <div className="flex justify-center mb-8">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h6" className="mb-3 font-semibold text-center">
            Quick Upload
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4 text-center">
            Upload a new document for signature
          </Typography>

          {uploadLoading && (
            <Box className="mb-4">
              <LinearProgress
                variant="determinate"
                value={progress || 0}
                className="mb-2"
              />
              <Typography variant="caption" className="text-gray-500 text-center block">
                Uploading... {progress || 0}%
              </Typography>
            </Box>
          )}

          {!uploadLoading && (
            <Typography variant="caption" className="text-gray-500 text-center block mb-4">
              Ready to upload
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            startIcon={<FileUpload />}
            fullWidth
            onClick={onUploadClick}
            disabled={uploadLoading}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            {uploadLoading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
}
