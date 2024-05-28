import { Component, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardNumberComponent, StripeCardComponent } from 'ngx-stripe';
import { Router } from '@angular/router';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterPayService } from 'src/app/services/register-pay.service';
import Swal from 'sweetalert2';
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { HelperService } from 'src/app/services/helper.service';
import { TypeBrowserService } from 'src/app/services/TypeBrowser';
import { ApiMercantilService } from 'src/app/services/ApiMercantil';
import { ConsultasService } from 'src/app/services/consultas.service';


@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss']
})

export class StripeComponent implements OnInit {
  paymentForm: FormGroup;
  stripeCardValid: boolean = false;
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  public pinSend: boolean = false;
  public nameClient: any;
  public saldoUSD: any = '';
  public saldoBs: string = '';
  public saldoText: string = '';
  public paquete: string = '';
  public subscription: string = '';
  public showReceipt: boolean = false;
  public newAmount: object;

  private TypeNavegador: string;
  private IpAddress: any;
  private c_i: any;
  private nroContrato: any;
  private name: any;
  private idContrato: any;

  public AmountMinin: boolean = true;
  public SetInterval: any;
  public newTime: string;
  public Minutes: string;
  public Second: string;
  public errorPin: boolean = false;
  public MountNegative: boolean = false; //Esto debe ir true por defecto ojo acomodar horita es temporal
  public ValidoPagoStripe: boolean = false;
  public MontoCancelar: string = "";
  private StripeTasa: number = 4;
  private ComissionF: number = 0.3;

