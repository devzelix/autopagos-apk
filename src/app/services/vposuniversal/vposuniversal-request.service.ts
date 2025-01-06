import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VposuniversalRequestService {

  constructor() { }

  //#-----------------------------Conect to API and Test-----------------------------------#//
  // closeAPI(){//Close Conecction to API
  //   axios.get(environment.API_URL_VPOS+'/api/donwservice')
  //   .then(res => console.log(res))
  //   .catch(err => console.log(err));
  // }

  statusOK(_dataApi: any){//Test connection to API
    axios.get(environment.API_URL_VPOS+'/api/pingpage')
    .then(res => _dataApi = res).then(res => console.log(res))
    .catch(err => console.log(err));
    //this.closeAPI();
  }
  //#--------------------------------------------------------------------------------------#//

  //#--------------------------------Card pay Simple---------------------------------------#//
  cardRequest(_ci: any, _amount: string, _subscriber: string, _register: string){ //Pay Card Simple

    return new Promise((resolve, reject)=>{
      try {

        if(_ci != null && _ci != '' && _amount ) {
          axios({
            method: 'post',
            url: environment.API_URL_VPOS+'/metodo/request/cardpay',
            headers: {
              'accept': 'application/json',
              'token': environment.TokenAPILaravelVPOS,
              'Content-Type': 'application/json',
              },
            data : {
               "monto": _amount,
                "ci": _ci,
                "subscriber": _subscriber,
                "register": _register
            }
          }).then(res => {
              console.log(res);
              resolve(res)
              return true;
            })
            .catch(err => {
              console.log(err);
              reject(err)
              return false;
            });
        }else{
          reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
        }

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#--------------------------------------------------------------------------------------#//

  //#---------------------------------Card pay Zelle--------------------------------------#//
  zelleRequest(_ci: string, _amount: number,  _refZelle: number){ //Pay Zelle

    return new Promise((resolve, reject)=>{
      try {

        if(_ci != null && _ci != '' && Number.isFinite(_amount) && Number.isInteger(_refZelle)) {
          axios({
            method: 'post',
            url: environment.API_URL_VPOS+'/api/metodo/request/zelle/'+_ci+'/'+_amount+'/'+_refZelle,
            /*data: {
              "accion":"tarjeta",
              "montoTransaccion": _amount,
              "cedula": _ci,
              "referencia": _refZelle,
            }*/
          }).then(res => {
              console.log(res);
              resolve(res)
            })
            .catch(err => {
              console.log(err);
              reject(err)
          });
        }else{
          reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
        }

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-------------------------------------------------------------------------------------#//

  //#-----------------------------Pay From change option----------------------------------#//
  cambioRequest(_ci: string, _amount: number,  _typeCoin: string){ //Pay From change option (Mobile Pay)

    return new Promise((resolve, reject)=>{
      try {

        if(_ci != null && _ci != '' && Number.isFinite(_amount) && _typeCoin != '') {
          axios({
            method: 'post',
            url: environment.API_URL_VPOS+'/api/metodo/request/paymentchange/'+_ci+'/'+_amount+'/'+_typeCoin,
            /*data: {
              "accion": "cambio",
              "montoTransaccion": _amount,
              "cedula": _ci,
              "tipoMoneda": _typeCoin //#Los valores admitidos son: VES (Bolívares), USD (Dólares), EUR (Euro)#//
            }*/
          }).then(res => {
              console.log(res);
              resolve(res)
            })
            .catch(err => {
              console.log(err);
              reject(err)
          });
        }else{
          reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
        }

      } catch (error) {
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#-------------------------------------------------------------------------------------#//

}
