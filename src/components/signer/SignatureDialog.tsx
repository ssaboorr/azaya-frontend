'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Edit, Person, Email, CalendarToday, Send, Refresh } from '@mui/icons-material';
import SignatureCanvas from './SignatureCanvas';
import { PDFDocument, rgb } from 'pdf-lib';

interface SignatureLocation {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Document {
  _id: string;
  title?: string;
  originalFileName: string;
  cloudinaryUrl?: string;
  uploader?: {
    name?: string;
    email?: string;
  };
  signatureFields?: Array<{
    _id?: string;
    type: string;
    page: number;
  }>;
}

interface SignatureDialogProps {
  open: boolean;
  document: Document | null;
  userInfo: {
    name: string;
    email: string;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (signatureData: {
    signature: string;
    name: string;
    email: string;
    date: string;
    signedPdf?: Blob;
  }) => void;
}

export default function SignatureDialog({ 
  open, 
  document, 
  userInfo, 
  loading, 
  onClose, 
  onSubmit 
}: SignatureDialogProps) {
  const [signatureData, setSignatureData] = useState({
    signature: '',
    name: userInfo.name || '',
    email: userInfo.email || '',
    date: new Date().toISOString().split('T')[0],
  });
  const [signedDocumentPreview, setSignedDocumentPreview] = useState<string | null>(null);
  const [showSignedPreview, setShowSignedPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [detectedSignatureFields, setDetectedSignatureFields] = useState<SignatureLocation[]>([]);
  const [isDetectingFields, setIsDetectingFields] = useState(false);

  // Function to detect signature locations in PDF
  const detectSignatureLocations = async (pdfUrl: string): Promise<SignatureLocation[]> => {
    // For now, return empty array to avoid PDF.js worker issues
    // This will fall back to the default bottom-right placement
    console.log('Signature detection temporarily disabled due to PDF.js worker issues');
    return [];
  };

  // Detect signature fields when dialog opens
  useEffect(() => {
    if (open && document?.cloudinaryUrl) {
      setIsDetectingFields(true);
      detectSignatureLocations(document.cloudinaryUrl)
        .then(locations => {
          setDetectedSignatureFields(locations);
          setIsDetectingFields(false);
        })
        .catch(() => {
          setDetectedSignatureFields([]);
          setIsDetectingFields(false);
        });
    }
  }, [open, document?.cloudinaryUrl]);

  // Function to manually re-scan for signature fields
  const handleRescanSignatureFields = async () => {
    if (!document?.cloudinaryUrl) return;
    
    setIsDetectingFields(true);
    try {
      const locations = await detectSignatureLocations(document.cloudinaryUrl);
      setDetectedSignatureFields(locations);
    } catch (error) {
      console.error('Error re-scanning signature fields:', error);
      setDetectedSignatureFields([]);
    } finally {
      setIsDetectingFields(false);
    }
  };

  // Function to overlay signature on the original PDF with smart positioning
  const createSignedPdfWithOverlay = async (signatureData: any, originalPdfUrl: string) => {
    try {
      // Load the original PDF
      const response = await fetch(originalPdfUrl);
      const existingPdfBytes = await response.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Convert signature image to PNG bytes
      const signatureResponse = await fetch(signatureData.signature);
      const signatureBytes = await signatureResponse.arrayBuffer();
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      
      if (detectedSignatureFields.length > 0) {
        // Use detected signature locations
        console.log(`Placing signature at ${detectedSignatureFields.length} detected location(s)`);
        
        detectedSignatureFields.forEach((location) => {
          const page = pdfDoc.getPages()[location.page];
          const { height: pageHeight } = page.getSize();
          
          // Convert coordinates (PDF.js uses different coordinate system than pdf-lib)
          const adjustedY = pageHeight - location.y - location.height;
          
          // Calculate optimal signature size
          const maxSignatureWidth = Math.min(location.width * 1.5, 120);
          const signatureHeight = 40;
          
          // Add signature at detected location
          page.drawImage(signatureImage, {
            x: location.x,
            y: adjustedY,
            width: maxSignatureWidth,
            height: signatureHeight,
          });
          
          // Add signer details below signature (if space allows)
          const detailsY = adjustedY - 15;
          if (detailsY > 20) {
            page.drawText(`Signed by: ${signatureData.name}`, {
              x: location.x,
              y: detailsY,
              size: 7,
              color: rgb(0.2, 0.2, 0.2),
            });
            
            if (detailsY > 35) {
              page.drawText(`Email: ${signatureData.email}`, {
                x: location.x,
                y: detailsY - 10,
                size: 6,
                color: rgb(0.2, 0.2, 0.2),
              });
              
              page.drawText(`Date: ${signatureData.date}`, {
                x: location.x,
                y: detailsY - 20,
                size: 6,
                color: rgb(0.2, 0.2, 0.2),
              });
            }
          }
        });
      } else {
        // Fallback to bottom-right placement (your original logic)
        console.log('No signature locations detected, using default bottom-right placement');
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        // Calculate signature position (bottom right corner) with proper margins
        const signatureWidth = 100;
        const signatureHeight = 50;
        const margin = 30;
        const detailsHeight = 25;
        
        const totalHeight = signatureHeight + detailsHeight + margin;
        const totalWidth = signatureWidth + margin;
        
        const signatureX = Math.max(margin, width - totalWidth);
        const signatureY = Math.max(margin, totalHeight);
        
        // Add signature label
        firstPage.drawText('Digital Signature', {
          x: signatureX + 2,
          y: signatureY + signatureHeight - 2,
          size: 7,
          color: rgb(0.2, 0.2, 0.2),
        });
        
        // Add the signature image with proper padding
        firstPage.drawImage(signatureImage, {
          x: signatureX + 3,
          y: signatureY + 3,
          width: signatureWidth - 6,
          height: 30,
        });
        
        // Add signer details below signature with proper positioning
        const detailsY = signatureY - 5;
        
        if (detailsY > 10) {
          firstPage.drawText(signatureData.name, {
            x: signatureX + 3,
            y: detailsY,
            size: 5,
            color: rgb(0.2, 0.2, 0.2),
          });
          
          firstPage.drawText(signatureData.email, {
            x: signatureX + 3,
            y: detailsY - 6,
            size: 5,
            color: rgb(0.2, 0.2, 0.2),
          });
          
          firstPage.drawText(signatureData.date, {
            x: signatureX + 3,
            y: detailsY - 12,
            size: 5,
            color: rgb(0.2, 0.2, 0.2),
          });
        }
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      throw new Error('Could not create signed PDF: ' + error);
    }
  };

  const handleSignatureSave = async (signature: string) => {
    setSignatureData(prev => ({ ...prev, signature }));
    
    if (document?.cloudinaryUrl) {
      setIsGeneratingPreview(true);
      try {
        const signedPdfBlob = await createSignedPdfWithOverlay({
          ...signatureData,
          signature
        }, document.cloudinaryUrl);
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setSignedDocumentPreview(base64);
          setShowSignedPreview(true);
          setIsGeneratingPreview(false);
        };
        reader.readAsDataURL(signedPdfBlob as Blob);
      } catch (error) {
        console.warn('Could not generate signed PDF:', error);
        setIsGeneratingPreview(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!signatureData.signature || !signatureData.name || !signatureData.email) {
      return;
    }

    let signedPdfBlob: Blob | undefined;
    
    if (signatureData.signature && document?.cloudinaryUrl) {
      try {
        signedPdfBlob = await createSignedPdfWithOverlay({
          ...signatureData,
          signature: signatureData.signature
        }, document.cloudinaryUrl) as Blob;
      } catch (error) {
        console.warn('Could not generate signed PDF, proceeding without it:', error);
      }
    }

    onSubmit({
      ...signatureData,
      signedPdf: signedPdfBlob
    });
  };

  const handleClose = () => {
    setSignatureData({
      signature: '',
      name: userInfo.name || '',
      email: userInfo.email || '',
      date: new Date().toISOString().split('T')[0],
    });
    setSignedDocumentPreview(null);
    setShowSignedPreview(false);
    setDetectedSignatureFields([]);
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle className="flex items-center gap-2">
        <Edit className="text-green-600" />
        Sign Document
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-6 pt-4">
          {/* Document Info */}
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="h6" className="mb-2">
              {document.title || document.originalFileName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              From: {document.uploader?.name || document.uploader?.email}
            </Typography>
            {document.signatureFields && document.signatureFields.length > 0 && (
              <Typography variant="body2" className="text-blue-600 mt-1">
                {document.signatureFields.length} signature field{document.signatureFields.length > 1 ? 's' : ''} required
              </Typography>
            )}
          </Box>

           {/* Signature Field Detection Status */}
           {isDetectingFields && (
             <Box>
               <Alert severity="info" className="mb-2">
                 <Typography variant="body2">
                   🔍 Scanning document for signature fields...
                 </Typography>
               </Alert>
               <LinearProgress />
             </Box>
           )}

           {detectedSignatureFields.length > 0 && !isDetectingFields && (
             <Alert 
               severity="success" 
               action={
                 <Button
                   color="inherit"
                   size="small"
                   startIcon={<Refresh />}
                   onClick={handleRescanSignatureFields}
                   disabled={isDetectingFields}
                 >
                   Rescan
                 </Button>
               }
             >
               <Typography variant="body2">
                 ✅ Found <strong>{detectedSignatureFields.length}</strong> signature field{detectedSignatureFields.length > 1 ? 's' : ''} in the document. 
                 Your signature will be placed automatically at the detected locations.
               </Typography>
             </Alert>
           )}

           {detectedSignatureFields.length === 0 && !isDetectingFields && document?.cloudinaryUrl && (
             <Alert 
               severity="warning"
               action={
                 <Button
                   color="inherit"
                   size="small"
                   startIcon={<Refresh />}
                   onClick={handleRescanSignatureFields}
                   disabled={isDetectingFields}
                 >
                   Rescan
                 </Button>
               }
             >
               <Typography variant="body2">
                 ⚠️ No signature fields detected in the document. Your signature will be placed at the bottom right corner.
               </Typography>
             </Alert>
           )}

          {/* Signature Canvas */}
          <SignatureCanvas 
            onSignatureSave={handleSignatureSave}
            isGeneratingPreview={isGeneratingPreview}
          />

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
                Signed Document Preview (PDF with Signature Overlay):
              </Typography>
              <Box className="border border-gray-300 rounded p-2 bg-white">
                <iframe
                  src={signedDocumentPreview}
                  className="w-full rounded"
                  style={{ height: '400px' }}
                  title="Signed Document Preview"
                />
                <Typography variant="caption" className="text-gray-500 mt-2 block">
                  {detectedSignatureFields.length > 0 
                    ? `Your signature has been placed at ${detectedSignatureFields.length} detected location(s)`
                    : 'Your signature has been placed at the bottom right corner'
                  }
                </Typography>
              </Box>
            </Box>
          )}

          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2">
              Please draw your signature in the canvas above, fill in your details, and click "Submit Signature" to complete the signing process. 
              {detectedSignatureFields.length > 0 
                ? ` Your signature will be automatically placed at ${detectedSignatureFields.length} detected signature field${detectedSignatureFields.length > 1 ? 's' : ''}.`
                : ' Your signature will be placed at the bottom right corner of the document.'
              }
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions className="p-4">
        <Button 
          onClick={handleClose}
          sx={{ color: '#6b7280' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Send />}
          disabled={!signatureData.signature || !signatureData.name || !signatureData.email || loading || isDetectingFields}
          sx={{
            backgroundColor: '#10b981',
            '&:hover': {
              backgroundColor: '#059669',
            },
          }}
        >
          {loading ? 'Signing...' : 'Submit Signature'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
