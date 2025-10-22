import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthAdminPanelService } from 'src/app/services/api/auth-admin-panel.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Para emitir evento al componente padre y mostrar el módulo administrativo con las acciones disponibles
  @Output() loginEvent = new EventEmitter<boolean>();
  public user: string = '';
  public pass: string = '';
  public formLogin: FormGroup;
  public submitted: boolean = false;

  constructor(
    private authService: AuthAdminPanelService
  ) { }

  ngOnInit(): void {
    // Inicializa el FormGroup con FormControls y validadores
    this.formLogin = new FormGroup({
      user: new FormControl('', [Validators.required]), // Email requerido y con formato válido
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]) // Contraseña requerida y con mínimo de 6 caracteres
    });
  }

  // Método para manejar el envío del formulario
  public async onSubmit(): Promise<void> {
    this.submitted = true;

    // Verifica si el formulario es válido antes de proceder
    if (this.formLogin.valid) {
      const user = this.formLogin.get('user')?.value;
      const password = this.formLogin.get('pass')?.value;
      await this.loginAdmin(user, password);
    } else {
      console.log('Formulario inválido');
      this.submitted = false;
    }
  }

  /**
   * Método para autenticar al administrador
   * @param user
   * @param pass
   */
  public async loginAdmin(user: string, pass: string): Promise<void> {
    const isAuthenticated = await this.authService.authAdmin(user, pass);

    if (isAuthenticated) {
      console.log('Autenticación exitosa');
      setTimeout(() => {
        this.loginEvent.emit(true);
      }, 1000);
      Swal.fire({
        icon: 'success',
        title: 'Autenticación exitosa',
        text: 'Bienvenido al panel administrativo.',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      console.log('Error de autenticación');
      this.loginEvent.emit(false);
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.',
      });
      this.submitted = false;
    }
  }
}
