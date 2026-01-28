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
      // C2P - Token/Llave de seguridad bancaria
      'c2p': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M12.5 8H17a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4.5"/>
          <path d="M7 14a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4.5M7 12h.01M17 12h.01M12 3v5m0 8v5"/>
          <circle cx="12" cy="8" r="1"/>
          <circle cx="12" cy="16" r="1"/>
        </g>
      </svg>`,
      
      // Débito Inmediato - SMS/Mensaje
      'debito_inmediato': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2"/>
          <path d="M3 12V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M7 16h.01M11 16h6"/>
        </g>
      </svg>`,
      
      // Punto de Venta - Terminal POS
      'punto_venta': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <rect width="14" height="18" x="5" y="3" rx="2"/>
          <path d="M9 7h6M9 11h6M9 15h4m-4 4h6"/>
        </g>
      </svg>`
    };
    return icons[icon] || '';
  }

  /**
   * Obtiene el nombre del método de pago por su ID
   */
  getMethodName(methodId: string | null): string {
    if (!methodId) return '';
    const method = this.paymentMethods.find(m => m.id === methodId);
    return method?.name || '';
  }

  /**
   * Obtiene la información del método de pago por su ID
   */
  getMethodInfo(methodId: string | null): string {
    if (!methodId) return '';
    const method = this.paymentMethods.find(m => m.id === methodId);
    return method?.infoText || '';
  }
}
