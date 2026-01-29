import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';


@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  @Output() closeModal = new EventEmitter<void>();

  /** Título del panel. Por defecto "PANEL DE ADMINISTRACIÓN"; el padre puede pasarlo con [panelTitle]. */
  @Input() panelTitle = 'PANEL DE ADMINISTRACIÓN';

  /** true = mostrar directo las funcionalidades (sin usuario/contraseña). */
  public isLogged: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  public handlerLogin(isLoggedIn: boolean): void {
    this.isLogged = isLoggedIn;
  }

  public onClose(): void {
    this.closeModal.emit();
  }

}
