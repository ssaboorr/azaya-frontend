'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  LinearProgress,
  Fab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  ExitToApp,
  CloudUpload,
  Description,
  Visibility,
  Add,
  FileUpload,
  PendingActions,
  CheckCircle,
  Close,
  Upload,
  Person,
  Title,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';
import { uploadDocument, getUploads, resetUploadDocument } from '@/redux/actions/uploadActions';

export default function UploaderDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.userLogin);
  
  // Upload states
  const { loading: uploadLoading, upload, error: uploadError, progress } = useAppSelector(
    (state) => state.uploadDocument
  );
  const { loading: listLoading, uploads, totalCount } = useAppSelector(
    (state) => state.uploadsList
  );

  // Local state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    signerEmail: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not logged in or not an uploader
  useEffect(() => {
    if (isClient) {
      if (!userInfo) {
        router.push('/login');
      } else if (userInfo.role !== 'uploader') {
        router.push('/dashboard');
      }
    }
  }, [userInfo, router, isClient]);

  // Load uploads on component mount
  useEffect(() => {
    if (isClient && userInfo) {
      dispatch(getUploads(1, 10));
    }
  }, [dispatch, userInfo, isClient]);

  // Handle successful upload
  useEffect(() => {
    if (upload && !uploadLoading) {
      setSnackbar({
        open: true,
        message: 'Document uploaded successfully!',
        severity: 'success',
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadForm({ title: '', signerEmail: '' });
      dispatch(resetUploadDocument());
      // Refresh uploads list
      dispatch(getUploads(1, 10));
    }
  }, [upload, uploadLoading, dispatch]);

  // Handle upload error
  useEffect(() => {
    if (uploadError) {
      setSnackbar({
        open: true,
        message: uploadError,
        severity: 'error',
      });
    }
  }, [uploadError]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if not provided
      if (!uploadForm.title) {
        setUploadForm(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        }));
      }
    }
  };

  const handleFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title || !uploadForm.signerEmail) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'warning',
      });
      return;
    }

    // Basic signature field - can be enhanced later
    const signatureFields = [
      {
        type: 'signature',
        x: 100,
        y: 200,
        width: 200,
        height: 50,
        page: 1,
        required: true
      }
    ];

    await dispatch(uploadDocument(
      selectedFile,
      uploadForm.title,
      uploadForm.signerEmail,
      signatureFields
    ));
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadForm({ title: '', signerEmail: '' });
    dispatch(resetUploadDocument());
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not logged in or wrong role
  if (!userInfo || userInfo.role !== 'uploader') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

 

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending_signature':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'pending_signature':
        return <PendingActions />;
      default:
        return <Description />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Toolbar>
          <CloudUpload sx={{ color: '#3b82f6', mr: 2 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#1f2937',
              fontWeight: 600
            }}
          >
            Uploader Dashboard
          </Typography>
          <Chip 
            label={`${userInfo.name} (${userInfo.role})`}
            variant="outlined"
            sx={{ mr: 2, color: '#3b82f6', borderColor: '#3b82f6' }}
          />
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
              textTransform: 'none',
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        {/* Welcome Section */}
        <Box className="text-center mb-8">
          <Typography variant="h3" className="text-gray-800 font-bold mb-4">
            Welcome back, {userInfo.name}!
          </Typography>
          <Typography variant="h6" className="text-gray-600 mb-4">
            Upload and manage your documents for signature
          </Typography>
        </Box>

        {/* Upload Section */}
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
                onClick={() => setUploadDialogOpen(true)}
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

        {/* Uploads List */}
        <Card className="mb-8">
          <CardContent>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h5" className="font-semibold">
                Your Documents
              </Typography>
              <Chip 
                label={`${totalCount || 0} total`}
                variant="outlined"
                color="primary"
              />
            </Box>
            
            {listLoading ? (
              <Box className="text-center py-4">
                <LinearProgress className="mb-2" />
                <Typography variant="body2" className="text-gray-500">
                  Loading documents...
                </Typography>
              </Box>
            ) : uploads && uploads.length > 0 ? (
              <List>
                {uploads.map((upload, index) => (
                  <React.Fragment key={upload._id}>
                    <ListItem className="hover:bg-gray-50 rounded-lg">
                      <ListItemIcon>
                        {getStatusIcon(upload.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box className="flex items-center gap-2">
                            <Typography variant="subtitle1" className="font-medium">
                              {upload.title || upload.originalName}
                            </Typography>
                            <Chip
                              label={upload.status}
                              color={getStatusColor(upload.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" className="text-gray-600">
                              Assigned to: {upload.signerEmail}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              Uploaded: {new Date(upload.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        sx={{
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          '&:hover': {
                            borderColor: '#2563eb',
                            backgroundColor: '#eff6ff',
                          },
                        }}
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < uploads.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Paper className="p-8 text-center">
                <CloudUpload className="text-gray-400 mb-4" sx={{ fontSize: 48 }} />
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
      </Container>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <Upload className="text-blue-600" />
          Upload Document
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-4">
            {/* File Upload */}
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-medium">
                Select Document *
              </Typography>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="w-full p-2 border border-gray-300 rounded-md"
                id="file-upload"
              />
              {selectedFile && (
                <Typography variant="caption" className="text-green-600 mt-1 block">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Box>

            {/* Document Title */}
            <TextField
              fullWidth
              label="Document Title"
              value={uploadForm.title}
              onChange={handleFormChange('title')}
              required
              InputProps={{
                startAdornment: <Title className="text-gray-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />

            {/* Signer Email */}
            <TextField
              fullWidth
              label="Signer Email"
              type="email"
              value={uploadForm.signerEmail}
              onChange={handleFormChange('signerEmail')}
              required
              InputProps={{
                startAdornment: <Person className="text-gray-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />

            {/* Upload Progress */}
            {uploadLoading && (
              <Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress || 0} 
                  className="mb-2" 
                />
                <Typography variant="caption" className="text-gray-500">
                  Uploading... {progress || 0}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button 
            onClick={handleCloseDialog}
            disabled={uploadLoading}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || !uploadForm.title || !uploadForm.signerEmail || uploadLoading}
            startIcon={<Upload />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            {uploadLoading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#3b82f6',
          '&:hover': {
            backgroundColor: '#2563eb',
          },
        }}
      >
        <Add />
      </Fab>
    </div>
  );
}
