import { Injectable } from '@angular/core';
import axios from 'axios';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import {
  IPrintTicket,
  IUploadFile,
} from 'src/app/interfaces/printer.interface';
import { handleApiError } from 'src/app/utils/api-tools';
import { environment } from 'src/environments/environment';
import { LogService } from '../log.service';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private dateNew: Date = new Date();
  private headersReq = {
    'Content-Type': 'application/json',
    'x-tkn': environment.API_PRINTER_TOKEN,
  };

  constructor(private _logService: LogService) { }

  /**
   * @description: Funcion para imprimir un ticket
   * @param _dataTiket
   * @returns
   */
  public async ticketCreateAndUpload(
    dataTiket: IPrintTicket
  ): Promise<IResponse> {
    let res: IResponse;

    try {
      // Validate file data
      if (!dataTiket) {
        res = {
          status: 400,
          message:
            'No se ha proporcionado la informacion para generar el ticket digital.',
        };

        return res;
      }

      const bodyReq: IRequest = {
        url: `${environment.API_Printer}/pdf/ticket-and-print`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-tkn': environment.API_PRINTER_TOKEN,
        },
        data: dataTiket,
      };

      const resultReq = await axios.request(bodyReq);

      res = {
        status: resultReq.status,
        message: 'Ticket digital creado.',
        data: resultReq.data.data,
      };

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'TICKET-FILE',
        is_success: true,
        http_method: 'POST',
        status: res.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: res.status.toString(),
        res_body: JSON.stringify(res.data),
        numSubscriber: null,
      });

      console.log('TICKET CREATE Y UPLOAD: \n', res);

      return res;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'PAYMENT-CREATE',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}/pdf/ticket-and-print`,

        req_body: JSON.stringify(dataTiket),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  // TODO: ESTA CLABEADO ORDENAR EL TEMA DE UN INICIO DE SESION PARA ESTAS MAQUINAS YA QUE NO PRODREMOS OBTENER LAS MAC ADDRESS
  /**
   * @description: Function to get the mac address string
   * @returns `string`
   */
  getMacAddress(): Promise<string> {
    // return new Promise<string>((resolve, reject) => {
    //   const url = environment.API_Printer + '/divice-info/mac';
    //   axios
    //     .get(url, { headers: this.headersReq })
    //     .then((res) => {
    //       resolve(res.data.data);
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     });
    // });
    return new Promise<string>((resolve, _reject) => {
      resolve('50:9a:4c:50:df:4e');
    });
  }
}
