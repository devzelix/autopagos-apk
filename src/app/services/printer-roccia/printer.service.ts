import { Injectable } from '@angular/core';
import axios from 'axios';
import { IPrintTicket, IUploadFile } from 'src/app/interfaces/printer.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private headersReq = {
    'Content-Type': 'application/json',
    'x-tkn': environment.API_PRINTER_TOKEN,
  };

  constructor() {}

  /**
   * @description: Funcion para imprimir un ticket
   * @param _dataTiket
   * @returns
   */
  printTitek(_dataTiket: IPrintTicket) {
    return new Promise((resolve, reject) => {
      try {
        if (_dataTiket) {
          axios({
            method: 'post',
            url: environment.API_Printer + '/pdf/ticket-and-print',
            headers: this.headersReq,
            data: {
              date: _dataTiket.date.toString(),
              hours: _dataTiket.hours.toString(),
              refNumber: _dataTiket.refNumber.toString(),
              numSeq: _dataTiket.numSeq.toString(),
              abononumber: _dataTiket.abononumber.toString(),
              status: _dataTiket.status.toString(),
              describe: _dataTiket.describe.toString(),
              amount: _dataTiket.amount.toString(),
              methodPayment: _dataTiket.methodPayment.toString(),
              checkoutIdentify: _dataTiket.checkoutIdentify.toString(),
              is_anulation: _dataTiket.is_anulation,
            },
          })
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(
            new Error(
              'Validacion invalida, verifica los campos e intenta de nuevo.'
            )
          );
        }
      } catch (error) {
        reject(error);
      }
    });
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
      resolve('50:9a:4c:50:df:4e')
    });

  }

  /**
   * @description: Function to upload the file to the printer
   * @param file `File` to upload
   */
  uploadFile(data: IUploadFile): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = environment.API_Printer + '/pdf/closing-and-upload';
      axios
        .post(url, data, { headers: this.headersReq })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
