import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthAdminPanelService } from 'src/app/services/api/auth-admin-panel.service';
import { ICheckout } from 'src/app/interfaces/checkout.interface';
import { IPosDevice } from 'src/app/interfaces/pos-device.interface';
import { LocalstorageService } from 'src/app/services/localstorage.service';
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
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() loginEvent = new EventEmitter<boolean>();

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
    private localStorageService: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.formLogin = new FormGroup({
      user: new FormControl('', [Validators.required]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
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

      // Obtener cajas de la sede
      const checkouts = await this.authService.getUserCheckouts(data.id_sede);

      if (checkouts && checkouts.length > 0) {
        this.availableCheckouts = checkouts;
        this.currentStep = LoginStep.CHECKOUT_SELECTION;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sin cajas disponibles',
          text: 'No hay cajas activas disponibles para esta sede.',
        });
        this.submitted = false;
      }
    } else {
      console.log('Error de autenticación');
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.',
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
        text: 'No hay dispositivos POS disponibles para asignar.',
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
        <p><strong>Caja:</strong> ${this.selectedCheckout?.checkout_identify}</p>
        <p><strong>Dispositivo POS:</strong> ${posDevice.terminalVirtual}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const success = await this.authService.assignPosToCheckout(
        posDevice.id_pos_device,
        this.selectedCheckout!.id_checkout
      );

      if (success) {
        // Guardar datos individuales
        this.localStorageService.set('id_checkout', this.selectedCheckout!.id_checkout);
        this.localStorageService.set('pos_ip', posDevice.ip_address);
        this.localStorageService.set('pos_port', posDevice.port);
        Swal.fire({
          icon: 'success',
          title: 'Asignación exitosa',
          text: 'El dispositivo POS ha sido asignado correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });

        this.currentStep = LoginStep.COMPLETED;
        this.loginEvent.emit(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en la asignación',
          text: 'No se pudo asignar el dispositivo POS. Inténtelo de nuevo.',
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
