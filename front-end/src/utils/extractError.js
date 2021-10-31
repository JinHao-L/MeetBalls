import { isNil } from 'lodash';

export const extractError = (error) => {
  if (error?.response) {
    const errorMessage = error.response?.data?.message;
    if (!isNil(errorMessage)) {
      if (!Array.isArray(errorMessage)) {
        return errorMessage;
      } else {
        return errorMessage.map((message) => message).join(', ');
      }
    } else {
      return error.message;
    }
  }
};
