import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataOptionsType } from '../../interfaces/payment-opt';
import { PAYMENT_OPTION } from '../../providers/payment-data-opt';

@Component({
  selector: 'app-payment-dialog-options',
  templateUrl: './payment-dialog-options.component.html',
  styleUrls: ['./payment-dialog-options.component.scss']
})
export class PaymentDialogOptionsComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();
  @Input() data: DataOptionsType;
  public ENUM_PAYMENT_OPT: typeof PAYMENT_OPTION = PAYMENT_OPTION;

  constructor(
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    // private dialogRef: MatDialogRef<PaymentDialogOptionsComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: { option: string}
  ) { }

  ngOnInit(): void {
  
  }

  copyTextBox(id: string) {
    const htmlElement = Array.from(document.querySelectorAll(`#${id}`))
    const htmlListElement = Array.from(document.querySelectorAll(`#${id} > ul`))
    const textArea = document.createElement('textarea')
    textArea.textContent = ''

    textArea.textContent += `${htmlElement[0].childNodes[0].textContent}\n`

    if (htmlListElement.length > 0) {
      htmlListElement[0].childNodes.forEach(el => {

        textArea.textContent += `${el.textContent}\n`

      })

    }

    this.copy(textArea.textContent)
  }

  copy(value: string) {
    this.clipboard.copy(value)
    this.snack.open('Copiado en el portapapeles', 'Cerrar', {
      horizontalPosition: 'center',
      duration: 3000
    })
  }

  dismiss() {
    // this.dialogRef.close()
    this.close.emit()
  }
}
