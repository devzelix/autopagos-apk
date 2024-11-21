import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-unique-payment',
  templateUrl: './unique-payment.component.html',
  styleUrls: ['./unique-payment.component.scss']
})
export class UniquePaymentComponent implements OnInit {

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
  public viewMultiplePayments: boolean = true;
  public viewUniquePayments: boolean = false;
  public morePayment: string = 'Adelanta tus pagos!!!';
  public title: string = 'Pago de mensualidad';

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier lógica que necesites al cargar el componente
  }

  public morePayments(){
    if (this.viewMultiplePayments === true){
      this.viewMultiplePayments = false; // To show multiple payments
      this.viewUniquePayments = true; // To hidden view unique payments
      this.morePayment = 'Volver'; // To change text from button click
      this.title = 'Selecione  cuantos meses desea adelantar'; // To change title on view
    } else if (this.viewMultiplePayments === false) {
      this.viewMultiplePayments = true; // To hiden view multiple payments
      this.viewUniquePayments = false; // To show view unique payments
      this.mountTotalMonthBs = this.saldoBs // To show total month in Bs
      this.mountTotalMonthUSD = this.saldoUSD // To show total month in USD
      this.morePayment = 'Adelanta tus pagos!!!'; // To change text from button click
      this.title = 'Paga tu mensualidad'; // To change title on view
      this.totalBs.emit(this.mountTotalMonthBs); // To emit Total in BS
      this.totalUSD.emit(this.mountTotalMonthUSD); // To emit Total in USD
    }
  }

  public mountsToPaymentBs(moutnBs: string){
    this.mountTotalMonthBs = moutnBs
    this.totalBs.emit(this.mountTotalMonthBs);
  }

  public mountsToPaymentUSD(mountUSD: string){
    this.mountTotalMonthUSD = mountUSD
    this.totalUSD.emit(this.mountTotalMonthUSD);
  }

}
