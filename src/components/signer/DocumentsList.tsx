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
  Button,
  IconButton,
  Tooltip,
  Fade,
  Grow,
} from '@mui/material';
import { Assignment, Visibility, Edit, CheckCircle, Warning, Person, Schedule, Description } from '@mui/icons-material';

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
  signatureFields?: Array<{
    _id?: string;
    type: string;
    page: number;
  }>;
  dueDate?: string;
}

interface DocumentsListProps {
  documents: Document[];
  loading: boolean;
  totalCount: number;
  onViewDocument: (document: Document) => void;
  onSignDocument: (document: Document) => void;
}

export default function DocumentsList({ 
  documents, 
  loading, 
  totalCount, 
  onViewDocument, 
  onSignDocument 
}: DocumentsListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return <CheckCircle />;
      case 'pending':
        return <Warning />;
      default:
        return <Assignment />;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'signed':
      case 'completed':
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
        <CardContent sx={{ p: 3 }}>
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
      <CardContent sx={{ p: 3 }}>
        <Box className="flex justify-between items-center mb-6">
          <Box className="flex items-center gap-3">
            <Box 
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
              }}
            >
              <Assignment sx={{ color: '#ffffff', fontSize: 20 }} />
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
              Documents for Signature
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
                    <ListItemIcon sx={{ minWidth: 48 ,padding:4 }}>
                      <Box
                        className="flex items-center justify-center w-12 h-12 rounded-xl"
                        sx={{
                          background: getStatusGradient(doc.status),
                          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease-in-out',
                          transform: hoveredItem === doc._id ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        {getStatusIcon(doc.status)}
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <span className="block">
                          <Box className="flex items-center gap-3 mb-2 px-2">
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
                            <Box className="flex items-center gap-4 text-sm">
                              <Box className="flex items-center gap-1">
                                <Person sx={{ color: '#6b7280', fontSize: 16 }} />
                                <Typography variant="body2" className="text-gray-600" component="span">
                                  From: {doc.uploader?.name || doc.uploader?.email}
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
                            
                            {doc.signatureFields && doc.signatureFields.length > 0 && (
                              <Box className="flex items-center gap-1">
                                <Description sx={{ color: '#3b82f6', fontSize: 14 }} />
                                <Typography variant="caption" className="text-blue-600" component="span">
                                  {doc.signatureFields.length} signature field{doc.signatureFields.length > 1 ? 's' : ''} required
                                </Typography>
                              </Box>
                            )}
                            
                            {doc.dueDate && (
                              <Box className="flex items-center gap-1">
                                <Schedule sx={{ color: '#f59e0b', fontSize: 14 }} />
                                <Typography variant="caption" className="text-orange-600" component="span">
                                  Due: {new Date(doc.dueDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </span>
                      }
                    />
                    
                    <Box className="flex gap-2">
                      <Tooltip title="Review Document" arrow>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => onViewDocument(doc)}
                          sx={{
                            borderColor: '#10b981',
                            color: '#10b981',
                            borderRadius: '8px',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            '&:hover': {
                              borderColor: '#059669',
                              backgroundColor: '#ecfdf5',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                              transition: 'all 0.2s ease-in-out'
                            },
                          }}
                        >
                          Review
                        </Button>
                      </Tooltip>
                      
                      {doc.status === 'pending' && (
                        <Tooltip title="Sign Document" arrow>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => onSignDocument(doc)}
                            sx={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                              borderRadius: '8px',
                              fontWeight: 600,
                              px: 2,
                              py: 1,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 8px 25px 0 rgba(16, 185, 129, 0.5)',
                                transition: 'all 0.2s ease-in-out'
                              },
                            }}
                          >
                            Sign
                          </Button>
                        </Tooltip>
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
                <Assignment sx={{ color: '#64748b', fontSize: 40 }} />
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
                No documents to sign
              </Typography>
              
              <Typography 
                variant="body2" 
                className="text-gray-500 mb-4"
                sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}
              >
                You're all caught up! Check back later for new documents.
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