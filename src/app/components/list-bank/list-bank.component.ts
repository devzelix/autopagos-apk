import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListBankPagoMovil } from '../form/camposSubscription/camposSuscription';


@Component({
  selector: 'app-list-bank',
  templateUrl: './list-bank.component.html',
  styleUrls: ['./list-bank.component.scss']
})
export class ListBankComponent implements OnInit {
  @Input() Tipo: string;
  @Output() BankSelect = new EventEmitter<any>();

  MetodosPagoMovil: any = ListBankPagoMovil

  constructor() { }

  ngOnInit(): void {
  }

  OpcionSelect(Valor: any) {
    this.BankSelect.emit({
      Tipo: this.Tipo,
      Opcion: Valor._value
    })
  }

}
