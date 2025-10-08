import { Injectable } from '@angular/core';
import axios from 'axios';
import { IUbiiposDataSend } from 'src/app/interfaces/api/ubiipos';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LocalstorageService } from '../localstorage.service';
import { LogService } from '../log.service';
import { ILog } from 'src/app/interfaces/log.interface';
import { handleApiError } from 'src/app/utils/api-tools';

@Injectable({
  providedIn: 'root'
})
export class UbiiposService {

  constructor(
    private _logService: LogService,
    private _localStorageService: LocalstorageService
  ) { }

  /**
   * UBIIPOS TEST
   * @param iptest: string
   * @returns resReturn: IResponse
   */
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
          Accept: 'application/json',
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
      const response = await axios.request(bodyReq);

      resReturn = {
        status: response.status,
        message: response.data.TRANS_MESSAGE_RESULT !== '' ? response.data.TRANS_MESSAGE_RESULT : response.statusText,
        data: response.data as any
      }

      console.log('testUbiipos: \n', resReturn);

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
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      return resReturn;
    } catch (error) {

      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${iptest}/api/spPayment`,
        req_body: JSON.stringify({
          paymentId: 'fibexUbii',
          customerId: '1000000',
          amount: 100,
          operation: 'PAYMENT'
        }),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  /**
   * PAYMENT UBIIPOS
   * @param request: IUbiiposDataSend
   * @returns resReturn: IResponse
   */
  async paymentUbiipos(request: IUbiiposDataSend): Promise<IResponse>{
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

        // LOGS SAVE ERROR
        this._logService.storagelog({
          dateTime: new Date(),
          log_type: 'UBIIPOS',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this._localStorageService.get<string>('ubiiposHost') ? `${this._localStorageService.get<string>('ubiiposHost')}/api/spPayment` : resReturn.message,
          req_body: JSON.stringify({
            paymentId: "fibexUbii",
            ...request
          }),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber:  null,
        });

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
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: body
      }

      // Make request
      const response = await axios.request(bodyReq);

      console.log('RESPONSE UBIIPOS: \n', response);

      resReturn = {
        status: response.status,
        message: response.data.TRANS_MESSAGE_RESULT !== '' ? response.data.TRANS_MESSAGE_RESULT : response.statusText,
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
        res_body: JSON.stringify(resReturn.data),
        numSubscriber:  null,
      });

      return resReturn;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${this._localStorageService.get<string>('ubiiposHost')}/api/spPayment`,
        req_body: JSON.stringify({
          paymentId: "fibexUbii",
          ...request
        }),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }
  }

  /**
   * UBIPOS PRINT TICKET
   * @returns resReturn: IResponse
   */
  async printTicket(): Promise<IResponse>{
    let resReturn: IResponse;

    const bodyPrint: IUbiiposDataSend = {
      paymentId: "fibexUbii",
      operation: "PRINT"
    }

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

        // LOGS SAVE ERROR
        this._logService.storagelog({
          dateTime: new Date(),
          log_type: 'UBIIPOS-PRINT',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this._localStorageService.get<string>('ubiiposHost') ? `${this._localStorageService.get<string>('ubiiposHost')}/api/spPayment` : resReturn.message ,
          req_body: JSON.stringify(bodyPrint),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber:  null,
        });

        return resReturn;
      }
      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: bodyPrint
      }

      // Make request
      const response = await axios.request(bodyReq);

      resReturn = {
        status: response.status,
        message: response.statusText,
        data: response.data as any
      }

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-PRINT',
        is_success: true,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyPrint),
        res_code: resReturn.message,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber:  null,
      });

      return resReturn;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-PRINT',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${this._localStorageService.get<string>('ubiiposHost')}/api/spPayment`,
        req_body: JSON.stringify(bodyPrint),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber:  null,
      });

      return errRes;
    }
  }

}
