import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardNumberComponent, StripeCardComponent} from 'ngx-stripe';
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

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss']
})
export class StripeComponent implements OnInit {
  paymentForm: FormGroup;
  stripeCardValid: boolean = false;
  @ViewChild(StripeCardComponent) card: StripeCardComponent;
  public Monto:any; 
  public nameClient:any;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: 100,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
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
    private seguridadDatos:SeguridadDatos
  ) { }

  ngOnInit() {
    // this.Monto =localStorage.getItem("Monto") ? localStorage.getItem("Monto") : "";
    // this.nameClient =localStorage.getItem("Name") ? localStorage.getItem("Name") : "";
    this.Monto=500;
    this.nameClient='Cliente Prueba'
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
  public clientSecret:any;

  buy() {
    this.stripeService
      .createToken(this.card.getCard(), { name: this.paymentForm.value.name })
      .subscribe(result => {
        console.log("Stripe Servicio");
        let resultTok:any;
        resultTok=result.token
            let data={
              token:result?.token?.id,
              name:this.nameClient,
              amount:this.Monto*100
            }
            //Aqui
            this.registerPayService.getStripePayment(data)
            .then((res:any)=>{
                if(res.pago){
                    console.log("Stripe registerPayService");
                    let client_secret=res.pago.client_secret
                    console.log(client_secret)
                    this.stripeService.confirmCardPayment(client_secret, 
                      {
                        payment_method: { card: this.card.getCard() },
                      }).subscribe(result =>{
                      if(result.error){
                        Swal.fire({
                          icon: 'error',
                          title: 'Correo erróneo',
                          text: result.error.message
                        });
                      }
                      else{
                        Swal.fire({
                          icon: 'success',
                          title: 'Exitoso',
                          text: 'Pago exitoso'
                        });
                      }
                        
                    })
              }
            })
            .catch((error:any)=>{
              console.log(error);
            })
      });
  }
}


