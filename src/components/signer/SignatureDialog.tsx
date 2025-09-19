'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { Edit, Person, Email, CalendarToday, Send } from '@mui/icons-material';
import SignatureCanvas from './SignatureCanvas';
import { PDFDocument, rgb } from 'pdf-lib';

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

  // Function to overlay signature on the original PDF
  const createSignedPdfWithOverlay = async (signatureData: any, originalPdfUrl: string) => {
    try {
      // Load the original PDF
      const response = await fetch(originalPdfUrl);
      const existingPdfBytes = await response.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the first page (you can modify this to add signature to all pages or specific pages)
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      // Convert signature image to PNG bytes
      const signatureResponse = await fetch(signatureData.signature);
      const signatureBytes = await signatureResponse.arrayBuffer();
      
      // Embed the signature image
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      
      // Calculate signature position (bottom right corner) with proper margins
      const signatureWidth = 100; // Width of signature area
      const signatureHeight = 50;  // Height of signature area
      const margin = 30;           // Margin from edges (increased for safety)
      const detailsHeight = 25;    // Height for signer details below signature
      
      // Ensure we have enough space for signature + details + margins
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
      const detailsY = signatureY - 5; // Position below the signature box
      
      // Ensure details don't go below the page
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
                  This shows how your signature will be overlaid on the original document
                </Typography>
              </Box>
            </Box>
          )}

          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2">
              Please draw your signature in the canvas above, fill in your details, and click "Submit Signature" to complete the signing process. Your signature will be overlaid on the original PDF document at the bottom right corner, preserving all original content.
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
          disabled={!signatureData.signature || !signatureData.name || !signatureData.email || loading}
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