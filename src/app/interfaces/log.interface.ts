export interface ILog {
  // id_log: number,
  date_time: Date; // ISO string format
  // id_checkout: number,
  log_type: string;
  is_success: boolean;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  route_api: string;
  req_body: string;
  res_code: string;
  res_body?: string | null;
  numSubscriber?: string | null;
}

export type IPromptLog = {
  date_time: ILog['date_time'];
  log_type: ILog['log_type'];
  is_success: ILog['is_success'];/* The `request_body` property in the `ILog` interface is used to store the body of the HTTP request. It can hold any type of data or be undefined if there is no request body associated with the log entry. In the `IPromptLog` type, `request_body` is an optional property that can be included when creating a prompt log object. */
  http_method: ILog['http_method'];
  status: ILog['status'];
  route_api: ILog['route_api'];
  req_body: ILog['req_body'];
  res_code: ILog['res_code'];
  res_body: ILog['res_body'];
  numSubscriber: ILog['numSubscriber'];
}
