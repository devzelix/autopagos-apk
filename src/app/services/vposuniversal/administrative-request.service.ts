import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministrativeRequestService {

  constructor() { }

  //#------------------------------Print the Last Voucher-------------------------------------#//
  printLastVoucher(){ //Print the Last Voucher

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: environment.API_URL_VPOS+'/api/adminstrative/print/lastvaouvher',
          /*data: {
            "accion":"imprimeUltimoVoucher"
          }*/
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
  printLastVoucherP(){ //Print the last processed voucher

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: environment.API_URL_VPOS+'/api/adminstrative/print/lastvaouvher/processed',
          /*data: {
            "accion":"imprimeUltimoVoucherP"
          }*/
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
  pre_closeCashRegister(){ //Pre-closing of cash register

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: environment.API_URL_VPOS+'/api/administrative/closingbox/pre-closing',
          /*data: {
            "accion":"precierre"
          }*/
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
  closeCashRegister(){ //Closing of cash register

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: environment.API_URL_VPOS+'/api/administrative/closingbox',
          /*data: {
            "accion":"precierre"
          }*/
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
  re_printLastCloseVoucher(){ //Reprint of the last Closing Voucher

    return new Promise((resolve, reject)=>{
      try {
        axios({
          method: 'post',
          url: environment.API_URL_VPOS+'/api/administrative/closingbox/re-print/lastvaucherclosing',
          /*data: {
            "accion":"UltimoCierre"
          }*/
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

}
