import { NgModule } from '@angular/core';
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

import { NegativeAmountPipe } from './pipe/negative-amount.pipe';
import { DialogDetailComprobantesComponent } from './components/dialog-detail-comprobantes/dialog-detail-comprobantes.component';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { SeguridadDatos } from './services/bcryptjs';
import { CoincoinxComponent } from './components/coincoinx/coincoinx.component';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  { path: 'pay', component: FormComponent },
  {  path: 'serial', component: SerialComponent },
  { path: 'coinx', component: CoincoinxComponent },
  { path: '',   redirectTo: '/pay', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    SerialComponent,
    FooterComponent,
    ImageComponent,
    NavComponent,
    NegativeAmountPipe,
    DialogDetailComprobantesComponent,
    CoincoinxComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule.forRoot(routes),
    NgHcaptchaModule.forRoot({
      siteKey: environment.CaptchaSiteKey,
      // languageCode: 'de' // optional, will default to browser language
    }),
  ],
  providers: [
    NegativeAmountPipe,
    SeguridadDatos
  ],
  exports:[MaterialModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
