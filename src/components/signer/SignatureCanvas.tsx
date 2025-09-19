'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Clear, Save } from '@mui/icons-material';

interface SignatureCanvasProps {
  onSignatureSave: (signature: string) => void;
  isGeneratingPreview?: boolean;
}

export default function SignatureCanvas({ onSignatureSave, isGeneratingPreview }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

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
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onSignatureSave(dataURL);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" className="mb-2 font-medium">
        Digital Signature *
      </Typography>
      <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <canvas
          ref={canvasRef}
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
  );
}