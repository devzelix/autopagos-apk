import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { environment } from 'src/environments/environment';
import { LogService } from '../log.service';
import { rejects } from 'assert';
import Swal from 'sweetalert2';
import { IPromptLog } from 'src/app/interfaces/log.interface';
import { VposerrorsService } from './vposerrors.service';

@Injectable({
  providedIn: 'root'
})
export class VposuniversalRequestService {

  constructor(
    private _logService: LogService,
    private errorService: VposerrorsService
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
    return new Promise<any>((resolve, reject)=>{
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<in cardRequest>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      console.log('ci', _ci)
      console.log('amount', _amount)
      console.log('subscriber', _subscriber)
      console.log('contract', _contract)
      console.log('register', _register)

      // try {
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
          console.log('RES', res);

          const isSuccess = res.data?.status === 200;

          console.log('MENSAJE DE RESPONSE', res.data?.datavpos?.mensajeRespuesta);

          // Obtener el response_code
          const responseCode = res.data?.datavpos?.codRespuesta ?? 'undefined';

          // Usar el servicio de errores para obtener el mensaje correcto
          const errorMessage = responseCode !== 'undefined'
          ? this.errorService.getErrorMessage(responseCode)
          : 'response message undefined';

          console.log('RESPONSE CODE', responseCode, errorMessage);


          // Extraer datos comunes para evitar repetición
          const logData: IPromptLog = {
            http_method: 'POST',
            status: res.data?.datavpos?.status ?? res.status,
            subscriberNum: _subscriber,
            mac_address: _register,
            response_code: responseCode,
            response_message: errorMessage,
            url_api: `${environment.API_URL_VPOS}/metodo/request/cardpay`,
            'is_success': isSuccess
          };



          // Siempre hacer log
          this._logService.storagelog(logData);

          if (!isSuccess) {
            // Mostrar error solo si no es exitoso
            Swal.fire({
              icon: 'error',
              title: res.data?.message || 'Error en la operación',
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 4000,
            });

            // Opcional: rechazar la promesa en caso de error
            // reject(new Error(res.data?.message || 'Operation failed'));
            return; // O usar return para no continuar
          }

          // Resolver solo si es exitoso
          resolve(res);
        })
          .catch(err => {
            console.error('ERROR', err);
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
      // } catch (error) {
      //   console.error('Error al procesar el pago:', error);
      //   // const response_code = (error as any).response?.codRespuesta ? (error as any).response.codRespuesta : "unknown error";
      //   this._logService.storagelog({
      //     http_method: 'POST',
      //     status:  (error as any).response?.status,
      //     url_api: environment.API_URL_VPOS+'/metodo/request/cardpay',
      //     'is_success': false,
      //     subscriberNum: _subscriber,
      //     mac_address: _register,
      //     response_code: (error as any).response?.codRespuesta ? (error as any).response.codRespuesta : 'response code undefined',
      //     response_message: (error as any).response?.mensaje ? (error as any).response.mensaje : 'response message undefined'
      //   })
      //   return error;
      // }

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
