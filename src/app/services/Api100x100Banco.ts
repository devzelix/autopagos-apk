import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { SeguridadDatos } from "./bcryptjs";


@Injectable({
    providedIn: 'root'
  })
  export class ApiMercantilService implements  OnInit {

  private title: string;
  private RegPagosFallidos: any =[];
  responses: any[];
  URLAPIMERCANTIL = environment.urlFull100x100Banco;
  TOKENAPIMERCANTIL = environment.TokenApi100x100Banco


  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private _EncrypD:SeguridadDatos,
  ) {
    this.responses = [];
    this.title = '';
   }

   C2PCompra(Datos:any){
    return new Promise((resolve,reject)=>{
      try {

      let DatosC2P = {
            "sBankId": Datos.Bank,//'108',
            "sDocumentId": Datos.Cedula,//'V11366811',
            "sPhoneNumber": Datos.Phone,//'584164169663',
            "nAmount": Datos.Amount,//1.5,
            "abonado": Datos.Abonado,
            "idcontrato": Datos.idContrato,
            //"client": Datos.Cliente
                    
      }

       this._EncrypD.EncryptData100x100(DatosC2P)
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

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
  
  }