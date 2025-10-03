// Define los métodos HTTP que puedes usar
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Interfaz genérica para la configuración de cualquier solicitud HTTP.
 * TBody: El tipo de dato que se espera en el cuerpo (body) de la petición (ej: { name: string }).
 */
export interface IRequest {
  /**
   * Método HTTP a utilizar (GET, POST, etc.).
   */
  method: HttpMethod;

  /**
   * URL o endpoint al que se enviará la petición (ej: '/users').
   */
  url: string;

  /**
   * Cuerpo de la petición. Es opcional para GET/DELETE, requerido para POST/PUT/PATCH.
   */
  data?: any;

  /**
   * Parámetros de consulta (query parameters) de la URL (ej: ?id=10).
   * Se usa Record<string, any> para permitir cualquier par clave-valor.
   */
  params?: Record<string, any>;

  /**
   * Encabezados (headers) de la petición (ej: Authorization, Content-Type).
   */
  headers?: Record<string, string>;
}

/**
 * Interfaz genérica para el formato de respuesta unificado de la aplicación.
 * TData: El tipo de dato que se espera en la carga útil (payload) de la respuesta exitosa.
 */
export interface IResponse {
  /**
   * Código de estado HTTP de la respuesta (ej: 200, 404, 500).
   * Nota: 0 se usa a menudo para errores de red/timeout.
   */
  status: number;

  /**
   * Mensaje descriptivo (ej: 'Success', 'Not Found', o mensaje de error).
   */
  message: string;

  /**
   * Los datos reales devueltos por la API en caso de éxito.
   * Usamos TData para tipar este contenido (ej: { id: 1, name: 'User' }).
   * Puede ser un objeto vacío {} en caso de error o éxito sin contenido (status 204).
   */
  data?: any;
}

