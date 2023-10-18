import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-pay',
  templateUrl: './info-pay.component.html',
  styleUrls: ['./info-pay.component.scss']
})
export class InfoPayComponent implements OnInit {
  @Inject(MAT_DIALOG_DATA) public dialogData: {fecha_reg:Date,numero_ref:number,status_pd:string}[] = []
  @Input() tableData: {fecha_reg:Date,numero_ref:number,status_pd:string}[] = []/*[
    
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
  ]*/

  constructor(
    private dialogRef: MatDialogRef<InfoPayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {fecha_reg:Date,numero_ref:number,status_pd:string}[]
  ) {
  }

  ngOnInit(): void {
    console.log("dialogData");
    console.log(this.data)
  }

  public dismiss = (): void => {
    this.dialogRef.close()
  }

}
