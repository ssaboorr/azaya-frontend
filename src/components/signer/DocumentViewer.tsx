'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { PictureAsPdf, Download, OpenInNew, Close } from '@mui/icons-material';

interface Document {
  _id: string;
  title?: string;
  originalFileName: string;
  status: string;
  uploader?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
  cloudinaryUrl?: string;
  signatureFields?: Array<{
    _id?: string;
    type: string;
    page: number;
  }>;
}

interface DocumentViewerProps {
  open: boolean;
  document: Document | null;
  onClose: () => void;
}

export default function DocumentViewer({ open, document, onClose }: DocumentViewerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!document) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen
    >
      <DialogTitle className="flex items-center justify-between">
        <Box className="flex items-center gap-2">
          <PictureAsPdf className="text-red-500" />
          <Typography variant="h6">
            {document.title || document.originalFileName || 'Document Viewer'}
          </Typography>
        </Box>
        <Box className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={() => {
              if (document.cloudinaryUrl) {
                window.open(document.cloudinaryUrl, '_blank');
              }
            }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNew />}
            onClick={() => {
              if (document.cloudinaryUrl) {
                window.open(document.cloudinaryUrl, '_blank');
              }
            }}
          >
            Open in New Tab
          </Button>
          <Button 
            onClick={onClose}
            sx={{ color: '#6b7280' }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent className="p-0">
        <Box className="h-full">
          {/* Document Info Header */}
          <Box className="p-4 bg-gray-50 border-b">
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Document Title
                </Typography>
                <Typography variant="body2" className="font-medium">
                  {document.title || document.originalFileName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Uploaded By
                </Typography>
                <Typography variant="body2" className="font-medium">
                  {document.uploader?.name || document.uploader?.email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Status
                </Typography>
                <Chip
                  label={document.status}
                  color={getStatusColor(document.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Assigned
                </Typography>
                <Typography variant="body2" className="font-medium">
                  {new Date(document.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            {/* Signature Fields Info */}
            {document.signatureFields && document.signatureFields.length > 0 && (
              <Box className="mt-4 p-3 bg-blue-50 rounded-md">
                <Typography variant="subtitle2" className="text-blue-800 mb-2">
                  Signature Fields ({document.signatureFields.length})
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {document.signatureFields.map((field: any, index: number) => (
                    <Chip
                      key={field._id || index}
                      label={`${field.type} (Page ${field.page})`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: '#10b981',
                        color: '#10b981'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Document URL */}
            {document.cloudinaryUrl && (
              <Box className="mt-3 p-2 bg-white rounded-md border">
                <Typography variant="caption" className="text-gray-600">
                  Document URL:
                </Typography>
                <Typography 
                  variant="caption" 
                  className="text-blue-600 break-all cursor-pointer hover:underline ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(document.cloudinaryUrl!);
                  }}
                >
                  {document.cloudinaryUrl}
                </Typography>
              </Box>
            )}
          </Box>

          {/* PDF Viewer */}
          <Box className="h-full p-0">
            {document.cloudinaryUrl ? (
              <iframe
                src={`${document.cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                width="100%"
                height="600px"
                style={{ 
                  border: 'none', 
                  borderRadius: '0px',
                  minHeight: '70vh'
                }}
                title={document.title || document.originalFileName}
              />
            ) : (
              <Box className="text-center py-8">
                <PictureAsPdf className="text-gray-400 mb-4" sx={{ fontSize: 64 }} />
                <Typography variant="h6" className="text-gray-500 mb-2">
                  Document Preview Not Available
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                  This document cannot be previewed in the browser.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => {
                    if (document.cloudinaryUrl) {
                      window.open(document.cloudinaryUrl, '_blank');
                    }
                  }}
                  sx={{
                    backgroundColor: '#10b981',
                    '&:hover': { backgroundColor: '#059669' },
                  }}
                >
                  Download Document
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}