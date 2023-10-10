import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-pay',
  templateUrl: './info-pay.component.html',
  styleUrls: ['./info-pay.component.scss']
})
export class InfoPayComponent implements OnInit {

  @Input() tableData: {fecha_reg:Date,numero_ref:number,status_pd:string}[] = [
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'REGISTRADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'RECHAZADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'RECHAZADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
    {
      fecha_reg: new Date(),
      numero_ref: 565415656,
      status_pd: 'PROCESADO'
    },
  ]

  constructor(
    private dialogRef: MatDialogRef<InfoPayComponent>,
  ) {
  }

  ngOnInit(): void {
  }

  public dismiss = (): void => {
    this.dialogRef.close()
  }

}
