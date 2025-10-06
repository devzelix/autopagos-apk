import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { LogService } from '../log.service';
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
  statusOK(_dataApi: any){//Test connection to API
    axios.get(environment.URL_API_MASTER+'/api/pingpage')
    .then(res => _dataApi = res).then(res => console.log(res))
    .catch(err => console.log(err));
    //this.closeAPI();
  }
  //#--------------------------------------------------------------------------------------#//

  //#--------------------------------Card pay Simple---------------------------------------#//
  cardRequest(_ci: string, _amount: string, _subscriber: string, _balnace: string, _contract: string, _register: string){ //Pay Card Simple
    return new Promise<any>((resolve, reject)=>{
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<in cardRequest>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

      const dataReq = {
        "monto": _amount,
        "ci": _ci,
        "subscriber": _subscriber,
        "balance": _balnace,
        "contract": _contract,
        "register": _register
      }

      axios({
        method: 'post',
        url: environment.URL_API_MASTER+'/compra',
        headers: {
          'accept': 'application/json',
          'token': environment.TOKEN_API_MASTER,
          'Content-Type': 'application/json',
          },
        data : dataReq
      })
      .then(res => {
        console.log('RES', res);

        const isSuccess = res.data?.status === 200;

        console.log('MENSAJE DE RESPONSE', res.data?.datavpos?.mensajeRespuesta);

        // Obtener el response_code
        const responseCode = res.data?.datavpos?.codRespuesta ?? 'undefined';

        // Usar el servicio de errores para obtener el mensaje correcto
        const errorMessage = responseCode !== 'undefined'
        ? this.errorService.getErrorMessageCode(responseCode)
        : 'response message undefined';

        console.log('RESPONSE CODE', responseCode, errorMessage);

        // TODO : VALIDAR COMO SE ESTAN GUARDANDO LOS LOGS EN LOCAL STORAGE Y VALIDADR SI EL LOCAL STORAGE CONTEMPLA LOS NUEVOS CAMPOS

        // Extraer datos comunes para evitar repetición
        const logData: IPromptLog = {
          dateTime: new Date(),
          log_type: 'TRANSACCION',
          http_method: 'POST',
          status: res.status,
          numSubscriber: _subscriber,
          req_body: JSON.stringify(dataReq),
          res_code: responseCode,
          res_body: JSON.stringify(res.data.datavpos) ?? 'response undefined',
          route_api: `${environment.URL_API_MASTER}/metodo/request/cardpay`,
          is_success: isSuccess
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
        // console.error('ERROR', err);
        let _messageError: string =
        'Ha ocurrido un error\nConsulte con el personal de Fibex';
        // 'Hubo un error con el servidor. Comuníquese con el personal de FIBEX.'

        let timeShow: number = 4000;

        // console.warn('DNI TO LOOK ERROR', _ci, _ci === '90000000');

        if (_ci === '90000000') {
          // console.warn('ENTER ON IF TO UPDATE MESSAGE', _messageError);
          _messageError =
            'Muestrele este error a un técnico \n Error: ' +
            (err instanceof Error ? err.message : 'Desconocido');
          timeShow = 6000;
          // console.warn('EXIT ON IF TO UPDATE MESSAGE', _messageError);
        }

        // console.warn('OUT IF MESSAGE', _messageError);

        Swal.fire({
          icon: 'error',
          title: _messageError,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: timeShow,
        });
        // const response_code = err.response.codRespuesta ? err.response.codRespuesta : "unknown error";
        this._logService.storagelog({
          dateTime: new Date(),
          log_type: 'TRANSACCION',
          http_method: 'POST',
          status: err.status,
          numSubscriber: _subscriber,
          req_body: JSON.stringify(dataReq),
          res_code: 'ERROR',
          res_body: JSON.stringify(err.data.datavpos) ?? 'response undefined',
          route_api: `${environment.URL_API_MASTER}/metodo/request/cardpay`,
          is_success: false
        })

        reject(err);
      });

    });
  }
  //#--------------------------------------------------------------------------------------#//
}
