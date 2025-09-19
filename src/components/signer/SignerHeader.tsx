'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { Edit, ExitToApp } from '@mui/icons-material';

interface SignerHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function SignerHeader({ userName, userRole, onLogout }: SignerHeaderProps) {
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
          label={`${userName} (${userRole})`}
          variant="outlined"
          sx={{ mr: 2, color: '#10b981', borderColor: '#10b981' }}
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
