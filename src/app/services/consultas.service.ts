import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment.prod';
import axios from 'axios';
import { BanksDays } from '../interfaces/banksDays';
import * as CryptoJS from 'crypto-js';
import { RegisterPayService } from './register-pay.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {

  private URLBACK: string = env.urlBackThomas;
  private tokendbfulll: string = env.tokendbFull;
  private URLDBFULL: string = env.urlDBFULL;

  constructor(
    private http: HttpClient,
    private registerPayService: RegisterPayService,
  ) {
    this.getDaysFeriados()
  }

  Send(Option: any, Msg?: any, Tipo?: any, url?: any, idDevice?: any) {

    try {
      // console.log(Option);
      // console.log(Msg);
      // console.log(Tipo);
      // console.log(url);
      // console.log("idDevice");
      // console.log(idDevice);
      axios({
        url: 'https://pha.thomas-talk.me/',
        method: 'POST',
        data: {
          query: `
            query {
              GetOptionsApp(Data:{
                Op:"${Option}"
                Act:"1"
                mensaje:"${Msg || ""}"
                Tipo:${Tipo || 0}
                URL:"${url || " "}"
                idDevice:"${idDevice || ""}"
              }){
                Op
                Act
                mensaje
                Tipo
                URL
                idDevice
              }
            }
          `
        }
      })
        .then((res: any) => {
          const Data = res.data.data.GetOptionsApp
          // console.log(Data)

        })
        .catch((err: any) => console.log(err))


    } catch (error) {
      console.error(error)
    }

  }

  getDaysFeriados(): Observable<BanksDays[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'TokenAuthPlataform': this.tokendbfulll,
        'Authorization': 'Basic ' + btoa('Onur:L4V1d43NsuPl3N1tud**=BghYjLaQeTB'),
        'db': this.registerPayService.encrypt('thomas_cobertura'),
        'table': this.registerPayService.encrypt('feriados_BCV'),
        'type': this.registerPayService.encrypt('find-all-info'),
      })
    }
    return this.http.get<BanksDays[]>(`${this.URLDBFULL}`, httpOptions)
  }

}
