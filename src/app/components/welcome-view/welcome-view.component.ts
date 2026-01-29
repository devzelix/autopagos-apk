import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-welcome-view',
  templateUrl: './welcome-view.component.html',
  styleUrls: ['./welcome-view.component.scss']
})
export class WelcomeViewComponent implements OnInit {
  @Output() showFormEmitter = new EventEmitter<void>();
  @Output() openAdminPanel = new EventEmitter<void>();

  // Variables para detectar doble tap
  private tapCount: number = 0;
  private tapTimer: any = null;
  private readonly DOUBLE_TAP_DELAY = 300; // 300ms entre taps para doble tap
  private lastTapTime: number = 0;

  constructor() { }

  ngOnInit(): void {
    // Escuchar evento personalizado de apertura del panel admin (respaldo)
    document.addEventListener('openAdminPanel', () => {
      this.openAdminPanelFromDoubleTap();
    });
  }

  /**
   * Maneja el tap/touch en el logo
   * Detecta doble tap para abrir panel admin
   */
  public onLogoTap(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const currentTime = Date.now();
    
    // Si pasó más de 300ms desde el último tap, resetear contador
    if (currentTime - this.lastTapTime > this.DOUBLE_TAP_DELAY) {
      this.tapCount = 0;
    }
    
    this.tapCount++;
    this.lastTapTime = currentTime;
    
    // Limpiar timer anterior
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }
    
    // Si es el segundo tap, abrir panel admin
    if (this.tapCount === 2) {
      console.log('🔓 Doble tap detectado en logo - Abriendo panel administrativo');
      this.openAdminPanelFromDoubleTap();
      this.resetTapCount();
      return;
    }
    
    // Si es un solo tap: mostrar iframe del carrusel de publicidad
    if (this.tapCount === 1) {
      this.tapTimer = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('showIdlePage', { detail: {} }));
        this.resetTapCount();
      }, this.DOUBLE_TAP_DELAY);
    }
  }

  /**
   * Abre el panel administrativo desde doble tap
   */
  private openAdminPanelFromDoubleTap(): void {
    // Emitir evento para que form.component lo maneje
    this.openAdminPanel.emit();
    
    // También disparar evento personalizado como respaldo
    const customEvent = new CustomEvent('openAdminPanel');
    document.dispatchEvent(customEvent);
  }

  /**
   * Resetea el contador de taps
   */
  private resetTapCount(): void {
    this.tapCount = 0;
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
      this.tapTimer = null;
    }
  }

  showForm = () => {
    this.showFormEmitter.emit()
  }

}
