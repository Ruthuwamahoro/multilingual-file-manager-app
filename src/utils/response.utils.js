class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
      });
    }
  
    static error(res, message = 'Error occurred', statusCode = 500, error = null) {
      const response = {
        success: false,
        message,
      };
  
      if (error) {
        response.error = process.env.NODE_ENV === 'development' ? error.toString() : 'Internal server error';
      }
  
      return res.status(statusCode).json(response);
    }
  }
  
  class ApiError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = {
    ApiResponse,
    ApiError,
  };