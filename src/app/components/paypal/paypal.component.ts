import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICreateOrderRequest } from "ngx-paypal";
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { HelperModalsService } from 'src/app/services/helper-modals.service';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';
import { RegisterPayService } from '../../services/register-pay.service';
import { ApiMercantilService } from '../../services/ApiMercantil';
import { TypeBrowserService } from '../../services/TypeBrowser';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { isNegativeNumber } from '../../validators/customValidatorAmount';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit {

  public montoComision: number;
  public payPalConfig: any;
  public nameClient: string = ''
  public saldoUSD: string = ''
  public paquete: string = ''
  public saldoBs: string = ''
  public saldoText: string = ''
  public subscription: string = ''
  private TypeNavegador: string ='';
  private PaypalTasa:number = 5.4;
  private ComissionF:number = 0.3;
  public MontoCancelar: any="";
  public ValidoPagoPaypal: boolean= false;
  public ReciberPay: boolean = false;
  public MountNegative: boolean = false;
  
  public MountPaypal: FormGroup;
  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public TasaCambio: string ="";

  constructor(private _TypeBrowserService: TypeBrowserService,private fb: UntypedFormBuilder ,private _seguridadDatos: SeguridadDatos, private _hModal: HelperModalsService, private _helper: HelperService, public router: Router,private _apimercantil: ApiMercantilService) {
    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!) : "";
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
    this.paquete = JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)) != "" ? JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)).join() : "";
    this.saldoBs = this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) ? this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) : "";
    this.saldoText = this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) : "";
    this.subscription = this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) : "";
    this.TasaCambio = this._seguridadDatos.decrypt(localStorage.getItem("TasaCambio")!) ? this._seguridadDatos.decrypt(localStorage.getItem("TasaCambio")!) : "";
    this.TasaCambio = this._seguridadDatos.decrypt(localStorage.getItem("TasaCambio")!) ? this._seguridadDatos.decrypt(localStorage.getItem("TasaCambio")!) : "";
  }

  ngOnInit() {
    this.MountPaypal = this.fb.group({
      cantidad: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
    },{ validator: isNegativeNumber })
    this.MontoCancelar = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
    this.initConfig();
    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();
    if(Number(this.MontoCancelar<=1)){
      this.MontoCancelar ="1";
      this.cantidadPaypal?.setValue('1');
      this.PagoACobrar();
    }else{
      this.MountNegative=true;
    }
    
    
  }

  get cantidadPaypal() { return this.MountPaypal.get('cantidad'); }

  PagoACobrar(){
    this.cantidadPaypal?.valueChanges.subscribe({
      
      next: (value) => {
        if (value) {
          if (Number(value) > Number(this.saldoUSD) && Number(value) > Number(this.subscription) * 3) {
            this.ValidoPagoPaypal = true;
            this.invalidForm(`Usted no puede reportar con más de 3 meses de su subscripción`, ``);
            this.cantidadPaypal?.setValue('');
            return;
          }else{
            this.ValidoPagoPaypal = false;
          }
          this.MontoCancelar=value;
          this.GetMontoNetoRecibir();
        }
      }
    })
  }

  invalidForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'error'
    })
  }

  

  Clear() {
    this._helper.dniToReload = this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : null;
    localStorage.clear();
    this.router.navigate(['pay']);
  }

  GetMontoNetoRecibir(){
    return (eval(`parseFloat((100*(this.ComissionF + Number(this.MontoCancelar))) / (0 - this.PaypalTasa + 100)).toFixed(2)`));
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: "USD",
      clientId: environment.clientIdP,
      createOrderOnClient: (data: any) => <ICreateOrderRequest>{
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: this.GetMontoNetoRecibir(), //total a pagar
              // value: "1", //total a pagar
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: this.GetMontoNetoRecibir(),
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
                  value: this.GetMontoNetoRecibir(),
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
          addresip: this._seguridadDatos.decrypt(localStorage.getItem("IpAdress")!) ? this._seguridadDatos.decrypt(localStorage.getItem("IpAdress")!) : "",//us
          browser_agent: this.TypeNavegador,
          montoarecibir: this.MontoCancelar
        }
       // this._RegisterPayService.PostRegisPaypal(dataRegis).then((payResult) => {
        if (data.status === 'COMPLETED') {
          if(Number(data.purchase_units[0].amount.value) == this.GetMontoNetoRecibir() || Number(data.purchase_units[0].amount.value) >= this.GetMontoNetoRecibir()){
            this._apimercantil.RegPay(dataRegis).then((resp:any)=>{
              try {
                  this.ReciberPay = true;
                  this._hModal.alertexit("Pago aprobado")
              } catch (error) {
                console.error('Error:', error);
              }
            })
            .catch((error:any)=>console.error(error));
          }else{
            this._hModal.invalidForm("El monto es menor a lo indicado, por favor comuniquese con soporte");
          }
        }
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
