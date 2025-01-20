import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MultiplePaymentComponent } from '../multiple-payment/multiple-payment.component';

@Component({
  selector: 'app-unique-payment',
  templateUrl: './unique-payment.component.html',
  styleUrls: ['./unique-payment.component.scss']
})
export class UniquePaymentComponent implements OnInit {
  @ViewChild('multiplePaymentComponent') multiplePaymentComponent: MultiplePaymentComponent;

  @Input() tasaCambio: string = '0.00';
  @Input() saldoUSD: string = '0.00';
  @Input() saldoBs: string = '0.00';
  @Input() subscription: string = '0.00';
  @Input() monthPayCount: number = 1;
  @Input() mountTotalMonthBs: number = 0;
  @Input() mountTotalMonthUSD: number = 0;

  @Output() totalBs = new EventEmitter<string>();
  @Output() totalUSD = new EventEmitter<string>();
  @Output() onEditAmountEvent = new EventEmitter<void>()

  public activePaymentMonth: number = 1;
  public viewMultiplePayments: boolean = true;
  public viewUniquePayments: boolean = false;
  public morePayment: string = 'Adelanta tus pagos!!!';
  public title: string = 'Pago de mensualidad';

  private lastMountBsValue: number = 0;
  private lastMountUSDValue: number = 0;

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier lógica que necesites al cargar el componente
    this.lastMountBsValue = this.mountTotalMonthBs
    this.lastMountUSDValue = this.mountTotalMonthUSD;
    console.log('this.lastmount Valueee', this.lastMountBsValue, this.lastMountUSDValue)
  }

  public morePayments(){
    if (this.viewMultiplePayments){

      this.viewMultiplePayments = false; // To show multiple payments
      this.viewUniquePayments = true; // To hidden view unique payments
      this.morePayment = 'Volver'; // To change text from button click
      this.title = 'Seleccione  cuantos meses desea adelantar adicionalmente'; // To change title on view
      this.multiplePaymentComponent.setMonthPayment(1)

    } else  {

      this.viewMultiplePayments = true; // To hiden view multiple payments
      this.viewUniquePayments = false; // To show view unique payments
      // this.mountTotalMonthBs = parseFloat(parseFloat(this.saldoBs).toFixed(2)) // To show total month in Bs
      // this.mountTotalMonthUSD = parseFloat(parseFloat(this.saldoUSD).toFixed(2)) // To show total month in USD
      this.mountTotalMonthBs = this.lastMountBsValue;
      this.mountTotalMonthUSD = this.lastMountUSDValue;
      this.morePayment = 'Adelanta tus pagos!!!'; // To change text from button click
      this.title = 'Paga tu mensualidad'; // To change title on view
      this.totalBs.emit(this.mountTotalMonthBs.toFixed(2)); // To emit Total in BS
      this.totalUSD.emit(this.mountTotalMonthUSD.toFixed(2)); // To emit Total in USD

    }
  }

  public mountsToPaymentBs(moutnBs: string){
    this.mountTotalMonthBs = parseFloat(moutnBs)
    this.totalBs.emit(this.mountTotalMonthBs.toFixed(2));
  }

  public mountsToPaymentUSD(mountUSD: string){
    this.mountTotalMonthUSD = parseFloat(mountUSD)
    this.totalUSD.emit(this.mountTotalMonthUSD.toFixed(2));
  }

  public onEditAmount = () => {
    this.onEditAmountEvent.emit()
  }

}
