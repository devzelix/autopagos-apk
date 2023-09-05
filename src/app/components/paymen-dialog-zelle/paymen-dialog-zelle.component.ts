import { Component, Inject, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConsultasService } from '../../services/consultas.service';


@Component({
  selector: 'app-paymen-dialog-zelle',
  templateUrl: './paymen-dialog-zelle.component.html',
  styleUrls: ['./paymen-dialog-zelle.component.scss']
})
export class PaymenDialogZelleComponent implements OnInit {

  constructor(
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<PaymenDialogZelleComponent>,
    private _consultaservice: ConsultasService,
    @Inject(MAT_DIALOG_DATA) public data: { option: string}
  ) { }

  ngOnInit() {
  }

  PayZelle(){
    this._consultaservice.PagoZelle();
    this.dismiss();
  }

  copy(value: string){
    this.clipboard.copy(value)
    this.snack.open('Copiado en el portapapeles', 'Cerrar', {
      horizontalPosition: 'center',
      duration: 3000
    })
  }



  dismiss(){
    this.dialogRef.close()
  }

}
