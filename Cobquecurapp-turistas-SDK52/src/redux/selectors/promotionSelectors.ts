import { createSelector } from 'reselect';
import { RootState } from '../store/store';
import { Promotion } from '../types/types';

const getPromotions = (state: RootState) => state.promotions.promotions;
const getSelectedPromotion = (state: RootState) => state.promotions.selectedPromotion;

export const getMemoizedPromotions = createSelector(
  [getPromotions],
  (promotions: Promotion[]) => {
    return promotions.map(promotion => ({ ...promotion }));
  }
);


export const getMemoizedSelectedPromotion = createSelector(
  [getSelectedPromotion],
  (selectedPromotion) => {
    return selectedPromotion ? { ...selectedPromotion } : null; 
  }
);