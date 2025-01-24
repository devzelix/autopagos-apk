export interface ILog {
    'dateTime': Date,
    'http_method': 'GET' | 'POST' | 'PUT' | 'DELETE',
    'status': number,
    'url_api': string,
    // 'ipAddress': string | number,
    'ciClient': string | number,
    // 'subscriberNum': string | number,
    // 'id_sede': string | number,
    // 'id_checkout': string | number,
    'mac_address': string | number,
    'response_code': string | Array<string>,
    // 'response_message': string,
    // 'additional_data'?: unknown,
    'duration_ms'?: number, // Obtener la duración de los atributos del request
    'is_success'?: boolean
    'request_body'?: any | undefined,
}

export type IPromptLog = {
  http_method: ILog['http_method'],
  status: ILog['status'],
  ciClient: ILog['ciClient'],
  response_code: ILog['response_code'],
  url_api: ILog['url_api'],
  'is_success': ILog['is_success'],/* The `request_body` property in the `ILog` interface is used to store the body of the HTTP request. It can hold any type of data or be undefined if there is no request body associated with the log entry. In the `IPromptLog` type, `request_body` is an optional property that can be included when creating a prompt log object. */
  request_body?: ILog['request_body'],}
