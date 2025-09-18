'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login } from '@/redux/actions/AccountActions';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get login state from Redux
  const { loading, error, userInfo } = useAppSelector((state) => state.userLogin);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Redirect if already logged in based on role
  useEffect(() => {
    if (userInfo) {
      switch (userInfo.role) {
        case 'uploader':
          router.push('/dashboard/uploader');
          break;
        case 'signer':
          router.push('/dashboard/signer');
          break;
        case 'admin':
          router.push('/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [userInfo, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Dispatch Redux login action
      try {
        await dispatch(login(formData.email, formData.password));
        // The useEffect hook will handle the redirect after userInfo is updated
      } catch (error) {
        // Error is already handled by Redux action
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-6 sm:p-8 lg:p-10">
          <Box className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-white text-3xl" />
            </div>
            <Typography variant="h4" className="text-gray-800 font-bold mb-3">
              Welcome Back
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: '20px',
               
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3b82f6',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                  color: '#1f2937',
                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: '20px',
               
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                  color: '#1f2937',
                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                  },
                },
              }}
            />

            <div className="text-right mt-2 mb-2">
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                underline="hover"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white mt-8"
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                },
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                padding: '12px 0',
                borderRadius: '8px',
              }}
            >
              {loading ? (
                <Box className="flex items-center gap-2">
                  <CircularProgress size={20} color="inherit" />
                  Signing In...
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Box className="mt-8 text-center">
            <Typography variant="body2" className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-semibold"
                underline="hover"
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}