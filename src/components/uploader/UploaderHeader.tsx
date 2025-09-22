'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Chip, Box } from '@mui/material';
import { ExitToApp, CloudUpload } from '@mui/icons-material';

interface UploaderHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function UploaderHeader({ userName, userRole, onLogout }: UploaderHeaderProps) {
  return (
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
          label={`${userName} (${userRole})`}
          variant="outlined"
          sx={{ mr: 2, color: '#3b82f6', borderColor: '#3b82f6' }}
        />
        <Button
          color="inherit"
          onClick={onLogout}
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
  );
}
