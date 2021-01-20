// Axios API
import axios from 'axios';
import { normalize } from 'normalizr';
import Immutable from 'seamless-immutable';
import { debug } from './utils/Messages';

// eslint-disable-next-line import/prefer-default-export
export const api = (schema) => {
  const instance = axios.create({
    headers: { responseType: 'json' },
  });
    // Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(
    (response) => {
      if (schema) {
        const toImmutable = response.config.responseType === undefined; //= == json
        const dataNormalize = schema
          ? normalize(response.data, schema)
          : response.data;
        debug('api', {
          from: response.request.responseURL,
          data: { raw: response.data, normalize: dataNormalize },
        });
        response.data = toImmutable ? Immutable(dataNormalize) : dataNormalize;
      }
      return response;
    },
    (err) => {
      const res = err.response;
      // eslint-disable-next-line no-underscore-dangle
      if (res.status === 503 && err.config && !err.config.__isRetryRequest) {
        // eslint-disable-next-line no-param-reassign,no-underscore-dangle
        err.config.__isRetryRequest = true;
        return axios(err.config);
      }
      return Promise.reject(res.status);
    },
  );
  return instance;
};
