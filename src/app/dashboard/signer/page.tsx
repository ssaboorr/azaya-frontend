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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  ExitToApp,
  Edit,
  Assignment,
  Visibility,
  Schedule,
  CheckCircle,
  Warning,
  Notifications,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/actions/AccountActions';

export default function SignerDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.userLogin);
  const [isClient, setIsClient] = useState(false);

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

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
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

  // Mock data for demonstration
  const signingStats = {
    pendingSignatures: 5,
    completedToday: 3,
    totalSigned: 128,
    urgent: 2,
  };

  const pendingDocuments = [
    {
      id: 1,
      name: 'Employment_Contract_John_Doe.pdf',
      uploader: 'HR Department',
      dueDate: '2025-01-20',
      priority: 'urgent',
      pages: 12,
    },
    {
      id: 2,
      name: 'NDA_Agreement_TechCorp.pdf',
      uploader: 'Legal Team',
      dueDate: '2025-01-22',
      priority: 'normal',
      pages: 5,
    },
    {
      id: 3,
      name: 'Service_Agreement_Q1.pdf',
      uploader: 'Sales Team',
      dueDate: '2025-01-25',
      priority: 'urgent',
      pages: 8,
    },
  ];

  const recentlySigned = [
    {
      id: 1,
      name: 'Marketing_Budget_2025.pdf',
      signedDate: '2025-01-15',
      uploader: 'Marketing Team',
    },
    {
      id: 2,
      name: 'Vendor_Agreement_ABC.pdf',
      signedDate: '2025-01-14',
      uploader: 'Procurement',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'normal':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
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
        <Box className="text-center mb-8">
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
        </Box>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent>
              <Badge badgeContent={signingStats.urgent} color="error">
                <Typography variant="h4" className="text-orange-600 font-bold mb-2">
                  {signingStats.pendingSignatures}
                </Typography>
              </Badge>
              <Typography variant="body2" className="text-gray-600">
                Pending Signatures
              </Typography>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent>
              <Typography variant="h4" className="text-green-600 font-bold mb-2">
                {signingStats.completedToday}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Signed Today
              </Typography>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent>
              <Typography variant="h4" className="text-blue-600 font-bold mb-2">
                {signingStats.totalSigned}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Signed
              </Typography>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent>
              <Typography variant="h4" className="text-red-600 font-bold mb-2">
                {signingStats.urgent}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Urgent Items
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Pending Documents */}
        <Card className="mb-8">
          <CardContent>
            <Typography variant="h5" className="mb-4 font-semibold">
              Documents Pending Your Signature
            </Typography>
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    doc.priority === 'urgent' ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getPriorityIcon(doc.priority)}
                    <div>
                      <Typography variant="subtitle1" className="font-medium">
                        {doc.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        From: {doc.uploader} • Due: {doc.dueDate} • {doc.pages} pages
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip
                      label={doc.priority}
                      color={getPriorityColor(doc.priority) as any}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
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
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Edit />}
                      sx={{
                        backgroundColor: '#10b981',
                        '&:hover': {
                          backgroundColor: '#059669',
                        },
                      }}
                    >
                      Sign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Signed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Recently Signed
                </Typography>
                <div className="space-y-3">
                  {recentlySigned.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle sx={{ color: '#10b981' }} />
                      <div className="flex-1">
                        <Typography variant="subtitle2" className="font-medium">
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          Signed on {doc.signedDate} • From {doc.uploader}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  fullWidth
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: '#ecfdf5',
                    },
                  }}
                >
                  View All Signed Documents
                </Button>
              </CardActions>
            </Card>
          </div>
          <div>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Quick Actions
                </Typography>
                <div className="space-y-3">
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: '#ecfdf5',
                      },
                    }}
                  >
                    View Signing Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: '#ecfdf5',
                      },
                    }}
                  >
                    Document Templates
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Notifications />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: '#ecfdf5',
                      },
                    }}
                  >
                    Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

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
    </div>
  );
}
