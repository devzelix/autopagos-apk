import { Injectable } from '@angular/core';
// import { LogService } from '../log.service';
import axios from 'axios';
import { UbiiposDataSend, UbiiposResponse } from 'src/app/interfaces/api/ubiipos';
import { LocalstorageService } from '../localstorage.service';
// import { IPromptLog } from 'src/app/interfaces/log.interface';

@Injectable({
  providedIn: 'root'
})
export class UbiiposService {

  // Endpoint
  // POST ipAddress:8080/api/spPayment

  constructor(
    // private _logService: LogService,
    private _localStorageService: LocalstorageService
  ) { }

    //#--------------------------------Test Ubiipos---------------------------------------#//
  async testUbiipos(iptest: string): Promise<UbiiposResponse> {

    try {

      // Validate `iptest`
      if (!iptest) {
        throw new Error('IP address is required');
      }

      // Make request
      const response = await axios.post(
        `${iptest}/api/spPayment`,
        {
          paymentId: 'fibexUbii',
          customerId: '1000000',
          amount: 100,
          operation: 'PAYMENT'
        },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      const res: UbiiposResponse = {
        status: response.status,
        message: response.statusText,
        data: response.data as any
      }

      return res;
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

      const errRes: UbiiposResponse = {
          status: statusCode,
          message: errorMessage,
          data: {}
      }
      return errRes;
    }
  }
  //#--------------------------------------------------------------------------------------#//

  //#--------------------------------Payment Ubiipos---------------------------------------#//
  async paymentUbiipos(request: UbiiposDataSend){

    try {
      // Get host
      const hostUbii: string = this._localStorageService.get<string>('ubiiposHost') ?? '';

      // Get url
      const url: string | null = hostUbii ? `${hostUbii}/api/spPayment` : null;

      // Validate url
      if (!url) {
        const res: UbiiposResponse = {
          status: 400,
          message: 'Ubiipos host is not configured',
          data: {}
        }
        return res;
      }

      // Get body
      const body: UbiiposDataSend = {
        paymentId: "fibexUbii",
        ...request
      };

      // Get headers
      const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }

      // Make request
      const response = await axios.post<UbiiposResponse, any>(url, body, {headers})

      const res: UbiiposResponse = {
        status: response.status,
        message: response.statusText,
        data: response.data as any
      }

      return res;
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

      const errRes: UbiiposResponse = {
          status: statusCode,
          message: errorMessage,
          data: {}
      }
      return errRes;
    }
  }
  //#--------------------------------------------------------------------------------------#//

}
