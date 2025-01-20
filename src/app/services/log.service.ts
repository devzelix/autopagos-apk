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
  ) {
  }

  /**
   * Function to save log to local storage
   * @param messageLog Log item
   */
  public storagelog = async (logData: IPromptLog) => {
    try {

      let mac_address = '';

      try {

        const macAddresData: any = await this._printer.getMacAddress();
        console.log('macAddresData', macAddresData);
        if (macAddresData?.data?.mac) {
          mac_address = macAddresData.data.mac;
        }

      } catch (error) {
        console.error('Error en logService > al obtener macAddres', error)
      }


      const logItem: ILog = {
        ...logData,
        dateTime: new Date(),
        mac_address
      }

      console.log('new log item', logItem)

      const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];
      allLogs.push(logItem);
      this._localStorageService.set('logs', allLogs);

      if (allLogs.length >= 20) {
        this.postLogs()
      }

    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function to post log to api
   */
  public postLogs = () => {
    return new Promise((resolve, reject) => {

      const allLogs: ILog[] = this._localStorageService.get<ILog[]>('logs') || [];
      axios.post<ILog[]>(environment.API_URL_VPOS+'log/create', allLogs)
      .then(resLog => {
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
