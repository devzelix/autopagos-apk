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
      console.log("entre aqui 2")
      try {
        let DatosC2P = {
          "Bank": "0105",
          "Cedula": Datos.c_i.substr(1),
          "Phone": "0"+Datos.tlfdestin.substr(2),
          "Amount": Datos.cantidad,
          "Abonado": Datos.Abonado,
          "IdContrato": Datos.idContrato,
        }

        console.log("DatosC2P",DatosC2P);
  
            const url = 'http://localhost:8888/';
            
            
            
            const headers = new HttpHeaders({'source':this._EncrypD.EncryptData100x100(origin),
            'wt':this._EncrypD.EncryptData100x100(environment.TokenApi100x100Banco),
            'accion':this._EncrypD.EncryptData100x100('MobilePayment'),
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'

            });
            
            
            console.log('Headers:', headers);
              
            this.http.post<any>(url,DatosC2P,{headers:headers}).subscribe({
              next: data => {
                console.log("Respondio");
                console.log(data);
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
      console.log("CompraTDD");
      return new Promise((resolve,reject)=>{
        try {
          Datos ={
            "Abonado": "C8641",
            "IdContrato": "CONTCAB369BF0FD11696",
            "sBankId": "0108",
            "sDocumentId": "11366811",
            "sPhoneNumber": "584164169696",
            "nAmount":12.21
          }

          const url = 'http://localhost:8888/';
        const headers = new HttpHeaders({'source':this._EncrypD.EncryptData100x100(origin),
            'wt':this._EncrypD.EncryptData100x100(environment.TokenApi100x100Banco),
            'accion':this._EncrypD.EncryptData100x100('DebitPayment'),
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'

            });
            
            
            console.log('Headers:', headers);
  
          console.log("CompraTDDv22",headers);
              this.http.post<any>(url, Datos,{headers:headers}).subscribe({
                  next: data => {
                    console.log("Respondio");
                    console.log(data);
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