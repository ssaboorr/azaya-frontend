'use client';

import React, { useEffect, useState } from 'react';
import { Button, Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ExitToApp } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.userLogin);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not logged in or redirect to role-specific dashboard
  useEffect(() => {
    if (isClient) {
      if (!userInfo) {
        router.push('/login');
      } else {
        // Redirect users to their specific dashboards unless they are admin
        switch (userInfo.role) {
          case 'uploader':
            router.push('/dashboard/uploader');
            break;
          case 'signer':
            router.push('/dashboard/signer');
            break;
          case 'admin':
            // Stay on main dashboard
            break;
          default:
            // Unknown role, stay on main dashboard
            break;
        }
      }
    }
  }, [userInfo, router, isClient]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
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

  // Don't render if not logged in
  if (!userInfo) {
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
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#1f2937',
              fontWeight: 600
            }}
          >
            Admin Dashboard
          </Typography>
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
       <Typography variant="h4">Welcome to the Dashboard</Typography>
      </Container>
    </div>
  );
}
