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
  Badge,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import {
  ExitToApp,
  Edit,
  Assignment,
  Visibility,
  Schedule,
  CheckCircle,
  Warning,
  Notifications,
  Close,
  PictureAsPdf,
  Download,
  OpenInNew,
  Person,
  Email,
  CalendarToday,
  Clear,
  Save,
  Send,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';
import { getSignerDocuments, resetSignerDocuments, signDocumentById, resetSignDocumentById } from '@/redux/actions/uploadActions';

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
  const [signatureData, setSignatureData] = useState({
    signature: '',
    name: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [signedDocumentPreview, setSignedDocumentPreview] = useState<string | null>(null);
  const [showSignedPreview, setShowSignedPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

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
    setSignatureData({
      signature: '',
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      date: new Date().toISOString().split('T')[0],
    });
    setSignedDocumentPreview(null);
    setShowSignedPreview(false);
    setIsGeneratingPreview(false);
    setSignatureDialogOpen(true);
  };

  const handleCloseSignatureDialog = () => {
    setSignatureDialogOpen(false);
    setSelectedDocument(null);
    setSignatureData({
      signature: '',
      name: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSignedDocumentPreview(null);
    setShowSignedPreview(false);
    // Clear signature canvas
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
    }
  };

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
    }
  };

  const saveSignature = async () => {
    if (signatureCanvas) {
      const dataURL = signatureCanvas.toDataURL('image/png');
      setSignatureData(prev => ({ ...prev, signature: dataURL }));
      
      // Generate signed PDF document
      setIsGeneratingPreview(true);
      try {
        const documentTitle = selectedDocument?.title || selectedDocument?.originalFileName || 'Document';
        const signedPdfBlob = await createSignedPdf({
          ...signatureData,
          signature: dataURL
        }, documentTitle);
        
        // Convert PDF blob to base64 for preview
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setSignedDocumentPreview(base64);
          setShowSignedPreview(true);
          setIsGeneratingPreview(false);
          setSnackbar({
            open: true,
            message: 'Signature saved and PDF generated successfully',
            severity: 'success',
          });
        };
        reader.readAsDataURL(signedPdfBlob as Blob);
      } catch (error) {
        console.warn('Could not generate signed PDF:', error);
        setIsGeneratingPreview(false);
        setSnackbar({
          open: true,
          message: 'Signature saved, but PDF generation failed',
          severity: 'warning',
        });
      }
    }
  };

  // Function to create a signed PDF document
  const createSignedPdf = (signatureData: any, documentTitle: string) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size in millimeters
        
        // Set up the document
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Add document title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(documentTitle, pageWidth / 2, 30, { align: 'center' });
        
        // Add a line under the title
        pdf.setLineWidth(0.5);
        pdf.line(20, 35, pageWidth - 20, 35);
        
        // Add document content
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const content = [
          'This document has been digitally signed.',
          '',
          'Document Details:',
          `• Title: ${documentTitle}`,
          `• Signer: ${signatureData.name}`,
          `• Email: ${signatureData.email}`,
          `• Date: ${signatureData.date}`,
          `• Status: Signed`,
          '',
          'The signature below represents the signer\'s agreement to the contents of this document.',
          'This is a legally binding digital signature.',
          '',
          'Document content would appear here in the actual implementation.',
          'This is a preview showing how the signed document will look.'
        ];
        
        let yPosition = 50;
        content.forEach((line) => {
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
        
        // Add signature area at the bottom with more padding
        const signatureY = pageHeight - 80; // More space from bottom
        const signatureX = pageWidth - 100; // More space from right edge
        const signatureBoxWidth = 80; // Wider signature box
        const signatureBoxHeight = 50; // Taller signature box
        
        // Draw signature box with padding
        pdf.setLineWidth(0.8);
        pdf.setDrawColor(100, 100, 100); // Gray border
        pdf.rect(signatureX - 10, signatureY - 10, signatureBoxWidth, signatureBoxHeight);
        
        // Add inner padding box
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(200, 200, 200); // Light gray inner border
        pdf.rect(signatureX - 8, signatureY - 8, signatureBoxWidth - 4, signatureBoxHeight - 4);
        
        // Add signature label with more spacing
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Digital Signature', signatureX - 5, signatureY - 3);
        
        // Add a line under the label
        pdf.setLineWidth(0.2);
        pdf.line(signatureX - 5, signatureY - 1, signatureX + signatureBoxWidth - 15, signatureY - 1);
        
        // Convert signature image to base64 and add to PDF
        const signatureImg = new Image();
        signatureImg.onload = () => {
          try {
            // Add signature image to PDF with padding
            const imgWidth = 65; // Slightly larger signature
            const imgHeight = 25; // Slightly taller signature
            const imgX = signatureX - 5; // Centered in the box
            const imgY = signatureY + 2; // Small padding from label
            
            pdf.addImage(signatureData.signature, 'PNG', imgX, imgY, imgWidth, imgHeight);
            
            // Add signer details below signature with more spacing
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            const detailsY = signatureY + 30; // More space below signature
            pdf.text(signatureData.name, imgX, detailsY);
            pdf.text(signatureData.email, imgX, detailsY + 4);
            pdf.text(signatureData.date, imgX, detailsY + 8);
            
            // Generate PDF blob
            const pdfBlob = pdf.output('blob');
            resolve(pdfBlob);
          } catch (error) {
            reject(new Error('Could not add signature to PDF: ' + error));
          }
        };
        
        signatureImg.onerror = () => {
          reject(new Error('Could not load signature image'));
        };
        
        signatureImg.src = signatureData.signature;
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSignatureSubmit = async () => {
    if (!signatureData.signature || !signatureData.name || !signatureData.email) {
      setSnackbar({
        open: true,
        message: 'Please complete all required fields including signature',
        severity: 'warning',
      });
      return;
    }

    if (!selectedDocument) {
      setSnackbar({
        open: true,
        message: 'No document selected for signing',
        severity: 'error',
      });
      return;
    }

    try {
      // Generate the signed PDF if we have a signature
      let signedPdfBlob: Blob | undefined;
      
      if (signatureData.signature) {
        try {
          const documentTitle = selectedDocument?.title || selectedDocument?.originalFileName || 'Document';
          signedPdfBlob = await createSignedPdf({
            ...signatureData,
            signature: signatureData.signature
          }, documentTitle) as Blob;
        } catch (error) {
          console.warn('Could not generate signed PDF, proceeding without it:', error);
        }
      }

      // Submit the signature data with PDF and current document data
      await dispatch(signDocumentById(selectedDocument._id, {
        ...signatureData,
        signedPdf: signedPdfBlob
      }, selectedDocument));
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

  // Calculate stats from actual data
  const pendingCount = signerDocs?.filter(doc => doc.status === 'pending').length || 0;
  const completedCount = signerDocs?.filter(doc => doc.status === 'signed' || doc.status === 'completed').length || 0;
  
  const signingStats = {
    pendingSignatures: pendingCount,
    completedToday: completedCount,
    totalSigned: completedCount,
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Toolbar>
          <Edit sx={{ color: '#10b981', mr: 2 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#1f2937',
              fontWeight: 600
            }}
          >
            Signer Dashboard
          </Typography>
          <Chip 
            label={`${userInfo.name} (${userInfo.role})`}
            variant="outlined"
            sx={{ mr: 2, color: '#10b981', borderColor: '#10b981' }}
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
        {/* <Box className="text-center mb-8">
          <Typography variant="h3" className="text-gray-800 font-bold mb-4">
            Welcome back, {userInfo.name}!
          </Typography>
          <Typography variant="h6" className="text-gray-600 mb-4">
            Review and sign your pending documents
          </Typography>
          {signingStats.urgent > 0 && (
            <Chip
              label={`${signingStats.urgent} urgent documents need attention`}
              color="error"
              icon={<Warning />}
              className="mb-4"
            />
          )}
        </Box> */}

        {/* Documents List */}
        <Card className="mb-8">
          <CardContent>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h5" className="font-semibold">
                Documents for Signature
              </Typography>
              <Chip 
                label={`${signerDocsCount || signerDocs?.length || 0} total`}
                variant="outlined"
                color="primary"
              />
            </Box>
            
            {signerDocsLoading ? (
              <Box className="text-center py-4">
                <LinearProgress className="mb-2" />
                <Typography variant="body2" className="text-gray-500">
                  Loading documents...
                </Typography>
              </Box>
            ) : signerDocs && signerDocs.length > 0 ? (
              <List>
                {signerDocs.map((doc, index) => (
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
                          onClick={() => handleViewDocument(doc)}
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
                            onClick={() => handleOpenSignatureDialog(doc)}
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
                    {index < signerDocs.length - 1 && <Divider />}
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

       
      </Container>

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
          <Box className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={() => {
                if (selectedDocument?.cloudinaryUrl) {
                  window.open(selectedDocument.cloudinaryUrl, '_blank');
                }
              }}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNew />}
              onClick={() => {
                if (selectedDocument?.cloudinaryUrl) {
                  window.open(selectedDocument.cloudinaryUrl, '_blank');
                }
              }}
            >
              Open in New Tab
            </Button>
            <Button 
              onClick={handleCloseViewer}
              sx={{ color: '#6b7280' }}
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
                      Uploaded By
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {selectedDocument.uploader?.name || selectedDocument.uploader?.email}
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
                      Assigned
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
                          key={field._id || index}
                          label={`${field.type} (Page ${field.page})`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: '#10b981',
                            color: '#10b981'
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
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDocument.cloudinaryUrl);
                      }}
                    >
                      {selectedDocument.cloudinaryUrl}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* PDF Viewer */}
              <Box className="h-full p-0">
                {selectedDocument.cloudinaryUrl ? (
                  <iframe
                    src={`${selectedDocument.cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    width="100%"
                    height="600px"
                    style={{ 
                      border: 'none', 
                      borderRadius: '0px',
                      minHeight: '70vh'
                    }}
                    title={selectedDocument.title || selectedDocument.originalFileName}
                  />
                ) : (
                  <Box className="text-center py-8">
                    <PictureAsPdf className="text-gray-400 mb-4" sx={{ fontSize: 64 }} />
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      Document Preview Not Available
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mb-4">
                      This document cannot be previewed in the browser.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => {
                        if (selectedDocument.cloudinaryUrl) {
                          window.open(selectedDocument.cloudinaryUrl, '_blank');
                        }
                      }}
                      sx={{
                        backgroundColor: '#10b981',
                        '&:hover': { backgroundColor: '#059669' },
                      }}
                    >
                      Download Document
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog 
        open={signatureDialogOpen} 
        onClose={handleCloseSignatureDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <Edit className="text-green-600" />
          Sign Document
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box className="space-y-6 pt-4">
              {/* Document Info */}
              <Box className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="h6" className="mb-2">
                  {selectedDocument.title || selectedDocument.originalFileName}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  From: {selectedDocument.uploader?.name || selectedDocument.uploader?.email}
                </Typography>
                {selectedDocument.signatureFields && selectedDocument.signatureFields.length > 0 && (
                  <Typography variant="body2" className="text-blue-600 mt-1">
                    {selectedDocument.signatureFields.length} signature field{selectedDocument.signatureFields.length > 1 ? 's' : ''} required
                  </Typography>
                )}
              </Box>

              {/* Signature Canvas */}
              <Box>
                <Typography variant="subtitle1" className="mb-2 font-medium">
                  Digital Signature *
                </Typography>
                <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={(canvas) => {
                      if (canvas) {
                        setSignatureCanvas(canvas);
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.strokeStyle = '#10b981';
                          ctx.lineWidth = 2;
                          ctx.lineCap = 'round';
                          ctx.lineJoin = 'round';
                        }
                      }
                    }}
                    width={600}
                    height={200}
                    className="border border-gray-300 rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <Box className="flex gap-2 mt-2">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Clear />}
                      onClick={clearSignature}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Save />}
                      onClick={saveSignature}
                      disabled={isGeneratingPreview}
                    >
                      {isGeneratingPreview ? 'Generating Preview...' : 'Save Signature'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Signature Form */}
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Full Name"
                  value={signatureData.name}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: <Person className="text-gray-400 mr-2" />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#10b981' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={signatureData.email}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: <Email className="text-gray-400 mr-2" />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#10b981' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={signatureData.date}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: <CalendarToday className="text-gray-400 mr-2" />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#10b981' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                    },
                  }}
                />
              </Box>

              {/* Signature Preview */}
              {signatureData.signature && (
                <Box>
                  <Typography variant="subtitle2" className="mb-2">
                    Signature Preview:
                  </Typography>
                  <Box className="border border-gray-300 rounded p-2 bg-white">
                    <img 
                      src={signatureData.signature} 
                      alt="Signature preview" 
                      className="max-h-20"
                    />
                  </Box>
                </Box>
              )}

              {/* Signed Document Preview */}
              {showSignedPreview && signedDocumentPreview && (
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-medium">
                    Signed Document Preview (PDF):
                  </Typography>
                  <Box className="border border-gray-300 rounded p-2 bg-white">
                    <iframe
                      src={signedDocumentPreview}
                      className="w-full rounded"
                      style={{ height: '400px' }}
                      title="Signed Document Preview"
                    />
                    <Typography variant="caption" className="text-gray-500 mt-2 block">
                      This is how your signed PDF document will look
                    </Typography>
                  </Box>
                  <Box className="flex gap-2 mt-2">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = signedDocumentPreview;
                        link.download = `${selectedDocument?.title || 'signed-document'}.pdf`;
                        link.click();
                      }}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<OpenInNew />}
                      onClick={() => {
                        window.open(signedDocumentPreview, '_blank');
                      }}
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowSignedPreview(false)}
                    >
                      Hide Preview
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Instructions */}
              <Alert severity="info">
                <Typography variant="body2">
                  Please draw your signature in the canvas above, fill in your details, and click "Submit Signature" to complete the signing process.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button 
            onClick={handleCloseSignatureDialog}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignatureSubmit}
            variant="contained"
            startIcon={<Send />}
            disabled={!signatureData.signature || !signatureData.name || !signatureData.email || signLoading}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            {signLoading ? 'Signing...' : 'Submit Signature'}
          </Button>
        </DialogActions>
      </Dialog>

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
