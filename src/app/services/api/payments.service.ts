import { Injectable } from '@angular/core';
import axios from "axios";
import { IPaymentCreate, IPaymentRegister } from "../../interfaces/api/payment";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor() {}

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

      console.log(resultReq);

      resPay = {
        status: resultReq.status,
        message: 'Transacción Creada en DB',
        data: resultReq.data
      }

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
