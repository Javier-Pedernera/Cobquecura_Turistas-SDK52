import { Dispatch } from 'redux';
import { Promotion, UserActionTypes, UserData } from '../types/types'; 
import {  addFavorite, loginUser, logOut, removeFavorite, setFavorites, setUser } from '../reducers/userReducer';
import { loginUserAuth } from '../../services/authService';
import { RootState } from '../store/store';
import axios from 'axios';


const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Acción asíncrona para realizar el login
export const userLogIn = (email: string, password: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const data = await loginUserAuth(email, password);
      // console.log("data el resultado del login", data);
      
      if ('error' in data) {
        // Manejar el error (puedes lanzar una excepción, mostrar un alert, etc.)
        throw new Error(data.error);
      }

      // Si no hay error, realiza el dispatch con los datos correctos
      dispatch(loginUser(data));
      return data;
    } catch (error:any) {
      console.error("Error en userLogIn:", error.message);
      throw error;
    }
  };
};

export const getUserInfo = (token:string) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      
      dispatch(setUser(response.data));
    } catch (error:any) {
      // Maneja cualquier otro error aquí
      console.error("Error en get User Info:", error.message);
      throw error;
    }
  };
};

export const logOutUser = () => {
  return (dispatch: Dispatch) => {
    dispatch(logOut());
  };
};

export const updateUserAction = (updatedUserData: UserData) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      // console.log("token",token);
      if (!token) {
        throw new Error('User not authenticated');
      }
      const { user_id, ...dataToSend } = updatedUserData;

      const response = await axios.put(`${API_URL}/user/${user_id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("respuesta del backend",response.status);
      dispatch(setUser(response.data));
      return response;
    } catch (error) {
      throw error;
    }
  };
};

export const fetchUserFavorites = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      const userId = state.user.userData?.user_id;

      if (!token || !userId) {
        throw new Error('User not authenticated');
      }
      const response = await axios.get(`${API_URL}/users/${userId}/favorites`);
      // console.log(response);
      
      const favorites = response.data.map((fav: { promotion_id: number }) => fav.promotion_id);
      dispatch(setFavorites(favorites));
    } catch (error) {
      throw error;
    }
  };
};

export const addFavoriteAction = (promotion: Promotion) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      const userId = state.user.userData?.user_id;
      
      

      if (!token || !userId) {
        throw new Error('User not authenticated');
      }
      // console.log("al agregar a favorito", userId, promotion);
      await axios.post(
        `${API_URL}/favorites`,
        { user_id: userId, promotion_id: promotion.promotion_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(addFavorite(promotion.promotion_id));
    } catch (error) {
      throw error;
    }
  };
};

export const removeFavoriteAction = (promotionId: number) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      const userId = state.user.userData?.user_id;

      if (!token || !userId) {
        throw new Error('User not authenticated');
      }
      await axios.delete(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          user_id: userId,
          promotion_id: promotionId,
        },
      });
      dispatch(removeFavorite(promotionId));
    } catch (error) {
      throw error;
    }
  };
};