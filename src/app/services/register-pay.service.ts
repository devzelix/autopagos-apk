import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment.prod';
import { RegisterPay } from '../interfaces/registerPay';
import * as CryptoJS from 'crypto-js';
import { SeguridadDatos } from './bscript.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterPayService {

  private URLGRAPH: string = env.urlGraphql;
  private URLGRAPHCONTRACT: string = env.urlGraphqlContract;
  // private URLAPITHOMAS: string = env.urlThomasApi;
  private URLDBFULL: string = env.urlDBFULL;
  private URLAPISSLTHOMAS: string = env.urlApisslThomas;
  private URLAPISSLTHOMASSEND: string = env.urlApisslThomasSend;
  private urlConsultassslThomas: string = env.urlConsultassslThomas;
  private TOKEN: string = env.securityEncrt;
  private ApiKeyApissl: string = env.ApiKeyApissl;
  private tokendbfulll: string = env.tokendbFull;
  private authDBFULL: string = env.authdbFUll;
  public dniCustomerContract: string
  public amountCustomerContract: string
  public linkedToContractProcess: string

  constructor(
    private http: HttpClient,
    private security: SeguridadDatos,
  ) {
  }

  /* registerPayClient(infoClient: RegisterPay): Observable<any> {
    infoClient.note = infoClient.note+'-Recibo:'+infoClient.img
    return this.http.get(`${this.URLGRAPH}?query={ReportePago_Falla(
        token:"${env.token}"
        Data:{
            Nombre:"${infoClient.name}"
            Cedula:"${infoClient.dni}"
            Email:"${infoClient.email}"
            Motivo:"Pago"
            Fecha:"${infoClient.date}"
            Nota:"${infoClient.note}"
            Imagen:"${infoClient.img}"
            Banco:"${infoClient.bank}"
            id_Cuba:"${infoClient.id_Cuba}"
            Monto:"${infoClient.amount}"
            comprobante:"${infoClient.voucher}"
            NombreTitular: "${infoClient.nameTitular}",
            CedulaTitula: "${infoClient.dniTitular}",
            EmailTitular: "${infoClient.emailTitular}",
            Tipo:"Pago"
        }
        lic: "${env.lic}"
    ){
      to
    }}`.replace(/(\r\n|\n|\r)/gm, ""), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map((res: any) => {
        // console.log(res)
        return res;
      }
      ));
  } */

  encrypt(str: string) {
    let encrypted = CryptoJS.AES.encrypt(str, this.TOKEN, {
      keySize: 16,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  registerPayClient(infoClient: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        infoClient.note = infoClient.note + ' -Recibo:' + infoClient.img

        const DataQuery = {
          query: `
          query{
            ReportePago_Falla(
              token:"${env.token}"
              Data:{
                Nombre:"${infoClient.name}"
                Cedula:"${infoClient.dni}"
                Email:"${infoClient.email}"
                Motivo:"Pago"
                Fecha:"${infoClient.date}"
                Nota:"${infoClient.note}"
                Imagen:"${infoClient.img}"
                Banco:"${infoClient.bank}"
                id_Cuba:"${infoClient.id_Cuba}"
                Monto:"${infoClient.amount}"
                IdContrato:"${infoClient.IdContrato}"
                comprobante:"${infoClient.voucher}"
                NombreTitular:"${infoClient.nameTitular || ""}"
                CedulaTitula:"${infoClient.dniTitular || ""}"
                EmailTitular:"${infoClient.emailTitular || ""}"
                Tipo:"Pago"
              }
              lic:"${env.lic}"
            ){
              to
            }
          }`,
        }

        this.http.post(this.URLGRAPH, DataQuery).subscribe((Response: any) => {
          resolve(Response)

          if (!Response.data.ReportePago_Falla[0].to.includes("DUPLICADO") || !Response.data.ReportePago_Falla[0].to.includes("CEDULA_ERRONEA") || !Response.data.ReportePago_Falla[0].to.includes("Error registrando")) {
            const DataParaConciliar = {
              Cedula: infoClient.dni,
              IdContrato: infoClient.IdContrato,
              Monto: infoClient.amount,
              Referencia: infoClient.voucher,
              Nombre: infoClient.name,
              Email: infoClient.email,
              Motivo: "Pago",
              Fecha: infoClient.date,
              Nota: infoClient.note,
              Imagen: infoClient.img,
              Banco: infoClient.bank,
              id_Cuba: infoClient.id_Cuba,
              comprobante: infoClient.voucher,
              NombreTitular: infoClient.nameTitular || "",
              CedulaTitula: infoClient.dniTitular || "",
              EmailTitular: infoClient.emailTitular || "",
              Tipo: "Pago"
            }
            //this.SendDataConciliar(DataParaConciliar)
          }
        }, (error) => {
          reject(error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  paySubs(payObj: any, dni: any) {

    let statusPay: any
    let payData: any
    if (payObj.hasOwnProperty('transaction_c2p_response')) {
      statusPay = payObj.transaction_c2p_response.trx_status == "approved" ? true : false
      payData = JSON.stringify(payObj.transaction_c2p_response)
    }
    else if (payObj.hasOwnProperty('transaction_response')) {
      statusPay = payObj.transaction_response.trx_status == "approved" ? true : false
      payData = JSON.stringify(payObj.transaction_response)
    }
    else {
      statusPay = false
    }
    payData = payData.replaceAll('"', "'")
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const DataQuery = {
          query: `
          mutation{
            SendVentaWa(Data:{
              status:${statusPay}
              Datos:"${payData}"
              Cedula:"${dni}"
            })
          }`,
        }

        this.http.post(this.URLGRAPHCONTRACT, DataQuery).subscribe((Response: any) => {
          resolve(Response)
          // console.log('Response', Response)
        }
          , (error) => {
            reject(error)
          })

      } catch (error) {
        reject(error)
      }
    })
  }

  MasterGETDBFULL(headersData: any, url: string) {
    return new Promise(async (resolve: any, reject: any) => {
      this.security.EncrypDataHash(headersData).then((headers: any) => {
        headers.TokenAuthPlataform = this.tokendbfulll
        headers.Authorization = this.authDBFULL
        this.http.get(url, { headers }).subscribe((res: any) => {
          let jsonres;
          resolve(res);
        })
      }).catch((error: any) => {
        reject(error)
      })

    })
  }

  GetDataClient(Cedula: any) {

    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        db: `thomas_cobertura`,
        table: 'tmClientes',
        type: 'find-any-info',
        campo: 'identidad',
        valor: Cedula,
      };
      this.MasterGETDBFULL(headersData, this.URLDBFULL).then((data) => {
        resolve(data);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  /* SendDataConciliar(Data: any) {
    try {

      this.http.post(`${env.ApiMercantil}RegPay/${env.TokenApiMercantil}`, Data).subscribe((ResClient: any) => {
        //data recibida
      }, err => {
        console.error(err)
      })

    } catch (error) {
      console.error(error)
    }
  } */

  GetListService(id_contrato: any) {

    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        method: `ServiciosIdCo`,
        token: this.ApiKeyApissl,
        id: id_contrato,
        lic: env.lic,
        platform: "PagosMercantil",
      };
      this.MasterGETPOST(headersData, this.URLAPISSLTHOMAS).then((data: any) => {
        resolve(data.data.info);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  getBancosList(): Observable<any> {
    return this.http.get(`${this.URLGRAPH}?query={ConsultaBancos(token:"${env.token}",lic:"${env.lic}"){lic,Bancos}}`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }

  getNewBankList() {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        method: `CtasBancarias`,
        token: this.ApiKeyApissl,
        platform: "PagosMercantil",
        lic: env.lic
      };
      this.MasterGETPOST(headersData, this.URLAPISSLTHOMAS).then((data: any) => {
        resolve(data.data.info);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  isObject(val: any) {
    return (typeof val === 'object');
  }

  MasterGETPOST(headersData: any, url: string, post?: boolean, body?: any) {
    return new Promise(async (resolve: any, reject: any) => {
      if (post) {
        this.security.EncrypDataHash(headersData).then((headers: any) => {
          this.http.post(url, body, { headers }).subscribe((res: any) => {
            let jsonres;
            try {
              if (this.isJsonString(res)) {
                jsonres = JSON.parse(res)
                console.log('Metodo :>> ', headersData.method, 'res sin json:>> ', res, 'respuesta de los metodos en jsonres:>> ', jsonres);
                resolve(jsonres.data.info);
              } else {
                jsonres = res
                console.log('Metodo :>> ', headersData.method, 'res sin json:>> ', res, 'respuesta de los metodos en jsonres:>> ', jsonres);
                resolve(jsonres[0]);
              }
            } catch (error) {
              console.log(error)
            }
          })
        }).catch((error: any) => {
          reject(error)
        })
      }
      else {
        this.security.EncrypDataHash(headersData).then((headers: any) => {
          // se debe cambiar por axion para colocarle un timeout
          // console.log(headers)
          this.http.get(url, { headers }).subscribe((res: any) => {
            let jsonres;
            try {
              if (this.isJsonString(res)) {
                jsonres = JSON.parse(res)
                // console.log('Metodo :>> ', headersData.method, 'res sin json:>> ', res, 'respuesta de los metodos en jsonres:>> ', jsonres);
              } else {
                jsonres = res
                // console.log('Metodo :>> ', headersData.method, 'res sin json:>> ', res, 'respuesta de los metodos en jsonres:>> ', jsonres);
              }
              resolve(jsonres);
            } catch (error) {
              console.log(error)
            }
          })
        }).catch((error: any) => {
          reject(error)
        })
      }

    })
  }

  ConsultarEstadoDeposito(nroContrato: any, Referencia: any) {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        method: `ConciliacionPago`,
        token: this.ApiKeyApissl,
        NroReferencia: Referencia,
        NroContrato: nroContrato,
        platform: "PagosMercantil",
        lic: env.lic
      };
      this.MasterGETPOST(headersData, this.URLAPISSLTHOMAS).then((data) => {
        resolve(data);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  isJsonString(jsonToParse: any) {
    try {
      JSON.parse(jsonToParse);
    } catch (e) {
      return false;
    }
    return true;
  }

  getSaldoByDni(dni: string) {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        method: `SaldoCe`,
        token: this.ApiKeyApissl,
        platform: "PagosMercantil",
        id: dni,
        lic: env.lic
      };
      this.MasterGETPOST(headersData, this.URLAPISSLTHOMAS).then((data: any) => {
        resolve(data.data.info);
      }).catch((error: any) => {
        reject(error)
      })
    })

  }


  getTypeClient(dni: string) {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        method: `GetTypeClient`,
        token: this.ApiKeyApissl,
        cedula: dni,
        platform: 'PagosMercantil'
      };
      this.MasterGETPOST(headersData, this.urlConsultassslThomas).then((data: any) => {
        resolve(data[0]);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }


  infoEquiposClientes(dni: string) {
    return new Promise(async (resolve: any, reject: any) => {
      const headersData = {
        'method': 'InfoEquipos',
        'token': this.ApiKeyApissl,
        'id': dni,
        'lic': env.lic,
        'platform': 'PagosMercantil',
        'Content-Type': 'application/json'
      };
      this.MasterGETPOST(headersData, this.URLAPISSLTHOMAS).then((data: any) => {
        resolve(data.data.info);
      }).catch((error: any) => {
        reject(error)
      })
    })
  }

  registerEquipo(infoEquipo: RegisterPay): Observable<any> {
    const { name, dni, date, email, nroContrato, img, serial } = infoEquipo;
    let form = {
      fullName: name,
      email,
      dni,
      date,
      contrato: nroContrato,
      img,
      serial
    };
    return this.http.post(`${env.urlDbMapsApi}/create-info/tmFibexSeriales`, form, {
      headers: {
        "x-keys-to-add-id": `[]`,
        "x-keys-of-arrays": `[""]`,
        "x-relations": "false"
      }
    });
  }

  getComprobantClient2(dni: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        //Actualmente el API trae todos los comprobante del usuario
        //Se recomienda que se debe colocar un limite para mejoras en el rendimiento
        this.http.get(`${this.URLGRAPH}?query={RegistroPago(token:"${env.token}",Data:{Cedula:"${dni}"}){Cedula Banco Email Contrato Monto Fecha Tasa_cambio Nombre_Titular Email_Titular Referencia Comprobante Nota}}`).subscribe((response: any) => {
          // console.log(response)
          let jsonres = response.data.RegistroPago;
          if (jsonres && jsonres.length > 0) {
            jsonres.forEach((element: any, index: number) => {
              if (element.hasOwnProperty('Fecha')) {
                element.Fecha = new Date(element.Fecha);
              }
              if (index == jsonres.length - 1) {
                // console.log("Termine");
                // console.log(jsonres);
                resolve(jsonres)
              }
            });
          } else {
            resolve([])
          }
        }, (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error)
      }
    })
  }

  SendWaNotif(Content: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        let Phones = ['584143771155', '584129503127', '584142788259', '584145958585', '584141967028']
        for (let index = 0; index < Phones.length; index++) {
          const DataWa = {
            "lic": env.lic,
            "Mensaje": Content,
            "Phone": Phones[index],
            "Archivos": [
              {
                "filename": "",
                "path": ""
              }
            ]
          }
          const headersData = {
            method: `SendWhats`,
            token: this.ApiKeyApissl,
            platform: "PagosMercantil",
          };
          this.MasterGETPOST(headersData, this.URLAPISSLTHOMASSEND, true, DataWa).then((data: any) => {
            console.log('SendWaNotif :>> ', data);
            resolve(data.data.info);
          }).catch((error: any) => {
            reject(error)
          })

          if (index === Phones.length - 1) {
            resolve(true)
          }

        }

      } catch (error) {
        reject(error)
      }
    })
  }

}
