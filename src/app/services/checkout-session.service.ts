import { Injectable } from '@angular/core';
import { LocalstorageService } from './localstorage.service';
import { AuthAdminPanelService } from './api/auth-admin-panel.service';
import { UbiiposService } from './api/ubiipos.service';
import { ICheckoutSession } from '../interfaces/checkout-session.interface';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CheckoutSessionService {
  private readonly SESSION_KEY = 'checkout_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  constructor(
    private localStorageService: LocalstorageService,
    private authService: AuthAdminPanelService,
    private ubiiposService: UbiiposService
  ) {}

  /**
   * Guarda la sesión de la caja y POS (sin expiración)
   */
  public saveSession(session: Omit<ICheckoutSession, 'sessionTimestamp' | 'expiresAt'>): void {
    const fullSession: ICheckoutSession = {
      ...session,
      sessionTimestamp: Date.now(),
      expiresAt: null // Sin expiración
    };

    // Guardar sesión completa
    this.localStorageService.set(this.SESSION_KEY, fullSession);

    // También guardar valores individuales para compatibilidad con código existente
    this.localStorageService.set('id_sede', session.id_sede);
    this.localStorageService.set('id_checkout', session.id_checkout);
    this.localStorageService.set('checkoutIdentify', session.checkoutIdentify);
    this.localStorageService.set('ubiiposHost', session.ubiiposHost);
    this.localStorageService.set('terminalVirtual', session.terminalVirtual);
    
    // Guardar IP del checkout si está disponible
    if (session.checkout_ip_address) {
      this.localStorageService.set('checkout_ip_address', session.checkout_ip_address);
    }
  }

  /**
   * Obtiene la sesión guardada
   */
  public getSession(): ICheckoutSession | null {
    return this.localStorageService.get<ICheckoutSession>(this.SESSION_KEY) ?? null;
  }

  /**
   * Verifica si existe una sesión guardada
   */
  public hasSession(): boolean {
    const session = this.getSession();
    return session !== null && session !== undefined;
  }

  /**
   * Verifica si la sesión ha expirado
   * Retorna false siempre ya que las sesiones no expiran
   */
  public isSessionExpired(): boolean {
    // Las sesiones no expiran
    return false;
  }

  /**
   * Valida la sesión completa (sin hacer test del POS):
   * 1. Verifica que existe
   * 2. Verifica que tiene todos los datos necesarios
   * 3. Verifica que tiene el timestamp de creación (para asegurar que es una sesión válida del nuevo sistema)
   * NO hace test del POS para no bloquear el flujo
   */
  public async validateSession(): Promise<{ isValid: boolean; session: ICheckoutSession | null; message?: string }> {
    const session = this.getSession();

    // 1. Verificar que existe
    if (!session) {
      return {
        isValid: false,
        session: null,
        message: 'No hay sesión guardada'
      };
    }

    // 2. Verificar que tiene todos los datos necesarios
    if (
      !session.id_sede ||
      !session.id_checkout ||
      !session.checkoutIdentify ||
      !session.ubiiposHost ||
      !session.terminalVirtual ||
      !session.id_pos_device
    ) {
      this.clearSession();
      return {
        isValid: false,
        session: null,
        message: 'La sesión está incompleta'
      };
    }

    // 3. Verificar que tiene sessionTimestamp (asegura que es una sesión del nuevo sistema, no datos antiguos)
    if (!session.sessionTimestamp || typeof session.sessionTimestamp !== 'number') {
      this.clearSession();
      return {
        isValid: false,
        session: null,
        message: 'La sesión no es válida (falta información de timestamp)'
      };
    }

    // La sesión es válida si tiene todos los datos necesarios
    // NO hacemos test del POS aquí para que el Swal aparezca primero
    return {
      isValid: true,
      session: session
    };
  }

  /**
   * Limpia cualquier sesión antigua o incompleta que pueda existir
   */
  private cleanOldSessions(): void {
    // Verificar si hay valores individuales en localStorage pero no hay sesión completa
    const hasIndividualValues = 
      this.localStorageService.get('id_sede') ||
      this.localStorageService.get('id_checkout') ||
      this.localStorageService.get('checkoutIdentify') ||
      this.localStorageService.get('ubiiposHost') ||
      this.localStorageService.get('terminalVirtual');

    const hasCompleteSession = this.getSession();

    // Si hay valores individuales pero no hay sesión completa, limpiar todo
    if (hasIndividualValues && !hasCompleteSession) {
      console.log('Limpieza de sesión antigua detectada');
      this.clearSession();
    }
  }

  /**
   * Restaura la sesión desde localStorage si es válida
   * Retorna true si se restauró exitosamente, false si no
   */
  public async restoreSession(): Promise<boolean> {
    // Primero limpiar sesiones antiguas
    this.cleanOldSessions();

    const validation = await this.validateSession();

    if (validation.isValid && validation.session) {
      // La sesión ya está guardada en localStorage, solo confirmar
      console.log('Sesión restaurada exitosamente:', validation.session);
      return true;
    }

    // Si la sesión no es válida, limpiarla
    if (!validation.isValid) {
      this.clearSession();
      console.log('Sesión no válida, se ha limpiado:', validation.message);
    }

    return false;
  }

  /**
   * Limpia la sesión guardada
   */
  public clearSession(): void {
    this.localStorageService.removeItem(this.SESSION_KEY);
    this.localStorageService.removeItem('id_sede');
    this.localStorageService.removeItem('id_checkout');
    this.localStorageService.removeItem('checkoutIdentify');
    this.localStorageService.removeItem('ubiiposHost');
    this.localStorageService.removeItem('terminalVirtual');
    this.localStorageService.removeItem('checkout_ip_address');
  }

  /**
   * Renueva la sesión (actualiza el timestamp, sin expiración)
   */
  public renewSession(): void {
    const session = this.getSession();
    if (session) {
      const renewedSession: ICheckoutSession = {
        ...session,
        sessionTimestamp: Date.now(),
        expiresAt: null // Sin expiración
      };
      this.localStorageService.set(this.SESSION_KEY, renewedSession);
    }
  }

  /**
   * Obtiene información de la sesión actual (sin validar)
   */
  public getSessionInfo(): {
    exists: boolean;
    expired: boolean;
    timeRemaining: number | null;
    session: ICheckoutSession | null;
  } {
    const session = this.getSession();
    const exists = session !== null;
    const expired = this.isSessionExpired();
    const timeRemaining = session && session.expiresAt
      ? Math.max(0, session.expiresAt - Date.now())
      : null;

    return {
      exists,
      expired,
      timeRemaining,
      session
    };
  }

  /**
   * Obtiene información formateada de la sesión para mostrar al usuario
   * Ahora es asíncrono para obtener el nombre de la sede desde la API
   */
  public async getFormattedSessionInfo(): Promise<string> {
    const session = this.getSession();
    if (!session) {
      return 'No hay sesión guardada';
    }

    const sessionDate = new Date(session.sessionTimestamp);
    const formattedDate = sessionDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Obtener información de la sede (nombre)
    let sedeDisplay = session.id_sede.toString();
    try {
      const sedeInfo = await this.authService.getSedeInfo(session.id_sede);
      if (sedeInfo && (sedeInfo.name || sedeInfo.nombre)) {
        sedeDisplay = sedeInfo.name || sedeInfo.nombre || session.id_sede.toString();
      }
    } catch (error) {
      console.error('Error al obtener nombre de sede:', error);
      // Si falla, usar el ID como fallback
    }

    return `
      <div style="text-align: left; margin: 10px 0;">
        <p><strong>Sede:</strong> ${sedeDisplay}</p>
        <p><strong>Caja:</strong> ${session.checkoutIdentify}</p>
        <p><strong>Terminal POS:</strong> ${session.terminalVirtual}</p>
        <p><strong>IP del POS:</strong> ${session.ubiiposHost}</p>
        <p><strong>Fecha de asignación:</strong> ${formattedDate}</p>
      </div>
    `;
  }
}

