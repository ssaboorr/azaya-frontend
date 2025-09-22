'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { ExitToApp, CloudUpload, Notifications, Settings } from '@mui/icons-material';

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
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <Box className="flex items-center gap-3">
          <Box 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
            sx={{
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            <CloudUpload sx={{ color: '#ffffff', fontSize: 20 }} />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: '#1f2937',
              fontWeight: 700,
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em'
            }}
          >
            Uploader Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box className="flex items-center gap-2">
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#3b82f6',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Notifications />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton
              size="small"
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#3b82f6',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          
          <Chip 
            label={`${userName} (${userRole})`}
            variant="outlined"
            sx={{ 
              mr: 2, 
              color: '#3b82f6', 
              borderColor: '#3b82f6',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#eff6ff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          />
          
          <Button
            color="inherit"
            onClick={onLogout}
            startIcon={<ExitToApp />}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              borderRadius: '12px',
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
                transition: 'all 0.2s ease-in-out'
              },
              textTransform: 'none',
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
