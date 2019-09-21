import {
  call, put, takeLatest,
} from 'redux-saga/effects';

import request from 'utils/request';
import actions from './actions';

import actionTypes from './actionTypes';

/**
 * login
 * @param {object} data
 * @yield {Object}
 */
export function* getTodos() {
  const requestURL = `${process.env.API_URL}/todos`;
  try {
    const result = yield call(request, requestURL);
    yield put(actions.onGetTodosSuccess(result));
  } catch (err) {
    yield put(actions.onGetTodosFailed(err));
  }
}

// Root saga
export default function* rootSaga() {
  yield takeLatest(actionTypes.GET_TODOS_LOADING, getTodos);
}
