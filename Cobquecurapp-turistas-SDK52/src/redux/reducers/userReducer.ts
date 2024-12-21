import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Promotion, UserData } from '../types/types';
import { UserStorageData } from '../../utils/storage';

export interface UserState {
  userData: UserData | null;
  accessToken: string | null;
  favorites: number[];
  isGuest: boolean; 
}

const initialState: UserState = {
  userData: null,
  accessToken: null,
  favorites: [],
  isGuest: false, 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ token: string; user: UserData }>) => {
      const { token, user } = action.payload;
      return {
        ...state,
        userData: user,
        accessToken: token,
        isGuest: false,
      };
    },
    logOut: (state) => {
      state.userData = null;
      state.accessToken = null;
      state.isGuest = false;
    },
    setUser: (state, action: PayloadAction<any>) => {
      return {
      ...state,
      userData: action.payload
      }
    },
    setFavorites: (state, action: PayloadAction<number[]>) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action: PayloadAction<number>) => {
      state.favorites.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    loginAsGuest: (state) => {
      state.isGuest = true; // Activar modo invitado
      state.userData = null; 
      state.accessToken = null;
      state.favorites = [];
    },
  },
});

export const { loginUser, logOut, setUser,setFavorites,loginAsGuest ,addFavorite, removeFavorite } = userSlice.actions;
export default userSlice.reducer;