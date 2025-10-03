import { Injectable } from '@angular/core';
import axios from 'axios';
import { IUbiiposDataSend } from 'src/app/interfaces/api/ubiipos';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LocalstorageService } from '../localstorage.service';
import { LogService } from '../log.service';
import { ILog } from 'src/app/interfaces/log.interface';

@Injectable({
  providedIn: 'root'
})
export class UbiiposService {

  // Endpoint
  // POST ipAddress:8080/api/spPayment

  constructor(
    private _logService: LogService,
    private _localStorageService: LocalstorageService
  ) { }

    //#--------------------------------Test Ubiipos---------------------------------------#//
  async testUbiipos(iptest: string): Promise<IResponse> {

    let resReturn: IResponse;

    try {
      // Validate `iptest`
      if (!iptest) {
        resReturn = {
          status: 400,
          message: 'IP address is required'
        }

        return resReturn;
      }

      const bodyReq: IRequest = {
        url: `${iptest}/api/spPayment`,
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          paymentId: 'fibexUbii',
          customerId: '1000000',
          amount: 100,
          operation: 'PAYMENT'
        },
      }

      // Make request
      const response = await axios(bodyReq);

      resReturn = {
        status: response.status,
        message: response.statusText,
        data: response.data as any
      }

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

      return resReturn;
    } catch (error) {
      console.error(error);

      // Body Request
      const bodyReq: IRequest = {
        url: `${iptest}/api/spPayment`,
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          paymentId: 'fibexUbii',
          customerId: '1000000',
          amount: 100,
          operation: 'PAYMENT'
        },
      }

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
        message: errorMessage
      }

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

      return errRes;
    }
  }
  //#--------------------------------------------------------------------------------------#//

  //#--------------------------------Payment Ubiipos---------------------------------------#//
  async paymentUbiipos(request: IUbiiposDataSend){
    let resReturn: IResponse;

    try {
      // Get host
      const hostUbii: string = this._localStorageService.get<string>('ubiiposHost') ?? '';

      // Get url
      const url: string | null = hostUbii ? `${hostUbii}/api/spPayment` : null;

      // Validate url
      if (!url) {
        resReturn = {
          status: 400,
          message: 'Ubiipos host is not configured'
        }
        return resReturn;
      }

      // Get body
      const body: IUbiiposDataSend = {
        paymentId: "fibexUbii",
        ...request
      };

      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: body
      }

      // Make request
      const response = await axios(bodyReq);

      resReturn = {
        status: response.status,
        message: response.statusText,
        data: response.data as any
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS',
        is_success: true,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(body),
        res_code: response.data.TRANS_CODE_RESULT,
        res_body: resReturn.data,
        numSubscriber: 'N/A',
      });

      return resReturn;
    } catch (error) {
      console.error(error);

      let statusCode = 500;
      let errorMessage = 'Unknown error';
      // Get body
      const body: IUbiiposDataSend = {
        paymentId: "fibexUbii",
        ...request
      };

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
        message: errorMessage
      }

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${this._localStorageService.get<string>('ubiiposHost')}/api/spPayment`,
        req_body: JSON.stringify(body),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: 'N/A',
      });

      return errRes;
    }
  }
  //#--------------------------------------------------------------------------------------#//

}
