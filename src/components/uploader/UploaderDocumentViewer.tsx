'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Chip,
  ButtonGroup,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { 
  PictureAsPdf, 
  Download, 
  OpenInNew, 
  Close, 
  Share, 
  Refresh, 
  Error 
} from '@mui/icons-material';

interface Document {
  _id: string;
  title?: string;
  originalFileName: string;
  status: string;
  signerEmail?: string;
  assignedSigner?: {
    name?: string;
    email?: string;
  };
  uploader?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  signatureFields?: Array<{
    _id?: string;
    type: string;
    page: number;
  }>;
}

interface UploaderDocumentViewerProps {
  open: boolean;
  document: Document | null;
  onClose: () => void;
  onDownloadDocument: (document: Document) => void;
  onOpenInNewTab: (document: Document) => void;
  onCopyLink: (document: Document) => void;
}

export default function UploaderDocumentViewer({ 
  open, 
  document, 
  onClose, 
  onDownloadDocument,
  onOpenInNewTab,
  onCopyLink
}: UploaderDocumentViewerProps) {
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPdfViewerUrl = (document: Document) => {
    if (!document.cloudinaryUrl) return '';
    return `${document.cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  };

  const handleIframeLoad = () => {
    setPdfLoading(false);
    setPdfLoadError(false);
  };

  const handleIframeError = () => {
    setPdfLoading(false);
    setPdfLoadError(true);
  };

  const handleRetryPdf = () => {
    setPdfLoadError(false);
    setPdfLoading(true);
  };

  const renderPdfViewer = () => {
    if (!document || typeof window === 'undefined') return null;

    if (pdfLoadError) {
      return (
        <Box className="flex items-center justify-center h-96 bg-gray-50">
          <div className="text-center p-8">
            <Error className="text-red-400 mb-4" sx={{ fontSize: 64 }} />
            <Typography variant="h6" className="text-gray-500 mb-2">
              Failed to Load PDF
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-4">
              The PDF couldn't be displayed. This might be due to:
              <br />• Authentication issues (401 error)
              <br />• Access restrictions
              <br />• Network connectivity problems
            </Typography>
            <Box className="space-x-2">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRetryPdf}
              >
                Retry
              </Button>
              <Button
                variant="contained"
                startIcon={<OpenInNew />}
                onClick={() => onOpenInNewTab(document)}
                sx={{
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' },
                }}
              >
                Open in New Tab
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => onDownloadDocument(document)}
                sx={{
                  backgroundColor: '#059669',
                  '&:hover': { backgroundColor: '#047857' },
                }}
              >
                Download
              </Button>
            </Box>
          </div>
        </Box>
      );
    }

    return (
      <Box className="h-full relative">
        {pdfLoading && (
          <Box className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <Typography variant="body2" className="text-gray-600">
                Loading PDF...
              </Typography>
            </div>
          </Box>
        )}
        <iframe
          src={getPdfViewerUrl(document)}
          width="100%"
          height="600px"
          style={{
            border: 'none',
            borderRadius: '0px',
            minHeight: '70vh'
          }}
          title={document.title || document.originalFileName}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </Box>
    );
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
        <Box className="flex items-center gap-1">
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Download">
              <Button
                onClick={() => onDownloadDocument(document)}
                startIcon={<Download />}
              >
                Download
              </Button>
            </Tooltip>
            <Tooltip title="Open in New Tab">
              <Button
                onClick={() => onOpenInNewTab(document)}
                startIcon={<OpenInNew />}
              >
                Open
              </Button>
            </Tooltip>
            <Tooltip title="Copy Link">
              <Button
                onClick={() => onCopyLink(document)}
                startIcon={<Share />}
              >
                Share
              </Button>
            </Tooltip>
          </ButtonGroup>
          <Button
            onClick={onClose}
            sx={{ color: '#6b7280', ml: 2 }}
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
                  Assigned To
                </Typography>
                <Typography variant="body2" className="font-medium">
                  {document.signerEmail || document.assignedSigner?.email}
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
                  Uploaded
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
                      key={index}
                      label={`${field.type} (Page ${field.page})`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6'
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
                  onClick={() => onCopyLink(document)}
                >
                  {document.cloudinaryUrl}
                </Typography>
              </Box>
            )}
          </Box>

          {/* PDF Viewer */}
          <Box className="h-full p-0">
            {renderPdfViewer()}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
