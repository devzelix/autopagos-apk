import { Component, OnInit } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';


@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent{

  public mobileQuery: MediaQueryList;

  constructor(public media: MediaMatcher) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    console.log(this.mobileQuery)
  }
}
