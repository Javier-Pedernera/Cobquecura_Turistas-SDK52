import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TouristPoint, Rating } from '../types/types';

interface TouristPointState {
  touristPoints: TouristPoint[];
  selectedTouristPoint: TouristPoint | null;
  ratings: Rating[];
  error: string | null;
}

const initialState: TouristPointState = {
  touristPoints: [],
  selectedTouristPoint: null,
  ratings: [],
  error: null,
};

const touristPointSlice = createSlice({
  name: 'touristPoints',
  initialState,
  reducers: {
    setTouristPoints: (state, action: PayloadAction<TouristPoint[]>) => {
      state.touristPoints = action.payload;
      state.error = null; 
    },
    setSelectedTouristPoint: (state, action: PayloadAction<TouristPoint>) => {
      state.selectedTouristPoint = action.payload;
      state.error = null;
    },
    clearSelectedTouristPoint: (state) => {
      state.selectedTouristPoint = null;
    },
    clearRatingsTouristPoint: (state) => {
      state.ratings = [];
    },
    setRatings: (state, action: PayloadAction<Rating[]>) => {
      state.ratings = action.payload;
      state.error = null; 
    },
    addRating: (state, action: PayloadAction<Rating>) => {
      state.ratings.push(action.payload);
    },
    updateRating: (state, action: PayloadAction<Rating>) => {
      const index = state.ratings.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.ratings[index] = action.payload;
      }
    },
    deleteRating: (state, action: PayloadAction<number>) => {
      state.ratings = state.ratings.filter(r => r.id !== action.payload);
    },
    updateTouristPoint: (state, action: PayloadAction<TouristPoint>) => {
      const index = state.touristPoints.findIndex(tp => tp.id === action.payload.id);
      if (index !== -1) {
        state.touristPoints[index] = action.payload;
      }
    },
    setTouristPointsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setRatingsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTouristPoints,
  setSelectedTouristPoint,
  clearSelectedTouristPoint,
  setRatings,
  addRating,
  updateRating,
  deleteRating,
  updateTouristPoint,
  setTouristPointsError,
  setRatingsError,
  clearRatingsTouristPoint
} = touristPointSlice.actions;

export default touristPointSlice.reducer;
