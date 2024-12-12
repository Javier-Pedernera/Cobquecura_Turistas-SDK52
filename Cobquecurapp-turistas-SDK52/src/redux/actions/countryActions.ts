import { Dispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState, AppDispatch } from '../store/store';
import { Country } from '../types/types';
import { setCountries } from '../reducers/countriesReducer';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchCountries = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.get<Country[]>(`${API_URL}/countries`);
      dispatch(setCountries(response.data));
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  };
};
