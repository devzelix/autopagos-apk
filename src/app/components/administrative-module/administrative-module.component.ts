import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  @Output() closeModal = new EventEmitter<void>();

  public isLogged: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  public handlerLogin(isLoggedIn: boolean): void {
    this.isLogged = isLoggedIn;
  }

  public onClose(): void {
    this.closeModal.emit();
  }

}
