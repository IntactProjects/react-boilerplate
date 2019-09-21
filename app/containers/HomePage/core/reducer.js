import {
  setInitialState,
  setLoadingState,
  setSuccessState,
  setFailureState,
} from '@kai23/reduxutils';


import { LOCATION_CHANGE } from 'connected-react-router';
import actionTypes from './actionTypes';

const data = {
  todos: [],
};
export const initialState = setInitialState(actionTypes, data);

function homeReducer(state = initialState, action) {
  switch (action.type) {
    // ////////////
    // GET_USERS
    // ////////////
    case actionTypes.GET_TODOS_LOADING:
      return setLoadingState(state, 'getTodos');

    case actionTypes.GET_TODOS_SUCCESS:
      return setSuccessState(state, 'getTodos', { todos: action.result });

    case actionTypes.GET_TODOS_FAILED:
      return setFailureState(state, 'getTodos', action.error.responseJSON);

    case LOCATION_CHANGE:
      return { ...initialState };

    default:
      return state;
  }
}

export default homeReducer;
