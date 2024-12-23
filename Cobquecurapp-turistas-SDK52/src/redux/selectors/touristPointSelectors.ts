import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store/store';

// Selector para puntos turísticos
export const selectTouristPoints = (state: RootState) => state.touristPoints.touristPoints;

export const getMemoizedTouristPoints = createSelector(
  [selectTouristPoints],
  (touristPoints) => touristPoints.map(point => ({ ...point }))
);

// Selector para valoraciones
export const selectRatings = (state: RootState) => state.touristPoints.ratings;

export const getMemoizedRatings = createSelector(
  [selectRatings],
  (ratings) => ratings.map(rating => ({ ...rating }))
);

// Selector para obtener el punto turístico seleccionado
export const selectSelectedTouristPoint = (state: RootState) => state.touristPoints.selectedTouristPoint;

// Versión memoizada
export const getMemoizedSelectedTouristPoint = createSelector(
  [selectSelectedTouristPoint],
  (selectedTouristPoint) => (selectedTouristPoint ? { ...selectedTouristPoint } : null)
);