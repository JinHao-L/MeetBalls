import axios from 'axios';
import { toast } from 'react-toastify';
import { apiUrl, loginTypeKey, refreshTokenKey } from '../common/CommonValues';
import setAuthToken from '../utils/setAuthToken';

// https://github.com/axios/axios#config-defaults
const server = axios.create({
  baseURL: apiUrl,
});

server.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const refreshToken = localStorage.getItem(refreshTokenKey);
    if (
      originalRequest.url !== '' &&
      !originalRequest.url?.startsWith('auth/') &&
      err?.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      const type = localStorage.getItem(loginTypeKey);
      const pathKey = type === 'zoom' ? 'auth/zoom/refresh' : 'auth/refresh';

      return server
        .post(pathKey, null, {
          params: {
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          },
        })
        .then((res) => {
          if (res.status === 201) {
            const tokenObj = res.data;
            setAuthToken(tokenObj.access_token || null, type);
            localStorage.setItem(refreshTokenKey, tokenObj.refresh_token);
            return server(originalRequest);
          }
        })
        .catch((err) => {
          if (err?.response?.status === 401) {
            setAuthToken(null);
            localStorage.removeItem(refreshTokenKey);
            toast.error('Not logged in');
            return Promise.reject();
          }
        });
    }
    return Promise.reject(err);
  },
);

export default server;