  cardOptions: StripeCardElementOptions = {
    iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#000000bb',
        color: '#31325F',
        fontWeight: 100,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#000000bb'
        },
      }
    }
  };
  
  get validForm() {
    return this.stripeCardValid;
  }

  elementsOptions: StripeElementsOptions = {
    locale: 'es'
  };

  constructor(
    private fb: FormBuilder,
    private stripeService: StripeService,
    public registerPayService: RegisterPayService,
    private _helper: HelperService,
    private _seguridadDatos: SeguridadDatos,
    private router: Router,
    private _TypeBrowserService: TypeBrowserService,
    private _ApiMercantil: ApiMercantilService,
    private _Consultas: ConsultasService,
  ) {
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
    this.MontoCancelar = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
    this.saldoBs = this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) ? this._seguridadDatos.decrypt(localStorage.getItem("MontoBs")!) : "";
    this.saldoText = this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Saldo")!) : "";
    this.paquete = JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)) != "" ? JSON.parse(this._seguridadDatos.decrypt(localStorage.getItem("Service")!)).join() : "";
    this.subscription = this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Subscription")!) : "";
    this.c_i = this._seguridadDatos.decrypt(localStorage.getItem('dni')!) ? this._seguridadDatos.decrypt(localStorage.getItem('dni')!) : "";
    this.nroContrato = this._seguridadDatos.decrypt(localStorage.getItem('Abonado')!) ? this._seguridadDatos.decrypt(localStorage.getItem('Abonado')!) : "";
    this.name = this._seguridadDatos.decrypt(localStorage.getItem('Name')!) ? this._seguridadDatos.decrypt(localStorage.getItem('Name')!) : "";
    this.idContrato = this._seguridadDatos.decrypt(localStorage.getItem('idContrato')!) ? this._seguridadDatos.decrypt(localStorage.getItem('idContrato')!) : "";

    let minutes = parseInt(sessionStorage.getItem('minutes')!);
    let seconds = parseInt(sessionStorage.getItem('seconds')!);
    if (minutes && seconds) {
      this.Countdown(minutes, minutes)
      this.pinSend = true
    }
  }

  ngOnInit() {
    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();
    this._ApiMercantil.GetAddress()
      .then((resp: any) => this.IpAddress = resp)
      .catch((error: any) => console.log(error));

    this.paymentForm = this.fb.group({
      cantidad: ['', [Validators.required]]
    });

    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!) : "";
    if (Number(this.saldoUSD <= 1)) {
      // this.saldoUSD = "1";
      // this.cantidadStripe?.setValue('1');
      this.ValidoPagoStripe = true;
      
    } else {
      this.MountNegative = true;
      this.cantidadStripe?.setValue(this.MontoCancelar);
    }
    this.PagoACobrar();

    //this.PagoACobrar();//Temporalll
  }

  get cantidadStripe() { return this.paymentForm.get('cantidad'); }

  onChange(ev: any) {
    let type = ev.type;
    let event = ev.event;
    if (type === 'change') {
      this.stripeCardValid = event.complete;
    }
  }

  Clear() {
    this._helper.dniToReload = this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : null;
    localStorage.clear();
    this.router.navigate(['']);

    sessionStorage.setItem('minutes', this.Minutes);
    sessionStorage.setItem('seconds', this.Second);
  }

  PagoACobrar() {
    this.cantidadStripe?.valueChanges.subscribe({

      next: (value) => {

        if(value <= 0){
          this.AmountMinin = false;
          return;
        }
        
        if (value) {
          if (Number(value) > Number(this.saldoUSD) && Number(value) > Number(this.subscription) * 3) {
            this.ValidoPagoStripe = true;
            this.invalidForm(`Usted no puede reportar con más de 3 meses de su suscripción`, ``);
            this.cantidadStripe?.setValue('');
            return;
          } else {
            this.AmountMinin = true;
            this.ValidoPagoStripe = false;
          }
          this.saldoUSD = value;
          this.GetMontoNetoRecibir();
        }
      }
    })
  }

  GetMontoNetoRecibir() {
    return (eval(`parseFloat((100*(this.ComissionF + Number(this.saldoUSD))) / (0 - this.StripeTasa + 100)).toFixed(2)`));
  }


  invalidForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'error'
    })
  }

  public clientSecret: any;

  buy() {
    this.paymentProcessing('Registrando pago', 'Por favor espere...')
    let resultTok: any;
    this.stripeService
      .createToken(this.card.getCard(), { name: this.paymentForm.value.name })
      .subscribe(result => {
        resultTok=result.token
            let data={
              abonado: this.nroContrato,
              token:result?.token?.id,
              amount:this.GetMontoNetoRecibir()*100,
              paquete: this.paquete
            }
            //Aqui
            this._ApiMercantil.getStripePayment(data)
            .then((res:any)=>{
                if(res.pago){
                    let client_secret=res.pago.client_secret
                    this.stripeService.confirmCardPayment(client_secret, 
                      {
                        payment_method: { card: this.card.getCard() },
                      }).subscribe((result:any) =>{
                      if(result.error){
                        this.paymentReject('Ocurrió un error con tu pago',result.error.message);
                      }
                      else{
                        this.paymentAproved('Exitoso','Pago exitoso')
                        this.showReceipt = true;
                        result.paymentIntent.neto=this.saldoUSD
                        this.PostData(result.paymentIntent);
                      }
                        
                    })
              }else{
                this.paymentReject('Ocurrió un error con tu pago','Intenta de nuevo en otro momento');
              }
            })
            .catch((error:any)=>{
              console.log(error);
            })
      });
  }

  paymentProcessing(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  paymentAproved(title: string, message: string) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message
    })
  }

  paymentReject(title: string, message: string) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message
    });
  }

  ClaveAuthStripe() {
    this._Consultas.GeneratePin(String(this.c_i), "PinPagos")
      .then((res: any) => {
        if (res.status) {
          this.pinSend = true;
          this.Countdown(1, 59);

          Swal.fire({
            title: 'Ingrese el PIN recibido.',
            text: "Enviado vía Correo y SMS",
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: (pin) => {
              this._Consultas.VerificarPin(this.c_i, pin).then(async (response: any) => {
                if (response.status) {
                  if (sessionStorage.getItem('minutes') && sessionStorage.getItem('seconds')) {
                    sessionStorage.removeItem('minutes');
                    sessionStorage.removeItem('seconds');
                  }
                  await this.buy();
                } else {
                  this.errorPin = true;
                }
              })
            }
          })
        }
      })
      .catch(err => console.error(err))
  }

  PostData(DataStripe: any) {
    let DatosUserAgent = {
      c_iDC: this.c_i,
      Abonado: this.nroContrato,
      Name: this.name,
      idContrato: this.idContrato,
      browser_agent: this.TypeNavegador,
      ipaddress: this.IpAddress.ip,
      ...DataStripe
    }

    this._ApiMercantil.stripePost(DatosUserAgent)
  }

  Countdown(Minute: number, Seconds: number) {
    var date = new Date();
    date.setMinutes(Minute);
    date.setSeconds(Seconds);
    var padLeft = (n: any) => "00".substring(0, "00".length - n.length) + n;

    this.SetInterval = setInterval(() => {
      this.Minutes = padLeft(date.getMinutes() + "");
      this.Second = padLeft(date.getSeconds() + "");
      date = new Date(date.getTime() - 1000);

      this.newTime = `${this.Minutes}:${this.Second}`
      if (this.Minutes == '00' && this.Second == '00') {
        this.Minutes = "";
        this.Second = "";
        this.newTime = ""
        clearInterval(this.SetInterval);
        this.pinSend = false;
      }
    }, 1000);
  }
}




