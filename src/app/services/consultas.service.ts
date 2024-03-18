import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import axios from 'axios';
import { BanksDays } from '../interfaces/banksDays';
import * as CryptoJS from 'crypto-js';
import { RegisterPayService } from './register-pay.service';
import { EncryptService } from './encrypt.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {

  @Output() PagoZelleOb = new EventEmitter<any>();
  // private URLBACK: string = env.urlBackThomas;
  private tokendbfulll: string = env.tokendbFull;
  private URLDBFULL: string = env.urlDBFULL;
  private ApiKeySSL: string =env.ApiKeyApissl
  private ApiTLS: string = env.urlApiTLS;

  constructor(
    private http: HttpClient,
    private registerPayService: RegisterPayService,
    private enc: EncryptService
  ) {
  }

  getDaysFeriados() {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        db: `thomas_cobertura`,
        table: 'feriados_BCV',
        type: 'find-all-info',
      };
      this.registerPayService.MasterGETDBFULL(headersData, this.URLDBFULL).then((data) => {
        resolve(data);
      }).catch((error: any) => {
        reject(error)
      })
  })
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

  GeneratePin(Cedula: any, tipo: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        // Encabezados de la petición
        const headers = ({
          directory: "Consultas",
          method: `GenerarPin`,
          token: this.ApiKeySSL,
          platform: "pagos",
          id: Cedula,
          tipo: tipo
        });

        this.registerPayService.MasterGETPOST(headers, this.ApiTLS + "?data=1").then((data: any) => {
          // data = JSON.parse(JSON.parse(this.enc.Descrypt(data.message))[0]);
          resolve(data);
        }).catch((error: any) => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  VerificarPin(Cedula: any, Pin: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        // Encabezados de la petición
        const headers = ({
          directory: "Consultas",
          method: `VerificarPin`,
          token: this.ApiKeySSL,
          platform: "pagos",
          id: Cedula,
          pin: Pin
        });

        this.registerPayService.MasterGETPOST(headers, this.ApiTLS + "?data=2").then((data: any) => {
          // data = JSON.parse(JSON.parse(this.enc.Descrypt(data.message))[0]);
          resolve(data);
        }).catch((error: any) => {
          reject(error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  PagoZelle(){
    this.PagoZelleOb.emit(true);
  }


}
