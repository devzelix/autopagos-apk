import { Component, OnInit, Inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-dialog-options',
  templateUrl: './payment-dialog-options.component.html',
  styleUrls: ['./payment-dialog-options.component.scss']
})
export class PaymentDialogOptionsComponent implements OnInit {

  constructor(
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<PaymentDialogOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { option: string}
  ) { }

  ngOnInit(): void {
    console.log(this.data)
  }

  copyTextBox(id: string){
    const htmlElement = Array.from(document.querySelectorAll(`#${id}`))
    const htmlListElement = Array.from(document.querySelectorAll(`#${id} > ul`))
    const textArea = document.createElement('textarea')
    textArea.textContent = ''

    textArea.textContent +=  `${htmlElement[0].childNodes[0].textContent}\n`

    if(htmlListElement.length > 0){
      htmlListElement[0].childNodes.forEach(el => {
  
        textArea.textContent += `${el.textContent}\n`
  
      })

    }

    this.copy(textArea.textContent)
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
