import { AnyAction } from 'redux';
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
  DELETE_UPLOAD_RESET,
  ASSIGN_SIGNER_REQUEST,
  ASSIGN_SIGNER_SUCCESS,
  ASSIGN_SIGNER_FAIL,
  ASSIGN_SIGNER_RESET,
  SIGN_DOCUMENT_REQUEST,
  SIGN_DOCUMENT_SUCCESS,
  SIGN_DOCUMENT_FAIL,
  SIGN_DOCUMENT_RESET,
  GET_PENDING_SIGNATURES_REQUEST,
  GET_PENDING_SIGNATURES_SUCCESS,
  GET_PENDING_SIGNATURES_FAIL,
  GET_PENDING_SIGNATURES_RESET,
  GET_SIGNED_DOCUMENTS_REQUEST,
  GET_SIGNED_DOCUMENTS_SUCCESS,
  GET_SIGNED_DOCUMENTS_FAIL,
  GET_SIGNED_DOCUMENTS_RESET,
  UPLOAD_PROGRESS_UPDATE,
  UPLOAD_PROGRESS_RESET,
  GET_UPLOADER_DOCUMENTS_REQUEST,
  GET_UPLOADER_DOCUMENTS_SUCCESS,
  GET_UPLOADER_DOCUMENTS_FAIL,
  GET_UPLOADER_DOCUMENTS_RESET,
  GET_SIGNER_DOCUMENTS_FAIL,
  GET_SIGNER_DOCUMENTS_REQUEST,
  GET_SIGNER_DOCUMENTS_SUCCESS,
  GET_SIGNER_DOCUMENTS_RESET,
  SIGN_DOCUMENT_BY_ID_REQUEST,
  SIGN_DOCUMENT_BY_ID_SUCCESS,
  SIGN_DOCUMENT_BY_ID_FAIL,
  SIGN_DOCUMENT_BY_ID_RESET,
  UPDATE_DOCUMENT_STATUS_REQUEST,
  UPDATE_DOCUMENT_STATUS_SUCCESS,
  UPDATE_DOCUMENT_STATUS_FAIL,
  UPDATE_DOCUMENT_STATUS_RESET,
} from '../constants/uploadConstants';
import { ReactNode } from 'react';

// Signature Field Interface
export interface SignatureField {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
}

