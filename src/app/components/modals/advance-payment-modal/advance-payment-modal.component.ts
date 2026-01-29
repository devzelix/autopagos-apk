import { Component, EventEmitter, Input, Output, ElementRef, Renderer2, OnDestroy, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-advance-payment-modal',
  templateUrl: './advance-payment-modal.component.html',
  styleUrls: ['./advance-payment-modal.component.scss']
})
export class AdvancePaymentModalComponent {
  @Input() isOpen: boolean = false;
  @Input() lastMountBsValue: string = '0.00';
  @Input() lastMountUSDValue: string = '0.00';

  private appendedToBody: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ months: number; amountBs: string; amountUSD: string }>();

  public selectedAdvanceMonth: number = 1;

  /**
   * Closes the modal
   */
  public closeModal(): void {
    this.close.emit();
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
   * Confirms the advance payment selection
   */
  public confirmAdvancePayment(): void {
    const newAmountBs = this.calculateAdvanceAmountBs(this.selectedAdvanceMonth);
    const newAmountUSD = this.calculateAdvanceAmountUSD(this.selectedAdvanceMonth);

    this.confirm.emit({
      months: this.selectedAdvanceMonth,
      amountBs: newAmountBs.toFixed(2),
      amountUSD: newAmountUSD.toFixed(2)
    });

    this.closeModal();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && !this.appendedToBody) {
        this.renderer.appendChild(document.body, this.el.nativeElement);
        this.appendedToBody = true;
      } else if (!this.isOpen && this.appendedToBody) {
        this.renderer.removeChild(document.body, this.el.nativeElement);
        this.appendedToBody = false;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.appendedToBody) {
      this.renderer.removeChild(document.body, this.el.nativeElement);
      this.appendedToBody = false;
    }
  }
}
