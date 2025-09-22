'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Fab, Snackbar, Alert, Slide } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';
import { uploadDocument, getUploads, resetUploadDocument, getUploaderDocuments, resetUploaderDocuments, updateDocumentStatus, resetUpdateDocumentStatus } from '@/redux/actions/uploadActions';

// Import new components
import UploaderHeader from '@/components/uploader/UploaderHeader';
import UploadSection from '@/components/uploader/UploadSection';
import UploaderDocumentsList from '@/components/uploader/UploaderDocumentsList';
import UploaderDocumentViewer from '@/components/uploader/UploaderDocumentViewer';
import UploadDialog from '@/components/uploader/UploadDialog';
import StatusChangeDialog from '@/components/uploader/StatusChangeDialog';

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
  const { loading: statusUpdateLoading, success: statusUpdateSuccess, error: statusUpdateError } = useAppSelector(
    (state) => state.updateDocumentStatus
  );

  // Local state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [isClient, setIsClient] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [documentToUpdate, setDocumentToUpdate] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<'verified' | 'rejected'>('verified');

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

  // Handle status update success
  useEffect(() => {
    if (statusUpdateSuccess) {
      setSnackbar({
        open: true,
        message: 'Document status updated successfully!',
        severity: 'success',
      });
      setStatusChangeDialogOpen(false);
      setDocumentToUpdate(null);
      setNewStatus('verified');
      dispatch(resetUpdateDocumentStatus());
      // Refresh the documents list
      if (userInfo) {
        dispatch(getUploaderDocuments(userInfo._id, 1, 10));
      }
    }
  }, [statusUpdateSuccess, dispatch, userInfo]);

  // Handle status update error
  useEffect(() => {
    if (statusUpdateError) {
      setSnackbar({
        open: true,
        message: statusUpdateError,
        severity: 'error',
      });
    }
  }, [statusUpdateError]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const handleUpload = async (file: File, title: string, signerEmail: string) => {
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

    await dispatch(uploadDocument(file, title, signerEmail, signatureFields));
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    dispatch(resetUploadDocument());
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleStatusChange = (document: any, status: 'verified' | 'rejected') => {
    setDocumentToUpdate(document);
    setNewStatus(status);
    setStatusChangeDialogOpen(true);
  };

  const handleConfirmStatusChange = async (status: 'verified' | 'rejected', reason?: string) => {
    if (!documentToUpdate) return;
    await dispatch(updateDocumentStatus(documentToUpdate._id, status, reason));
  };

  const handleCloseStatusDialog = () => {
    setStatusChangeDialogOpen(false);
    setDocumentToUpdate(null);
    setNewStatus('verified');
    dispatch(resetUpdateDocumentStatus());
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setViewerDialogOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerDialogOpen(false);
    setSelectedDocument(null);
  };

  // Document action handlers
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

      // For Cloudinary, add download parameters
      let downloadUrl = document.cloudinaryUrl;
      const separator = downloadUrl.includes('?') ? '&' : '?';
      downloadUrl = `${downloadUrl}${separator}fl_attachment=${encodeURIComponent(document.originalFileName || document.title + '.pdf')}`;

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

    } catch (error: any) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download document',
        severity: 'error',
      });
    }
  };

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

  const handleCopyLink = async (document: any) => {
    try {
      if (typeof window === 'undefined' || !navigator.clipboard) {
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
        }
      } else {
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


  return (
    <Box 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      sx={{
        animation: 'fadeIn 0.8s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}
    >
      <UploaderHeader 
        userName={userInfo?.name || ''} 
        userRole={userInfo?.role || ''} 
        onLogout={handleLogout} 
      />

      <Container 
        maxWidth="lg" 
        className="py-8"
        sx={{
          animation: 'slideInUp 0.6s ease-out 0.2s both',
          '@keyframes slideInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(30px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {/* Welcome Section */}
        <Box 
          className="text-center mb-12"
          sx={{
            animation: 'fadeInUp 0.8s ease-out',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Typography 
            variant="h3" 
            className="font-bold mb-4"
            sx={{
              background: 'linear-gradient(135deg, #1f2937 0%, #3b82f6 50%, #1d4ed8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              letterSpacing: '-0.025em'
            }}
          >
            Welcome back, {userInfo.name}!
          </Typography>
          <Typography 
            variant="h6" 
            className="text-gray-600 mb-6"
            sx={{ 
              fontSize: '1.125rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Upload and manage your documents for signature
          </Typography>
          
          {/* Stats Cards */}
          <Box 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 py-6 "
            sx={{
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Box 
              className="p-6 rounded-2xl text-center"
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography variant="h4" className="font-bold text-blue-600 mb-2">
                {uploaderDocs?.length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Documents
              </Typography>
            </Box>
            
            <Box 
              className="p-6 rounded-2xl text-center"
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography variant="h4" className="font-bold text-green-600 mb-2">
                {uploaderDocs?.filter(doc => doc.status === 'signed' || doc.status === 'verified').length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Verified
              </Typography>
            </Box>
            
            <Box 
              className="p-6 rounded-2xl text-center"
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography variant="h4" className="font-bold text-orange-600 mb-2">
                {uploaderDocs?.filter(doc => doc.status === 'pending').length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Pending
              </Typography>
            </Box>
            <Box 
              className="p-6 rounded-2xl text-center"
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography variant="h4" className="font-bold text-orange-600 mb-2">
                {uploaderDocs?.filter(doc => doc.status === 'rejected').length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Rejected
              </Typography>
            </Box>
          </Box>
          
        </Box>

        {/* Upload Section */}
        <UploadSection 
          onUploadClick={() => setUploadDialogOpen(true)}
          uploadLoading={uploadLoading || false}
          progress={progress || 0}
        />

        {/* Documents List */}
        <UploaderDocumentsList
          documents={uploaderDocs || []}
          loading={uploaderDocsLoading || false}
          totalCount={uploaderDocsCount || 0}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownloadDocument}
          onOpenInNewTab={handleOpenInNewTab}
          onCopyLink={handleCopyLink}
          onStatusChange={handleStatusChange}
          statusUpdateLoading={statusUpdateLoading || false}
        />
      </Container>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        onUpload={handleUpload}
        uploadLoading={uploadLoading || false}
        progress={progress || 0}
      />

      {/* Document Viewer Dialog */}
      <UploaderDocumentViewer
        open={viewerDialogOpen}
        document={selectedDocument}
        onClose={handleCloseViewer}
        onDownloadDocument={handleDownloadDocument}
        onOpenInNewTab={handleOpenInNewTab}
        onCopyLink={handleCopyLink}
      />

      {/* Enhanced Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left' } as any}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusChangeDialogOpen}
        document={documentToUpdate}
        newStatus={newStatus}
        onClose={handleCloseStatusDialog}
        onConfirm={handleConfirmStatusChange}
        loading={statusUpdateLoading || false}
      />

      {/* Enhanced Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.3s ease-in-out',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { 
              transform: 'scale(1)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
            },
            '50%': { 
              transform: 'scale(1.05)',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.6)'
            },
            '100%': { 
              transform: 'scale(1)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
            }
          },
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            transform: 'scale(1.1) translateY(-4px)',
            boxShadow: '0 16px 48px rgba(59, 130, 246, 0.6)',
            animation: 'none',
          },
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
      >
        <Add sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  );
}
