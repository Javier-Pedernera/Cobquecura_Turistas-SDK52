import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Branch, RatingBranch } from '../types/types';

export interface BranchState {
  branches: Branch[] | null;
  branchRatings: {
    ratings: RatingBranch[];
    average_rating: number;
    loading: boolean;
    error: string | null;
  };
}

const initialState: BranchState = {
  branches: null,
  branchRatings: {
    ratings: [],
    average_rating: 0,
    loading: false,
    error: null,
  },
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
    },
    clearBranches: (state) => {
      state.branches = null;
    },
    fetchBranchRatingsRequest: (state) => {
      state.branchRatings.loading = true;
      state.branchRatings.error = null;
    },
    fetchBranchRatingsSuccess: (state, action: PayloadAction<{ ratings: RatingBranch[], average_rating: number }>) => {
      state.branchRatings.ratings = action.payload.ratings;
      state.branchRatings.average_rating = action.payload.average_rating;
      state.branchRatings.loading = false;
    },
    fetchBranchRatingsFailure: (state, action: PayloadAction<string>) => {
      state.branchRatings.loading = false;
      state.branchRatings.error = action.payload;
    },
    addBranchRating: (state, action: PayloadAction<RatingBranch>) => {
      state.branchRatings.ratings.push(action.payload);
    },
    editBranchRating: (state, action: PayloadAction<RatingBranch>) => {
      const index = state.branchRatings.ratings.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.branchRatings.ratings[index] = action.payload;
      }      
    },
    deleteBranchRating: (state, action: PayloadAction<number>) => {
      state.branchRatings.ratings = state.branchRatings.ratings.filter(r => r.id !== action.payload);
    },
    clearBranchRatings: (state) => {
      state.branchRatings.ratings = [];
      state.branchRatings.average_rating = 0
    },
  },
});

export const {
  setBranches,
  clearBranches,
  fetchBranchRatingsRequest,
  fetchBranchRatingsSuccess,
  fetchBranchRatingsFailure,
  addBranchRating,
  editBranchRating,
  deleteBranchRating,
  clearBranchRatings
} = branchSlice.actions;
export default branchSlice.reducer;
