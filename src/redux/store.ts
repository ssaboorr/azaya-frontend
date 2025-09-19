import { configureStore } from '@reduxjs/toolkit';
import { 
  userLoginReducer, 
  userRegisterReducer, 
  userDetailReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer
} from './reducers/userReducers';
import {
  uploadDocumentReducer,
  uploadsListReducer,
  uploadDetailsReducer,
  updateUploadReducer,
  deleteUploadReducer,
  assignSignerReducer,
  signDocumentReducer,
  pendingSignaturesReducer,
  signedDocumentsReducer,
  uploadProgressReducer,
  uploaderDocumentsReducer,
  signerDocumentsReducer,
  signDocumentByIdReducer,
  updateDocumentStatusReducer,
} from './reducers/uploadReducers';

const isBrowser = typeof window !== 'undefined';

const userInfoFromStorage =
  isBrowser && localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo') as string)
    : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
};

export const store = configureStore({
  reducer: {
    // User reducers
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    userDetail: userDetailReducer,
    userList: userListReducer,
    userDelete: userDeleteReducer,
    userUpdate: userUpdateReducer,
    // Upload reducers
    uploadDocument: uploadDocumentReducer,
    uploadsList: uploadsListReducer,
    uploadDetails: uploadDetailsReducer,
    updateUpload: updateUploadReducer,
    deleteUpload: deleteUploadReducer,
    assignSigner: assignSignerReducer,
    signDocument: signDocumentReducer,
    pendingSignatures: pendingSignaturesReducer,
    signedDocuments: signedDocumentsReducer,
    uploadProgress: uploadProgressReducer,
    uploaderDocuments: uploaderDocumentsReducer,
    signerDocuments: signerDocumentsReducer,
    signDocumentById: signDocumentByIdReducer,
    updateDocumentStatus: updateDocumentStatusReducer,
  },
  preloadedState: initialState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
