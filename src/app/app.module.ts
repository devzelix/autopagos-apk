import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { FormComponent } from './components/form/form.component';
import { FooterComponent } from './components/footer/footer.component';
import { SerialComponent } from './components/serial/serial.component';
import { ImageComponent } from './components/image/image.component';
import { NavComponent } from './components/nav/nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { NgxPayPalModule } from 'ngx-paypal';

import { NegativeAmountPipe } from './pipe/negative-amount.pipe';
import { DialogDetailComprobantesComponent } from './components/dialog-detail-comprobantes/dialog-detail-comprobantes.component';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { SeguridadDatos } from './services/bcryptjs';
import { CoincoinxComponent } from './components/coincoinx/coincoinx.component';
import { environment } from 'src/environments/environment';
import { CaptchaThomasModule } from 'captcha-thomas';
import { GlobalErrorHandler } from './utils/GlobalErrorHandler';
import { PaypalComponent } from './components/paypal/paypal.component';
import { StripeComponent } from './components/stripe/stripe.component';
import { NgxStripeModule } from 'ngx-stripe';
import { TableReceiptComponent } from './components/table-receipt/table-receipt.component';
import { PaymentDialogComponent } from './components/payment-dialog/payment-dialog.component';
import { PaymentDialogOptionsComponent } from './components/payment-dialog-options/payment-dialog-options.component';
import { PaymenDialogZelleComponent } from './components/paymen-dialog-zelle/paymen-dialog-zelle.component';
import { ReplacePipe } from './pipe/replace.pipe';
import { DetallePayComponent } from './components/detalle-pay/detalle-pay.component'
import { InfoPayComponent } from './components/info-pay/info-pay.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ListBankComponent } from './components/list-bank/list-bank.component';
import { DebitoCreditoBNCComponent } from './components/debito-credito-bnc/debito-credito-bnc.component';
import { Debit100x100 } from './components/debito-100%/debito-100%';
import { KeyboardOnScreenComponent } from './components/keyboard-on-screen/keyboard-on-screen.component'; 
import { ModalPaymentComponent } from './components/modal-payment/modal-payment.component';
import { TabDniComponent } from './components/tabs/tab-dni/tab-dni.component';


const routes: Routes = [
  { path: '', component: FormComponent },
  { path: 'pay', component: FormComponent },
  { path: 'serial', component: SerialComponent },
  { path: 'coinx', component: CoincoinxComponent },
  { path: 'paypal', component: PaypalComponent },
  { path: 'stripe', component: StripeComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    SerialComponent,
    FooterComponent,
    ImageComponent,
    TableReceiptComponent,
    NavComponent,
    PaymentDialogComponent,
    PaymentDialogOptionsComponent,
    PaymenDialogZelleComponent,
    NegativeAmountPipe,
    ReplacePipe,
    DialogDetailComprobantesComponent,
    CoincoinxComponent,
    PaypalComponent,
    StripeComponent,
    DetallePayComponent,
    InfoPayComponent,
    ListBankComponent,
    DebitoCreditoBNCComponent,
    Debit100x100,
    KeyboardOnScreenComponent,
    ModalPaymentComponent,
    TabDniComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    CaptchaThomasModule,
    NgxStripeModule.forRoot(environment.TokenStripe),
    NgxPayPalModule,
    RouterModule.forRoot(routes),
    QRCodeModule,
    NgHcaptchaModule.forRoot({
      siteKey: environment.CaptchaSiteKey,
      // languageCode: 'de' // optional, will default to browser language
    }),
  ],
  providers: [
    NegativeAmountPipe,
    SeguridadDatos,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  exports: [MaterialModule],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
