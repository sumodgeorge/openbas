import Immutable from 'seamless-immutable';
import * as R from 'ramda';
import { FORM_ERROR } from 'final-form';
import FileSaver from 'file-saver';
import * as Constants from '../constants/ActionTypes';
import { api } from '../Network';

export const submitForm = (formId) => {
  document
    .getElementById(formId)
    .dispatchEvent(new Event('submit', { cancelable: true }));
};

export const fileSave = (uri, filename) => () => api()
  .get(uri, { responseType: 'blob' })
  .then((response) => {
    FileSaver.saveAs(response.data, filename);
  });

export const fileDownload = (uri) => () => api().get(uri, { responseType: 'blob' });

export const simpleCall = (uri) => api().get(uri);

export const getReferential = (schema, uri, noloading) => (dispatch) => {
  if (noloading !== true) {
    dispatch({ type: Constants.DATA_FETCH_SUBMITTED });
  }
  return api(schema)
    .get(uri)
    .then((response) => {
      dispatch({ type: Constants.DATA_FETCH_SUCCESS, payload: response.data });
      return response.data;
    })
    .catch((error) => {
      dispatch({ type: Constants.DATA_FETCH_ERROR, payload: error });
      throw error;
    });
};

export const putReferential = (schema, uri, data) => (dispatch) => {
  dispatch({ type: Constants.DATA_FETCH_SUBMITTED });
  return api(schema)
    .put(uri, data)
    .then((response) => {
      dispatch({ type: Constants.DATA_FETCH_SUCCESS, payload: response.data });
      dispatch({ type: Constants.DATA_UPDATE_SUCCESS, payload: response.data });
      return response.data;
    })
    .catch((error) => {
      dispatch({ type: Constants.DATA_FETCH_ERROR, payload: error });
      throw error;
    });
};

export const postReferential = (schema, uri, data) => (dispatch) => {
  dispatch({ type: Constants.DATA_FETCH_SUBMITTED });
  return api(schema)
    .post(uri, data)
    .then((response) => {
      dispatch({ type: Constants.DATA_FETCH_SUCCESS, payload: response.data });
      return response.data;
    })
    .catch((error) => {
      dispatch({ type: Constants.DATA_FETCH_ERROR, payload: error });
      throw error;
    });
};

export const delReferential = (uri, type, id) => (dispatch) => {
  dispatch({ type: Constants.DATA_FETCH_SUBMITTED });
  return api()
    .delete(uri)
    .then(() => {
      dispatch({
        type: Constants.DATA_DELETE_SUCCESS,
        payload: Immutable({ type, id }),
      });
    })
    .catch((error) => {
      dispatch({ type: Constants.DATA_FETCH_ERROR, payload: error });
      throw error;
    });
};
