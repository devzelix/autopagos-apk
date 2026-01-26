import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthAdminPanelService } from 'src/app/services/api/auth-admin-panel.service';
import { ICheckout } from 'src/app/interfaces/checkout.interface';
import { IPosDevice } from 'src/app/interfaces/pos-device.interface';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { UbiiposService } from 'src/app/services/api/ubiipos.service';
import { CheckoutSessionService } from 'src/app/services/checkout-session.service';
import Swal from 'sweetalert2';

enum LoginStep {
  LOGIN = 'LOGIN',
  CHECKOUT_SELECTION = 'CHECKOUT_SELECTION',
  POS_SELECTION = 'POS_SELECTION',
  COMPLETED = 'COMPLETED'
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {

  @Output() loginEvent = new EventEmitter<boolean>();
  @Input() loginMode: 'checkout-init' | 'admin-panel' = 'admin-panel';

  public formLogin: FormGroup;
  public submitted: boolean = false;
  public currentStep: LoginStep = LoginStep.LOGIN;
  public LoginStep = LoginStep; // Para usar en el template

  // Datos del flujo
  public userIdSede: number | null = null;
  public selectedCheckout: ICheckout | null = null;
  public availableCheckouts: ICheckout[] = []; // Array de cajas disponibles
  public availablePosDevices: IPosDevice[] = [];
  public filteredPosDevices: IPosDevice[] = [];
  public selectedPosDevice: IPosDevice | null = null;
  public searchTerm: string = '';

  constructor(
    private authService: AuthAdminPanelService,
    private localStorageService: LocalstorageService,
    private ubiiposService: UbiiposService,
    private checkoutSessionService: CheckoutSessionService
  ) { }

  ngOnInit(): void {
    this.formLogin = new FormGroup({
      user: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(100)])
    });
  }

  // TrackBy functions para optimizar *ngFor
  trackByCheckoutId(index: number, checkout: ICheckout): any {
    return checkout.id_checkout || index;
  }

  trackByDeviceId(index: number, device: IPosDevice): any {
    return device.id_pos_device || device.serial_number || index;
  }

  public async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.formLogin.valid) {
      const user = this.formLogin.get('user')?.value;
      const password = this.formLogin.get('pass')?.value;
      await this.loginAdmin(user, password);
    } else {
      console.log('Formulario inválido');
      this.submitted = false;
    }
  }

  public async loginAdmin(user: string, pass: string): Promise<void> {
    const { data, isAuthenticated } = await this.authService.authAdmin(user, pass);

    if (isAuthenticated && data) {
      console.log('Autenticación exitosa');
      this.userIdSede = data.id_sede;

      // Si es modo admin-panel, solo autenticar y emitir evento
      if (this.loginMode === 'admin-panel') {
        console.log('Modo admin-panel: autenticación completada sin selección de caja');
        this.loginEvent.emit(true);
        this.submitted = false;
        return;
      }

      // Si es modo checkout-init, continuar con selección de cajas
      if (this.loginMode === 'checkout-init') {
        // Obtener cajas de la sede
        const checkouts = await this.authService.getUserCheckouts(data.id_sede);

        if (checkouts && checkouts.length > 0) {
          this.availableCheckouts = checkouts;
          this.currentStep = LoginStep.CHECKOUT_SELECTION;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Sin cajas disponibles',
            html: '<p style="color: #dc3545; font-weight: 500;">No hay cajas activas disponibles para esta sede.</p>',
            customClass: {
              popup: 'fibex-swal-popup',
              title: 'fibex-swal-title',
              htmlContainer: 'fibex-swal-html',
              confirmButton: 'fibex-swal-confirm-btn',
              icon: 'fibex-swal-icon'
            },
            buttonsStyling: false,
            width: '420px',
            padding: '2rem'
          });
          this.submitted = false;
        }
      }
    } else {
      console.log('Error de autenticación');
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        html: '<p style="color: #dc3545; font-weight: 500;">Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.</p>',
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          confirmButton: 'fibex-swal-confirm-btn',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        width: '450px',
        padding: '2rem'
      });
      this.submitted = false;
    }
  }

  public async onCheckoutSelected(checkout: ICheckout): Promise<void> {
    if (!checkout) return;

    this.selectedCheckout = checkout;

    // Obtener dispositivos POS disponibles
    const posDevices = await this.authService.getAvailablePos();

    if (posDevices && posDevices.length > 0) {
      this.availablePosDevices = posDevices;
      this.filteredPosDevices = posDevices.filter(device => device.id_checkout === null);
      this.currentStep = LoginStep.POS_SELECTION;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sin dispositivos POS',
        html: '<p style="color: #dc3545; font-weight: 500;">No hay dispositivos POS disponibles para asignar.</p>',
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          confirmButton: 'fibex-swal-confirm-btn',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        width: '420px',
        padding: '2rem'
      });
    }
  }

  public filterPosDevices(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPosDevices = this.availablePosDevices
      .filter(device => device.id_checkout === null)
      .filter(device =>
        device.device_model.toLowerCase().includes(term) ||
        device.serial_number.toLowerCase().includes(term) ||
        device.terminalVirtual.toLowerCase().includes(term)
      );
  }

  public async onPosSelected(posDevice: IPosDevice): Promise<void> {
    this.selectedPosDevice = posDevice;

    // Confirmar asignación
    const result = await Swal.fire({
      title: '¿Confirmar asignación?',
      html: `
        <div style="text-align: left; margin: 10px 0;">
          <p style="margin: 10px 0;"><strong>📦 Caja:</strong> ${this.selectedCheckout?.checkout_identify}</p>
          <p style="margin: 10px 0;"><strong>💳 Dispositivo POS:</strong> ${posDevice.terminalVirtual}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#357CFF',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'fibex-swal-popup',
        title: 'fibex-swal-title',
        htmlContainer: 'fibex-swal-html',
        confirmButton: 'fibex-swal-confirm-btn',
        cancelButton: 'fibex-swal-cancel-btn',
        icon: 'fibex-swal-icon'
      },
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      width: '480px',
      padding: '2rem',
      didOpen: () => {
        // Aplicar estilos inline después de que se abra el modal
        const confirmBtn = document.querySelector('.swal2-confirm.fibex-swal-confirm-btn') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel.fibex-swal-cancel-btn') as HTMLElement;
        
        if (confirmBtn) {
          confirmBtn.style.background = 'linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)';
          confirmBtn.style.backgroundImage = 'linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)';
          confirmBtn.style.color = '#ffffff';
          confirmBtn.style.border = 'none';
          confirmBtn.style.borderRadius = '12px';
          confirmBtn.style.padding = '14px 28px';
          confirmBtn.style.fontSize = '15px';
          confirmBtn.style.fontWeight = '600';
          confirmBtn.style.fontFamily = "'Poppins', sans-serif";
          confirmBtn.style.boxShadow = '0 4px 14px rgba(53, 124, 255, 0.4)';
          confirmBtn.style.minWidth = '120px';
        }
        
        if (cancelBtn) {
          cancelBtn.style.background = '#6c757d';
          cancelBtn.style.backgroundImage = 'none';
          cancelBtn.style.color = '#ffffff';
          cancelBtn.style.border = 'none';
          cancelBtn.style.borderRadius = '12px';
          cancelBtn.style.padding = '14px 28px';
          cancelBtn.style.fontSize = '15px';
          cancelBtn.style.fontWeight = '600';
          cancelBtn.style.fontFamily = "'Poppins', sans-serif";
          cancelBtn.style.boxShadow = '0 4px 14px rgba(108, 117, 125, 0.3)';
          cancelBtn.style.minWidth = '120px';
        }
      }
    });

    if (result.isConfirmed) {
      // Construir URL del POS
      const posUrl = `http://${posDevice.ip_address}:${posDevice.port}`;

      // Mostrar loading de prueba de conexión ANTES de ejecutar el test
      Swal.fire({
        title: 'Probando conexión con POS...',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="margin: 10px 0;">Verificando conexión con:</p>
            <p style="margin: 10px 0;"><strong>🌐 IP:</strong> ${posDevice.ip_address}:${posDevice.port}</p>
            <p style="margin: 10px 0;"><strong>💳 Terminal:</strong> ${posDevice.terminalVirtual}</p>
            <p style="margin-top: 15px; color: #357CFF; font-weight: 500;">Por favor espere...</p>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Esperar un momento para que el Swal se muestre
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        // Probar conexión
        const connectionTest = await this.ubiiposService.testUbiipos(posUrl);

        // Cerrar loading
        await Swal.close();

        // Verificar resultado
        if (connectionTest.status === 200) {
        // Conexión exitosa, proceder con asignación
        const success = await this.authService.assignPosToCheckout(
          posDevice.id_pos_device,
          this.selectedCheckout!.id_checkout
        );

        if (success) {
          // Guardar sesión completa usando el servicio de sesión
          this.checkoutSessionService.saveSession({
            id_sede: this.userIdSede ?? 0,
            id_checkout: this.selectedCheckout!.id_checkout,
            checkoutIdentify: this.selectedCheckout!.checkout_identify,
            ubiiposHost: `http://${posDevice.ip_address}:${posDevice.port}`,
            terminalVirtual: posDevice.terminalVirtual,
            id_pos_device: posDevice.id_pos_device,
            checkout_ip_address: this.selectedCheckout!.ip_address
          });

          Swal.fire({
            icon: 'success',
            title: 'Asignación exitosa',
            html: '<p style="color: #28a745; font-weight: 500;">El dispositivo POS ha sido asignado correctamente.</p>',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'fibex-swal-popup',
              title: 'fibex-swal-title',
              htmlContainer: 'fibex-swal-html',
              icon: 'fibex-swal-icon'
            },
            buttonsStyling: false,
            width: '420px',
            padding: '2rem'
          });

          this.currentStep = LoginStep.COMPLETED;
          this.loginEvent.emit(true);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error en la asignación',
            html: '<p style="color: #dc3545; font-weight: 500;">No se pudo asignar el dispositivo POS. Inténtelo de nuevo.</p>',
            customClass: {
              popup: 'fibex-swal-popup',
              title: 'fibex-swal-title',
              htmlContainer: 'fibex-swal-html',
              confirmButton: 'fibex-swal-confirm-btn',
              icon: 'fibex-swal-icon'
            },
            buttonsStyling: false,
            width: '450px',
            padding: '2rem'
          });
        }
        } else {
          // Conexión fallida - mostrar error detallado
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión con POS',
            html: `
              <div style="text-align: left; margin: 10px 0;">
                <p style="margin: 10px 0;">No se pudo establecer conexión con el dispositivo POS.</p>
                <p style="margin: 10px 0;"><strong>🌐 IP:</strong> ${posDevice.ip_address}</p>
                <p style="margin: 10px 0;"><strong>🔌 Puerto:</strong> ${posDevice.port}</p>
                <p style="margin: 10px 0;"><strong>💳 Terminal:</strong> ${posDevice.terminalVirtual}</p>
                <p style="margin: 10px 0;"><strong>📊 Estado:</strong> ${connectionTest.status}</p>
                <p style="margin: 10px 0; color: #dc3545;"><strong>❌ Error:</strong> ${connectionTest.message || 'Error desconocido'}</p>
              </div>
            `,
            confirmButtonText: 'Intentar con otro dispositivo',
            customClass: {
              popup: 'fibex-swal-popup',
              title: 'fibex-swal-title',
              htmlContainer: 'fibex-swal-html',
              confirmButton: 'fibex-swal-confirm-btn',
              icon: 'fibex-swal-icon'
            },
            buttonsStyling: false,
            width: '500px',
            padding: '2rem'
          });
        }
      } catch (error: any) {
        // Error al ejecutar el test
        await Swal.close();
        
        Swal.fire({
          icon: 'error',
          title: 'Error al probar conexión con POS',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="margin: 10px 0;">Ocurrió un error al intentar conectar con el dispositivo POS.</p>
              <p style="margin: 10px 0;"><strong>🌐 IP:</strong> ${posDevice.ip_address}</p>
              <p style="margin: 10px 0;"><strong>🔌 Puerto:</strong> ${posDevice.port}</p>
              <p style="margin: 10px 0;"><strong>💳 Terminal:</strong> ${posDevice.terminalVirtual}</p>
              <p style="margin: 10px 0; color: #dc3545;"><strong>❌ Error:</strong> ${error?.message || 'No se pudo conectar con el dispositivo'}</p>
            </div>
          `,
          confirmButtonText: 'Intentar con otro dispositivo',
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            confirmButton: 'fibex-swal-confirm-btn',
            icon: 'fibex-swal-icon'
          },
          buttonsStyling: false,
          width: '500px',
          padding: '2rem'
        });
      }
    }
  }

  public onCancel(): void {
    this.currentStep = LoginStep.LOGIN;
    this.selectedCheckout = null;
    this.selectedPosDevice = null;
    this.availableCheckouts = []; // Limpiar array de cajas
    this.availablePosDevices = [];
    this.filteredPosDevices = [];
    this.searchTerm = '';
    this.submitted = false;
  }
}
