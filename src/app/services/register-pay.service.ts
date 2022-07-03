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
  private URLAPITHOMAS: string = env.urlThomasApi;

  constructor(
    private http: HttpClient,
  ) { }

  registerPayClient(infoClient: RegisterPay): Observable<any> {
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
  }

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

}
