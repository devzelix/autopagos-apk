import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor() { }

  printTitek(_dataTiket: any){

    return new Promise((resolve, reject)=>{
      try {

        if(_dataTiket) {
          axios({
            method: 'post',
            url: environment.API_Printer+'/tikect/generate-print',
            data: {
              'date': String(_dataTiket[0]['date']),
              'hours': String(_dataTiket[0]['hours']),
              'refNumber': String(_dataTiket[0]['refundNumber']),
              'nameClient': String(_dataTiket[0]['nameClient']),
              'ciClient': String(_dataTiket[0]['ciClient']),
              'abononumber': String(_dataTiket[0]['abonumber']),
              'describe': String(_dataTiket[0]['describe']),
              'amount': String(_dataTiket[0]['amount']),
              'methodPayment': String(_dataTiket[0]['methodPayment']),
              'totalAmount': String(_dataTiket[0]['totalAmount']),
              'saldo': String(_dataTiket[0]['saldo']),
              'status': String(_dataTiket[0]['status']),
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

  getMacAddress(){
    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'get',
          url: environment.API_Printer+'/get-macaddress',
          data: {}
        }).then(res => {
            resolve(res)
          })
          .catch(err => {
            reject(err)
        });
      } catch (error) {
        reject(error);
      }

    });

  }

}
