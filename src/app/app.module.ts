import { ErrorHandler, NgModule } from '@angular/core';
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


const routes: Routes = [
  { path: '', component: FormComponent },
  { path: 'pay', component: FormComponent },
  {  path: 'serial', component: SerialComponent },
  { path: 'coinx', component: CoincoinxComponent },
  { path: 'paypal', component: PaypalComponent },
  {path:'stripe', component:StripeComponent},
  //{ path: '',   redirectTo: '/', pathMatch: 'full' }
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
    NegativeAmountPipe,
    DialogDetailComprobantesComponent,
    CoincoinxComponent,
    PaypalComponent, 
    StripeComponent
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
  exports:[MaterialModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
