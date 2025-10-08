import { Injectable } from '@angular/core';

import axios from "axios";
import { Base64Service } from "./base64.service";
import * as mime from "mime-types";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LogService } from '../log.service';
import { handleApiError } from 'src/app/utils/api-tools';

@Injectable({
  providedIn: 'root'
})
export class CMSfileService {

  constructor(
    private _base64Service: Base64Service,
    private _logService: LogService
  ) { }


  /**
   * @description Upload File to cms server
   * @param pathRoute
   * @param name
   * @returns url: string
   */
  public async uploadFile(pathRoute: string, name: string) {
    let resReturn: IResponse;

    try {
      // Validate file data
      if (!pathRoute) {
        resReturn = {
          status: 400,
          message: 'No se ha proporcionado la ruta del archivo para subir'
        }

        return resReturn;
      }

      const type = mime.lookup(pathRoute);
      const base64 = await this._base64Service.encodeFile(pathRoute);

      const bodyReq: IRequest = {
        url: `${environment.URL_API_CMS}/${environment.SUFIJOUP_CMS}`,
        method: 'POST',
        headers: {
          Accept: "application/json",
          'TokenAuth': environment.TOKEN_CMS,
          'Authorization': `Basic ${btoa(`${environment.USER_CMS}:${environment.PASS_CMS}`)}`
        },
        data: {
          file: `data:${type};base64, ${base64}`,
          name: name,
          folder: 'Auto_Pago_Files'
        }
      }

      const resultReq = await axios.request(bodyReq);

      console.log('uploadFile: \n', resultReq);

      resReturn = {
        status: resultReq.status,
        message: 'Archivo subido con exito',
        data: resultReq.data
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UPLOAD-FILE-TO-CMS',
        is_success: true,
        http_method: 'POST',
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: resReturn.status.toString(),
        res_body: JSON.stringify(resReturn.data),
        numSubscriber:  null,
      });

      return resReturn;

    } catch (error) {
      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UPLOAD-FILE-TO-CMS',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_CMS}/${environment.SUFIJOUP_CMS}`,
        req_body: JSON.stringify({
          file: `data:Type;base64, base64`,
          name: name,
          folder: 'Auto_Pago_Files'
        }),
        res_code: errRes.status.toString(),
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }
  }
}
