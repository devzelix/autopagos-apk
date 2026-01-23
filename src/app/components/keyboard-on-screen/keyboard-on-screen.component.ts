import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-keyboard-on-screen',
  templateUrl: './keyboard-on-screen.component.html',
  styleUrls: ['./keyboard-on-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyboardOnScreenComponent implements OnInit {
  @Output() valorTeclado = new EventEmitter<string>();
  @Output() deleteKeyEmitter = new EventEmitter<void>();
  @Output() enterEmitter = new EventEmitter<void>();
  @Input() isValidEnterBtn: boolean = false;
  @Input() classes: string = ''

  private isProcessing: boolean = false;
  private lastPressTime: number = 0;
  private readonly DEBOUNCE_TIME = 100; // 100ms entre pulsaciones

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  /**
   * Optimized key press handler with debounce for Android
   */
  public pressKey(num: string): void {
    const now = Date.now();
    
    // Prevenir múltiples pulsaciones muy rápidas (debounce)
    if (this.isProcessing || (now - this.lastPressTime) < this.DEBOUNCE_TIME) {
      return;
    }

    this.isProcessing = true;
    this.lastPressTime = now;

    // Emitir el evento
    this.valorTeclado.emit(num);

    // Resetear el estado después de un breve delay
    setTimeout(() => {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }, this.DEBOUNCE_TIME);
  }

  /**
   * Optimized delete handler with debounce for Android
   */
  public deleteLast = (): void => {
    const now = Date.now();
    
    // Prevenir múltiples pulsaciones muy rápidas
    if (this.isProcessing || (now - this.lastPressTime) < this.DEBOUNCE_TIME) {
      return;
    }

    this.isProcessing = true;
    this.lastPressTime = now;

    this.deleteKeyEmitter.emit();

    // Resetear el estado después de un breve delay
    setTimeout(() => {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }, this.DEBOUNCE_TIME);
  };

  /**
   * Function executed on enter pressed
   */
  public enterEmit = (): void => {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.enterEmitter.emit();
    
    setTimeout(() => {
      this.isProcessing = false;
      this.cdr.markForCheck();
    }, this.DEBOUNCE_TIME);
  };

  /**
   * Handle touch events for better Android support
   */
  public onTouchStart(event: TouchEvent): void {
    // Prevenir el comportamiento por defecto para mejor respuesta
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.classList.add('keyboard-active');
    }
  }

  /**
   * Handle touch end events
   */
  public onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('keyboard-active');
      // Disparar el click después del touch
      target.click();
    }
  }
}
