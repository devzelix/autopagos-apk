import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministrativeRequestService {

  constructor() { }

  //#------------------------------Print the Last Voucher-------------------------------------#//
  printLastVoucher(ci: string, register: string){ //Print the Last Voucher

    const url = environment.API_URL_VPOS+'/administrative/print/last-voucher';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-----------------------------------------------------------------------------------------#//

  //#-------------------------Print the last processed voucher--------------------------------#//
  printLastVoucherP(ci: string, register: string){ //Print the last processed voucher

    const url = environment.API_URL_VPOS+'/administrative/print/last-voucher-processed';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-----------------------------------------------------------------------------------------#//

  //#---------------------------Pre-closing of cash register----------------------------------#//
  pre_closeCashRegister(ci: string, register: string){ //Pre-closing of cash register

    const url = environment.API_URL_VPOS+'/administrative/close/pre-closing-cash-register';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-----------------------------------------------------------------------------------------#//

  //#-------------------------------Closing of cash register----------------------------------#//
  closeCashRegister(ci: string, register: string){ //Closing of cash register

    const url = environment.API_URL_VPOS+'/administrative/close/closing-cash-register';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-----------------------------------------------------------------------------------------#//

  //#-----------------------Reprint of the last Closing Voucher-------------------------------#//
  re_printLastCloseVoucher(ci: string, register: string){ //Reprint of the last Closing Voucher

    const url = environment.API_URL_VPOS+'/administrative/request/re-print-last-closing-vouche';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-----------------------------------------------------------------------------------------#//


  //#-----------------------Anulation Transaction-------------------------------#//
  anulationPayment(ci: string, numSeq: string, register: string){ //Reprint of the last Closing Voucher

    console.warn('anulationPayment', 'ci', ci, 'numSeq', numSeq, 'register', register);

    const url = environment.API_URL_VPOS+'/administrative/payment/anulation';

    const header = {
      'accept': 'application/json',
      'token': environment.TokenAPILaravelVPOS,
      'Content-Type': 'application/json',
    };

    const body = {
      'ci': ci,
      'register': register,
      'numSeq': numSeq
    };

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: url,
          headers: header,
          data: body
        }).then(res => {
            console.log(res);
            resolve(res)
          })
          .catch(err => {
            console.log(err);
            reject(err)
        });

      } catch (error) {
        reject(error);
      }

    });

    // alert('This function is not implemented yet!');

  }
  //#-----------------------------------------------------------------------------------------#//

}
