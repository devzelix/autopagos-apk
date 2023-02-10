import { Component, OnInit } from '@angular/core';
import { ICreateOrderRequest } from "ngx-paypal";
import { environment } from 'src/environments/environment';
import { RegisterPayService } from '../../services/register-pay.service';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit {

  public payPalConfig: any;

  constructor(private _RegisterPayService:RegisterPayService) { }

  ngOnInit() {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: "USD",
      clientId: environment.clientId,
      createOrderOnClient: (data: any) => <ICreateOrderRequest> {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "10", //total a pagar
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: "10"
                  }
                }
              },
              items: [
                {
                  name: "Pago Servicio Fibex Telecom",
                  quantity: "1",
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: "USD",
                    value: "10"
                  }
                }
              ]
            }
          ]
        },
      advanced: {
        commit: "true"
      },
      style: {
        label: "paypal",
        layout: "vertical"
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

      // Name: this.name?.value,
      // Abonado: this.nroContrato?.value,
      // idContrato: this.idContrato,
        this._RegisterPayService.PostRegisPaypal(data);
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
