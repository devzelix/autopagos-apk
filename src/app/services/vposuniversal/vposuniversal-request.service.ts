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
  //   axios.get(environment.API_URL+'/api/donwservice')
  //   .then(res => console.log(res))
  //   .catch(err => console.log(err));
  // }

  statusOK(_dataApi: any){//Test connection to API
    axios.get(environment.API_URL+'/api/pingpage')
    .then(res => _dataApi = res).then(res => console.log(res))
    .catch(err => console.log(err));
    //this.closeAPI();
  }
  //#--------------------------------------------------------------------------------------#//

  //#--------------------------------Card pay Simple---------------------------------------#//
  cardRequest(_ci: string, _amount: string){ //Pay Card Simple

    return new Promise((resolve, reject)=>{
      try {

        if(_ci != null && _ci != '' && _amount ) {
          axios({
            method: 'get',
            url: environment.API_URL+'/api/metodo/request/cardpay',
            headers: {
              'token': environment.TokenAPILaravelVPOS,
              'monto': _amount,
              'ci': _ci
            }
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
  //#--------------------------------------------------------------------------------------#//

  //#---------------------------------Card pay Zelle--------------------------------------#//
  zelleRequest(_ci: string, _amount: number,  _refZelle: number){ //Pay Zelle

    return new Promise((resolve, reject)=>{
      try {

        if(_ci != null && _ci != '' && Number.isFinite(_amount) && Number.isInteger(_refZelle)) {
          axios({
            method: 'post',
            url: environment.API_URL+'/api/metodo/request/zelle/'+_ci+'/'+_amount+'/'+_refZelle,
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
            url: environment.API_URL+'/api/metodo/request/paymentchange/'+_ci+'/'+_amount+'/'+_typeCoin,
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
