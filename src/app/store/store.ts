import { combineReducers } from 'redux';
import {
  destinationReducer,
  spotsReducer,
  nearbySpotsReducer,
  tutorialReducer,
  placesReducer
} from './reducers';

import { Position, Spots, NearbySpots, TutorialState, Place } from '~/util';

// 'assemble' the full store out of modules
export interface IAppState {
  destination?: Position;
  spots?: Spots;
  nearbySpots?: NearbySpots;
  tutorial?: TutorialState;
  place?: Place;
}

export const rootReducer = combineReducers<IAppState>({
  destination: destinationReducer,
  spots: spotsReducer,
  nearbySpots: nearbySpotsReducer,
  tutorial: tutorialReducer,
  place: placesReducer
});
