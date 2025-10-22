import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  public isLogged: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  public handlerLogin(isLoggedIn: boolean): void {
    this.isLogged = isLoggedIn;
  }

}
