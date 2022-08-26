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

  ConsultaPagoMovilxReferencia(Agent:any){
    return new Promise((resolve,reject)=>{
      try {
        
        Agent.Date = Agent.Date.split('T')[0];
        Agent.Date = Agent.Date.replace(/-/g,'/')
        console.log(Agent.Date)
        let Datos ={
            "procesing_date":Agent.Date, //Reemplazar por lo que coloque el usuario
            "ipaddress": Agent.AddresIp,
            "browser_agent": Agent.Browser,
            "payment_reference": Agent.Reference,
            "Name": Agent.Name
        }
        /*  
          "manufacturer": "Samsung",
          "model": "S9",
          "os_version": "Oreo 9.1",
          "lat": 37.4224764,
          "lng": -122.0842499
        */
      //  this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
      //  .then((resp:any)=>{
      //    console.log(resp);
          //console.log("Data Encriptada");
          //console.log(resp);
          //this._EncrypD.DesEncrypDataHash(env.KeyEncrypt,Datos)
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
     //   })
     //   .catch((error:any)=>console.error(error));
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
       // this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       // .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxFacturaReferencia/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
      //  })
      //  .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  C2PCompra(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
       /* let DatosC2P ={
            "manufacturer": "Samsung",
            "model": "S9",
            "os_version": "Oreo 9.1",
            "lat": 37.4224764,
            "lng": -122.0842499,
            "ipaddress": "10.0.0.1",
            "browser_agent": "Chrome 18.1.3",
            "destination_mobile_number":"584241513063",
            "origin_mobile_number":"584126584242",
            "destination_id": "V18367443",
            "twofactor_auth": "00001111",
            "destination_bank_id":105,
            "invoice_number":"20092411049",
            "trx_type":"compra",
            "payment_method":"c2p",
            "amount":2000
        }*/

      let DatosC2P = {
        "ipaddress": Datos.AddresIp,
        "browser_agent": Datos.Browser,
        "destination_mobile_number":Datos.tlfdestin,
        "origin_mobile_number":Datos.tlforigin,
        "destination_id": Datos.c_i,
        "twofactor_auth": Datos.auth,
        "destination_bank_id":105,
        "invoice_number":Datos.invoice,
        "trx_type":"compra",
        "payment_method":"c2p",
        "amount":Datos.cantidad,
        "Name": Datos.Name
      }

      console.log("Datos C2p");
      console.log(DatosC2P);
      //  this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
      //  .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2p/${this.TOKENAPIMERCANTIL}`, DatosC2P).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                    resolve(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
                }
            })
     //   })
     //   .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  C2PClave(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        //this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       // .then((resp:any)=>{
         console.log("Datos a enviar");
         console.log(Datos);
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2pClave/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                    resolve(data);
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
     //   })
     //  .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  GetAuthTDD(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        
        Datos ={
          "ipaddress": Datos.AddresIp,
          "browser_agent": Datos.Browser,
          "card_number":Datos.Ncard,
          "customer_id":Datos.c_iDC
        }
        console.log("GetAuthTDD");
        console.log(Datos);
        //this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       // .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}GetAuthTDC/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    resolve(data);
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
                }
            })
     //   })
     //  .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }

  CompraTDD(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos ={
          "ipaddress": Datos.AddresIp,
          "browser_agent": Datos.Browser,
          "card_number":Datos.Ncard,
          "customer_id":Datos.c_iDC,
          "invoice_number": Datos.invoice,
          "cvv": Datos.ccv,
          "twofactor_auth": Datos.Clavetlfonica,
          "expiration_date": Datos.vencmto,
          "amount": Datos.cantidadDC,
          "payment_method": Datos.PaymenMethod,
          "account_type": Datos.typeCuenta,
          "Name": Datos.Name
        }
        console.log("CompraTDD");
        console.log(Datos);
        //this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       // .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}PayTDC/${this.TOKENAPIMERCANTIL}`, Datos).subscribe({
                next: data => {
                    console.log("respondio");
                    console.log(data)
                    resolve(data);
                },
                error: error => {
                    console.error('There was an error!', error);
                }
            })
     //   })
     //  .catch((error:any)=>console.error(error));
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
    console.log("GetAddress");
    const WebUrl= "https://crm.thomas-talk.me/ip/";
    fetch(WebUrl, {
      method: "GET",
    })
      .then((response) => {
        console.log("response");
        console.log(response);
        resolve(response);
      })
      .catch((error:any)=>{
        reject(error)
      })

    })
  //   return new Promise((resolve,reject)=>{
  //     this.http.get("https://crm.thomas-talk.me/ip/").subscribe({
  //     next: data => {
  //       console.log("IP")
  //       console.log(data);
  //       console.log(typeof data);
  //         resolve(data)
  //     },
  //     error: error => {
  //         reject(error);
  //     }
  //     })
  //  })
    
  }
  




}
