import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { StripeService, StripeCardNumberComponent, StripeCardComponent } from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
} from '@stripe/stripe-js';

import { environment as env } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss']
})
export class StripeComponent implements OnInit {
  // @ViewChild(StripeCardComponent) card: StripeCardComponent;

  // cardOptions: StripeCardElementOptions = {
  //   style: {
  //     base: {
  //       iconColor: '#666EE8',
  //       color: '#31325F',
  //       fontWeight: '300',
  //       fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  //       fontSize: '18px',
  //       '::placeholder': {
  //         color: '#CFD7E0'
  //       }
  //     }
  //   }
  // };

  // elementsOptions: StripeElementsOptions = {
  //   locale: 'es'
  // };

  // stripeTest: FormGroup;

  // constructor(private fb: FormBuilder, private stripeService: StripeService) {
  //   this.stripeTest = this.fb.group({
  //     name: ['', [Validators.required]]
  //   });
  // }

  // ngOnInit(): void {
 
  // }

  // createToken(): void {
  //   const name = this.stripeTest.get('name')?.value;
  //   this.stripeService
  //     .createToken(this.card.element, { name })
  //     .subscribe((result) => {
  //       if (result.token) {
  //         // Use the token
  //         console.log(result.token.id);
  //       } else if (result.error) {
  //         // Error creating the token
  //         console.log(result.error.message);
  //       }
  //     });
  // }
  paymentForm: FormGroup;
  stripeCardValid: boolean = false;
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: 300,
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
    private stripeService: StripeService
  ) { }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  onChange( ev:any ) {
    let type=ev.type;
    let event=ev.event;
    if (type === 'change') {
      this.stripeCardValid = event.complete;
    }
  }

  buy() {
    this.stripeService
      .createToken(this.card.getCard(), { name: this.paymentForm.value.name })
      .subscribe(result => {
        if (result.token) {
          console.log(result.token);
        } else if (result.error) {
          console.log(result.error.message);
        }
      });
  }
}

