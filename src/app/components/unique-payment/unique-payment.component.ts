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
  public morePayment: string = 'Adelanta tus pagos!!!';
  public title: string = 'Paga a tiempo tu mensualidad';

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier lógica que necesites al cargar el componente
  }

  public morePayments(){
    if (this.viewMultiplePayments === true){
      this.viewMultiplePayments = false;
      this.morePayment = 'Pagar un solo mes';
      this.title = 'Selecione los meses a pagar';
    } else if (this.viewMultiplePayments === false) {
      this.viewMultiplePayments = true;
      this.mountTotalMonthBs = this.saldoBs
      this.mountTotalMonthUSD = this.saldoUSD
      this.morePayment = 'Adelanta tus pagos!!!';
      this.title = 'Paga a tiempo tu mensualidad';
      this.totalBs.emit(this.mountTotalMonthBs);
      this.totalUSD.emit(this.mountTotalMonthUSD);
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
