import { Injectable } from '@angular/core';
// import { LogService } from '../log.service';
import axios from 'axios';
import { UbiiposDataSend, UbiiposRequest, UbiiposResponse } from 'src/app/interfaces/api/ubiipos';
import { LocalstorageService } from '../localstorage.service';
// import { IPromptLog } from 'src/app/interfaces/log.interface';

@Injectable({
  providedIn: 'root'
})
export class UbiiposService {

  // Endpoint
  // POST ipAddress:8080/api/spPayment

  constructor(
    // private _logService: LogService,
    private _localStorageService: LocalstorageService
  ) { }

  //#--------------------------------Payment Ubiipos---------------------------------------#//
  async paymentUbiipos(request: UbiiposDataSend){

    try {
      // Get host
      const hostUbii: string | null = this._localStorageService.get<string>('ipAddress') ?? null;

      // Get url
      const url: string | null = hostUbii ? `${hostUbii}:8080/api/spPayment` : null;

      // Get body
      const body: UbiiposRequest = {
        posData: request
      }

      // Get headers
      const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }

      // Validate url
      if (!url) {
        throw new Error('URL is null');
      }

      // Make request
      const response = await axios.post<UbiiposResponse, any>(url, body, {headers})
      .catch(error => {
        console.error(error)
        return error;
      })

      return response;      
    } catch (error) {
      console.error(error)
      return error;
    }
  }
  //#--------------------------------------------------------------------------------------#//

}
