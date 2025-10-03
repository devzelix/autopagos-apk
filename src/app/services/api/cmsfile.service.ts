import { Injectable } from '@angular/core';

import axios from "axios";
import { Base64Service } from "./base64.service";
import * as mime from "mime-types";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';

@Injectable({
  providedIn: 'root'
})
export class CMSfileService {

  constructor(
    private _base64Service: Base64Service
  ) { }

  /**
   * @description Upload files to the server through API-Master
   * @param fileInfo
   * @param is_anulation
   */
  // public async uploadFile(pathRoute: string, name: string) {
  //   try {
  //     // Validate file data
  //     if (!pathRoute) {
  //       throw new Error('No se ha proporcionado la ruta del archivo para subir');
  //     }

  //     const type = mime.lookup(pathRoute);
  //     const base64 = await this._base64Service.encodeFile(pathRoute);

  //     const headers_req = {
  //       Accept: "application/json",
  //       'TokenAuth': environment.TOKEN_CMS,
  //       'Authorization': `Basic ${btoa(`${environment.USER_CMS}:${environment.PASS_CMS}`)}`,
  //     };

  //     const data_req = {
  //       file: `data:${type};base64, ${base64}`,
  //       name: name,
  //       folder: 'Auto_Pago_Files',
  //     };

  //     return await axios({
  //       url: `${environment.URL_API_CMS}/${environment.SUFIJOUP_CMS}`,
  //       method: "POST",
  //       headers: headers_req,
  //       data: data_req,
  //     })
  //     .then((res) => {
  //       return Promise.resolve(res.data);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       return Promise.reject(err);
  //     });

  //   } catch (err) {
  //     console.error(err);
  //     throw new Error('Error al subir el archivo');
  //   }
  // }

   /**
   * @description Upload files to the server through API-Master
   * @param fileInfo
   * @param is_anulation
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

      const dataReq: IRequest = {
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

      const resultReq = await axios(dataReq);

      console.log(resultReq);

      resReturn = {
        status: resultReq.status,
        message: 'Archivo subido con exito',
        data: resultReq.data
      }

      return resReturn;

    } catch (error) {
     console.error(error);

      let statusCode = 500;
      let errorMessage = 'Unknown error';

      if (axios.isAxiosError(error)) {
        // Ahora TypeScript sabe que 'error' es un error de Axios
        if (error.response) {
            // Error del servidor (4xx o 5xx)
            statusCode = error.response.status;
            errorMessage = error.response.data?.message || error.message;
        } else if (error.message === 'Network Error') {
            // Error de red
            statusCode = 0;
            errorMessage = 'Network Error: The request could not be completed.';
        } else {
            // Otros errores de Axios (como configuración)
            errorMessage = error.message;
        }

      } else if (error instanceof Error) {
        // Tu error de validación ('IP address is required')
        statusCode = 400;
        errorMessage = error.message;
      }

      const errRes: IResponse = {
        status: statusCode,
        message: errorMessage,
        data: {}
      }
      return errRes;
    }
  }
}

/**
 // ---------------------------------- LOGS try
 // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: true,
        http_method: 'POST',
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: response.data.TRANS_CODE_RESULT,
        res_body: resReturn.data,
        numSubscriber: 'N/A',
      });

    // ---------------------------------- LOGS CATCH
    // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: 'N/A',
      });
 */
