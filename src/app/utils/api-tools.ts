import axios from 'axios';
import { IResponse } from '../interfaces/api/handlerResReq';

/**
 * Procesa un error de API capturado (típicamente de una promesa) para normalizarlo
 * a un objeto de respuesta uniforme.
 * * Esta función es crucial para la gestión centralizada de errores en la aplicación.
 * Distingue entre:
 * 1. Errores de servidor (Axios con respuesta 4xx/5xx).
 * 2. Errores de red (Axios sin respuesta).
 * 3. Errores genéricos de JavaScript (e.g., TypeError).
 * 4. Errores desconocidos.
 * * @param error El objeto de error capturado, que puede ser de tipo `AxiosError`, `Error`, o `unknown`.
 * @returns Un objeto de respuesta estandarizado de tipo `IResponse` que contiene el código de estado (status)
 * y un mensaje de error legible (message).
 */
export const handleApiError = (error: unknown): IResponse => {
  console.error(error);

  let statusCode = 500;
  let errorMessage = 'Error desconocido';

  if (axios.isAxiosError(error)) {
    // Error de Axios
    if (error.response) {
      // Error del servidor (4xx o 5xx)
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || error.message || 'Error del servidor';
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      // Error de red
      statusCode = 0;
      errorMessage = 'Error de red: No se pudo establecer conexión. Verifique que la IP y el puerto sean correctos y que el servicio esté activo.';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      // Error de conexión rechazada o timeout
      statusCode = 0;
      errorMessage = 'Conexión rechazada o tiempo de espera agotado. Verifique que el dispositivo esté encendido y accesible.';
    } else {
      // Otros errores de Axios (como configuración)
      errorMessage = error.message || 'Error de conexión';
    }
  } else if (error instanceof Error) {
    // Error genérico de JavaScript
    statusCode = 400;
    errorMessage = error.message || 'Error inesperado';
  }

  return {
    status: statusCode,
    message: errorMessage
  };
};


/**
 * Clasifica el tipo de pago de una mensualidad comparando el monto pagado con el costo de la suscripción.
 * @param mountPaid - El monto que el cliente pagó.
 * @param subscriptionCost - El costo fijo de la mensualidad o suscripción.
 * @returns La descripción abreviada del tipo de pago.
 */
export function getPaymentDescription(mountPaid: number | string, subscriptionCost: number | string): string {
  // Aseguramos que ambos sean números para comparaciones precisas
  const monto = Number(mountPaid);
  const suscripcion = Number(subscriptionCost);

  // Usamos el switch(true) para evaluar las condiciones booleanas
  switch (true) {
    case monto === suscripcion:
      return 'Pago Mensualidad';

    case monto > suscripcion:
      return 'Adelanto Mensualidad';

    case monto < suscripcion:
      return 'Abono Mensualidad';

    default:
      // Caso para cualquier valor que resulte en NaN o lógica inesperada
      return 'Tipo de Pago Desconocido';
  }
}
