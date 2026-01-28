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
  @Input() mountTotalMonthBs: string = '0.00';
  @Input() mountTotalMonthUSD: string = '0.00';
  @Input() setTitleFn: (newTitle: string) => void;

  @Output() totalBs = new EventEmitter<string>();
  @Output() totalUSD = new EventEmitter<string>();
  @Output() onEditAmountEvent = new EventEmitter<void>()

  public activePaymentMonth: number = 1;
  public viewMultiplePayments: boolean = true;
  public viewUniquePayments: boolean = false;
  public morePayment: string = 'Adelanta tus pagos';
  public classBtn: string = 'btn-more-payments';

  // Modal properties
  public showAdvancePaymentModal: boolean = false;
  public selectedAdvanceMonth: number = 1;
  public isAdvancePaymentActive: boolean = false; // Track if user has selected advance payment

  private lastMountBsValue: string = '0.00';
  private lastMountUSDValue: string = '0.00';

  constructor() { }

  ngOnInit(): void {
    this.setTitleFn('Pago de mensualidad')
    this.lastMountBsValue = this.mountTotalMonthBs
    this.lastMountUSDValue = this.mountTotalMonthUSD;
  }

  /**
   * Opens the advance payment modal or resets to default
   */
  public openAdvancePaymentModal(): void {
    if (this.isAdvancePaymentActive) {
      // If advance is active, reset to default
      this.resetToDefaultPayment();
    } else {
      // If not active, open modal
      this.showAdvancePaymentModal = true;
      this.selectedAdvanceMonth = 1; // Start at 1 month
    }
  }

  /**
   * Closes the advance payment modal
   */
  public closeAdvancePaymentModal(): void {
    this.showAdvancePaymentModal = false;
    this.selectedAdvanceMonth = 1;
  }

  /**
   * Increments the selected month count
   */
  public incrementMonth(): void {
    if (this.selectedAdvanceMonth < 3) {
      this.selectedAdvanceMonth++;
    }
  }

  /**
   * Decrements the selected month count
   */
  public decrementMonth(): void {
    if (this.selectedAdvanceMonth > 1) {
      this.selectedAdvanceMonth--;
    }
  }

  /**
   * Selects a month option in the modal
   */
  public selectAdvanceMonth(months: number): void {
    this.selectedAdvanceMonth = months;
  }

  /**
   * Calculates the advance amount in Bs for the selected months
   */
  public calculateAdvanceAmountBs(months: number): number {
    const monthlyBs = parseFloat(this.lastMountBsValue);
    return monthlyBs * (months + 1); // +1 because it includes the current month
  }

  /**
   * Calculates the advance amount in USD for the selected months
   */
  public calculateAdvanceAmountUSD(months: number): number {
    const monthlyUSD = parseFloat(this.lastMountUSDValue);
    return monthlyUSD * (months + 1); // +1 because it includes the current month
  }

  /**
   * Confirms the advance payment selection and updates the amounts
   */
  public confirmAdvancePayment(): void {
    if (this.selectedAdvanceMonth) {
      const newAmountBs = this.calculateAdvanceAmountBs(this.selectedAdvanceMonth);
      const newAmountUSD = this.calculateAdvanceAmountUSD(this.selectedAdvanceMonth);

      this.mountTotalMonthBs = newAmountBs.toFixed(2);
      this.mountTotalMonthUSD = newAmountUSD.toFixed(2);

      this.totalBs.emit(this.mountTotalMonthBs);
      this.totalUSD.emit(this.mountTotalMonthUSD);

      this.setTitleFn(`Pago de ${this.selectedAdvanceMonth + 1} ${this.selectedAdvanceMonth + 1 > 1 ? 'meses' : 'mes'}`);

      this.isAdvancePaymentActive = true; // Mark advance as active

      this.closeAdvancePaymentModal();
    }
  }

  /**
   * Resets payment to default (1 month)
   */
  public resetToDefaultPayment(): void {
    this.mountTotalMonthBs = this.lastMountBsValue;
    this.mountTotalMonthUSD = this.lastMountUSDValue;

    this.totalBs.emit(this.mountTotalMonthBs);
    this.totalUSD.emit(this.mountTotalMonthUSD);

    this.setTitleFn('Pago de mensualidad');
    this.isAdvancePaymentActive = false;
    this.selectedAdvanceMonth = 1;
  }

  public morePayments() {
    if (this.viewMultiplePayments) {

      this.viewMultiplePayments = false;
      this.viewUniquePayments = true;
      this.morePayment = 'Pagar un mes';
      this.classBtn = 'btn-one-payment';
      this.setTitleFn('Seleccione  cuantos meses desea adelantar adicionalmente');
      this.multiplePaymentComponent.setMonthPayment(1)

    } else {

      this.viewMultiplePayments = true;
      this.viewUniquePayments = false;
      this.mountTotalMonthBs = this.lastMountBsValue;
      this.mountTotalMonthUSD = this.lastMountUSDValue;
      this.morePayment = 'Adelanta tus pagos';
      this.classBtn = 'btn-more-payments';
      this.setTitleFn('Paga tu mensualidad');
      this.totalBs.emit(parseFloat(this.mountTotalMonthBs).toFixed(2));
      this.totalUSD.emit(parseFloat(this.mountTotalMonthUSD).toFixed(2));

    }
  }

  public mountsToPaymentBs(moutnBs: string) {
    this.mountTotalMonthBs = parseFloat(moutnBs).toFixed(2);
    this.totalBs.emit(parseFloat(this.mountTotalMonthBs).toFixed(2));
  }

  public mountsToPaymentUSD(mountUSD: string) {
    this.mountTotalMonthUSD = parseFloat(mountUSD).toFixed(2);
    this.totalUSD.emit(parseFloat(this.mountTotalMonthUSD).toFixed(2));
  }

  public onEditAmount = () => {
    this.onEditAmountEvent.emit()
  }

  /**
   * Verifica si el usuario tiene deuda (saldo positivo)
   * @returns true si hay deuda, false si hay saldo a favor
   */
  public hasDebt(): boolean {
    return parseFloat(this.saldoUSD) > 0;
  }

}
