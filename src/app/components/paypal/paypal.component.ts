import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICreateOrderRequest } from "ngx-paypal";
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { HelperModalsService } from 'src/app/services/helper-modals.service';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';
import { RegisterPayService } from '../../services/register-pay.service';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit {

  public payPalConfig: any;
  public nameClient: string = ''
  public saldoUSD: string = ''
  public paquete: string = ''
  public saldoBs: string = ''
  public saldoText: string = ''
  public subscription: string = ''

  constructor(private _RegisterPayService: RegisterPayService, private _seguridadDatos: SeguridadDatos, private _hModal: HelperModalsService, private _helper: HelperService, public router: Router) {
    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!) : "";
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
    this.paquete = JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)) != "" ? JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)).join() : "";
    this.saldoBs = this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) ? this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) : "";
    this.saldoText = this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) : "";
    this.subscription = this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) : "";
  }

  ngOnInit() {
    this.initConfig();
  }

  Clear() {
    this._helper.dniToReload = this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : null;
    localStorage.clear();
    this.router.navigate(['pay']);
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: "USD",
      clientId: environment.clientId,
      createOrderOnClient: (data: any) => <ICreateOrderRequest>{
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "", //total a pagar
              // value: "1", //total a pagar
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "",
                  // value: "1",
                }
              }
            },
            items: [
              {
                name: JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)).join() ? JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)).join() : "Pago Servicio Fibex Telecom",
                quantity: "1",
                category: "DIGITAL_GOODS",
                unit_amount: {
                  currency_code: "USD",
                  value: this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "",
                  // value: "1",
                }
              }
            ]
          }
        ]
      },
      advanced: {
        commit: "true",
        extraQueryParams: [{ name: "disable-funding", value: "credit,card" }]
      },
      style: {
        layout: "vertical",
        shape: "pill",
        label: "paypal",
        tagline: false,
        color: "blue"
      },
      onApprove: (data: any, actions: any) => {
        console.log(
          "onApprove - transaction was approved, but not authorized",
          data,
          actions
        );
        actions.order.get().then((details: any) => {
          console.log(
            "onApprove - you can get full order details inside onApprove: ",
            details
          );
        });
      },
      onClientAuthorization: (data: any) => {
        console.log(
          "onClientAuthorization - you should probably inform your server about completed transaction at this point",
          data
        );
        const dataRegis = {
          ...data,
          abonado: this._seguridadDatos.decrypt(localStorage.getItem("Abonado")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Abonado")!) : "",//us
          id_contrato: this._seguridadDatos.decrypt(localStorage.getItem("idContrato")!) ? this._seguridadDatos.decrypt(localStorage.getItem("idContrato")!) : "",//us
          name_user: this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!) : "", //us
          customer_id: this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : "",//us
        }
        this._RegisterPayService.PostRegisPaypal(dataRegis).then((payResult) => {
          try {
            if (payResult.status === 'COMPLETED') {
              this._hModal.alertexit("Pago aprobado").then((result) => {
                if (result) {
                  this.Clear()
                }
              })
            }
          } catch (error) {
            console.error('Error:', error);
          }
        });
      },
      onCancel: (data: any, actions: any) => {
        console.log("OnCancel", data, actions);
      },
      onError: (err: any) => {
        console.log("OnError", err);
      },
      onClick: (data: any, actions: any) => {
        console.log("onClick", data, actions);
      }
    };
  }

}