// Upload Interface
export interface Upload {
  rejectionReason: ReactNode;
  rejectedReason: ReactNode;
  _id: string;
  title: string; // Document title
  originalFileName: string; // Original file name
  cloudinaryUrl: string; // Cloudinary file URL
  cloudinaryPublicId: string; // Cloudinary public ID
  uploader: {
    _id: string;
    name: string;
    email: string;
  };
  assignedSigner: {
    _id: string;
    name: string;
    email: string;
  };
  signerEmail: string; // Email of assigned signer
  signatureFields: SignatureField[]; // Signature field positions
  status: 'pending' | 'assigned' | 'signed' | 'completed' | 'rejected';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  dueDate?: string;
  signedAt?: string;
  signatureData?: {
    signedBy: string;
    signedAt: string;
    signatureImage?: string;
  };
  comments?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// State Interfaces
export interface UploadDocumentState {
  loading?: boolean;
  upload?: Upload;
  error?: string;
  progress?: number;
}

export interface UploadsListState {
  loading?: boolean;
  uploads?: Upload[];
  error?: string;
  totalCount?: number;
  page?: number;
  limit?: number;
}

export interface UploadDetailsState {
  loading?: boolean;
  upload?: Upload;
  error?: string;
}

export interface UpdateUploadState {
  loading?: boolean;
  success?: boolean;
  error?: string;
  upload?: Partial<Upload>;
}

export interface DeleteUploadState {
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export interface AssignSignerState {
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export interface SignDocumentState {
  loading?: boolean;
  success?: boolean;
  error?: string;
  signedDocument?: Upload;
}

export interface PendingSignaturesState {
  loading?: boolean;
  documents?: Upload[];
  error?: string;
}

export interface SignedDocumentsState {
  loading?: boolean;
  documents?: Upload[];
  error?: string;
}

export interface UploadProgressState {
  progress?: number;
  uploading?: boolean;
}

export interface UploaderDocumentsState {
  loading?: boolean;
  documents?: Upload[];
  error?: string;
  totalCount?: number;
  page?: number;
  limit?: number;
}

export interface SignerDocumentsState {
  loading?: boolean;
  documents?: Upload[];
  error?: string;
  totalCount?: number;
  page?: number;
  limit?: number;
}

export interface SignDocumentByIdState {
  loading?: boolean;
  success?: boolean;
  error?: string;
  signedDocument?: Upload;
}

// Initial States
const initialUploadDocumentState: UploadDocumentState = {};
const initialUploadsListState: UploadsListState = { uploads: [] };
const initialUploadDetailsState: UploadDetailsState = {};
const initialUpdateUploadState: UpdateUploadState = {};
const initialDeleteUploadState: DeleteUploadState = {};
const initialAssignSignerState: AssignSignerState = {};
const initialSignDocumentState: SignDocumentState = {};
const initialPendingSignaturesState: PendingSignaturesState = { documents: [] };
const initialSignedDocumentsState: SignedDocumentsState = { documents: [] };
const initialUploadProgressState: UploadProgressState = { progress: 0, uploading: false };
const initialUploaderDocumentsState: UploaderDocumentsState = { documents: [] };
const initialSignerDocumentsState: SignerDocumentsState = { documents: [] };
const initialSignDocumentByIdState: SignDocumentByIdState = {};

// Upload Document Reducer
export const uploadDocumentReducer = (
  state: UploadDocumentState = initialUploadDocumentState,
  action: AnyAction
): UploadDocumentState => {
  switch (action.type) {
    case UPLOAD_DOCUMENT_REQUEST:
      return { loading: true, progress: 0 };
    case UPLOAD_DOCUMENT_SUCCESS:
      return { loading: false, upload: action.payload, progress: 100 };
    case UPLOAD_DOCUMENT_FAIL:
      return { loading: false, error: action.payload, progress: 0 };
    case UPLOAD_DOCUMENT_RESET:
      return {};
    default:
      return state;
  }
};

// Uploads List Reducer
export const uploadsListReducer = (
  state: UploadsListState = initialUploadsListState,
  action: AnyAction
): UploadsListState => {
  switch (action.type) {
    case GET_UPLOADS_REQUEST:
      return { loading: true };
    case GET_UPLOADS_SUCCESS:
      return {
        loading: false,
        uploads: action.payload.uploads,
        totalCount: action.payload.totalCount,
        page: action.payload.page,
        limit: action.payload.limit,
      };
    case GET_UPLOADS_FAIL:
      return { loading: false, error: action.payload };
    case GET_UPLOADS_RESET:
      return { uploads: [] };
    default:
      return state;
  }
};

// Upload Details Reducer
export const uploadDetailsReducer = (
  state: UploadDetailsState = initialUploadDetailsState,
  action: AnyAction
): UploadDetailsState => {
  switch (action.type) {
    case GET_UPLOAD_DETAILS_REQUEST:
      return { loading: true };
    case GET_UPLOAD_DETAILS_SUCCESS:
      return { loading: false, upload: action.payload };
    case GET_UPLOAD_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case GET_UPLOAD_DETAILS_RESET:
      return {};
    default:
      return state;
  }
};

// Update Upload Reducer
export const updateUploadReducer = (
  state: UpdateUploadState = initialUpdateUploadState,
  action: AnyAction
): UpdateUploadState => {
  switch (action.type) {
    case UPDATE_UPLOAD_REQUEST:
      return { loading: true };
    case UPDATE_UPLOAD_SUCCESS:
      return { loading: false, success: true, upload: action.payload };
    case UPDATE_UPLOAD_FAIL:
      return { loading: false, error: action.payload };
    case UPDATE_UPLOAD_RESET:
      return {};
    default:
      return state;
  }
};

// Delete Upload Reducer
export const deleteUploadReducer = (
  state: DeleteUploadState = initialDeleteUploadState,
  action: AnyAction
): DeleteUploadState => {
  switch (action.type) {
    case DELETE_UPLOAD_REQUEST:
      return { loading: true };
    case DELETE_UPLOAD_SUCCESS:
      return { loading: false, success: true };
    case DELETE_UPLOAD_FAIL:
      return { loading: false, error: action.payload };
    case DELETE_UPLOAD_RESET:
      return {};
    default:
      return state;
  }
};

// Assign Signer Reducer
export const assignSignerReducer = (
  state: AssignSignerState = initialAssignSignerState,
  action: AnyAction
): AssignSignerState => {
  switch (action.type) {
    case ASSIGN_SIGNER_REQUEST:
      return { loading: true };
    case ASSIGN_SIGNER_SUCCESS:
      return { loading: false, success: true };
    case ASSIGN_SIGNER_FAIL:
      return { loading: false, error: action.payload };
    case ASSIGN_SIGNER_RESET:
      return {};
    default:
      return state;
  }
};

// Sign Document Reducer
export const signDocumentReducer = (
  state: SignDocumentState = initialSignDocumentState,
  action: AnyAction
): SignDocumentState => {
  switch (action.type) {
    case SIGN_DOCUMENT_REQUEST:
      return { loading: true };
    case SIGN_DOCUMENT_SUCCESS:
      return { loading: false, success: true, signedDocument: action.payload };
    case SIGN_DOCUMENT_FAIL:
      return { loading: false, error: action.payload };
    case SIGN_DOCUMENT_RESET:
      return {};
    default:
      return state;
  }
};

// Pending Signatures Reducer
export const pendingSignaturesReducer = (
  state: PendingSignaturesState = initialPendingSignaturesState,
  action: AnyAction
): PendingSignaturesState => {
  switch (action.type) {
    case GET_PENDING_SIGNATURES_REQUEST:
      return { loading: true };
    case GET_PENDING_SIGNATURES_SUCCESS:
      return { loading: false, documents: action.payload };
    case GET_PENDING_SIGNATURES_FAIL:
      return { loading: false, error: action.payload };
    case GET_PENDING_SIGNATURES_RESET:
      return { documents: [] };
    default:
      return state;
  }
};

// Signed Documents Reducer
export const signedDocumentsReducer = (
  state: SignedDocumentsState = initialSignedDocumentsState,
  action: AnyAction
): SignedDocumentsState => {
  switch (action.type) {
    case GET_SIGNED_DOCUMENTS_REQUEST:
      return { loading: true };
    case GET_SIGNED_DOCUMENTS_SUCCESS:
      return { loading: false, documents: action.payload };
    case GET_SIGNED_DOCUMENTS_FAIL:
      return { loading: false, error: action.payload };
    case GET_SIGNED_DOCUMENTS_RESET:
      return { documents: [] };
    default:
      return state;
  }
};

// Upload Progress Reducer
export const uploadProgressReducer = (
  state: UploadProgressState = initialUploadProgressState,
  action: AnyAction
): UploadProgressState => {
  switch (action.type) {
    case UPLOAD_PROGRESS_UPDATE:
      return { progress: action.payload, uploading: true };
    case UPLOAD_PROGRESS_RESET:
      return { progress: 0, uploading: false };
    default:
      return state;
  }
};

// Uploader Documents Reducer
export const uploaderDocumentsReducer = (
  state: UploaderDocumentsState = initialUploaderDocumentsState,
  action: AnyAction
): UploaderDocumentsState => {
  switch (action.type) {
    case GET_UPLOADER_DOCUMENTS_REQUEST:
      return { loading: true };
    case GET_UPLOADER_DOCUMENTS_SUCCESS:
      return {
        loading: false,
        documents: action.payload.documents || action.payload,
        totalCount: action.payload.totalCount,
        page: action.payload.page,
        limit: action.payload.limit
      };
    case GET_UPLOADER_DOCUMENTS_FAIL:
      return { loading: false, error: action.payload };
    case GET_UPLOADER_DOCUMENTS_RESET:
      return { documents: [] };
    default:
      return state;
  }
};

// Signer Documents Reducer
export const signerDocumentsReducer = (
  state: SignerDocumentsState = initialSignerDocumentsState,
  action: AnyAction
): SignerDocumentsState => {
  switch (action.type) {
    case GET_SIGNER_DOCUMENTS_REQUEST:
      return { loading: true };
    case GET_SIGNER_DOCUMENTS_SUCCESS:
      return {
        loading: false,
        documents: action.payload.documents || action.payload,
        totalCount: action.payload.totalCount,
        page: action.payload.page,
        limit: action.payload.limit
      };
    case GET_SIGNER_DOCUMENTS_FAIL:
      return { loading: false, error: action.payload };
    case GET_SIGNER_DOCUMENTS_RESET:
      return { documents: [] };
    default:
      return state;
  }
};

// Sign Document by ID Reducer
export const signDocumentByIdReducer = (
  state: SignDocumentByIdState = initialSignDocumentByIdState,
  action: AnyAction
): SignDocumentByIdState => {
  switch (action.type) {
    case SIGN_DOCUMENT_BY_ID_REQUEST:
      return { loading: true };
    case SIGN_DOCUMENT_BY_ID_SUCCESS:
      return {
        loading: false,
        success: true,
        signedDocument: action.payload
      };
    case SIGN_DOCUMENT_BY_ID_FAIL:
      return { loading: false, error: action.payload };
    case SIGN_DOCUMENT_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

// Update Document Status State Interface
export interface UpdateDocumentStatusState {
  loading?: boolean;
  success?: boolean;
  error?: string;
  updatedDocument?: any;
}

// Initial Update Document Status State
export const initialUpdateDocumentStatusState: UpdateDocumentStatusState = {};

// Update Document Status Reducer
export const updateDocumentStatusReducer = (
  state: UpdateDocumentStatusState = initialUpdateDocumentStatusState,
  action: any
): UpdateDocumentStatusState => {
  switch (action.type) {
    case UPDATE_DOCUMENT_STATUS_REQUEST:
      return { loading: true };
    case UPDATE_DOCUMENT_STATUS_SUCCESS:
      return {
        loading: false,
        success: true,
        updatedDocument: action.payload
      };
    case UPDATE_DOCUMENT_STATUS_FAIL:
      return { loading: false, error: action.payload };
    case UPDATE_DOCUMENT_STATUS_RESET:
      return {};
    default:
      return state;
  }
};
