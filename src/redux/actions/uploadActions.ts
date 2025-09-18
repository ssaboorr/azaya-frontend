/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// actions/uploadActions.ts

import axiosInstance from '@/lib/axios';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAIL,
  UPLOAD_DOCUMENT_RESET,
  GET_UPLOADS_REQUEST,
  GET_UPLOADS_SUCCESS,
  GET_UPLOADS_FAIL,
  GET_UPLOADS_RESET,
  GET_UPLOAD_DETAILS_REQUEST,
  GET_UPLOAD_DETAILS_SUCCESS,
  GET_UPLOAD_DETAILS_FAIL,
  GET_UPLOAD_DETAILS_RESET,
  UPDATE_UPLOAD_REQUEST,
  UPDATE_UPLOAD_SUCCESS,
  UPDATE_UPLOAD_FAIL,
  UPDATE_UPLOAD_RESET,
  DELETE_UPLOAD_REQUEST,
  DELETE_UPLOAD_SUCCESS,
  DELETE_UPLOAD_FAIL,
  ASSIGN_SIGNER_REQUEST,
  ASSIGN_SIGNER_SUCCESS,
  ASSIGN_SIGNER_FAIL,
  SIGN_DOCUMENT_REQUEST,
  SIGN_DOCUMENT_SUCCESS,
  SIGN_DOCUMENT_FAIL,
  GET_PENDING_SIGNATURES_REQUEST,
  GET_PENDING_SIGNATURES_SUCCESS,
  GET_PENDING_SIGNATURES_FAIL,
  GET_SIGNED_DOCUMENTS_REQUEST,
  GET_SIGNED_DOCUMENTS_SUCCESS,
  GET_SIGNED_DOCUMENTS_FAIL,
  UPLOAD_PROGRESS_UPDATE,
  UPLOAD_PROGRESS_RESET,
  GET_UPLOADER_DOCUMENTS_REQUEST,
  GET_UPLOADER_DOCUMENTS_SUCCESS,
  GET_UPLOADER_DOCUMENTS_FAIL,
  GET_UPLOADER_DOCUMENTS_RESET,
  GET_SIGNER_DOCUMENTS_REQUEST,
  GET_SIGNER_DOCUMENTS_SUCCESS,
  GET_SIGNER_DOCUMENTS_FAIL,
  GET_SIGNER_DOCUMENTS_RESET,
} from '../constants/uploadConstants';
import { RootState } from '../store';

// Type for Thunk Result
type ThunkResult<R> = ThunkAction<R, RootState, unknown, AnyAction>;

// Upload Document Action
export const uploadDocument =
  (
    file: File,
    title: string,
    signerEmail: string,
    signatureFields: Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      page: number;
      required: boolean;
    }> = []
  ): ThunkResult<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: UPLOAD_DOCUMENT_REQUEST });
      dispatch({ type: UPLOAD_PROGRESS_RESET });

      // Get user token from state
      const state = getState();
      const token = state.userLogin.userInfo?.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', title);
      formData.append('signerEmail', signerEmail);
      formData.append('signatureFields', JSON.stringify(signatureFields));

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch({ type: UPLOAD_PROGRESS_UPDATE, payload: progress });
        },
      };

      const { data } = await axiosInstance.post('/api/documents/upload', formData, config);

      if (data.success && data.data) {
        console.log("After Uploading ==>",data.data)
        const uploadInfo = {
          _id: data.data._id,
          title: data.data.title || title,
          originalFileName: data.data.originalFileName || title,
          cloudinaryUrl: data.data.cloudinaryUrl,
          cloudinaryPublicId: data.data.cloudinaryPublicId,
          uploader: data.data.uploader,
          assignedSigner: data.data.assignedSigner,
          signerEmail: data.data.signerEmail || signerEmail,
          signatureFields: data.data.signatureFields || signatureFields,
          status: data.data.status || 'pending',
          priority: data.data.priority || 'normal',
          dueDate: data.data.dueDate,
          comments: data.data.comments,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          __v: data.data.__v,
        };

        dispatch({ type: UPLOAD_DOCUMENT_SUCCESS, payload: uploadInfo });
        dispatch({ type: UPLOAD_PROGRESS_RESET });
      } 
    } catch (err: any) {
      console.log("upload error ==>",err)
      dispatch({
        type: UPLOAD_DOCUMENT_FAIL,
        payload: err.response?.data?.message || err.message || 'Upload failed',
      });
      dispatch({ type: UPLOAD_PROGRESS_RESET });
    }
  };

