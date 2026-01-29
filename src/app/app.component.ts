import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from './services/helper.service';
import { KioskAuthService } from './services/kiosk-auth.service';
import { Subject, merge, fromEvent } from 'rxjs';
import { debounceTime, takeUntil, startWith, filter, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private inactivityTimer: any;
  private activitySubscription: any;
  private viewCheckInterval: any;
  
  // 🚩 FLAG: Cambiar a true para habilitar el carrusel de publicidad
  private readonly ENABLE_AD_CAROUSEL = false;
  
  public showAdCarousel = false;
  // Para pruebas locales usar 10000 (10 s); en producción usar 30000 (30 s)
  private readonly INACTIVITY_TIME = 10000; // 10 segundos (pruebas) / 30000 producción
  public showIdlePage = false;
  /** URL a cargar en el iframe de inactividad. Cambiar por la URL deseada (ej. página de publicidad). */
  public idlePageUrl = environment.URL_IDLE_PAGE;
  /** URL saneada para el iframe (asignada una vez para evitar parpadeo por recarga). */
  public idlePageUrlSafe: SafeResourceUrl;

  public kioskStatus$ = this.kioskAuth.kioskStatus$;

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  public showScrollArrow: boolean = false;
  public showUuid: boolean = false;

  constructor(
    public helper: HelperService,
    private kioskAuth: KioskAuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.idlePageUrlSafe = this.idlePageUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.idlePageUrl)
      : this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    this.startInactivityTimer();

    // Vista principal: iframe (imágenes) + botón Empezar. Al estar el kiosko registrado, se muestra primero esta pantalla.
    this.kioskStatus$.pipe(
      filter(status => status === 'REGISTERED'),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.showIdlePage = true;
        this.cdr.detectChanges();
      });
    });

    // Tap en logos (welcome-view o form): mostrar iframe del carrusel de publicidad
    fromEvent(document, 'showIdlePage')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.showIdlePage = true;
          this.cdr.detectChanges();
        });
      });

    // Forzamos visualización de carga al inicio
    this.kioskAuth.setLoadingState();
    setTimeout(() => {
      this.kioskAuth.initAuth();
    }, 1000); // Reducido a 1s
  }

  get kioskUuid() {
    return this.kioskAuth.getUuid();
  }

  retryAuth() {
    // 1. Mostrar estado de carga visualmente
    this.kioskAuth.setLoadingState(); 
    
    setTimeout(() => {
      this.kioskAuth.initAuth();
    }, 1000); // Reducido a 1s
  }

  copyUuid() {
    if (this.kioskUuid) {
      navigator.clipboard.writeText(this.kioskUuid).then(() => {
        // Podrías mostrar un toast aquí si tuvieras uno configurado
        console.log('UUID copiado al portapapeles');
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopInactivityTimer();
    this.clearActivitySubscription();
    this.stopViewCheck();
  }

  /**
   * Verifica si estamos en la vista de inicio (welcome-view)
   */
  private isInWelcomeView(): boolean {
    // Solo mostrar carrusel cuando:
    // 1. helper.view es false (vista de inicio, no la app)
    // 2. El welcome-view está visible en el DOM
    if (this.helper.view) {
      return false; // Está en la vista de la app, no en el inicio
    }
    
    // Verificar si el welcome-view está visible
    const welcomeView = document.querySelector('app-welcome-view');
    const formView = document.querySelector('form.form-login');
    
    // Está en welcome-view si welcome-view existe y el formulario no está visible
    return welcomeView !== null && formView === null;
  }

  /**
   * Inicia el temporizador de inactividad
   */
  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    
    // Limpiar suscripción anterior si existe
    this.clearActivitySubscription();
    
    // Iniciar verificación periódica de la vista
    this.startViewCheck();
    
    // Detectar actividad del usuario (sin mousemove para que no reinicie con cada movimiento)
    const activity$ = merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll')
    ).pipe(takeUntil(this.destroy$));

    // Suscripción única: 10 s sin clic/toque/tecla/scroll. startWith(null) hace que el primer
    // período de 10 s cuente desde la carga (sin él, debounceTime nunca emite si no hubo ningún evento).
    this.activitySubscription = activity$.pipe(
      startWith(null),
      debounceTime(this.INACTIVITY_TIME),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Pantalla de inactividad: iframe + botón "Empezar pago"
      if (this.idlePageUrl && !this.showIdlePage) {
        this.ngZone.run(() => {
          this.showIdlePage = true;
          this.cdr.detectChanges();
        });
        console.log('Mostrando pantalla de inactividad');
      }
      // Solo mostrar carrusel si está habilitado y estamos en la vista de inicio
      if (this.ENABLE_AD_CAROUSEL && !this.showAdCarousel && this.isInWelcomeView()) {
        this.showAdCarousel = true;
        console.log('Mostrando carrusel de publicidad por inactividad');
      }
    });
  }

  /**
   * Inicia la verificación periódica de la vista
   */
  private startViewCheck(): void {
    this.stopViewCheck();
    
    // Verificar cada segundo si debemos ocultar el carrusel
    this.viewCheckInterval = setInterval(() => {
      this.checkViewAndHideCarousel();
    }, 1000);
  }

  /**
   * Detiene la verificación periódica de la vista
   */
  private stopViewCheck(): void {
    if (this.viewCheckInterval) {
      clearInterval(this.viewCheckInterval);
      this.viewCheckInterval = null;
    }
  }

  /**
   * Verifica periódicamente si debemos ocultar el carrusel
   */
  private checkViewAndHideCarousel(): void {
    // Si el carrusel está visible pero no estamos en welcome-view, ocultarlo
    if (this.showAdCarousel && !this.isInWelcomeView()) {
      this.showAdCarousel = false;
      console.log('Carrusel ocultado - no está en vista de inicio');
    }
  }

  /**
   * Limpia la suscripción de actividad
   */
  private clearActivitySubscription(): void {
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
      this.activitySubscription = null;
    }
  }

  /**
   * Detiene el temporizador de inactividad
   */
  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  /**
   * Oculta la pantalla de inactividad (iframe/carrusel) y muestra la pantalla de pago (tarjeta con usuario, monto, PAGAR)
   */
  public hideIdlePage(): void {
    this.showIdlePage = false;
    this.startInactivityTimer();
    // Disparar en el siguiente ciclo para que Angular oculte el overlay antes; así el form recibe el evento y muestra la pantalla de pago
    setTimeout(() => this.goToPaymentForm(), 0);
    console.log('Pantalla de inactividad cerrada, mostrando pantalla de pago');
  }

  /**
   * Oculta el carrusel cuando el usuario toca la pantalla
   */
  public hideAdCarousel(): void {
    this.showAdCarousel = false;
    this.startInactivityTimer(); // Reiniciar el timer
    console.log('Carrusel ocultado, volviendo al inicio');
    
    // Resetear el form component para volver al welcome-view
    this.resetToWelcomeView();
  }

  /**
   * Resetea el form component para mostrar el welcome-view
   */
  private resetToWelcomeView(): void {
    const formComponent = document.querySelector('app-form');
    if (formComponent) {
      const event = new CustomEvent('resetToWelcome', { detail: {} });
      formComponent.dispatchEvent(event);
    }
  }

  /**
   * Indica al form component que muestre la pantalla de pago (usuario, monto, botón PAGAR)
   */
  private goToPaymentForm(): void {
    // Disparar en document para que el form component lo reciba aunque aún no esté visible
    document.dispatchEvent(new CustomEvent('goToPaymentForm', { detail: {} }));
  }

  /**
   * Llevar la vista a la parte superior
   */
  public handleShowScrollArrow = (event: Event) => {
    this.showScrollArrow = ((event.target as HTMLDivElement).scrollTop > 0)
  }

  public scrollToTop = () => {
    const scrollElement: HTMLElement | null = document.getElementById('content-scrollable')
    scrollElement?.scrollTo({top: 0, behavior: 'smooth'});
  }

}
