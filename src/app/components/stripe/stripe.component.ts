import { Component, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardNumberComponent, StripeCardComponent} from 'ngx-stripe';
import { Router } from '@angular/router';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
} from '@stripe/stripe-js';

import { environment as env } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterPayService } from 'src/app/services/register-pay.service';
import Swal from 'sweetalert2';
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { HelperService } from 'src/app/services/helper.service';
import { TypeBrowserService } from 'src/app/services/TypeBrowser';
import { ApiMercantilService } from 'src/app/services/ApiMercantil';
import { ConsultasService } from 'src/app/services/consultas.service';
import { StripeData } from 'src/app/interfaces/stripeData';

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
  public Monto:any; 
  public nameClient:any;
  public saldoUSD: string = '';
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

  public SetInterval: any;
  public newTime: string;
  public Minutes: string;
  public Second: string;
  public errorPin: boolean = false;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#000000bb',
        color: '#31325F',
        fontWeight: 100,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#000000bb'
        }
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
    public registerPayService:RegisterPayService, 
    private _helper: HelperService,
    private _seguridadDatos: SeguridadDatos,
    private router: Router,
    private _TypeBrowserService: TypeBrowserService,
    private _ApiMercantil: ApiMercantilService,
    private _Consultas: ConsultasService,
  ) {
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) : "";
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
    if(minutes && seconds) {
      this.Countdown(minutes, minutes)
      this.pinSend = true
    }
  }

  ngOnInit() {
    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();
    this._ApiMercantil.GetAddress()
      .then((resp: any) => this.IpAddress = resp)
      .catch((error: any) => console.log(error));

    this.Monto = this._seguridadDatos.decrypt(localStorage.getItem("Monto")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Monto")!)  : ""
    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!)  : "";
    // this.Monto=500;
    // this.nameClient='Cliente Prueba'
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required]]
    });
    //Este era de prueba ok
    // this.registerPayService.getStripePayment('hola')
    //       .subscribe((res) => {
            
    //         console.log(res)
    //         this.clientSecret=res;
    //       });
  }

  onChange( ev:any ) {
    let type=ev.type;
    let event=ev.event;
    if (type === 'change') {
      this.stripeCardValid = event.complete;
    }
  }

  Clear() {
    this._helper.dniToReload = this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : null;
    localStorage.clear();
    this.router.navigate(['pay']);

    sessionStorage.setItem('minutes', this.Minutes);
    sessionStorage.setItem('seconds', this.Second);
  }

  public clientSecret:any;

  buy() {
    this.paymentProcessing('Registrando pago', 'Por favor espere...')
    let resultTok:any;
    this.stripeService
      .createToken(this.card.getCard(), { name: this.paymentForm.value.name })
      .subscribe(result => {
        // this.newAmount = {cantidad: result.amount}
        resultTok=result.token
            let data={
              token:result?.token?.id,
              amount:this.Monto*100,
              paquete: this.paquete
            }
            //Aqui
            this.registerPayService.getStripePayment(data)
            .then((res:any)=>{
                if(res.pago){
                    // console.log("Stripe registerPayService");
                    let client_secret=res.pago.client_secret
                    // console.log(client_secret)
                    this.stripeService.confirmCardPayment(client_secret, 
                      {
                        payment_method: { card: this.card.getCard() },
                      }).subscribe(result =>{
                        console.log("REspondio el confirmCardPayment");
                        console.log(result);
                      if(result.error){
                        Swal.fire({
                          icon: 'error',
                          title: 'Ocurrió un error con tu pago',
                          text: result.error.message
                        });
                      }
                      else{
                        // this.newAmount = {cantidad: result.paymentIntent?.amount};
                        Swal.fire({
                          icon: 'success',
                          title: 'Exitoso',
                          text: 'Pago exitoso'
                        }).then(res => {
                          if(res.isConfirmed){ 
                            this.showReceipt = true
                            this.PostData(result.paymentIntent);
                          }

                        })
                      }
                        
                    })
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
      //timer: 5000,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  ClaveAuthStripe() {
    // TODO: Michael queda pendiente por la API para poder postear estos datos 
    // TODO: Realizar sweet alert para comprobar si el pin retornado de la api es el mismo que se tipea
    // TODO: Peticion
    // this._Consultas.GeneratePin(String(this.c_i), "PinPagos")
    // .then((res: any) => {
    //   if(res.status) {
    //     this.buy();
    //   }
    // })
    // .catch(err => console.error(err))
    this._Consultas.GeneratePin(String(this.c_i), "PinPagos")
    .then((res: any) => {
      if(res.status) {
        this.pinSend = true;
        this.Countdown(1, 59);

        Swal.fire({
          title: 'Ingrese el PIN recibido.',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Enviar',
          cancelButtonText: 'Cancelar',
          showLoaderOnConfirm: true,
          preConfirm: (pin) => {
            this._Consultas.VerificarPin(this.c_i, pin).then( async (response: any) => {
              if(response.status) {
                if(sessionStorage.getItem('minutes') && sessionStorage.getItem('seconds')) {
                  sessionStorage.removeItem('minutes');
                  sessionStorage.removeItem('seconds');
                }
                await this.buy();
              }else{
                this.errorPin = true;
              } 
            })
          },
          allowOutsideClick: () => !Swal.isLoading()
        })
      }
    })
    .catch(err => console.error(err))
  }

  PostData(DataStripe:any){
    let DatosUserAgent= {
      c_iDC: this.c_i,
      Abonado: this.nroContrato,
      Name: this.name,
      idContrato: this.idContrato,
      browser_agent: this.TypeNavegador,
      ipaddress: this.IpAddress.ip,
      ...DataStripe
    }

    this.registerPayService.stripePost(DatosUserAgent)
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




