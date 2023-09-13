import { APIError } from '../utils/APIError.js'

export const errorHandler = (err, req, res, next) => {
  if (err instanceof APIError) {
    const { statusCode, success, message: error, errors } = err;
    if(!errors)
      return res.status(statusCode).json({ success, error });
    else
      return res.status(statusCode).json({ success, errors });
  }
  return res.status(500).json({ success: false, error: err.message });
}