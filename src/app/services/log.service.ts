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
  ) {}

  /**
   * Function to save log to local storage
   * @param messageLog Log item
   */
  public storagelog = async (logData: IPromptLog) => {
    try {

      let mac_address = '';

      try {

        const macAddresData: string = await this._printer.getMacAddress();
        console.log('macAddresData', macAddresData);
        if (macAddresData) {
          mac_address = macAddresData;
        }

      } catch (error) {
        console.error('Error en logService > al obtener macAddres', error)
      }


      const logItem: ILog = {
        ...logData,
        dateTime: new Date(),
      }

      console.log('new log item', logItem)

      const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];
      allLogs.push(logItem);
      this._localStorageService.set('logs', allLogs);

      if (allLogs.length > 20) {
        this.postLogs();
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


      let mac_address: string = '';
      try {

        const macAddresData: string = await this._printer.getMacAddress();
        console.log('macAddresData', macAddresData);
        if (macAddresData) mac_address = macAddresData;

      } catch (error) {
        console.error('Error en logService > al obtener macAddres', error)
      }

      const body = {
        logs: allLogs,
        register: mac_address
      }
      console.log('BODY LOGS', body)

      const headers = {
        token: environment.TokenAPILaravelVPOS
      }
      axios.post<ILog[],any>(environment.API_URL_VPOS+'/log/create', body, {headers})
      .then(resLog => {
        if(resLog.status === 201) {
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

}
