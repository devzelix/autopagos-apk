import axios from 'axios';
import { IResponse } from '../interfaces/api/handlerResReq';

export const handleApiError = (error: unknown): IResponse => {
  console.error(error);

  let statusCode = 500;
  let errorMessage = 'Unknown error';

  if (axios.isAxiosError(error)) {
    // Error de Axios
    if (error.response) {
      // Error del servidor (4xx o 5xx)
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || error.message;
    } else if (error.message === 'Network Error') {
      // Error de red
      statusCode = 404;
      errorMessage = 'Network Error: The request could not be completed.';
    } else {
      // Otros errores de Axios (como configuración)
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    // Error genérico de JavaScript
    statusCode = 400;
    errorMessage = error.message;
  }

  return {
    status: statusCode,
    message: errorMessage
  };
};
