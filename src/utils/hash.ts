import crypto from 'crypto-js'

export const hashEmail = (email: any) => {
  return crypto.MD5(email).toString();
};
