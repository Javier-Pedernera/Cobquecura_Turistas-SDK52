import { Dispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import { AppDispatch } from '../store/store';
import { TouristPoint, Rating, NewRating, putRating } from '../types/types';
import { setRatings, setRatingsError, setTouristPoints, setTouristPointsError, addRating, updateRating, deleteRating, setSelectedTouristPoint } from '../reducers/touristPointReducer';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
};

export const fetchTouristPoints = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.get<TouristPoint[]>(`${API_URL}/tourist_points`);
      
      // Filtrar los puntos turísticos activos
      const activeTouristPoints = response.data.filter(
        (point) => point.status?.name === 'active'
      );
      // Enviar los puntos turísticos activos ordenados al estado
      dispatch(setTouristPoints(activeTouristPoints));
    } catch (error) {
      dispatch(setTouristPointsError(getErrorMessage(error)));
    }
  };
};

export const fetchTouristPointById = (touristPointId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.get<TouristPoint>(`${API_URL}/tourist_points/${touristPointId}`);
      // Asignar el punto turístico actualizado al estado global
      dispatch(setSelectedTouristPoint(response.data));
    } catch (error) {
      dispatch(setTouristPointsError(getErrorMessage(error)));
    }
  };
};

export const fetchRatings = (touristPointId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.get<Rating[]>(`${API_URL}/tourist_points/${touristPointId}/ratings`);
      // console.log("respuesta de ratings",response.data);
      
      dispatch(setRatings(response.data));
    } catch (error) {
      dispatch(setRatingsError(getErrorMessage(error)));
    }
  };
};

export const addNewRating = (rating: NewRating, tourist_point_id:any) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_URL}/tourist_points/${tourist_point_id}/ratings`, rating);
      // console.log(response);
      
      dispatch(addRating(response.data));
    } catch (error) {
      dispatch(setRatingsError(getErrorMessage(error)));
    }
  };
};

export const updateExistingRating = (ratingID: number, rating: putRating) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put<any>(`${API_URL}/ratings/${ratingID}`, rating);
      dispatch(updateRating(response.data));
    } catch (error) {
      dispatch(setRatingsError(getErrorMessage(error)));
    }
  };
};

export const deleteExistingRating = (ratingId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      await axios.delete(`${API_URL}/ratings/${ratingId}`);
      dispatch(deleteRating(ratingId));
    } catch (error) {
      dispatch(setRatingsError(getErrorMessage(error)));
    }
  };
};
