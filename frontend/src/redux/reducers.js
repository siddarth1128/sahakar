import { combineReducers } from 'redux';
import { SET_USER, LOGOUT } from './actions';

// user slice
const initialUserState = {
  user: null,
  isAuthenticated: false,
};

function userReducer(state = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true };
    case LOGOUT:
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
}

export default combineReducers({
  user: userReducer,
});