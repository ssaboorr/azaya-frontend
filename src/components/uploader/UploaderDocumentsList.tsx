'use client';

import React, { useState } from 'react';
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
  Fade,
  Slide,
  Grow,
  Badge,
} from '@mui/material';
import { 
  PictureAsPdf, 
  Visibility, 
  Download, 
  OpenInNew, 
  Share, 
  CheckCircle, 
  Cancel,
  MoreVert,
  Schedule,
  Person
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'signed':
      case 'verified':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'pending':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'rejected':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  if (loading) {
    return (
      <Card 
        className="mb-8"
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent>
          <Box className="text-center py-8">
            <Box className="relative mb-4">
              <LinearProgress 
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
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
            <Typography variant="body2" className="text-gray-500 font-medium">
              Loading documents...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="mb-8"
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <CardContent>
        <Box className="flex justify-between items-center mb-6">
          <Box className="flex items-center gap-3">
            <Box 
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
              }}
            >
              <PictureAsPdf sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography 
              variant="h5" 
              className="font-bold"
              sx={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}
            >
              Your Documents
            </Typography>
          </Box>
          <Chip
            label={`${totalCount || documents?.length || 0} total`}
            variant="outlined"
            sx={{
              color: '#3b82f6',
              borderColor: '#3b82f6',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#eff6ff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          />
        </Box>

        {documents && documents.length > 0 ? (
          <List sx={{ p: 0 }}>
            {documents.map((doc, index) => (
              <Grow 
                key={doc._id} 
                in={true} 
                timeout={300 + index * 100}
                style={{ transformOrigin: '0 0 0' }}
              >
                <div>
                  <ListItem 
                    className="rounded-xl px-4 py-4 mb-3"
                    sx={{
                      background: hoveredItem === doc._id 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      boxShadow: hoveredItem === doc._id 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease-in-out',
                      transform: hoveredItem === doc._id ? 'translateY(-2px)' : 'translateY(0)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(doc._id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <ListItemIcon sx={{ minWidth: 48 ,padding:4}}>
                      <Box
                        className="flex items-center justify-center w-12 h-12 rounded-xl"
                        sx={{
                          background: getStatusGradient(doc.status),
                          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease-in-out',
                          transform: hoveredItem === doc._id ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <PictureAsPdf sx={{ color: '#ffffff', fontSize: 24 }} />
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <span className="block">
                          <Box className="flex items-center gap-3 mb-2">
                            <Typography 
                              variant="h6" 
                              className="font-semibold"
                              component="span"
                              sx={{
                                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.1rem'
                              }}
                            >
                              {doc.title || doc.originalFileName}
                            </Typography>
                            <Chip
                              label={doc.status}
                              size="small"
                              sx={{
                                background: getStatusGradient(doc.status),
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            />
                          </Box>
                        </span>
                      }
                      secondary={
                        <span className="block">
                          <Box className="space-y-2">
                            {doc.status === 'rejected' && (
                              <Box 
                                className="flex items-center gap-2 p-2 rounded-lg"
                                sx={{
                                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                  border: '1px solid #fecaca'
                                }}
                              >
                                <Cancel sx={{ color: '#dc2626', fontSize: 16 }} />
                                <Typography variant="body2" className="text-red-600 font-medium" component="span">
                                  Rejected: {doc.rejectionReason}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box className="flex items-center gap-4 text-sm">
                              <Box className="flex items-center gap-1">
                                <Person sx={{ color: '#6b7280', fontSize: 16 }} />
                                <Typography variant="body2" className="text-gray-600" component="span">
                                  {doc.signerEmail || doc.assignedSigner?.email}
                                </Typography>
                              </Box>
                              <Box className="flex items-center gap-1">
                                <Schedule sx={{ color: '#6b7280', fontSize: 16 }} />
                                <Typography variant="body2" className="text-gray-500" component="span">
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="caption" className="text-gray-400" component="span">
                              Original: {doc.originalFileName}
                            </Typography>
                          </Box>
                        </span>
                      }
                    />
                    
                    <Box className="flex gap-1">
                      <Tooltip title="View Document" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onViewDocument(doc)}
                          sx={{ 
                            color: '#3b82f6',
                            '&:hover': {
                              backgroundColor: '#eff6ff',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Download" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDownloadDocument(doc)}
                          sx={{ 
                            color: '#059669',
                            '&:hover': {
                              backgroundColor: '#ecfdf5',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Open in New Tab" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onOpenInNewTab(doc)}
                          sx={{ 
                            color: '#7c3aed',
                            '&:hover': {
                              backgroundColor: '#faf5ff',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Copy Link" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onCopyLink(doc)}
                          sx={{ 
                            color: '#dc2626',
                            '&:hover': {
                              backgroundColor: '#fef2f2',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <Share />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Status Change Buttons - Only show for signed documents */}
                      {doc.status === 'signed' && (
                        <Box className="flex gap-1 ml-2 pl-2 border-l border-gray-200">
                          <Tooltip title="Mark as Verified" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onStatusChange(doc, 'verified')}
                              disabled={statusUpdateLoading}
                              sx={{ 
                                color: '#059669',
                                '&:hover': {
                                  backgroundColor: '#ecfdf5',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s ease-in-out'
                                },
                                '&:disabled': {
                                  color: '#9ca3af',
                                  backgroundColor: 'transparent'
                                }
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reject Document" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onStatusChange(doc, 'rejected')}
                              disabled={statusUpdateLoading}
                              sx={{ 
                                color: '#dc2626',
                                '&:hover': {
                                  backgroundColor: '#fef2f2',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s ease-in-out'
                                },
                                '&:disabled': {
                                  color: '#9ca3af',
                                  backgroundColor: 'transparent'
                                }
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                </div>
              </Grow>
            ))}
          </List>
        ) : (
          <Fade in={true} timeout={500}>
            <Paper 
              className="p-12 text-center rounded-2xl"
              sx={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '2px dashed #cbd5e1',
                borderRadius: '16px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <Box
                className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl"
                sx={{
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  transition: 'all 0.3s ease-in-out',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                <PictureAsPdf sx={{ color: '#64748b', fontSize: 40 }} />
              </Box>
              
              <Typography 
                variant="h6" 
                className="font-bold mb-3"
                sx={{
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.25rem'
                }}
              >
                No documents uploaded yet
              </Typography>
              
              <Typography 
                variant="body2" 
                className="text-gray-500 mb-4"
                sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}
              >
                Upload your first document to get started with the signature process
              </Typography>
              
              <Box className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Box className="w-2 h-2 rounded-full bg-gray-300"></Box>
                <Box className="w-2 h-2 rounded-full bg-gray-300"></Box>
                <Box className="w-2 h-2 rounded-full bg-gray-300"></Box>
              </Box>
            </Paper>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}
