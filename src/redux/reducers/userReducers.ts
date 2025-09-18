import { AnyAction } from 'redux';
import {
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_RESET,
  USER_DETAILS_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_RESET,
  USER_REGISTER_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_RESET,
  USER_LIST_SUCCESS,
  USER_DELETE_FAIL,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_RESET,
  USER_UPDATE_SUCCESS,
 
} from '../constants/userConstants';

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  role: string;
  isActive: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDetails {
  _id: string;
  name: string;
  email: string;
  token: string;
  isAdmin?: boolean;
}

export interface UserState {
  loading?: boolean;
  userInfo?: User;
  error?: string;
}

export interface UserDetailState {
  loading?: boolean;
  userDetails?: UserDetails;
  error?: string;
}



export interface UserListState {
  loading?: boolean;
  users?: User[];
  error?: string;
}

export interface UserDeleteState {
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export interface UserUpdateState {
  loading?: boolean;
  success?: boolean;
  error?: string;
  user?: Partial<User>;
}





const initialUserState: UserState = {};
const initialUserDetailsState: UserDetailState = {};
const initialUserListState: UserListState = { users: [] };
const initialUserDeleteState: UserDeleteState = {};
const initialUserUpdateState: UserUpdateState = { user: {} };


// Login Reducer
export const userLoginReducer = (
  state: UserState = initialUserState,
  action: AnyAction
): UserState => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true };
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGIN_RESET:
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

// Register Reducer
export const userRegisterReducer = (
  state: UserState = initialUserState,
  action: AnyAction
): UserState => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true };
    case USER_REGISTER_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_REGISTER_FAIL:
      return { loading: false, error: action.payload };
    case USER_REGISTER_RESET:
      return {};
    default:
      return state;
  }
};

// User Detail Reducer
export const userDetailReducer = (
  state: UserDetailState = initialUserDetailsState,
  action: AnyAction
): UserDetailState => {
  switch (action.type) {
    case USER_DETAILS_REQUEST:
      return { loading: true };
    case USER_DETAILS_SUCCESS:
      return { loading: false, userDetails: action.payload };
    case USER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case USER_DETAILS_RESET:
      return {};
    default:
      return state;
  }
};



// User List Reducer
export const userListReducer = (
  state: UserListState = initialUserListState,
  action: AnyAction
): UserListState => {
  switch (action.type) {
    case USER_LIST_REQUEST:
      return { loading: true };
    case USER_LIST_SUCCESS:
      return { loading: false, users: action.payload };
    case USER_LIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_LIST_RESET:
      return { users: [] };
    default:
      return state;
  }
};

// User Delete Reducer
export const userDeleteReducer = (
  state: UserDeleteState = initialUserDeleteState,
  action: AnyAction
): UserDeleteState => {
  switch (action.type) {
    case USER_DELETE_REQUEST:
      return { loading: true };
    case USER_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// User Update Reducer
export const userUpdateReducer = (
  state: UserUpdateState = initialUserUpdateState,
  action: AnyAction
): UserUpdateState => {
  switch (action.type) {
    case USER_UPDATE_REQUEST:
      return { loading: true };
    case USER_UPDATE_SUCCESS:
      return { loading: false, success: true, user: action.payload };
    case USER_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_UPDATE_RESET:
      return { user: {} };
    default:
      return state;
  }
};

