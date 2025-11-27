import { Injectable } from '@angular/core';
import axios from "axios";
import { IUpLoadFiles } from "../../interfaces/api/upload-files";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LogService } from '../log.service';
import { ILog } from 'src/app/interfaces/log.interface';
import { handleApiError } from 'src/app/utils/api-tools';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  constructor(
    private _logService: LogService
  ) {}

  /**
   * @description Upload files to the server through API-Master
   * @param fileInfo
   * @param is_anulation
   */
  public async uploadInvoice(fileInfo: IUpLoadFiles, is_anulation: boolean = false): Promise<IResponse>{
    let resReturn: IResponse;
    const typeFileUp = is_anulation ? "ticket-anulation" : "ticket";
    try {
      // Validate file data
      if (!fileInfo) {
        resReturn = {
          status: 400,
          message: 'No se ha proporcionado el archivo a subir'
        }

        // LOGS SAVE ERROR
        this._logService.storagelog({
          dateTime: new Date(),
          log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
          req_body: JSON.stringify(fileInfo),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber:  null,
        });

        return resReturn;
      }

      // Get config requets
      const configReq: IRequest = {
        url: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: environment.TOKEN_API_MASTER,
        },
        data: fileInfo
      }

      // Make request
      const response = await axios.request(configReq);

      // Response to return
      resReturn = {
        status: response.status,
        message: `File ${typeFileUp} created on DB.`,
        data: response.data as any
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
        is_success: true,
        http_method: configReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: configReq.url,
        req_body: JSON.stringify(fileInfo),
        res_code: response.status.toString(),
        res_body: JSON.stringify(resReturn.data),
        numSubscriber:  null,
      });

      return resReturn;
    } catch (error) {

      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        req_body: JSON.stringify(fileInfo),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }
  }

  /**
   * @description Upload Administration files to the server through API-Master
   * @param path Route path to file
   * @param is_closing boolean
   */
  public async uploadAdministrationFiles(fileInfo: IUpLoadFiles, is_closing: boolean = true): Promise<IResponse>{
    let resReturn: IResponse;
    const typeFileUp = is_closing ? "closing" : "pre-closing";
    try {
      // Validate file data
      if (!fileInfo) {
        resReturn = {
          status: 400,
          message: 'No se ha proporcionado el archivo a subir'
        }

        // LOGS SAVE ERROR
        this._logService.storagelog({
          dateTime: new Date(),
          log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
          req_body: JSON.stringify(fileInfo),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber:  null,
        });

        return resReturn;
      }

      // Get config requets
      const configReq: IRequest = {
        url: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: environment.TOKEN_API_MASTER,
        },
        data: fileInfo
      }

      // Make request
      const response = await axios.request(configReq);

      // Response to return
      resReturn = {
        status: response.status,
        message: `File ${typeFileUp} created on DB.`,
        data: response.data as any
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
        is_success: true,
        http_method: configReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: configReq.url,
        req_body: JSON.stringify(fileInfo),
        res_code: response.data.TRANS_CODE_RESULT,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber:  null,
      });

      return resReturn;
    } catch (error) {

      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: `UPLOAD-FILE-${typeFileUp.toUpperCase()}`,
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        req_body: JSON.stringify(fileInfo),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }
  }
}
