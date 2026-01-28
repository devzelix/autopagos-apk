import { Component, EventEmitter, Input, Output, ElementRef, Renderer2, OnDestroy, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-edit-amount-modal',
  templateUrl: './edit-amount-modal.component.html',
  styleUrls: ['./edit-amount-modal.component.scss']
})
export class EditAmountModalComponent {
  @Input() isOpen: boolean = false;
  @Input() currentAmountUSD: string = '0.00';
  @Input() tasaCambio: string = '1.00';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ amountUSD: string; amountBs: string }>();

  public customAmountInput: string = '';
  private appendedToBody: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

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
    // Keep existing behavior for setting input when opened
    if (this.isOpen) {
      this.customAmountInput = this.currentAmountUSD;
    }
  }

  ngOnDestroy(): void {
    if (this.appendedToBody) {
      this.renderer.removeChild(document.body, this.el.nativeElement);
      this.appendedToBody = false;
    }
  }

  /**
   * Closes the modal
   */
  public closeModal(): void {
    this.customAmountInput = '';
    this.close.emit();
  }

  /**
   * Handles keyboard input for custom amount
   */
  public onAmountKeyPress(value: string): void {
    if (value === 'delete') {
      this.customAmountInput = this.customAmountInput.slice(0, -1);
    } else if (value === 'clear') {
      this.customAmountInput = '';
    } else {
      // Allow only numbers and one decimal point
      if (value === '.' && this.customAmountInput.includes('.')) {
        return;
      }
      // Limit to 2 decimal places
      if (this.customAmountInput.includes('.')) {
        const parts = this.customAmountInput.split('.');
        if (parts[1] && parts[1].length >= 2) {
          return;
        }
      }
      this.customAmountInput += value;
    }
  }

  /**
   * Calculates the converted amount in Bs
   */
  public getConvertedAmountBs(): number {
    const amount = parseFloat(this.customAmountInput || '0');
    const tasa = parseFloat(this.tasaCambio);
    return amount * tasa;
  }

  /**
   * Verifies if the custom amount is valid
   */
  public isCustomAmountValid(): boolean {
    const amount = parseFloat(this.customAmountInput || '0');
    return !isNaN(amount) && amount > 0;
  }

  /**
   * Confirms the custom amount
   */
  public confirmCustomAmount(): void {
    const amount = parseFloat(this.customAmountInput);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const tasaCambio = parseFloat(this.tasaCambio);
    const amountUSD = amount.toFixed(2);
    const amountBs = (amount * tasaCambio).toFixed(2);

    this.confirm.emit({
      amountUSD,
      amountBs
    });

    this.closeModal();
  }
}
