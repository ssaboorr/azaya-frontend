'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Fab, Snackbar, Alert } from '@mui/material';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <UploaderHeader 
        userName={userInfo?.name || ''} 
        userRole={userInfo?.role || ''} 
        onLogout={handleLogout} 
      />

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

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusChangeDialogOpen}
        document={documentToUpdate}
        newStatus={newStatus}
        onClose={handleCloseStatusDialog}
        onConfirm={handleConfirmStatusChange}
        loading={statusUpdateLoading || false}
      />

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
