import { Component, EventEmitter, Output } from '@angular/core';
import { PaymentMethodType, IPaymentMethod } from '../../interfaces/payment-methods.interface';
import { PAYMENT_METHODS } from '../../config/payment-methods.config';

@Component({
  selector: 'app-payment-method-selector',
  templateUrl: './payment-method-selector.component.html',
  styleUrls: ['./payment-method-selector.component.scss']
})
export class PaymentMethodSelectorComponent {
  @Output() methodSelected = new EventEmitter<PaymentMethodType>();

  public paymentMethods: IPaymentMethod[] = PAYMENT_METHODS;
  public selectedMethod: PaymentMethodType | null = null;
  public showInfoPopover: string | null = null;

  constructor() {}

  /**
   * Maneja la selección de un método de pago
   */
  selectMethod(methodId: PaymentMethodType): void {
    this.selectedMethod = methodId;
    this.methodSelected.emit(methodId);
  }

  /**
   * Muestra/oculta el popover de información
   */
  toggleInfo(methodId: string, event: Event): void {
    event.stopPropagation();
    this.showInfoPopover = this.showInfoPopover === methodId ? null : methodId;
  }

  /**
   * Cierra el popover de información
   */
  closeInfo(): void {
    this.showInfoPopover = null;
  }

  /**
   * Obtiene el ícono SVG para cada método de pago
   */
  getMethodIcon(icon: string): string {
    const icons: { [key: string]: string } = {
      'phone_iphone': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1m-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5m4.5-4H7V4h9z"/></svg>`,
      'credit_card': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 8H4V6h16m0 12H4v-6h16m0-8H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/></svg>`,
      'point_of_sale': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M17 2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M7 6V4h10v2zm13.5 6.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5M6 18c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v2H6zM4 9h16v2H4zm0 11h16v2H4z"/></svg>`
    };
    return icons[icon] || '';
  }
}
