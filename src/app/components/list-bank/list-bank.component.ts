import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListBankPago, Debito } from '../form/camposSubscription/camposSuscription';


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
    //Se separo en debito y credito ya que ha bancos que no tienen servicio de credito
    if (this.Tipo === 'Debito') {
      this.MetodosPago = Debito.filter((FL: any) => FL.opcion != 'otros' && FL.opcion !='100% Banco')
    } else  if (this.Tipo === 'Credito') {
      this.MetodosPago = ListBankPago.filter((FL: any) => FL.opcion != 'otros' && FL.opcion != '100% Banco')
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