// Get Uploads List Action
export const getUploads =
  (page: number = 1, limit: number = 10, status?: string): ThunkResult<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: GET_UPLOADS_REQUEST });

      // Get user token from state
      const state = getState();
      const token = state.userLogin.userInfo?.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const { data } = await axiosInstance.get(`/api/documents?${params}`, config);

      if (data.success && data.data) {
        dispatch({
          type: GET_UPLOADS_SUCCESS,
          payload: {
            uploads: data.data.documents || data.data.uploads,
            totalCount: data.data.totalCount,
            page: data.data.page,
            limit: data.data.limit,
          },
        });
      } else {
        throw new Error('Failed to fetch uploads');
      }
    } catch (err: any) {
      dispatch({
        type: GET_UPLOADS_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to fetch uploads',
      });
    }
  };

// Get Upload Details Action
export const getUploadDetails =
  (uploadId: string): ThunkResult<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: GET_UPLOAD_DETAILS_REQUEST });

      // Get user token from state
      const state = getState();
      const token = state.userLogin.userInfo?.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const { data } = await axiosInstance.get(`/api/documents/${uploadId}`, config);

      if (data.success && data.data) {
        dispatch({ type: GET_UPLOAD_DETAILS_SUCCESS, payload: data.data.document || data.data.upload });
      } else {
        throw new Error('Failed to fetch upload details');
      }
    } catch (err: any) {
      dispatch({
        type: GET_UPLOAD_DETAILS_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to fetch upload details',
      });
    }
  };

// Update Upload Action
export const updateUpload =
  (
    uploadId: string,
    updateData: {
      assignedTo?: string;
      priority?: string;
      dueDate?: string;
      comments?: string;
      status?: string;
    }
  ): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: UPDATE_UPLOAD_REQUEST });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axiosInstance.put(
        `/api/uploads/${uploadId}`,
        updateData,
        config
      );

      if (data.success && data.data) {
        dispatch({ type: UPDATE_UPLOAD_SUCCESS, payload: data.data.upload });
      } else {
        throw new Error('Failed to update upload');
      }
    } catch (err: any) {
      dispatch({
        type: UPDATE_UPLOAD_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to update upload',
      });
    }
  };

// Delete Upload Action
export const deleteUpload =
  (uploadId: string): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: DELETE_UPLOAD_REQUEST });

      const { data } = await axiosInstance.delete(`/api/uploads/${uploadId}`);

      if (data.success) {
        dispatch({ type: DELETE_UPLOAD_SUCCESS });
      } else {
        throw new Error('Failed to delete upload');
      }
    } catch (err: any) {
      dispatch({
        type: DELETE_UPLOAD_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to delete upload',
      });
    }
  };

// Assign Signer Action
export const assignSigner =
  (uploadId: string, signerId: string, dueDate?: string): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: ASSIGN_SIGNER_REQUEST });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const requestData = {
        assignedTo: signerId,
        ...(dueDate && { dueDate }),
      };

      const { data } = await axiosInstance.put(
        `/api/uploads/${uploadId}/assign`,
        requestData,
        config
      );

      if (data.success) {
        dispatch({ type: ASSIGN_SIGNER_SUCCESS });
      } else {
        throw new Error('Failed to assign signer');
      }
    } catch (err: any) {
      dispatch({
        type: ASSIGN_SIGNER_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to assign signer',
      });
    }
  };

// Sign Document Action
export const signDocument =
  (
    uploadId: string,
    signatureData: {
      signatureImage?: string;
      comments?: string;
    }
  ): ThunkResult<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch({ type: SIGN_DOCUMENT_REQUEST });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axiosInstance.post(
        `/api/uploads/${uploadId}/sign`,
        signatureData,
        config
      );

      if (data.success && data.data) {
        dispatch({ type: SIGN_DOCUMENT_SUCCESS, payload: data.data.upload });
      } else {
        throw new Error('Failed to sign document');
      }
    } catch (err: any) {
      dispatch({
        type: SIGN_DOCUMENT_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to sign document',
      });
    }
  };

