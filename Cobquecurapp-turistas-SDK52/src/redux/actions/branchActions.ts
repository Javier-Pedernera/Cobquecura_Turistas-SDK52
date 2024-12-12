import { Dispatch } from 'redux';
import { setBranches, clearBranches, fetchBranchRatingsRequest, fetchBranchRatingsSuccess, fetchBranchRatingsFailure, addBranchRating, editBranchRating, deleteBranchRating, clearBranchRatings } from '../reducers/branchReducer';
import { RootState } from '../store/store';
import axios from 'axios';
import { Branch, Rating, RatingBranch } from '../types/types';


const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchBranches = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const token = state.user.accessToken;

      if (!token) {
        throw new Error('User not authenticated');
      }
      const response = await axios.get<Branch[]>(`${API_URL}/branches`);
      
      // Filtrar solo las sucursales activas (que no estén eliminadas)
      const activeBranches = response.data.filter(branch => branch.status.name === "active");

      // Enviar las sucursales activas ordenadas al estado
      dispatch(setBranches(activeBranches));
    } catch (error) {
      throw error;
    }
  };
};

export const clearAllBranches = () => {
  return (dispatch: Dispatch) => {
    dispatch(clearBranches());
  };
};

export const fetchBranchRatings = (branchId: number) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(fetchBranchRatingsRequest());
    try {
      const response = await axios.get<{ ratings: RatingBranch[], average_rating: number }>(`${API_URL}/branches/${branchId}/ratings/all`);
      dispatch(fetchBranchRatingsSuccess(response.data));
    } catch (error:any) {
      dispatch(fetchBranchRatingsFailure(error.toString()));
    }
  };
};

export const addRating = (branchId: number, rating: RatingBranch) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const response = await axios.post<RatingBranch>(`${API_URL}/branches/${branchId}/ratings`, rating);
      dispatch(addBranchRating(response.data));
    } catch (error) {
      throw error;
    }
  };
};

export const editRating = (branchId: number, rating: RatingBranch) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const response = await axios.put<RatingBranch>(`${API_URL}/branches/ratings/${branchId}`, rating);
      dispatch(editBranchRating(response.data));
    } catch (error) {
      throw error;
    }
  };
};

export const deleteRating = (branchId: number, ratingId: number) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      await axios.delete(`${API_URL}/branches/ratings/${branchId}`, { data: { id: ratingId } });
      dispatch(deleteBranchRating(ratingId));
    } catch (error) {
      throw error;
    }
  };
};
export const clearBranchRatingsAction = () => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(clearBranchRatings());
  };
};