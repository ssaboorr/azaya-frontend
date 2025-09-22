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
import { Edit, CheckCircle, Cancel } from '@mui/icons-material';

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
    >
      <DialogTitle className="flex items-center gap-2">
        <Edit className="text-blue-600" />
        {newStatus === 'verified' ? 'Verify Document' : 'Reject Document'}
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-4 pt-4">
          <Typography variant="body1" className="mb-4">
            {newStatus === 'verified' 
              ? `Are you sure you want to mark "${document?.title || document?.originalFileName}" as verified?`
              : `Are you sure you want to reject "${document?.title || document?.originalFileName}"?`
            }
          </Typography>
          
          {newStatus === 'rejected' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#dc2626',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
              }}
            />
          )}

          {loading && (
            <Box className="flex items-center gap-2">
              <LinearProgress sx={{ width: '100%' }} />
              <Typography variant="body2" className="text-gray-500">
                Updating status...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className="p-4">
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#6b7280' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || (newStatus === 'rejected' && !rejectionReason.trim())}
          startIcon={newStatus === 'verified' ? <CheckCircle /> : <Cancel />}
          sx={{
            backgroundColor: newStatus === 'verified' ? '#059669' : '#dc2626',
            '&:hover': {
              backgroundColor: newStatus === 'verified' ? '#047857' : '#b91c1c',
            },
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
