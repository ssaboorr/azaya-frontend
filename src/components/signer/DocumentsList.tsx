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
  Button,
} from '@mui/material';
import { Assignment, Visibility, Edit, CheckCircle, Warning } from '@mui/icons-material';

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
            Documents for Signature
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
                    {getStatusIcon(doc.status)}
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
                        <span className="block text-gray-600 text-sm">
                          From: {doc.uploader?.name || doc.uploader?.email}
                        </span>
                        <span className="block text-gray-500 text-xs">
                          Assigned: {new Date(doc.createdAt).toLocaleDateString()} • 
                          Original: {doc.originalFileName}
                        </span>
                        {doc.signatureFields && doc.signatureFields.length > 0 && (
                          <span className="block text-blue-600 text-xs">
                            {doc.signatureFields.length} signature field{doc.signatureFields.length > 1 ? 's' : ''} required
                          </span>
                        )}
                        {doc.dueDate && (
                          <span className="block text-orange-600 text-xs">
                            Due: {new Date(doc.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    }
                  />
                  <Box className="flex gap-1">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => onViewDocument(doc)}
                      sx={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        '&:hover': {
                          borderColor: '#059669',
                          backgroundColor: '#ecfdf5',
                        },
                      }}
                    >
                      Review
                    </Button>
                    {doc.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => onSignDocument(doc)}
                        sx={{
                          backgroundColor: '#10b981',
                          '&:hover': {
                            backgroundColor: '#059669',
                          },
                        }}
                      >
                        Sign
                      </Button>
                    )}
                  </Box>
                </ListItem>
                {index < documents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Paper className="p-8 text-center">
            <Assignment className="text-gray-400 mb-4" sx={{ fontSize: 48 }} />
            <Typography variant="h6" className="text-gray-500 mb-2">
              No documents to sign
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              You're all caught up! Check back later for new documents.
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}