import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListBankPago } from '../form/camposSubscription/camposSuscription';


@Component({
  selector: 'app-list-bank',
  templateUrl: './list-bank.component.html',
  styleUrls: ['./list-bank.component.scss']
})
export class ListBankComponent implements OnInit {
  @Input() Tipo: string;
  @Output() BankSelect = new EventEmitter<any>();

  MetodosPago: any = []

  constructor() { }

  ngOnInit(): void {
    console.log("entre en el ngOninit de list bank " + this.Tipo)
    console.log(ListBankPago)
    if (this.Tipo === 'DebitoCredito') {
      this.MetodosPago = ListBankPago.filter((FL: any) => FL.opcion != 'otros')
    } else {
      this.MetodosPago = ListBankPago
    }

  }

  OpcionSelect(Valor: any) {
    this.BankSelect.emit({
      Tipo: this.Tipo,
      Opcion: Valor._value
    })
  }

}
