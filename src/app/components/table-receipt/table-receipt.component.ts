import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SeguridadDatos } from 'src/app/services/bscript.service';

@Component({
  selector: 'app-table-receipt',
  templateUrl: './table-receipt.component.html',
  styleUrls: ['./table-receipt.component.scss']
})
export class TableReceiptComponent implements OnInit {
  @Input() amountPm: any;
  @Input() cantidad: any;
  public PgMovilRegForm: FormGroup;
  public PgMovilForm: FormGroup;
  public dateToDay: Date = new Date();
  public paquete: string = '';
  public subscription: string = '';
  public saldoUSD: string = '';
  public saldoBs: string = '';
  public nameClient: string = '';
  public dni: string = '';

  constructor(private _seguridadDatos: SeguridadDatos) {
    this.subscription = this._seguridadDatos.decrypt(localStorage.getItem('Subscription')!) ? this._seguridadDatos.decrypt(localStorage.getItem('Subscription')!) : "";
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem('Monto')!) ? this._seguridadDatos.decrypt(localStorage.getItem('Monto')!) : ""; 
    this.saldoBs = this._seguridadDatos.decrypt(localStorage.getItem('MontoBs')!) ? this._seguridadDatos.decrypt(localStorage.getItem('MontoBs')!) : "";
    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem('Name')!) ? this._seguridadDatos.decrypt(localStorage.getItem('Name')!) : "";
    this.dni = this._seguridadDatos.decrypt(localStorage.getItem('dni')!) ? this._seguridadDatos.decrypt(localStorage.getItem('dni')!) : "";

    console.log(this.cantidad)
  }

  ngOnInit(): void {
  }

  

}
