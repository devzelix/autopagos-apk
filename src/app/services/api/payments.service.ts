import { Injectable } from '@angular/core';
import axios from "axios";
import { IPaymentCreate, IPaymentRegister } from "../../interfaces/api/payment";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LogService } from '../log.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(
    private _logService: LogService,
  ) {}

  /**
   * Payment Register on SAE PLUS
   * @param paymenteInfo
   * @returns IResponse
   */
  public async paymentRegisterOnSAE (paymenteInfo: IPaymentRegister) {
    let resPay: IResponse;

    try {
      // Validate file data
      if (!paymenteInfo) {
        resPay = {
          status: 400,
          message: 'No se ha proporcionado la informacion de la transaccion a registrar'
        }

        return resPay;
      }

      const bodyReq: IRequest = {
        url: `${environment.URL_API_MASTER}/administrative/payment/register-payment`,
        method: 'POST',
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo
      };

      const resultReq = await axios(bodyReq);

      resPay = {
        status: resultReq.status,
        message: 'Transacción Creada en DB',
        data: resultReq.data
      }

      console.log('paymentRegisterOnSAE: \n', resPay);

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'REGISTER-SAE-PLUS',
        is_success: true,
        http_method: 'POST',
        status: resPay.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: resPay.status.toString(),
        res_body: JSON.stringify(resPay.data),
        numSubscriber:  null,
      });

      return resPay;

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
        message: errorMessage
      }

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'REGISTER-SAE-PLUS',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}/administrative/payment/register-payment`,
        req_body: JSON.stringify(paymenteInfo),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }

  }

  /**
   * Payment Create on Database
   * @param paymenteInfo
   * @returns IResponse
   */
  public async paymentCreate(paymenteInfo: IPaymentCreate) {
    let resPay: IResponse;

    try {
      // Validate file data
      if (!paymenteInfo) {
        resPay = {
          status: 400,
          message: 'No se ha proporcionado la informacion de la transaccion a guardar'
        }

        return resPay;
      }

      const bodyReq: IRequest = {
        url: `${environment.URL_API_MASTER}/administrative/payment/create-transaction`,
        method: 'POST',
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo
      };

      const resultReq = await axios(bodyReq);

      console.log(resultReq);

      resPay = {
        status: resultReq.status,
        message: 'Transacción Creada en DB',
        data: resultReq.data
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'CREATE-TRANSACTION',
        is_success: true,
        http_method: 'POST',
        status: resPay.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: resPay.status.toString(),
        res_body: JSON.stringify(resPay.data),
        numSubscriber:  null,
      });

      return resPay;

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
        message: errorMessage
      }

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'PAYMENT-CREATE',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}/administrative/payment/create-transaction`,
        req_body: JSON.stringify(paymenteInfo),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }

  }

}
