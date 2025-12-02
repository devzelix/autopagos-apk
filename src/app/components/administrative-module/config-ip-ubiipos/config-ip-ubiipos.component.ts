import { CommonModule } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { EventEmitter } from '@angular/core';
import { UbiiposService } from 'src/app/services/api/ubiipos.service';
import Swal from 'sweetalert2';
import { IResponse } from 'src/app/interfaces/api/handlerResReq';

@Component({
  selector: 'app-config-ip-ubiipos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './config-ip-ubiipos.component.html',
  styleUrls: ['./config-ip-ubiipos.component.scss'],
})
export class ConfigIpUbiiposComponent implements OnInit {
  @Output() ipUbiipos = new EventEmitter<boolean>();

  constructor(
    private _localStorageService: LocalstorageService,
    private _ubiiposService: UbiiposService
  ) {}

  ngOnInit(): void {}

  // Propiedades para el binding
  ipAddress: string = '';
  portNumber: number | null;
  validationMessage: string = '';
  isIpValid: boolean = false;
  isFormSubmitted: boolean = false;

  // Expresión Regular para validar una IPv4
  private ipRegex: RegExp =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  /**
   * Método que se ejecuta al presionar el botón de "Guardar y Conectar".
   * @param form Angular NgForm
   */
  async onSubmit(form: any): Promise<void> {
    // 🔑 Hacemos el método 'async' y tipamos el retorno
    console.log(
      'Form submitted with IP:',
      this.ipAddress,
      'and Port:',
      this.portNumber
    );
    this.isFormSubmitted = true;
    this.validationMessage = '';
    this.isIpValid = false;

    // 1. Validación básica: Ambos campos deben tener valor
    if (form.invalid || !this.ipAddress.trim() || !this.portNumber) {
      this.validationMessage =
        '⚠️ Por favor, introduce la Dirección IP y el Puerto.';
      return;
    }

    // 2. Validación de Puerto: Rango (1-65535)
    if (this.portNumber < 1 || this.portNumber > 65535) {
      this.validationMessage =
        '⚠️ El Puerto debe ser un número válido entre 1 y 65535.';
      return;
    }

    // 3. Validación de IP con Expresión Regular
    if (!this.ipRegex.test(this.ipAddress)) {
      // Negamos la validación para salir si es inválida
      this.isIpValid = false;
      this.validationMessage =
        '❌ Formato de IP inválido. Debe ser X.X.X.X (Ej: 192.168.1.1).';
      return;
    }

    // 4. Conexión de prueba con manejo de error HTTP
    const fullAddress = `http://${this.ipAddress}:${this.portNumber}`;
    this.validationMessage = `Conectando a ${fullAddress}...`; // Mensaje de feedback mientras espera

    try {
      // Resetear estado antes de la prueba
      this.validationMessage = '';
      this.isIpValid = true;
      // Si tu servicio usa HttpClient de Angular, esto ya ocurre.
      this.showModal(
        'Cancele la operación en el punto de venta si es necesario.',
        'warning',
        22000
      );
      const testConnection: IResponse = await this._ubiiposService.testUbiipos(
        fullAddress
      );

      if (testConnection.status !== 200) {
        this.validationMessage = `No se pudo conectar a ${fullAddress}. Verifica que la IP y el Puerto sean correctos y que el servicio esté activo.`;
        this.showModal(this.validationMessage, 'error', 6000);
        this.isIpValid = false;
        this.ipUbiipos.emit(true); // Emitir true para mantener abierto o mostrar error
        return;
      }

      // Si llegamos aquí, la conexión fue exitosa (status 200-299)
      this.validationMessage = `Conexión exitosa. IP configurada: ${fullAddress}`;

      // Simulación de tiempo de guardado y cierre del componente (si aplica)
      Swal.fire({
        title: this.validationMessage,
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Lógica final para guardar la configuración (ej: localStorage)
          this._localStorageService.set('ubiiposHost', fullAddress);
          console.log('Configuración guardada y exitosa:', fullAddress);
          setTimeout(() => {
            this.ipUbiipos.emit(false); // Emitir false para cerrar el componente o indicar éxito
            this.isIpValid = false;
          }, 1000);
        } else {
          this.ipUbiipos.emit(true); // Emitir true para mantener abierto o mostrar error
          this._localStorageService.removeItem('ubiiposHost');
          this.validationMessage =
            'Configuración cancelada por el usuario. La IP no fue guardada.';
          this.showModal(this.validationMessage, 'error', 6000);
          this.isIpValid = false;
          return;
        }
      });
    } catch (error: any) {
      // Capturamos el error
      console.error('Error al guardar la configuración:', error);
      this.validationMessage =
        'Error interno al guardar la configuración. Inténtalo de nuevo.';
      this.isIpValid = false;
      this.ipUbiipos.emit(true); // Emitir true para mantener abierto o mostrar error
      return;
    }
  }

  /**
   * Show modal with SweetAlert2
   */
  showModal(
    message: string,
    type: 'error' | 'success' | 'warning',
    timer: number = 4000
  ): void {
    Swal.fire({
      icon: type,
      title: message,
      showConfirmButton: false,
      allowOutsideClick: false,
      timer: timer, // El modal se cerrará después de 5 segundos
    });
  }
}
