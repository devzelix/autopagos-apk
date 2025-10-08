import { Injectable } from '@angular/core';
import axios from "axios";
import { IPaymentCreate, IPaymentRegister } from "../../interfaces/api/payment";
import { environment } from 'src/environments/environment';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LogService } from '../log.service';
import { handleApiError } from 'src/app/utils/api-tools';

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
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo
      };

      const resultReq = await axios.request(bodyReq);

      resPay = {
        status: resultReq.status,
        message: 'Transacción Registrada en SAE',
        data: resultReq.data
      }

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
      const errRes: IResponse = handleApiError(error);

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
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo
      };

      const resultReq = await axios.request(bodyReq);

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
      const errRes: IResponse = handleApiError(error);

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
