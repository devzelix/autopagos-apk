import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { SeguridadDatos } from './bcryptjs'
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiMercantilService implements  OnInit {

  private hasBaseDropZoneOver: boolean = false;
  private title: string;
  private RegPagosFallidos: any =[];
  responses: any[];
  URLAPIMERCANTIL = env.ApiMercantil
  TOKENAPIMERCANTIL = env.TokenApiMercantil

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private _EncrypD:SeguridadDatos
  ) {
    this.responses = [];
    this.title = '';
   }

   ngOnInit(): void {
    
  }

  ConsultaPagoMovil(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "destination_mobile_number":"584241513063",
            "origin_mobile_number":"584126584242",
            "payment_reference":"6460003485",
            "trx_date":"2022/06/12",
            "amount":10000,
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3"
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovil/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    this.ErrorRegJSON(Datos)
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        this.ErrorRegJSON(Datos)
        reject(error);
      }
    })
  }

  ConsultaPagoMovilxFecha(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "procesing_date":"2022/06/12",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "search_criteria": "last"
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxFecha/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  ConsultaPagoMovilxFactura(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "procesing_date":"2022/06/12",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "invoice_number": "20092411046"
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxFactura/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  ConsultaPagoMovilxReferencia(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "procesing_date":"2022/06/12",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "payment_reference":"6460003485"
        }
        // 
        //
      //  this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
      //  .then((resp:any)=>{
          //console.log("Data Encriptada");
          //console.log(resp);
        //  this._EncrypD.DesEncrypDataHash(env.KeyEncrypt,Datos)
         // .then((resp:any)=>{console.log("Data Desencriptada"); console.log(resp);})
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxReferencia/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                    resolve(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error)
                }
            })
      //  })
      //  .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  ConsultaPagoMovilxReferenciaFactura(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "procesing_date":"2022/06/12",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "payment_reference": "6460003485",
            "invoice_number": "20092411046"
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxFacturaReferencia/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  C2PCompra(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "destination_mobile_number":"584241513063",
            "origin_mobile_number":"584126584242",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "destination_id": "V18367443",
            "twofactor_auth": "00001111",
            "destination_bank_id":105,
            "invoice_number":"20092411049",
            "trx_type":"compra",
            "payment_method":"c2p",
            "amount":2000
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2p/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  C2PClave(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
            "destination_mobile_number":"584241513063",
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "destination_id": "V18367443",
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2pClave/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
        })
        .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  ErrorRegJSON(Registro:any){
    this.RegPagosFallidos.push(Registro);
  }

  GetAddress(){
    return new Promise((resolve,reject)=>{
      this.http.get("http://api.ipify.org/?format=json").subscribe({
      next: data => {
          resolve(data)
      },
      error: error => {
          reject(error);
      }
      })
    })
    
  }
  




}
