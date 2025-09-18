/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// actions/userActions.ts

import axiosInstance from '@/lib/axios';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_RESET,
  USER_REGISTER_SUCCESS,
} from '../constants/userConstants';
import { RootState } from '../store';


// Type for Thunk Result
type ThunkResult<R> = ThunkAction<R, RootState, unknown, AnyAction>;

// Login Action
export const login =
  (email: string, password: string): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: USER_LOGIN_REQUEST });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      }, config);

      // Check if response is successful
      if (data.success && data.data) {
        const userInfo = {
          _id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          token: data.data.token,
          isActive: data.data.user.isActive,
        };

        dispatch({ type: USER_LOGIN_SUCCESS, payload: userInfo });
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        throw new Error('Login failed: Invalid response');
      }
    } catch (err: any) {
      dispatch({
        type: USER_LOGIN_FAIL,
        payload: err.response?.data?.message || err.message || 'Login failed',
      });
    }
  };

// Logout Action
export const logout = (): ThunkResult<void> => async (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_LOGIN_RESET });
  dispatch({ type: USER_REGISTER_RESET });
};

// Register Action
export const register =
  (
    name: string,
    email: string,
    password: string,
    role: string = 'uploader'
  ): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: USER_REGISTER_REQUEST });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axiosInstance.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      }, config);

      // Check if response is successful
      if (data.success && data.data) {
        const userInfo = {
          _id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          token: data.data.token,
          isActive: data.data.user.isActive,
        };

        dispatch({ type: USER_REGISTER_SUCCESS, payload: userInfo });
        dispatch({ type: USER_LOGIN_SUCCESS, payload: userInfo });
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        throw new Error('Registration failed: Invalid response');
      }
    } catch (err: any) {
      dispatch({
        type: USER_REGISTER_FAIL,
        payload: err.response?.data?.message || err.message || 'Registration failed',
      });
    }
  };
