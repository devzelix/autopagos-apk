import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, NgZone, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { SeguridadDatos } from "./bcryptjs";
import axios, { Axios } from "axios";



@Injectable({
    providedIn: 'root'
  })
  export class Api100x100Service implements  OnInit {

  private title: string;
  private RegPagosFallidos: any =[];
  responses: any[];
  URLAPI100x100 = environment.urlFull100x100Banco;
  TOKENAPI100x100 = environment.TokenApi100x100Banco


  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private _EncrypD:SeguridadDatos,
  ) {
    this.responses = [];
    this.title = '';
   }

  C2PCompra(Datos: any) {
    return new Promise((resolve, reject) => {
      try {
        let DatosC2P = {
          "Bank": "0105",
          "Cedula": Datos.c_i.substr(1),
          "Phone": "0"+Datos.tlfdestin.substr(2),
          "Amount": Datos.cantidad,
          "Abonado": Datos.Abonado,
          "IdContrato": Datos.idContrato,
          "name_user": Datos.name_user,
          "sAuthKey":Datos.AuthKey
        };
  
            //const url = 'http://localhost:9003/';//'https://apitest3.thomas-talk.me/'
            const headers = new HttpHeaders({'source':this._EncrypD.EncryptData100x100(origin),
            'wt':this._EncrypD.EncryptData100x100(environment.TokenApi100x100Banco),
            'accion':this._EncrypD.EncryptData100x100('MobilePayment'),
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            });

            this.http.post<any>(environment.api100x100,DatosC2P,{headers:headers}).subscribe({
              next: data => {
                  resolve(data);
              },
              error: error => {
                  console.error('There was an error!', error);
                  reject(error);
              }
          })
        
      } catch (error) {
        reject(error);
      }
    });
  }

  ListBank() {
    return new Promise((resolve, reject) => {
      try {
            const url ='https://apitest3.thomas-talk.me/';
            const headers = new HttpHeaders({'source':this._EncrypD.EncryptData100x100(origin),
            'wt':this._EncrypD.EncryptData100x100(environment.TokenApi100x100Banco),
            'accion':this._EncrypD.EncryptData100x100('ListBank'),
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            });

            this.http.get<any>(url,{headers:headers}).subscribe({
              next: data => {
                  resolve(data);
              },
              error: error => {
                  console.error('There was an error!', error);
                  reject(error);
              }
          })
        
      } catch (error) {
        reject(error);
      }
    });
  }
  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }



    CompraDebito(Datos:any){
      return new Promise((resolve,reject)=>{
        try {
          Datos ={
            "name_user": Datos.name_user,
            "Abonado": Datos.Abonado,
            "IdContrato": Datos.Contrato,
            "sBankId": Datos.Bank, //Nose si mercantil o 100x100 banco
            "sDocumentId": Datos.pref_ci+Datos.CI,
            "sPhoneNumber": Datos.CountNumber,//numero de cuenta
            "nAmount":Datos.Amount,
            "sTrxType":Datos.identifierTransaction,
            "sAuthKey":Datos.Auth
          }

          const url = 'https://apitest3.thomas-talk.me/';//'https://apitest3.thomas-talk.me/'
          const headers = new HttpHeaders({'source':this._EncrypD.EncryptData100x100(origin),
              'wt':this._EncrypD.EncryptData100x100(environment.TokenApi100x100Banco),
              'accion':this._EncrypD.EncryptData100x100('DebitPayment'),
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json',
              'Accept': 'application/json'

          });

          this.http.post<any>(environment.api100x100, Datos,{headers:headers}).subscribe({
              next: data => {
                  resolve(data);
              },
              error: error => {
                  console.error('There was an error!', error);
                  reject(error);
              }
          })

        } catch (error) {
          reject(error);
        }
      })
    }  
  
  }