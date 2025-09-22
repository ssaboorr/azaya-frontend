'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardActions, Button, Box, Typography, LinearProgress, Fade, Zoom } from '@mui/material';
import { FileUpload, CloudUpload, CheckCircle } from '@mui/icons-material';

interface UploadSectionProps {
  onUploadClick: () => void;
  uploadLoading: boolean;
  progress: number;
}

export default function UploadSection({ onUploadClick, uploadLoading, progress }: UploadSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center mb-8">
      <Card 
        className="w-full max-w-md"
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box className="text-center mb-4">
            <Box 
              className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-2xl"
              sx={{
                background: uploadLoading 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                transition: 'all 0.3s ease-in-out',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                animation: uploadLoading ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              {uploadLoading ? (
                <CloudUpload sx={{ color: '#ffffff', fontSize: 28 }} />
              ) : (
                <FileUpload sx={{ color: '#ffffff', fontSize: 28 }} />
              )}
            </Box>
            
            <Typography 
              variant="h6" 
              className="font-bold mb-2"
              sx={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem'
              }}
            >
              Quick Upload
            </Typography>
            
            <Typography 
              variant="body2" 
              className="text-gray-600 mb-4"
              sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}
            >
              Upload a new document for signature
            </Typography>
          </Box>

          <Fade in={uploadLoading} timeout={300}>
            <Box className="mb-4">
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

          <Fade in={!uploadLoading} timeout={300}>
            <Box>
              {!uploadLoading && (
                <Box className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography 
                    variant="caption" 
                    className="text-green-600 font-semibold"
                  >
                    Ready to upload
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            startIcon={uploadLoading ? <CloudUpload /> : <FileUpload />}
            fullWidth
            onClick={onUploadClick}
            disabled={uploadLoading}
            sx={{
              height: 48,
              borderRadius: '12px',
              background: uploadLoading 
                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
              fontWeight: 600,
              fontSize: '0.95rem',
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
        </CardActions>
      </Card>
    </div>
  );
}
