import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {KeyValue} from '@angular/common';

@Component({
  selector: 'app-dialog-detail-comprobantes',
  templateUrl: './dialog-detail-comprobantes.component.html',
  styleUrls: ['./dialog-detail-comprobantes.component.scss']
})
export class DialogDetailComprobantesComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogDetailComprobantesComponent>,
    @Inject(MAT_DIALOG_DATA) public comprobante: string) { }

    public ListComprobant:any={};

    private onCompare(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
      return -1;
  }
  public campos:any= ['Banco','Comprobante','Fecha','Monto','Referencia','Nota']

  ngOnInit(): void {
    console.log('hola')
    Object.entries(this.comprobante).forEach(([key,value],index:number)=>{
      const INDEX = this.campos.findIndex((valueC:any)=>key == valueC);
      if(INDEX !=-1){
        if(key == 'Fecha'){
          this.ListComprobant[key]=new Date(value).toLocaleString('en-GB')
        }else{
          this.ListComprobant[key]=value
        }
        
      }
    })
  }

  ClosDialog(){
    this.dialogRef.close();
  }

}
