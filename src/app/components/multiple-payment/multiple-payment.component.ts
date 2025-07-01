import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-multiple-payment',
  templateUrl: './multiple-payment.component.html',
  styleUrls: ['./multiple-payment.component.scss']
})
export class MultiplePaymentComponent implements AfterViewInit {

  @Input() viewMultiple: boolean = true;
  @Input() activePaymentMonth: number = 1;
  @Input() tasaCambio: string = '0.00';
  @Input() saldoUSD: string = '0.00';
  @Input() saldoBs: string = '0.00';
  @Input() subscription: string = '0.00';
  @Input() monthPayCount: number = 1;
  @Input() mountTotalMonthBs: string = '0.00';
  @Input() mountTotalMonthUSD: string = '0.00';

  @Output() totalBs = new EventEmitter<string>();
  @Output() totalUSD = new EventEmitter<string>();

  constructor() {}

  /* ngOnInit(): void {
  } */
  ngAfterViewInit(): void {
  }

  // onDestroy() {
  //   console.log('MultiplePaymentComponent destroyed');
  //   // this.totalBs.emit(String(this.mountTotalMonthBs));
  //   // this.totalUSD.emit(String(this.mountTotalMonthUSD));
  // }

  public setMonthPayment (numMonth:number) {
    let subscriptionBs = parseFloat( (parseFloat(this.subscription) * parseFloat(this.tasaCambio)).toFixed(2) );
    console.log('setMonthPayment num month:', numMonth,' Saldo Bs:', this.saldoBs,' Saldo USD:', this.saldoUSD, ' Subscription USD:', this.subscription, ' Subscription Bs:', subscriptionBs, ' Tasa cambio:', this.tasaCambio)
    this.activePaymentMonth = numMonth;

    this.mountTotalMonthBs =  parseFloat(( ( parseFloat(this.saldoBs) > 0 ? parseFloat(this.saldoBs) : 0) + (subscriptionBs * (numMonth))).toFixed(2)).toFixed(2);
    this.mountTotalMonthUSD = parseFloat(( ( parseFloat(this.saldoBs) > 0 ? parseFloat(this.saldoUSD) : 0 ) + ((parseFloat(this.subscription) * (numMonth)))).toFixed(2)).toFixed(2);

    this.totalBs.emit(String(this.mountTotalMonthBs));
    this.totalUSD.emit(String(this.mountTotalMonthUSD));

  }
}
