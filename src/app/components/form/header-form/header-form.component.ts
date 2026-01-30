import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.scss'],
})
export class HeaderFormComponent implements OnInit {
  @Output() goHomeEmitter = new EventEmitter<void>();

  private tapCount = 0;
  private tapTimer: any;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Maneja el clic en el logo.
   * Requiere 10 clics rápidos (menos de 400ms entre ellos) para volver al inicio.
   */
  handleLogoTap() {
    this.tapCount++;
    
    // Reiniciar timer en cada clic
    clearTimeout(this.tapTimer);
    
    // Si pasan 400ms sin otro clic, se reinicia la cuenta
    this.tapTimer = setTimeout(() => {
      this.tapCount = 0;
    }, 400);

    if (this.tapCount >= 10) {
      console.log('🐞 Reset forzado por 10 clicks en logo');
      this.tapCount = 0;
      this.goHomeEmitter.emit();
    }
  }

  // Método legacy por si se usa en otro lado, pero redirigido a la nueva lógica si es necesario
  // o mantenido simple si se llama programáticamente.
  goHome() {
    this.goHomeEmitter.emit();
  }
}
