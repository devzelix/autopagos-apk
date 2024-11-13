import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multiple-payment',
  templateUrl: './multiple-payment.component.html',
  styleUrls: ['./multiple-payment.component.scss']
})
export class MultiplePaymentComponent implements OnInit {

  @Input() viewMultiple: boolean = true;
  @Input() tasaCambio: string = '0.00';
  @Input() saldoUSD: string = '0.00';
  @Input() saldoBs: string = '0.00';
  @Input() subscription: string = '0.00';
  @Input() monthPayCount: number = 1;
  @Input() mountTotalMonthBs: string = '0.00';
  @Input() mountTotalMonthUSD: string = '0.00';

  @Output() totalBs = new EventEmitter<string>();
  @Output() totalUSD = new EventEmitter<string>();

  public activePaymentMonth: number = 1;

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier lógica que necesites al cargar el componente
  }

  public setMonthPayment (numMonth:number) {

    let subscriptionBs = Number(this.subscription) * Number(this.tasaCambio);
    this.activePaymentMonth = numMonth;

    this.mountTotalMonthBs = numMonth > 1 ? ( Number(this.saldoBs) + (subscriptionBs * (numMonth- 1))).toFixed(2) : this.saldoBs;
    this.mountTotalMonthUSD = numMonth > 1? ( Number(this.saldoUSD) + ((Number(this.subscription) * (numMonth - 1)))).toFixed(2) : this.saldoUSD ;

    this.totalBs.emit(this.mountTotalMonthBs);
    this.totalUSD.emit(this.mountTotalMonthUSD);

  }
}
