import server from '../services/server';
import { accessTokenKey, loginTypeKey } from '../common/CommonValues';

const setAuthToken = (token, type) => {
  if (token) {
    server.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    server.defaults.headers.common['X-Auth-Type'] = type;
    window.sessionStorage.setItem(accessTokenKey, token);
    localStorage.setItem(loginTypeKey, type);
    document.dispatchEvent(new Event(accessTokenKey));
  } else {
    delete server.defaults.headers.common['Authorization'];
    delete server.defaults.headers.common['X-Auth-Type'];
    window.sessionStorage.removeItem(accessTokenKey);
    document.dispatchEvent(new Event(accessTokenKey));
  }
};

export default setAuthToken;
