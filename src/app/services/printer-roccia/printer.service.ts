import { Injectable } from '@angular/core';
import axios from 'axios';
import { IPrintTicket, IUploadFile } from 'src/app/interfaces/printer.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  private headersReq = {
    'Content-Type': 'application/json',
    'x-tkn': environment.API_PRINTER_TOKEN
  }

  constructor() { }

  printTitek(_dataTiket: IPrintTicket){

    return new Promise((resolve, reject)=>{
      try {

        if(_dataTiket) {
          axios({
            method: 'post',
            url: environment.API_Printer+'/pdf',
            headers: this.headersReq,
            data: {
              'date': String(_dataTiket.date),
              'hours': String(_dataTiket.hours),
              'refNumber': String(_dataTiket.refundNumber),
              'numSeq': String(_dataTiket.numSeq),
              'abononumber': String(_dataTiket.abononumber),
              'status': String(_dataTiket.status),
              'describe': String(_dataTiket.describe),
              'amount': String(_dataTiket.amount),
              'methodPayment': String(_dataTiket.methodPayment),
            }
          }).then(res => {
              resolve(res)
            })
            .catch(err => {
              reject(err)
          });
        }else{
          reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
        }

      } catch (error) {
        reject(error);
      }

    });

  }

  /**
   * Function to get the mac address string
   * @returns `string`
   */
  getMacAddress(): Promise<string>{
    return new Promise<string>((resolve, reject)=>{
      const url = environment.API_Printer+'/divice-info/mac'
      axios.get(url, {headers: this.headersReq})
      .then(res => {
        resolve(res.data.data)
      })
      .catch(err => {
        reject(err)
      });
    });
  }

  /**
   * Function to upload the file to the printer
   * @param file `File` to upload
   */
  uploadFile(data: IUploadFile): Promise<any>{
    return new Promise((resolve, reject)=>{
      const url = environment.API_Printer+'/upload-file';
      axios.post(url, data, {headers: this.headersReq})
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
    });
  }

}
