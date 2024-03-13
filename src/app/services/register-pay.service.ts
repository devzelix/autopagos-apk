import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { RegisterPay } from '../interfaces/registerPay';
import * as CryptoJS from 'crypto-js';
import { SeguridadDatos } from './bscript.service';
import { ResponseMethod } from '../interfaces/response';
import { StripeData } from '../interfaces/stripeData';
import { info } from 'console';

@Injectable({
  providedIn: 'root'
})

export class RegisterPayService {
  private stripeAPI=env.ApiMercantil //Esto luego lo metes en un environment

  private URLGRAPH: string = env.urlGraphql;
  private URLTRASNF: string = env.ApiTransf;
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
        infoClient.name=infoClient.name.replace(/["]+/g, '');
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

        console.log("Esto es lo que estoy enviando");
        console.log(DataQuery);
        console.log("infoClient")
        console.log(infoClient);

        this.http.post(this.URLGRAPH, DataQuery).subscribe((Response: any) => {
          console.log("Respuesta del SAE");
          console.log(Response);
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
        console.log("Hubo un error");
        console.log(error);
        reject(error)
      }
    })
  }

  registerPayClientv2(infoClient: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        infoClient.note = infoClient.note + ' -Recibo:' + infoClient.img
        infoClient.name=infoClient.name.replace(/["]+/g, '');
        console.log(infoClient);
        const DataQuery = {
            Nombre:infoClient.name,
            Cedula:infoClient.dni,
            Email:infoClient.email,
            Motivo:"Pago",
            Fecha:infoClient.date,
            Nota:infoClient.note,
            Imagen:infoClient.img,
            Banco:infoClient.bank,
            id_Cuba:infoClient.id_Cuba,
            Monto:infoClient.amount,
            IdContrato:infoClient.IdContrato,
            comprobante:infoClient.voucher,
            NombreTitular:infoClient.nameTitular || "",
            CedulaTitula:infoClient.dniTitular || "",
            EmailTitular:infoClient.emailTitular || "",
            Tipo:"Pago",
            BancoEmisor:infoClient.BancoEmisor,
            ipaddress:infoClient.AddresIp,
            browser_agent:infoClient.Browser
        }

        this.http.post(this.URLTRASNF+"SearchPay", DataQuery).subscribe((Response: any) => {
          console.log("Respuesta del SAE");
          console.log(Response);
          resolve(Response)
        }, (error) => {
          reject(error)
        })
      } catch (error) {
        console.log("Hubo un error");
        console.log(error);
        reject(error)
      }
    })
  }

  ReferenciaMes(Referencia:any){
    return new Promise(async (resolve: any, reject: any) => {
      let DataQuery= {
        "Referencia":Referencia
      }
      this.http.post(this.URLTRASNF+"SeaRefMs", DataQuery).subscribe((Response: any) => {
        console.log("Repondio");
        console.log(Response);
        resolve(Response)
      }, (error) => {
        reject(error)
      })
    })
  }

  AbonadoSearchSector(abonado:any){
    return new Promise(async (resolve: any, reject: any) => {
      let DataQuery= {
        "abonado":abonado
      }
      this.http.post(this.URLTRASNF+"SearchSector", DataQuery).subscribe((Response: any) => {
        console.log("Repondio");
        console.log(Response);
        resolve(Response)
      }, (error) => {
        reject(error)
      })
    })
  }

  StatusPayAbonado(Abonado: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        console.log("Me llego esto");
        console.log(Abonado);
        const DataQuery = {
          Abonado:Abonado
        }

        this.http.post(this.URLTRASNF+"StatusPay", DataQuery).subscribe((Response: any) => {
          resolve(Response)
        }, (error) => {
          reject(error)
        })
      } catch (error) {
        console.log("Hubo un error");
        console.log(error);
        reject(error)
      }
    })
  }

  StatusPayAbonadoTeen(Abonado: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        console.log("Me llego esto");
        console.log(Abonado);
        const DataQuery = {
          Abonado:Abonado
        }

        this.http.post(this.URLTRASNF+"StatusPaysTeen", DataQuery).subscribe((Response: any) => {
          resolve(Response)
        }, (error) => {
          reject(error)
        })
      } catch (error) {
        console.log("Hubo un error");
        console.log(error);
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

  PostRegisPaypal(BodyJson:any) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let PreHeaders = {
          db: `thomas_cobertura`,
          table: `paypal_pay`,
        };
        const body ={
          name_user: BodyJson.name_user, //us
          customer_id: BodyJson.customer_id,//us
          email: BodyJson.purchase_units[0].payee.email_address,
          payer_id: BodyJson.payer.payer_id,
          id: BodyJson.id,
          abonado: BodyJson.abonado,//us
          id_contrato: BodyJson.id_contrato,//us
          amount: BodyJson.purchase_units[0].amount.value,
          currency: BodyJson.purchase_units[0].amount.currency_code,
          processing_date: BodyJson.create_time,
          status: BodyJson.status
        }
        console.log('body :>> ', body);
        this.security.EncrypDataHash(PreHeaders).then((headers: any) => {
          try {
            this.DbFullPost(this.URLDBFULL, headers, body, '["idstr"]').then((result: any) => {
              console.log('result :>> ', result);
              resolve(result)
            }).catch((err) => {
              console.error(err)
              console.log(new Date());
              reject(err)
            });
          } catch (error) {
            console.error('Error:', error);
            reject(error)
          }
        })
      } catch (error) {
        console.error('Error:', error);
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

  DbFullPost(Url: string, headers1: {}, Databody: any, registerChange: string) {
    console.log('entró :>> ');
    return new Promise(async (resolve: any, reject: any) => {
          try {
            const headersData: any = {
              ...headers1,
              'TokenAuthPlataform': this.tokendbfulll,
              'Authorization': this.authDBFULL,
              'x-keys-to-add-id': `${registerChange}`,
              'x-keys-of-arrays': '[]',
              'x-relations': 'false',
              'Content-Type': 'application/json'
            }
            let databodyF: any = {
              ...Databody,
            }
            console.log('headersData :>> ', headersData);
            console.log('databodyF :>> ', databodyF);
            this.http.post<any>(`${this.URLDBFULL}create-info`, databodyF, { headers: headersData }).subscribe((response: any) => {
              console.log('response :>> ', response);
              let jsonres;
              try {
                if (this.isJsonString(response)) {
                  jsonres = JSON.parse(response)
                } else {
                  jsonres = response
                }
                console.log('salio:>>')
                resolve(jsonres);
              } catch (error) {
                console.log(error)
              }
            }, err => {
              reject(err);
            });
          } catch (error) {
            console.log(error)
            reject(error)
          }
    })
  }

  MasterPOSTDBFULL(headersData: any, body:any, url: string) {
    return new Promise(async (resolve: any, reject: any) => {
      this.security.EncrypDataHash(headersData).then((headers: any) => {
        headers.TokenAuthPlataform = this.tokendbfulll
        headers.Authorization = this.authDBFULL
        this.http.post(url,body,{ headers }).subscribe((res: any) => {
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

  AjusteDataPaypal(Body:any){
    // const BodyJSON ={
    //   name_user: BodyJson.name_user,
    //   customer_id: BodyJson.customer_id,
    //   email: BodyJson.email,
    //   payer_id: BodyJson.payer_id,
    //   id: BodyJson.id,
    //   abonado: BodyJson.abonado,
    //   id_contrato: BodyJson.id_contrato,
    //   amount: BodyJson.amount,
    //   currency: BodyJson.currency,
    //   processing_date: BodyJson.processing_date,
    //   status: BodyJson.status
    // }
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

  getStripePayment(data: any){
    return new Promise((resolve,reject)=>{
      console.log(data);
      const headers = new HttpHeaders({'TokenAuth':env.NewTokenMercantil,'Authorization':env.AuthdbMercantil});
      this.http.post(`${env.ApiMercantil}RegStr`, data,{headers:headers}).subscribe({
        next: data => {
          console.log(data);
          resolve(data)
        },
        error: error => {
          console.log(error);
            reject(error);
        }
    });
    });
  }

  confirmPaymen(data: any){
    return new Promise((resolve,reject)=>{
      this.http.post(`${env.ApiMercantil}payment`, data).subscribe({
        next: data => {
          console.log(data);
            resolve(data)
        },
        error: error => {
          console.log(error);
            reject(error);
        }
    });
    });
  }

  stripePost(data: any) {

    let DataUSer={
      "name_user": data.Name,
      "customer_id": data.c_iDC,
      "stripe_id": data.id,
      "payment_reference": data.payment_method,
      "browser_agent": data.browser_agent,
      "ipaddress": data.ipaddress,
      "abonado": data.Abonado,
      "id_contrato": data.idContrato,
      "amount": data.neto,
      "description": data.description,
      "currency": data.currency,
      "processing_date": data.created,
      "status": data.status
    }
    console.log("Lo que le voy a enviar stripePost");
    console.log(DataUSer);
    const headers = new HttpHeaders({'TokenAuth':env.NewTokenMercantil,'Authorization':env.AuthdbMercantil});
    this.http.post(`${env.ApiMercantil}SavStr`, DataUSer,{headers:headers}).subscribe({
      error: error => {
        console.log(error);
      }
    })

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
        console.log(headersData);
        console.log(body);
        this.security.EncrypDataHash(headersData).then((headers: any) => {
          this.http.post(url, body, { headers }).subscribe((res: any) => {
            let jsonres;
            try {
              if (this.isJsonString(res)) {
                jsonres = JSON.parse(res)
              } else {
                jsonres = res
              }
              resolve(jsonres);
            }catch (error) {
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
          this.http.get(url, { headers }).subscribe((res: any) => {
            let jsonres;
            try {
              if (this.isJsonString(res)) {
                jsonres = JSON.parse(res)
              } else {
                jsonres = res
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
        console.log()
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
            resolve(data);
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
