import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HelperService } from './services/helper.service';
import { KioskAuthService } from './services/kiosk-auth.service';
import { Subject, merge, fromEvent } from 'rxjs';
import { debounceTime, takeUntil, startWith, filter, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AdminPanelStateService } from './services/admin-panel-state.service';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private viewCheckInterval: any;
  
  // 🚩 FLAG: Cambiar a true para habilitar el carrusel de publicidad
  private readonly ENABLE_AD_CAROUSEL = false;
  
  public showAdCarousel = false;
  // Tiempo sin actividad para mostrar la pantalla de inactividad (iframe + botón Empezar)
  private readonly INACTIVITY_TIME = 120000; // 2 minutos
  public showIdlePage = false;
  /** URL a cargar en el iframe de inactividad. Cambiar por la URL deseada (ej. página de publicidad). */
  public idlePageUrl = environment.URL_IDLE_PAGE;
  /** URL saneada para el iframe (asignada una vez para evitar parpadeo por recarga). */
  public idlePageUrlSafe: SafeResourceUrl;

  public kioskStatus$ = this.kioskAuth.kioskStatus$;
  /** No mostrar carrusel cuando el panel de administración está abierto. */
  public adminPanelOpen$ = this.adminPanelStateService.isOpen;

  /** Variable para saber qué tiene el iframe (opcional, por si la necesitas usar luego) */
  public iframeContentType: 'video' | 'image' | 'unknown' = 'unknown';

  /** Indica si el iframe ya cargó y mandó su señal de listo */
  private isIframeReady = false;

  // --- VARIABLES PARA GESTIÓN DE IFRAME Y REINTENTOS ---
  private iframeRetryInterval: any = null; // Intervalo para reintentar carga si falla
  private minDisplayTimeout: any = null;   // Timeout para el delay mínimo
  private readonly IFRAME_RETRY_MS = 10000; // Reintentar cada 10 segundos si no responde
  private readonly MIN_DISPLAY_DELAY_MS = 3000; // Esperar al menos 3s antes de mostrar (para evitar parpadeo)
  private isMonitoringIframe = false; // Bandera para saber si estamos en modo escucha activa

  // Ruta actual para controlar la visibilidad del botón global
  public currentRoute: string = '';
  
  // Estado actual del kiosco para lógica interna
  private currentKioskStatus: string = 'LOADING';

  // CONTROL DE VISIBILIDAD DEL BOTÓN CON TIMING
  public showGlobalButton = false;

  // FLAG PARA DIRECCIÓN DE SALIDA DEL IFRAME
  public isGoingToPay = false;

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    // Solo procesar si estamos monitoreando activamente
    if (!this.isMonitoringIframe) return;

    // Verificamos si el mensaje viene con la etiqueta que acordamos
    if (event.data && event.data.type === 'IDLE_CONTENT_INFO') {
      
      // IMPORTANTE: Ejecutar dentro de Angular Zone para que la UI se actualice
      this.ngZone.run(() => {
        this.iframeContentType = event.data.contentType;
        console.log('✅ Iframe reportó listo. Tipo:', this.iframeContentType);
        
        // Detener reintentos porque ya respondió
        this.stopIframeRetry();

        // Iniciar transición con delay mínimo (si estamos en WelcomeView y Kiosco Registrado)
        if (this.router.url === '/' && this.currentKioskStatus === 'REGISTERED') {
          this.scheduleIdleActivation();
        }
      });
    }
  }

  /**
   * Prepara la animación según la ruta actual
   */
  public prepareRoute(outlet: any) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  /**
   * Maneja el clic en el botón "EMPEZAR" global.
   * REGLA: El botón desaparece ANTES de que el resto se mueva.
   */
  public handleGlobalStart(): void {
    if (!this.showGlobalButton) return;

    console.log('🔘 Botón Global START presionado - Desapareciendo botón');
    
    // 1. Desaparecer botón de inmediato para que no estorbe la animación vertical
    this.showGlobalButton = false;
    this.cdr.detectChanges();

    // 2. Esperar un instante y ejecutar movimiento
    setTimeout(() => {
      if (this.showIdlePage) {
        this.isGoingToPay = true; // Activar salida vertical
        this.hideIdlePage();
      } else {
        this.router.navigate(['/pay']);
      }
    }, 50); // Reducido de 150ms a 50ms
  }

  /**
   * Programa la activación del Idle Mode respetando un tiempo mínimo
   */
  private scheduleIdleActivation(): void {
    if (this.minDisplayTimeout) return; // Ya hay una activación programada

    console.log(`⏳ Iframe listo. Esperando ${this.MIN_DISPLAY_DELAY_MS}ms para transición suave...`);
    
    this.minDisplayTimeout = setTimeout(() => {
      // IMPORTANTE: Limpiar la variable del timeout una vez que se ejecuta
      this.minDisplayTimeout = null;
      
      console.log('⏰ Timeout cumplido. Verificando condiciones para activar Idle...');

      // Verificar de nuevo por seguridad (Ruta y Estado)
      if (this.router.url === '/' && this.currentKioskStatus === 'REGISTERED') {
         console.log('🚀 Condiciones OK. Ejecutando transición a Idle Mode.');
         
         // Mantenemos el botón encendido para que no parpadee durante el carrusel lateral
         this.activateIdleMode();
      } else {
         console.warn('⚠️ Condiciones no cumplidas tras timeout (Ruta o Estado cambiaron). Cancelando.');
      }
    }, this.MIN_DISPLAY_DELAY_MS);
  }

  /**
   * Inicia el monitoreo del iframe: Carga inicial y bucle de reintento
   */
  private startIframeMonitoring(): void {
    // CONDICIÓN CRÍTICA: Solo iniciar si estamos en Welcome View Y el Kiosco está Registrado.
    if (this.currentKioskStatus !== 'REGISTERED') {
      console.log('⛔ Kiosco no registrado. Iframe en pausa.');
      return;
    }

    if (this.isMonitoringIframe) return; // Ya estamos monitoreando
    
    console.log('📡 Iniciando monitoreo de Iframe (Welcome View detectado)');
    this.isMonitoringIframe = true;
    this.isIframeReady = false;
    
    // Carga inicial
    this.reloadIframe();

    // Configurar reintento periódico (Watchdog)
    // Si el iframe no responde en X segundos, recargamos
    this.stopIframeRetry(); // Limpiar por si acaso
    this.iframeRetryInterval = setInterval(() => {
      console.warn('⚠️ Iframe no respondió a tiempo. Reintentando carga (Watchdog)...');
      this.reloadIframe();
    }, this.IFRAME_RETRY_MS);
  }

  /**
   * Detiene todo monitoreo y limpia recursos (Al salir de Welcome View o perder registro)
   */
  private stopIframeMonitoring(): void {
    console.log('🛑 Deteniendo monitoreo y limpiando Iframe');
    this.isMonitoringIframe = false;
    this.stopIframeRetry();
    
    if (this.minDisplayTimeout) {
      clearTimeout(this.minDisplayTimeout);
      this.minDisplayTimeout = null;
    }

    // AHORRO DE RAM: Descargar el iframe después de que termine la animación de salida
    setTimeout(() => {
      if (this.currentRoute !== '/' && this.currentRoute !== '/idle') {
        this.idlePageUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
        console.log('🧹 Iframe descargado tras animación');
      }
    }, 1000);
  }

  private stopIframeRetry(): void {
    if (this.iframeRetryInterval) {
      clearInterval(this.iframeRetryInterval);
      this.iframeRetryInterval = null;
    }
  }

  /**
   * Activa el modo inactivo: Muestra Iframe y navega a ruta vacía para liberar RAM
   */
  private activateIdleMode(): void {
    this.isMonitoringIframe = false;
    this.stopIframeRetry(); 
    
    this.ngZone.run(() => {
      this.showIdlePage = true;
      this.router.navigate(['/idle']); // <--- AHORRO DE RAM: Destruye WelcomeView
      this.cdr.detectChanges();
    });
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  public showScrollArrow: boolean = false;

  public isLoginKiosk: boolean = environment.is_login_kiosk;

  constructor(
    public helper: HelperService,
    private kioskAuth: KioskAuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private adminPanelStateService: AdminPanelStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Forzar navegación al inicio siempre que se carga la app (ej. refresh)
    this.router.navigate(['/']);

    // Escuchar cambios de ruta para activar/desactivar lógica según donde estemos
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const prevRoute = this.currentRoute;
      this.currentRoute = event.urlAfterRedirects;
      
      // FIX IFRAME: Solo volvemos al modo horizontal si regresamos a la Home
      if (this.currentRoute === '/') {
        this.isGoingToPay = false; 
      }

      // --- LÓGICA DE VISIBILIDAD DEL BOTÓN (CON DELAY TRAS RENDERIZADO) ---
      const isAdsCurrent = this.currentRoute === '/' || this.currentRoute === '/idle';
      const isAdsPrev = prevRoute === '/' || prevRoute === '/idle' || prevRoute === '';

      if (isAdsCurrent) {
        // Esperamos a que la vista empiece a posicionarse (400ms)
        setTimeout(() => {
          if (this.currentRoute === '/' || this.currentRoute === '/idle') {
            this.ngZone.run(() => {
              this.showGlobalButton = true;
              this.cdr.detectChanges();
            });
          }
        }, 400); // Casi inmediato
      } 
      this.cdr.detectChanges();

      // Si llegamos al Welcome View ('/'), iniciamos la maquinaria
      if (this.currentRoute === '/' || this.currentRoute === '/idle') {
        if (this.currentRoute === '/') this.startIframeMonitoring();
      } else {
        this.stopIframeMonitoring();
      }
    });

    // Escuchar evento para abrir panel admin (DESHABILITADO)
    /*
    fromEvent(document, 'openAdminPanel')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.adminPanelStateService.setOpen(true);
      });
    */

    this.kioskStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((status) => {
       console.log('🔄 Estado del Kiosco actualizado:', status);
       this.currentKioskStatus = status;

       if (status === 'REGISTERED') {
         if (this.currentRoute === '/' || this.router.url === '/') {
           this.startIframeMonitoring();
         }
       } else {
         this.stopIframeMonitoring();
       }
    });

    // Forzamos visualización de carga al inicio
    this.kioskAuth.setLoadingState();
    setTimeout(() => {
      this.kioskAuth.initAuth();
    }, 1000); 
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopViewCheck();
  }

  /**
   * Recarga el iframe para forzar un nuevo evento de carga/mensaje
   */
  private reloadIframe(): void {
    this.isIframeReady = false; 
    if (this.idlePageUrl) {
      const separator = this.idlePageUrl.includes('?') ? '&' : '?';
      const urlWithTimestamp = `${this.idlePageUrl}${separator}t=${Date.now()}`;
      this.idlePageUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithTimestamp);
    } else {
      this.idlePageUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
  }

  /**
   * Verifica si estamos en la vista de inicio (welcome-view)
   */
  private isInWelcomeView(): boolean {
    if (this.helper.view) return false; 
    const welcomeView = document.querySelector('app-welcome-view');
    const formView = document.querySelector('form.form-login');
    return welcomeView !== null && formView === null;
  }

  private startViewCheck(): void {
    this.stopViewCheck();
    this.viewCheckInterval = setInterval(() => {
      this.checkViewAndHideCarousel();
    }, 1000);
  }

  private stopViewCheck(): void {
    if (this.viewCheckInterval) {
      clearInterval(this.viewCheckInterval);
      this.viewCheckInterval = null;
    }
  }

  private checkViewAndHideCarousel(): void {
    if (this.showAdCarousel && !this.isInWelcomeView()) {
      this.showAdCarousel = false;
    }
  }

  public onIdleButtonInteraction(ev: Event): void {
    if (ev.cancelable) ev.preventDefault();
    ev.stopPropagation();
    this.hideIdlePage();
  }

  public hideIdlePage(): void {
    this.showIdlePage = false;
    setTimeout(() => {
      this.goToPaymentForm();
    }, 0);
  }

  public hideAdCarousel(): void {
    this.showAdCarousel = false;
    this.resetToWelcomeView();
  }

  private resetToWelcomeView(): void {
    this.router.navigate(['/']);
  }

  private goToPaymentForm(): void {
    this.router.navigate(['/pay']);
  }

  public handleShowScrollArrow = (event: Event) => {
    this.showScrollArrow = ((event.target as HTMLDivElement).scrollTop > 0)
  }

  public scrollToTop = () => {
    const scrollElement: HTMLElement | null = document.getElementById('content-scrollable')
    scrollElement?.scrollTo({top: 0, behavior: 'smooth'});
  }

  public closeAdminPanel(): void {
    this.adminPanelStateService.setOpen(false);
  }

}