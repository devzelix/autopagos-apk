import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  constructor(
    // private administrativeAction
  ) { }

  ngOnInit(): void {
  }

  public closeBox() {
    // Emitir evento para cerrar la caja de administración
    alert("Acción aministrativa ejecutada");
  }

}
