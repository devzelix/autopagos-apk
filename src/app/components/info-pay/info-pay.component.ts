import { Component, EventEmitter, Input, Output } from '@angular/core';
// Se elimina OnInit ya que no se usará en este caso
import { IPayInfoData } from 'src/app/interfaces/bankList';
import { TasaService } from 'src/app/services/tasa.service';

@Component({
  selector: 'app-info-pay',
  templateUrl: './info-pay.component.html',
  styleUrls: ['./info-pay.component.scss']
})
export class InfoPayComponent { // Ya no es necesario implementar OnInit
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
  @Input() stateTableData: IPayInfoData[] = [];
  @Input() showStateTable: boolean = false;

  // El setter es ahora la única fuente de verdad para la conversión.
  @Input()
  set saldoUser(valor: number) {
    console.log('Setter invocado con el valor:', valor);
    this.saldoReal = valor;
    this.saldoMounted = Math.abs(valor || 0); // Usar '|| 0' como protección
  }

  public saldoMounted: number = 0;
  public saldoReal: number = 0; // Guardas el valor original aquí

  constructor(
  ) { }


  public dismiss = (): void => {
    this.closeEvent.emit();
  }
}
