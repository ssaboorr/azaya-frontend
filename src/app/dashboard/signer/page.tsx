'use client';

import React, { useEffect, useState } from 'react';
import { Container, Fab, Snackbar, Alert } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';
import { getSignerDocuments, resetSignerDocuments, signDocumentById, resetSignDocumentById } from '@/redux/actions/uploadActions';

// Import components
import SignerHeader from '../../../components/signer/SignerHeader';
import DocumentsList from '../../../components/signer/DocumentsList';
import DocumentViewer from '../../../components/signer/DocumentViewer';
import SignatureDialog from '../../../components/signer/SignatureDialog';

export default function SignerDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.userLogin);
  const { loading: signerDocsLoading, documents: signerDocs, totalCount: signerDocsCount } = useAppSelector(
    (state) => state.signerDocuments
  );
  const { loading: signLoading, success: signSuccess, error: signError } = useAppSelector(
    (state) => state.signDocumentById
  );
  const [isClient, setIsClient] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not logged in or not a signer
  useEffect(() => {
    if (isClient) {
      if (!userInfo) {
        router.push('/login');
      } else if (userInfo.role !== 'signer') {
        router.push('/dashboard');
      }
    }
  }, [userInfo, router, isClient]);

  // Load signer documents on component mount
  useEffect(() => {
    if (isClient && userInfo) {
      dispatch(getSignerDocuments(userInfo._id, 1, 10));
    }
  }, [dispatch, userInfo, isClient]);

  // Handle signing success
  useEffect(() => {
    if (signSuccess) {
      setSnackbar({
        open: true,
        message: 'Document signed successfully!',
        severity: 'success',
      });
      handleCloseSignatureDialog();
      
      // Refresh the documents list
      if (userInfo) {
        dispatch(getSignerDocuments(userInfo._id, 1, 10));
      }
      
      // Reset the sign state
      dispatch(resetSignDocumentById());
    }
  }, [signSuccess, dispatch, userInfo]);

  // Handle signing error
  useEffect(() => {
    if (signError) {
      setSnackbar({
        open: true,
        message: signError,
        severity: 'error',
      });
    }
  }, [signError]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setViewerDialogOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleOpenSignatureDialog = (document: any) => {
    setSelectedDocument(document);
    setSignatureDialogOpen(true);
  };

  const handleCloseSignatureDialog = () => {
    setSignatureDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleSignatureSubmit = async (signatureData: {
    signature: string;
    name: string;
    email: string;
    date: string;
    signedPdf?: Blob;
  }) => {
    if (!selectedDocument) {
      setSnackbar({
        open: true,
        message: 'No document selected for signing',
        severity: 'error',
      });
      return;
    }

    try {
      await dispatch(signDocumentById(selectedDocument._id, signatureData, selectedDocument));
    } catch (error) {
      console.error('Error submitting signature:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting signature. Please try again.',
        severity: 'error',
      });
    }
  };


  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not logged in or wrong role
  if (!userInfo || userInfo.role !== 'signer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <SignerHeader 
        userName={userInfo?.name || ''}
        userRole={userInfo?.role || ''}
        onLogout={handleLogout}
      />

      <Container maxWidth="lg" className="py-8">
        <DocumentsList
          documents={signerDocs || []}
          loading={signerDocsLoading || false}
          totalCount={signerDocsCount || 0}
          onViewDocument={handleViewDocument}
          onSignDocument={handleOpenSignatureDialog}
        />
      </Container>

      <DocumentViewer
        open={viewerDialogOpen}
        document={selectedDocument}
        onClose={handleCloseViewer}
      />

      <SignatureDialog
        open={signatureDialogOpen}
        document={selectedDocument}
        userInfo={{
          name: userInfo?.name || '',
          email: userInfo?.email || ''
        }}
        loading={signLoading || false}
        onClose={handleCloseSignatureDialog}
        onSubmit={handleSignatureSubmit}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="sign"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#10b981',
          '&:hover': {
            backgroundColor: '#059669',
          },
        }}
      >
        <Edit />
      </Fab>

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
    </div>
  );
}
