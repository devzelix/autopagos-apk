import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { SeguridadDatos } from './bcryptjs'
import axios from 'axios';
import { RegisterPayService } from './register-pay.service';

@Injectable({
  providedIn: 'root'
})
export class ApiMercantilService implements  OnInit {

  private hasBaseDropZoneOver: boolean = false;
  private title: string;
  private RegPagosFallidos: any =[];
  responses: any[];
  URLAPIMERCANTIL = env.ApiMercantil;//'http://localhost:8090/'
  TOKENAPIMERCANTIL = env.TokenApiMercantil

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private _EncrypD:SeguridadDatos,
    private registerPayService: RegisterPayService
  ) {
    this.responses = [];
    this.title = '';
   }

   ngOnInit(): void { }

  ConsultaPagoMovil(Datos:any){
    return new Promise((resolve,reject)=>{
      try {
        Datos.Date = Datos.Date.split('T')[0];
        Datos.Date = Datos.Date.replace(/\//g,'-')

        Datos ={
            "destination_mobile_number":Datos.tlfdestinReg,
            "origin_mobile_number":Datos.tlforigin,
            "payment_reference":Datos.Reference,
            "amount":Datos.Cantidad,
            "trx_date":Datos.Date,
            "ipaddress": Datos.AddresIp,
            "browser_agent": Datos.Browser,
            "Name": Datos.Name,
            "abonado": Datos.Abonado,
            "idcontrato": Datos.idContrato,
            "destination_id": Datos.c_i,
            "client": Datos.Cliente
        }
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
        .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovil/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data)
                },
                error: error => {
                    reject(error);
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

  Test(){
    let Datos ={
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
            this.http.post<any>(`${this.URLAPIMERCANTIL}Test`, resp).subscribe({
                next: data => {

                },
                error: error => {
                    console.error('There was an error!', error);
                    this.ErrorRegJSON(Datos)
                }
            })
        })
        .catch((error:any)=>console.error(error));
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
        let Datos ={
            "procesing_date":Agent.Date,
            "ipaddress": Agent.AddresIp,
            "browser_agent": Agent.Browser,
            "payment_reference": Agent.Reference,
            "Name": Agent.Name,
            "abonado": Agent.Abonado,
            "idcontrato": Agent.idContrato,
            "client": Agent.Cliente
        }
       this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}SearchPagoMovilxReferencia/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error)
                }
            })
       })
       .catch((error:any)=>console.error(error));
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
        "Name": Datos.Name,
        "abonado": Datos.Abonado,
        "idcontrato": Datos.idContrato,
        "client": Datos.Cliente
      }

       this._EncrypD.EncrypDataHash(env.KeyEncrypt,DatosC2P)
       .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2p/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
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
        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}c2pClave/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data);
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

  GetAuthTDD(Datos:any){
    return new Promise((resolve,reject)=>{
      try {

        Datos ={
          "ipaddress": Datos.AddresIp,
          "browser_agent": Datos.Browser,
          "card_number":Datos.Ncard,
          "customer_id":Datos.c_iDC
        }

        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}GetAuthTDC/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data);
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
                }
            })
       })
      .catch((error:any)=>console.error(error));
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
          "Name": Datos.Name,
          "abonado": Datos.Abonado,
          "idcontrato": Datos.idContrato,
          "client": Datos.Cliente
        }

        this._EncrypD.EncrypDataHash(env.KeyEncrypt,Datos)
       .then((resp:any)=>{
            this.http.post<any>(`${this.URLAPIMERCANTIL}PayTDC/${this.TOKENAPIMERCANTIL}`, resp).subscribe({
                next: data => {
                    resolve(data);
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
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
    const WebUrl= this.URLAPIMERCANTIL+'Whatismyip/'+this.TOKENAPIMERCANTIL;
     this.http.get<any>(WebUrl).subscribe({
        next: data => {
            resolve(data);

        },
        error: error => {
            console.error('There was an error!', error);
            reject(error)
        }
     })
    })

  }

  RegPay(BodyJson:any){
    return new Promise((resolve,reject)=>{
      try {

        let body ={
            name_user: BodyJson.name_user, //us
            customer_id: BodyJson.customer_id,//us
            email: BodyJson.purchase_units[0].payee.email_address,
            payer_id: BodyJson.payer.payer_id,
            payment_reference: BodyJson.id,
            abonado: BodyJson.abonado,//us
            id_contrato: BodyJson.id_contrato,//us
            amount: BodyJson.montoarecibir,
            currency: BodyJson.purchase_units[0].amount.currency_code,
            processing_date: BodyJson.create_time,
            status: BodyJson.status,
            browser_agent: BodyJson.browser_agent,
            ipaddress:BodyJson.addresip
          }

       this._EncrypD.EncrypDataHash(env.KeyEncrypt,body)
       .then((resp:any)=>{
        const headers = new HttpHeaders({'TokenAuth':env.NewTokenMercantil,'Authorization':env.AuthdbMercantil});
            this.http.post<any>(`${this.URLAPIMERCANTIL}RegPaypal`, resp,{headers:headers}).subscribe({
                next: data => {
                    resolve(data)
                },
                error: error => {
                    console.error('There was an error!', error);
                    reject(error);
                }
            })
       })
       .catch((error:any)=>console.error(error));
      } catch (error) {
        reject(error);
      }
    })
  }
}
