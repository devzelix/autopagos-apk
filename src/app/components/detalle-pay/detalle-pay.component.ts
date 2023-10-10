import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalle-pay',
  templateUrl: './detalle-pay.component.html',
  styleUrls: ['./detalle-pay.component.scss']
})
export class DetallePayComponent implements OnInit {

  @Input('DataPagoPendiente') DataPagoPendiente: any;
  displayedColumns: string[] = ['Fecha', 'Comprobante','Status'];

  constructor() { }

  ngOnInit(): void {
  }

}
