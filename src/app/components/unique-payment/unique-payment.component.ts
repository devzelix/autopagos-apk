import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MultiplePaymentComponent } from '../multiple-payment/multiple-payment.component';

@Component({
  selector: 'app-unique-payment',
  templateUrl: './unique-payment.component.html',
  styleUrls: ['./unique-payment.component.scss']
})
export class UniquePaymentComponent {
  @ViewChild(MultiplePaymentComponent) multiplePaymentComponent!: MultiplePaymentComponent;

  @Input() saldoUSD: string = '0.00';
  @Input() saldoBs: string = '0.00';
  @Input() tasaCambio: string = '1.00';
  @Input() setTitleFn!: (title: string) => void;

  @Input() mountTotalMonthBs: string = '0.00';
  @Input() mountTotalMonthUSD: string = '0.00';
  @Input() subscription: any;
  @Input() monthPayCount: number = 1;

  @Output() totalBs = new EventEmitter<string>();
  @Output() totalUSD = new EventEmitter<string>();
  @Output() onEditAmountEvent = new EventEmitter();
  
  public viewMultiplePayments: boolean = false;
  public viewUniquePayments: boolean = true;
  public morePayment: string = 'Adelanta tus pagos';
  public classBtn: string = 'btn-more-payments';

  // Modal properties
  public showAdvancePaymentModal: boolean = false;
  public selectedAdvanceMonth: number = 1;
  public isAdvancePaymentActive: boolean = false;

  // Edit amount modal properties
  public showEditAmountModal: boolean = false;
  public customAmountInput: string = '';
  public isEditingAmount: boolean = false;

  public lastMountBsValue: string = '0.00';
  public lastMountUSDValue: string = '0.00';

  constructor() { }

  /**
   * Opens the advance payment modal or resets to default
   */
  public openAdvancePaymentModal(): void {
    if (this.isAdvancePaymentActive) {
      // If advance is active, reset to default
      this.resetToDefaultPayment();
    } else {
      // Ensure we have the current single-month values as the base for advance calculations
      this.lastMountBsValue = this.mountTotalMonthBs || this.lastMountBsValue;
      this.lastMountUSDValue = this.mountTotalMonthUSD || this.lastMountUSDValue;
      // If mountTotalMonth values are empty, fallback to saldo values converted
      if (!this.lastMountBsValue || this.lastMountBsValue === '0.00') {
        const usd = parseFloat(this.saldoUSD || '0') || 0;
        const tasa = parseFloat(this.tasaCambio || '1') || 1;
        this.lastMountUSDValue = usd.toFixed(2);
        this.lastMountBsValue = (usd * tasa).toFixed(2);
      }

      // If not active, open modal
      this.showAdvancePaymentModal = true;
    }
  }

  /**
   * Closes the advance payment modal
   */
  public closeAdvancePaymentModal(): void {
    this.showAdvancePaymentModal = false;
  }

  /**
   * Handles confirmation from advance payment modal
   */
  public onAdvancePaymentConfirm(event: { months: number; amountBs: string; amountUSD: string }): void {
    this.mountTotalMonthBs = event.amountBs;
    this.mountTotalMonthUSD = event.amountUSD;

    this.totalBs.emit(this.mountTotalMonthBs);
    this.totalUSD.emit(this.mountTotalMonthUSD);

    this.setTitleFn(`Pago de ${event.months + 1} ${event.months + 1 > 1 ? 'meses' : 'mes'}`);
    this.isAdvancePaymentActive = true;
  }

  /**
   * Opens the edit amount modal
   */
  public openEditAmountModal(): void {
    this.showEditAmountModal = true;
  }

  /**
   * Closes the edit amount modal
   */
  public closeEditAmountModal(): void {
    this.showEditAmountModal = false;
  }

  /**
   * Handles confirmation from edit amount modal
   */
  public onEditAmountConfirm(event: { amountUSD: string; amountBs: string }): void {
    this.mountTotalMonthUSD = event.amountUSD;
    this.mountTotalMonthBs = event.amountBs;

    this.totalBs.emit(this.mountTotalMonthBs);
    this.totalUSD.emit(this.mountTotalMonthUSD);

    this.setTitleFn('Pago personalizado');
    this.isAdvancePaymentActive = false;
    this.isEditingAmount = true;
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
      this.multiplePaymentComponent.setMonthPayment(1);
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
    // Open edit amount modal
    this.openEditAmountModal();
  }

  /**
   * Verifica si el usuario tiene deuda (saldo positivo)
   * @returns true si hay deuda, false si hay saldo a favor
   */
  public hasDebt(): boolean {
    return parseFloat(this.saldoUSD) > 0;
  }
}
