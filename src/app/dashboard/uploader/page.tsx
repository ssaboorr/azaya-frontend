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
  IconButton,
  Tooltip,
  ButtonGroup,
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
  Download,
  OpenInNew,
  PictureAsPdf,
  Error,
  Refresh,
  Share,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';
import { uploadDocument, getUploads, resetUploadDocument, getUploaderDocuments, resetUploaderDocuments } from '@/redux/actions/uploadActions';

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
  const { loading: uploaderDocsLoading, documents: uploaderDocs, totalCount: uploaderDocsCount } = useAppSelector(
    (state) => state.uploaderDocuments
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
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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
      dispatch(getUploaderDocuments(userInfo._id, 1, 10));
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
      dispatch(getUploads(1, 10));
      if (userInfo) {
        dispatch(getUploaderDocuments(userInfo._id, 1, 10));
      }
    }
  }, [upload, uploadLoading, dispatch, userInfo]);

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
      if (!uploadForm.title) {
        setUploadForm(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '')
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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setViewerDialogOpen(true);
    setPdfLoadError(false);
    setPdfLoading(true);
  };

  const handleCloseViewer = () => {
    setViewerDialogOpen(false);
    setSelectedDocument(null);
    setPdfLoadError(false);
    setPdfLoading(false);
  };

  // Fixed download function
  const handleDownloadDocument = async (document: any) => {
    try {
      if (!document.cloudinaryUrl) {
        setSnackbar({
          open: true,
          message: 'Document URL not available',
          severity: 'error',
        });
        return;
      }

      // Check if we're on client-side
      if (typeof window === 'undefined') {
        setSnackbar({
          open: true,
          message: 'Download not available on server-side',
          severity: 'error',
        });
        return;
      }

      setSnackbar({
        open: true,
        message: 'Starting download...',
        severity: 'info',
      });

      // Method 1: Direct window.open approach (more reliable)
      try {
        // For Cloudinary, add download parameters
        let downloadUrl = document.cloudinaryUrl;

        // Add Cloudinary download parameters
        const separator = downloadUrl.includes('?') ? '&' : '?';
        downloadUrl = `${downloadUrl}${separator}fl_attachment=${encodeURIComponent(document.originalFileName || document.title + '.pdf')}`;

        // Open in new window/tab for download
        const newWindow = window.open(downloadUrl, '_blank');

        if (!newWindow) {
          console.log('Popup blocked or failed to open');
        }

        setTimeout(() => {
          setSnackbar({
            open: true,
            message: 'Download started successfully',
            severity: 'success',
          });
        }, 500);

      } catch (directError: any) {
        console.warn('Direct download failed, trying alternative method:', directError);

        // Method 2: Fetch and blob approach
        try {
          const response = await fetch(document.cloudinaryUrl);

          if (!response.ok) {
            if (response.status === 401) {
              console.log('Unauthorized access to document. Please check permissions.');
            }
            console.log(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          // Create download link using window.document (client-side only)
          const link = window.document.createElement('a');
          link.href = url;
          link.download = document.originalFileName || `${document.title}.pdf`;
          link.style.display = 'none';

          // Append to body, click, and remove
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);

          // Clean up the blob URL
          window.URL.revokeObjectURL(url);

          setSnackbar({
            open: true,
            message: 'Download completed successfully',
            severity: 'success',
          });

        } catch (fetchError: any) {
          console.error('Fetch download failed:', fetchError);
          throw fetchError;
        }
      }

    } catch (error: any) {
      console.error('Download error:', error);

      let errorMessage = 'Failed to download document';

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Unauthorized access. Please check document permissions.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Access forbidden. You may not have permission to download this document.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Document not found. It may have been moved or deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  // Fixed open in new tab function
  const handleOpenInNewTab = (document: any) => {
    if (typeof window === 'undefined') {
      setSnackbar({
        open: true,
        message: 'Cannot open document on server-side',
        severity: 'error',
      });
      return;
    }

    if (document.cloudinaryUrl) {
      try {
        // Add parameters to improve PDF viewing in browser
        const viewerUrl = `${document.cloudinaryUrl}#toolbar=1&navpanes=1&scrollbar=1`;
        const newWindow = window.open(viewerUrl, '_blank', 'noopener,noreferrer');

        if (!newWindow) {
          setSnackbar({
            open: true,
            message: 'Popup was blocked. Please allow popups for this site.',
            severity: 'warning',
          });
        }
      } catch (error: any) {
        console.error('Failed to open document:', error);
        setSnackbar({
          open: true,
          message: 'Failed to open document in new tab',
          severity: 'error',
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: 'Document URL not available',
        severity: 'error',
      });
    }
  };

  // Fixed copy link function
  const handleCopyLink = async (document: any) => {
    try {
      // Check if we're on client-side and clipboard API is available
      if (typeof window === 'undefined' || !navigator.clipboard) {
        // Fallback for older browsers or server-side
        if (typeof window !== 'undefined' && window.document) {
          const textArea = window.document.createElement('textarea');
          textArea.value = document.cloudinaryUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          window.document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            window.document.execCommand('copy');
            setSnackbar({
              open: true,
              message: 'Document link copied to clipboard',
              severity: 'success',
            });
          } catch (err: any) {
            console.log('Copy failed:', err);
          } finally {
            window.document.body.removeChild(textArea);
          }
        } else {
          console.log('Copy not supported');
        }
      } else {
        // Modern clipboard API
        await navigator.clipboard.writeText(document.cloudinaryUrl);
        setSnackbar({
          open: true,
          message: 'Document link copied to clipboard',
          severity: 'success',
        });
      }
    } catch (error: any) {
      console.error('Copy failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to copy link. You can manually copy the URL from the document viewer.',
        severity: 'warning',
      });
    }
  };

  // Add client-side check for PDF viewer URL
  const getPdfViewerUrl = (document: any) => {
    if (!document.cloudinaryUrl || typeof window === 'undefined') return '';

    // For Cloudinary URLs, add parameters for better PDF viewing
    return `${document.cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setPdfLoading(false);
    setPdfLoadError(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setPdfLoading(false);
    setPdfLoadError(true);
  };

  // Retry PDF loading
  const handleRetryPdf = () => {
    setPdfLoadError(false);
    setPdfLoading(true);
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
        return <PendingActions />;
      default:
        return <Description />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fixed PDF viewer render function
  const renderPdfViewer = () => {
    if (!selectedDocument || typeof window === 'undefined') return null;

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
                onClick={() => handleOpenInNewTab(selectedDocument)}
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
                onClick={() => handleDownloadDocument(selectedDocument)}
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
          src={getPdfViewerUrl(selectedDocument)}
          width="100%"
          height="600px"
          style={{
            border: 'none',
            borderRadius: '0px',
            minHeight: '70vh'
          }}
          title={selectedDocument.title || selectedDocument.originalFileName}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </Box>
    );
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
                label={`${uploaderDocsCount || uploaderDocs?.length || 0} total`}
                variant="outlined"
                color="primary"
              />
            </Box>

            {uploaderDocsLoading ? (
              <Box className="text-center py-4">
                <LinearProgress className="mb-2" />
                <Typography variant="body2" className="text-gray-500">
                  Loading documents...
                </Typography>
              </Box>
            ) : uploaderDocs && uploaderDocs.length > 0 ? (
              <List>
                {uploaderDocs.map((upload, index) => (
                  <React.Fragment key={upload._id}>
                    <ListItem className="hover:bg-gray-50 rounded-lg px-4 py-3">
                      <ListItemIcon>
                        <PictureAsPdf className="text-red-500" sx={{ fontSize: 32 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-base">
                              {upload.title || upload.originalFileName}
                            </span>
                            <Chip
                              label={upload.status}
                              color={getStatusColor(upload.status) as any}
                              size="small"
                            />
                          </div>
                        }
                        secondary={
                          <div className="space-y-1">
                            <div className="text-gray-600 text-sm">
                              Assigned to: {upload.signerEmail || upload.assignedSigner?.email}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Uploaded: {new Date(upload.createdAt).toLocaleDateString()} •
                              Original: {upload.originalFileName}
                            </div>
                            {upload.cloudinaryPublicId && (
                              <div className="text-gray-400 text-xs">
                                ID: {upload.cloudinaryPublicId}
                              </div>
                            )}
                          </div>
                        }
                      />
                      <Box className="flex gap-1">
                        <Tooltip title="View Document">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDocument(upload)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(upload)}
                            sx={{ color: '#059669' }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in New Tab">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenInNewTab(upload)}
                            sx={{ color: '#7c3aed' }}
                          >
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy Link">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyLink(upload)}
                            sx={{ color: '#dc2626' }}
                          >
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < uploaderDocs.length - 1 && <Divider />}
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
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
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

      {/* Document Viewer Dialog */}
      <Dialog
        open={viewerDialogOpen}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
        fullScreen
      >
        <DialogTitle className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <PictureAsPdf className="text-red-500" />
            <Typography variant="h6">
              {selectedDocument?.title || selectedDocument?.originalFileName || 'Document Viewer'}
            </Typography>
          </Box>
          <Box className="flex items-center gap-1">
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Download">
                <Button
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  startIcon={<Download />}
                >
                  Download
                </Button>
              </Tooltip>
              <Tooltip title="Open in New Tab">
                <Button
                  onClick={() => handleOpenInNewTab(selectedDocument)}
                  startIcon={<OpenInNew />}
                >
                  Open
                </Button>
              </Tooltip>
              <Tooltip title="Copy Link">
                <Button
                  onClick={() => handleCopyLink(selectedDocument)}
                  startIcon={<Share />}
                >
                  Share
                </Button>
              </Tooltip>
            </ButtonGroup>
            <Button
              onClick={handleCloseViewer}
              sx={{ color: '#6b7280', ml: 2 }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent className="p-0">
          {selectedDocument && (
            <Box className="h-full">
              {/* Document Info Header */}
              <Box className="p-4 bg-gray-50 border-b">
                <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Document Title
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {selectedDocument.title || selectedDocument.originalFileName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Assigned To
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {selectedDocument.signerEmail || selectedDocument.assignedSigner?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Status
                    </Typography>
                    <Chip
                      label={selectedDocument.status}
                      color={getStatusColor(selectedDocument.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Uploaded
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {new Date(selectedDocument.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Signature Fields Info */}
                {selectedDocument.signatureFields && selectedDocument.signatureFields.length > 0 && (
                  <Box className="mt-4 p-3 bg-blue-50 rounded-md">
                    <Typography variant="subtitle2" className="text-blue-800 mb-2">
                      Signature Fields ({selectedDocument.signatureFields.length})
                    </Typography>
                    <Box className="flex flex-wrap gap-2">
                      {selectedDocument.signatureFields.map((field: any, index: number) => (
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
                {selectedDocument.cloudinaryUrl && (
                  <Box className="mt-3 p-2 bg-white rounded-md border">
                    <Typography variant="caption" className="text-gray-600">
                      Document URL:
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-blue-600 break-all cursor-pointer hover:underline ml-2"
                      onClick={() => handleCopyLink(selectedDocument)}
                    >
                      {selectedDocument.cloudinaryUrl}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* PDF Viewer */}
              <Box className="h-full p-0">
                {renderPdfViewer()}
              </Box>
            </Box>
          )}
        </DialogContent>
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
