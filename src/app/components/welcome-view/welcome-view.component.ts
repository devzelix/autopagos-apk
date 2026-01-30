import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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
  private readonly MULTI_TAP_DELAY = 400; // Tiempo máx entre taps
  private lastTapTime: number = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Escuchar evento personalizado de apertura del panel admin (respaldo)
    document.addEventListener('openAdminPanel', () => {
      this.openAdminPanelFromDoubleTap();
    });
  }

  /**
   * Maneja el tap/touch en el logo
   * Detecta 10 taps para acciones (antes admin, ahora deshabilitado)
   */
  public onLogoTap(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Limpiar timer anterior
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }

    this.tapCount++;
    
    // Si llegamos a 10 taps...
    if (this.tapCount >= 10) {
      console.log('🔄 10 taps detectados - Ya estamos en Inicio.');
      // Lógica de admin comentada por petición del usuario
      // this.openAdminPanelFromDoubleTap();
      this.resetTapCount();
      return;
    }
    
    // Resetear cuenta si dejan de tocar por un momento
    this.tapTimer = setTimeout(() => {
      this.resetTapCount();
    }, this.MULTI_TAP_DELAY);
  }

  /**
   * Abre el panel administrativo (DESHABILITADO)
   */
  private openAdminPanelFromDoubleTap(): void {
    // Comentado para no romper lógica pero deshabilitar acceso
    /*
    this.openAdminPanel.emit();
    const customEvent = new CustomEvent('openAdminPanel');
    document.dispatchEvent(customEvent);
    */
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
    // this.showFormEmitter.emit()
    this.router.navigate(['/pay']);
  }

}
