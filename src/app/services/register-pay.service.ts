import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment.prod';
import { RegisterPay } from '../interfaces/registerPay';

@Injectable({
  providedIn: 'root'
})
export class RegisterPayService {

  private URLGRAPH: string = env.urlGraphql;
  private URLGRAPHCONTRACT: string = env.urlGraphqlContract;
  private URLAPITHOMAS: string = env.urlThomasApi;
  public dniCustomerContract: string
  public amountCustomerContract: string
  public linkedToContractProcess: string

  constructor(
    private http: HttpClient,
  ) { }

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
          console.log('Response', Response)
        }
          , (error) => {
            reject(error)
          })

      } catch (error) {
        reject(error)
      }
    })
  }

  GetDataClient(Cedula: any) {
    return new Promise(async (resolve: any, reject: any) => {
      this.http.get(`${env.urlBackThomas}find-any-info/thomas_cobertura/tmClientes/identidad/${Cedula}`).subscribe((ResClient: any) => {
        resolve(ResClient)
      }, err => {
        reject(err)
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

  ConsultarEstadoDeposito(nroContrato: any, Referencia: any) {
    return this.http.get(`${this.URLAPITHOMAS}ConciliacionPago/${nroContrato}/${Referencia}/${env.lic}`)
      .pipe(
        map((res: any) => {
          let jsonres = JSON.parse(res);
          return jsonres
        }
        ))
  }

  GetListService(id_contrato: any) {
    return this.http.get(`${this.URLAPITHOMAS}ServiciosIdCo/${id_contrato}/${env.lic}`)
      .pipe(
        map((res: any) => {
          let jsonres = JSON.parse(res);
          return jsonres
        }
        ))
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
    return this.http.get(`${this.URLAPITHOMAS}CtasBancarias/${env.lic}`)
      .pipe(
        map((res: any) => {
          let jsonres = JSON.parse(res);
          return jsonres.data.info;
        }
        ))
  }


  getSaldoByDni(dni: string) {
    return this.http.get(`${this.URLAPITHOMAS}SaldoCe/${dni}/${env.lic}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .pipe(
        map((res: any) => {
          let jsonres = JSON.parse(res);
          return jsonres.data.info;
        })
      );
  }

  getTypeClient(dni: string) {
    return this.http.get(`${this.URLAPITHOMAS}GetTypeClient/${dni}`,
    )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }


  infoEquiposClientes(dni: string) {
    return this.http.get<any>(`${this.URLAPITHOMAS}InfoEquipos/${dni}/${env.lic}`)
      .pipe(
        map((res: any) => {
          let result = JSON.parse(res);
          if (result.data.info.length > 0) {
            return result.data.info;
          }
          return [];
        })
      );
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

          this.http.post(env.urlThomasApi + `SendWhats`, DataWa).subscribe((response: any) => {

          }, (error) => {
            reject(error);
          });

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
