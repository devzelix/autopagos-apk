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
  public Service:string = '';

  constructor(private _seguridadDatos: SeguridadDatos) {}

  ngOnInit(): void {
    // Mover lógica pesada del constructor a ngOnInit para mejor rendimiento
    this.subscription = this._seguridadDatos.decrypt(localStorage.getItem('Subscription')!) || "";
    this.saldoUSD = this._seguridadDatos.decrypt(localStorage.getItem('Monto')!) || ""; 
    this.saldoBs = this._seguridadDatos.decrypt(localStorage.getItem('MontoBs')!) || "";
    this.nameClient = this._seguridadDatos.decrypt(localStorage.getItem('Name')!) || "";
    this.dni = this._seguridadDatos.decrypt(localStorage.getItem('dni')!) || "";
    
    const serviceData = this._seguridadDatos.decrypt(localStorage.getItem('Service')!);
    this.Service = serviceData ? JSON.parse(serviceData) : "";

    if(typeof this.cantidad == 'object'){
      this.cantidad = this.cantidad?.value;
    } 

    if(typeof this.amountPm == 'object'){
      this.amountPm = this.amountPm?.value;
    }
  }

  

}
