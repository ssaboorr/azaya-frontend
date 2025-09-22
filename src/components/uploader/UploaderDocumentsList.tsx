'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  PictureAsPdf, 
  Visibility, 
  Download, 
  OpenInNew, 
  Share, 
  CheckCircle, 
  Cancel 
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
  rejectionReason?: string | React.ReactNode;
}

interface UploaderDocumentsListProps {
  documents: Document[];
  loading: boolean;
  totalCount: number;
  onViewDocument: (document: Document) => void;
  onDownloadDocument: (document: Document) => void;
  onOpenInNewTab: (document: Document) => void;
  onCopyLink: (document: Document) => void;
  onStatusChange: (document: Document, status: 'verified' | 'rejected') => void;
  statusUpdateLoading: boolean;
}

export default function UploaderDocumentsList({ 
  documents, 
  loading, 
  totalCount, 
  onViewDocument,
  onDownloadDocument,
  onOpenInNewTab,
  onCopyLink,
  onStatusChange,
  statusUpdateLoading
}: UploaderDocumentsListProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
      case 'verified':
        return <CheckCircle />;
      case 'pending':
        return <PictureAsPdf />;
      default:
        return <PictureAsPdf />;
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent>
          <Box className="text-center py-4">
            <LinearProgress className="mb-2" />
            <Typography variant="body2" className="text-gray-500">
              Loading documents...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" className="font-semibold">
            Your Documents
          </Typography>
          <Chip
            label={`${totalCount || documents?.length || 0} total`}
            variant="outlined"
            color="primary"
          />
        </Box>

        {documents && documents.length > 0 ? (
          <List>
            {documents.map((doc, index) => (
              <React.Fragment key={doc._id}>
                <ListItem className="hover:bg-gray-50 rounded-lg px-4 py-3">
                  <ListItemIcon>
                    <PictureAsPdf className="text-red-500" sx={{ fontSize: 32 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <span className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-base">
                          {doc.title || doc.originalFileName}
                        </span>
                        <Chip
                          label={doc.status}
                          color={getStatusColor(doc.status) as any}
                          size="small"
                        />
                      </span>
                    }
                    secondary={
                      <span className="block space-y-1">
                        {doc.status === 'rejected' && (
                          <span className="block text-red-600 text-sm">
                            Rejected Reason: {doc.rejectionReason}
                          </span>
                        )}
                        <span className="block text-gray-600 text-sm">
                          Assigned to: {doc.signerEmail || doc.assignedSigner?.email}
                        </span>
                        <span className="block text-gray-500 text-xs">
                          Uploaded: {new Date(doc.createdAt).toLocaleDateString()} •
                          Original: {doc.originalFileName}
                        </span>
                        {doc.cloudinaryPublicId && (
                          <span className="block text-gray-400 text-xs">
                            ID: {doc.cloudinaryPublicId}
                          </span>
                        )}
                      </span>
                    }
                  />
                  <Box className="flex gap-1">
                    <Tooltip title="View Document">
                      <IconButton
                        size="small"
                        onClick={() => onViewDocument(doc)}
                        sx={{ color: '#3b82f6' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => onDownloadDocument(doc)}
                        sx={{ color: '#059669' }}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open in New Tab">
                      <IconButton
                        size="small"
                        onClick={() => onOpenInNewTab(doc)}
                        sx={{ color: '#7c3aed' }}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Link">
                      <IconButton
                        size="small"
                        onClick={() => onCopyLink(doc)}
                        sx={{ color: '#dc2626' }}
                      >
                        <Share />
                      </IconButton>
                    </Tooltip>
                    {/* Status Change Buttons - Only show for signed documents */}
                    {doc.status === 'signed' && (
                      <>
                        <Tooltip title="Mark as Verified">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(doc, 'verified')}
                            sx={{ color: '#059669' }}
                            disabled={statusUpdateLoading}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Document">
                          <IconButton
                            size="small"
                            onClick={() => onStatusChange(doc, 'rejected')}
                            sx={{ color: '#dc2626' }}
                            disabled={statusUpdateLoading}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </ListItem>
                {index < documents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Paper className="p-8 text-center">
            <PictureAsPdf className="text-gray-400 mb-4" sx={{ fontSize: 48 }} />
            <Typography variant="h6" className="text-gray-500 mb-2">
              No documents uploaded yet
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              Upload your first document to get started
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}
