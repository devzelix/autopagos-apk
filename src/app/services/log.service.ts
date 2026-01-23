import { Injectable } from '@angular/core';
import { ILog, IPromptLog } from '../interfaces/log.interface';
import { LocalstorageService } from './localstorage.service';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { PrinterService } from './printer-roccia/printer.service';


@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    private _localStorageService: LocalstorageService,
    private _printer: PrinterService
  ) { }

  /**
   * Function to save log to local storage
   * @param messageLog Log item
   */
  public storagelog = async (logData: IPromptLog) => {
    try {
      // ✅ Validar y asegurar que res_code siempre tenga un valor válido
      const validatedLogData: IPromptLog = {
        ...logData,
        res_code: logData.res_code || logData.status?.toString() || 'UNKNOWN', // Asegurar valor válido
      };

      const logItem: ILog = {
        ...validatedLogData,
        date_time: new Date(),
      }

      console.log('new log item', logItem)

      const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];
      allLogs.push(logItem);
      this._localStorageService.set('logs', allLogs);

      console.log('LOG LENGTH: \n', allLogs.length, '\nEnviar para crear: \n', allLogs.length > 50);

      if (allLogs.length > 1) {
        console.log('Entre para enviar los log...');
        await this.postLogs().then((res) => {
          console.log('Res: \n', res);
        }).catch((err) => {
          console.log('Err: \n', err);
        })
      }

      console.log('Log saved to local storage', this._localStorageService.get<ILog[]>('logs'));

    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function to post log to api
   */
  public postLogs = () => {
    return new Promise(async (resolve, reject) => {
      const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];

      // ✅ Validar y limpiar logs antes de enviar - asegurar que res_code siempre tenga valor
      const validatedLogs: ILog[] = allLogs.map((log, index) => {
        // Validar que res_code tenga un valor válido
        if (!log.res_code || log.res_code.trim() === '') {
          console.warn(`⚠️ [LogService] Log ${index} sin res_code válido. Usando valor por defecto.`, log);
          return {
            ...log,
            res_code: log.status?.toString() || 'UNKNOWN', // Valor por defecto
          };
        }
        return log;
      });

      const body = {
        logs: validatedLogs,
        register: this._localStorageService.get('checkoutIdentify')
      }
      console.log('📤 [LogService] Enviando logs validados:', {
        total: validatedLogs.length,
        logs: validatedLogs.map(l => ({ log_type: l.log_type, res_code: l.res_code }))
      });

      const headers = {
        token: environment.TOKEN_API_MASTER
      }

      axios.post<ILog[], any>(environment.URL_API_MASTER + '/logs/create', body, { headers })
        .then(resLog => {
          if (resLog.status === 201) {
            localStorage.removeItem('logs');
            console.log('LOGS REMOVED', resLog);
          }
          console.log('Log Res Api', resLog)
          resolve(resLog)
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })

    })
      .catch(error => {
        console.error(error)
      })

  }

  /**
   * Function to post log to api
   */
  // public postLogs = () =>{
  //   return new Promise(async (resolve, reject) => {

  //     const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];


  //     let mac_address: string = '';
  //     try {

  //       const macAddresData: string = await this._printer.getMacAddress();
  //       console.log('macAddresData', macAddresData);
  //       if (macAddresData) mac_address = macAddresData;

  //     } catch (error) {
  //       console.error('Error en logService > al obtener macAddres', error)
  //     }

  //     const body = {
  //       logs: allLogs,
  //       register: mac_address
  //     }
  //     console.log('BODY LOGS', body)

  //     const headers = {
  //       token: environment.TOKEN_API_MASTER
  //     }
  //     axios.post<ILog[],any>(environment.URL_API_MASTER+'/log/create', body, {headers})
  //     .then(resLog => {
  //       if(resLog.status === 201) {
  //         localStorage.removeItem('logs');
  //         console.log('LOGS REMOVED', resLog);
  //       }
  //       console.log('Log Res Api', resLog)
  //       resolve(resLog)
  //     })
  //     .catch(error => {
  //       console.error(error)
  //       reject(error)
  //     })

  //   })
  //   .catch(error => {
  //     console.error(error)
  //   })
  // }

}
