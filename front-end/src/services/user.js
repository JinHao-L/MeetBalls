import server from './server';

export const getUser = () => {
  return server.get(`user/me`);
};

export const getUserById = async (uuid) => {
  return server.get(`user/${uuid}`);
};
