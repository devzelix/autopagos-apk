export interface ILog {
  // id_log: number,
  dateTime: Date; // ISO string format
  // id_checkout: number,
  log_type: string;
  is_success: boolean;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  route_api: string;
  // ip_address: string,
  req_body: string;
  res_code: string;
  res_body?: string | null;
  numSubscriber?: string | null;
}

export type IPromptLog = {
  dateTime: ILog['dateTime'],
  log_type: ILog['log_type'],
  http_method: ILog['http_method'],
  status: ILog['status'],
  numSubscriber: ILog['numSubscriber'],
  req_body: ILog['req_body'],
  res_code: ILog['res_code'],
  res_body: ILog['res_body'],
  route_api: ILog['route_api'],
  is_success: ILog['is_success'],/* The `request_body` property in the `ILog` interface is used to store the body of the HTTP request. It can hold any type of data or be undefined if there is no request body associated with the log entry. In the `IPromptLog` type, `request_body` is an optional property that can be included when creating a prompt log object. */
}
