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
  Fade,
  Zoom,
  Paper,
} from '@mui/material';
import { Edit, CheckCircle, Cancel, Warning, VerifiedUser } from '@mui/icons-material';

interface Document {
  _id: string;
  title?: string;
  originalFileName: string;
  status: string;
}

interface StatusChangeDialogProps {
  open: boolean;
  document: Document | null;
  newStatus: 'verified' | 'rejected';
  onClose: () => void;
  onConfirm: (status: 'verified' | 'rejected', reason?: string) => void;
  loading: boolean;
}

export default function StatusChangeDialog({ 
  open, 
  document, 
  newStatus, 
  onClose, 
  onConfirm, 
  loading 
}: StatusChangeDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    const reason = newStatus === 'rejected' ? rejectionReason : undefined;
    onConfirm(newStatus, reason);
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
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
          background: newStatus === 'verified' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
          {newStatus === 'verified' ? (
            <VerifiedUser sx={{ fontSize: 20 }} />
          ) : (
            <Warning sx={{ fontSize: 20 }} />
          )}
        </Box>
        <Typography variant="h6" className="font-bold">
          {newStatus === 'verified' ? 'Verify Document' : 'Reject Document'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box className="space-y-6">
          <Paper
            className="p-4 rounded-xl"
            sx={{
              background: newStatus === 'verified' 
                ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: newStatus === 'verified' 
                ? '1px solid #a7f3d0'
                : '1px solid #fecaca'
            }}
          >
            <Box className="flex items-center gap-3 mb-3">
              {newStatus === 'verified' ? (
                <CheckCircle sx={{ color: '#059669', fontSize: 24 }} />
              ) : (
                <Cancel sx={{ color: '#dc2626', fontSize: 24 }} />
              )}
              <Typography 
                variant="h6" 
                className="font-semibold"
                sx={{
                  color: newStatus === 'verified' ? '#065f46' : '#991b1b'
                }}
              >
                Document: {document?.title || document?.originalFileName}
              </Typography>
            </Box>
            
            <Typography 
              variant="body1" 
              className="font-medium"
              sx={{
                color: newStatus === 'verified' ? '#047857' : '#b91c1c'
              }}
            >
              {newStatus === 'verified' 
                ? 'Are you sure you want to mark this document as verified? This action will confirm that the document has been properly reviewed and approved.'
                : 'Are you sure you want to reject this document? Please provide a reason for rejection below.'
              }
            </Typography>
          </Paper>
          
          <Fade in={newStatus === 'rejected'} timeout={300}>
            <Box>
              {newStatus === 'rejected' && (
                <TextField
                  fullWidth
                  label="Rejection Reason"
                  multiline
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#fecaca',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#dc2626',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#dc2626',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Fade>

          <Fade in={loading} timeout={300}>
            <Box>
              {loading && (
                <Box>
                  <Box className="relative">
                    <LinearProgress 
                      sx={{ 
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: newStatus === 'verified' 
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
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
                    variant="body2" 
                    className="text-center mt-2"
                    sx={{ 
                      fontWeight: 600,
                      color: newStatus === 'verified' ? '#047857' : '#b91c1c'
                    }}
                  >
                    Updating status...
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
          disabled={loading}
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
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || (newStatus === 'rejected' && !rejectionReason.trim())}
          startIcon={newStatus === 'verified' ? <CheckCircle /> : <Cancel />}
          sx={{
            height: 40,
            borderRadius: '12px',
            background: newStatus === 'verified' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: newStatus === 'verified' 
              ? '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
              : '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
            fontWeight: 600,
            px: 3,
            py: 1,
            textTransform: 'none',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: newStatus === 'verified' 
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              transform: 'translateY(-2px)',
              boxShadow: newStatus === 'verified' 
                ? '0 8px 25px 0 rgba(16, 185, 129, 0.5)'
                : '0 8px 25px 0 rgba(239, 68, 68, 0.5)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              boxShadow: 'none',
              transform: 'none',
            }
          }}
        >
          {loading 
            ? 'Updating...' 
            : newStatus === 'verified' 
              ? 'Verify Document' 
              : 'Reject Document'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