// Get Pending Signatures Action (for signers)
export const getPendingSignatures = (): ThunkResult<Promise<void>> => async (dispatch) => {
  try {
    dispatch({ type: GET_PENDING_SIGNATURES_REQUEST });

    const { data } = await axiosInstance.get('/api/uploads/pending-signatures');

    if (data.success && data.data) {
      dispatch({ type: GET_PENDING_SIGNATURES_SUCCESS, payload: data.data.documents });
    } else {
      throw new Error('Failed to fetch pending signatures');
    }
  } catch (err: any) {
    dispatch({
      type: GET_PENDING_SIGNATURES_FAIL,
      payload: err.response?.data?.message || err.message || 'Failed to fetch pending signatures',
    });
  }
};

// Get Signed Documents Action
export const getSignedDocuments = (): ThunkResult<Promise<void>> => async (dispatch) => {
  try {
    dispatch({ type: GET_SIGNED_DOCUMENTS_REQUEST });

    const { data } = await axiosInstance.get('/api/uploads/signed-documents');

    if (data.success && data.data) {
      dispatch({ type: GET_SIGNED_DOCUMENTS_SUCCESS, payload: data.data.documents });
    } else {
      throw new Error('Failed to fetch signed documents');
    }
  } catch (err: any) {
    dispatch({
      type: GET_SIGNED_DOCUMENTS_FAIL,
      payload: err.response?.data?.message || err.message || 'Failed to fetch signed documents',
    });
  }
};

// Reset Actions
export const resetUploadDocument = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: UPLOAD_DOCUMENT_RESET });
};

export const resetUploads = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: GET_UPLOADS_RESET });
};

export const resetUploadDetails = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: GET_UPLOAD_DETAILS_RESET });
};

export const resetUpdateUpload = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: UPDATE_UPLOAD_RESET });
};

// Get Documents by Uploader ID Action
export const getUploaderDocuments = (
  uploaderId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): ThunkResult<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: GET_UPLOADER_DOCUMENTS_REQUEST });

      const state = getState();
      const token = state.userLogin.userInfo?.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const { data } = await axiosInstance.get(`/api/documents/uploader/${uploaderId}`, config);

      if (data.success && data.data) {
        dispatch({
          type: GET_UPLOADER_DOCUMENTS_SUCCESS,
          payload: {
            documents: data.data.documents || data.data,
            totalCount: data.data.totalCount || data.data.length,
            page: page,
            limit: limit,
          },
        });
      } else {
        throw new Error('Failed to fetch uploader documents: Invalid response');
      }
    } catch (err: any) {
      dispatch({
        type: GET_UPLOADER_DOCUMENTS_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to fetch uploader documents',
      });
    }
  };

export const resetUploaderDocuments = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: GET_UPLOADER_DOCUMENTS_RESET });
};

// Get Documents by Signer ID Action
export const getSignerDocuments = (
  signerId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): ThunkResult<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: GET_SIGNER_DOCUMENTS_REQUEST });

      const state = getState();
      const token = state.userLogin.userInfo?.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const { data } = await axiosInstance.get(`/api/documents/signer/${signerId}?${params.toString()}`, config);

      if (data.success && data.data) {
        dispatch({
          type: GET_SIGNER_DOCUMENTS_SUCCESS,
          payload: {
            documents: data.data.documents || data.data,
            totalCount: data.data.totalCount || data.data.length,
            page: page,
            limit: limit,
          },
        });
      } else {
        throw new Error('Failed to fetch signer documents: Invalid response');
      }
    } catch (err: any) {
      dispatch({
        type: GET_SIGNER_DOCUMENTS_FAIL,
        payload: err.response?.data?.message || err.message || 'Failed to fetch signer documents',
      });
    }
  };

export const resetSignerDocuments = (): ThunkResult<void> => (dispatch) => {
  dispatch({ type: GET_SIGNER_DOCUMENTS_RESET });
};
