import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { environment } from 'src/environments/environment';
import { LogService } from '../log.service';

@Injectable({
  providedIn: 'root'
})
export class VposuniversalRequestService {

  constructor(
    private _logService: LogService
  ) {
  }

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
  cardRequest(_ci: string, _amount: string, _subscriber: string, _contract: string, _register: string){ //Pay Card Simple
    return new Promise<AxiosResponse<any>>((resolve, reject)=>{
      // console.log('in cardRequest')
      try {
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
              "contract": _contract,
              "register": _register
          }
        })
        .then(res => {
          console.log('RES', res)
          this._logService.storagelog({
              http_method: 'POST',
              status: res.data?.datavpos.status ?? res.status,
              subscriberNum: _subscriber,
              mac_address: _register,
              response_code: res.data.datavpos.codRespuesta ?? 'response code undefined',
              response_message: res.data.datavpos.mensaje ?? 'response message undefined',
              url_api: environment.API_URL_VPOS+'/metodo/request/cardpay',
              'is_success': true
            })
            resolve(res)
          })
          .catch(err => {
            console.error('Error en cardRequest:', err);

            axios.isAxiosError(err) && console.error('Axios error:', err.message);
            // resolve(err.response?.data);

            // const response_code = err.response.codRespuesta ? err.response.codRespuesta : "unknown error";
            this._logService.storagelog({
              http_method: 'POST',
              status: err.data?.datavpos.status ?? err.status,
              subscriberNum: _subscriber,
              mac_address: _register,
              response_code: err.data.datavpos.codRespuesta ?? 'response code undefined',
              response_message: err.response.codRespuesta ?? 'response message undefined',
              url_api: environment.API_URL_VPOS+'/metodo/request/cardpay',
              'is_success': true
            })
            reject(err);
          });
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        // const response_code = (error as any).response?.codRespuesta ? (error as any).response.codRespuesta : "unknown error";
        this._logService.storagelog({
          http_method: 'POST',
          status:  (error as any).response?.status,
          url_api: environment.API_URL_VPOS+'/metodo/request/cardpay',
          'is_success': false,
          subscriberNum: _subscriber,
          mac_address: _register,
          response_code: (error as any).response?.codRespuesta ? (error as any).response.codRespuesta : 'response code undefined',
          response_message: (error as any).response?.mensaje ? (error as any).response.mensaje : 'response message undefined'
        })
        reject(error);
      }

    });

    //this.closeAPI();

  }
  //#--------------------------------------------------------------------------------------#//

  //#---------------------------------Card pay Zelle--------------------------------------#//
  // zelleRequest(_ci: string, _amount: number,  _refZelle: number){ //Pay Zelle

  //   return new Promise((resolve, reject)=>{
  //     try {

  //       if(_ci != null && _ci != '' && Number.isFinite(_amount) && Number.isInteger(_refZelle)) {
  //         axios({
  //           method: 'post',
  //           url: environment.API_URL_VPOS+'/api/metodo/request/zelle/'+_ci+'/'+_amount+'/'+_refZelle,
  //           /*data: {
  //             "accion":"tarjeta",
  //             "montoTransaccion": _amount,
  //             "cedula": _ci,
  //             "referencia": _refZelle,
  //           }*/
  //         }).then(res => {
  //             console.log(res);
  //             resolve(res)
  //           })
  //           .catch(err => {
  //             console.log(err);
  //             reject(err)
  //         });
  //       }else{
  //         reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
  //       }

  //     } catch (error) {
  //       reject(error);
  //     }

  //   });

  //   //this.closeAPI();

  // }
  //#-------------------------------------------------------------------------------------#//

  //#-----------------------------Pay From change option----------------------------------#//
  // cambioRequest(_ci: string, _amount: number,  _typeCoin: string){ //Pay From change option (Mobile Pay)

  //   return new Promise((resolve, reject)=>{
  //     try {

  //       if(_ci != null && _ci != '' && Number.isFinite(_amount) && _typeCoin != '') {
  //         axios({
  //           method: 'post',
  //           url: environment.API_URL_VPOS+'/api/metodo/request/paymentchange/'+_ci+'/'+_amount+'/'+_typeCoin,
  //           /*data: {
  //             "accion": "cambio",
  //             "montoTransaccion": _amount,
  //             "cedula": _ci,
  //             "tipoMoneda": _typeCoin //#Los valores admitidos son: VES (Bolívares), USD (Dólares), EUR (Euro)#//
  //           }*/
  //         }).then(res => {
  //             console.log(res);
  //             resolve(res)
  //           })
  //           .catch(err => {
  //             console.log(err);
  //             reject(err)
  //         });
  //       }else{
  //         reject(new Error('Validacion invalida, verifica los campos e intenta de nuevo.'));
  //       }

  //     } catch (error) {
  //       reject(error);
  //     }

  //   });

  //   //this.closeAPI();

  // }
  //#-------------------------------------------------------------------------------------#//

}
