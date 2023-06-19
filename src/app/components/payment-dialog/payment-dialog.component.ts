import { Component, OnInit } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent{

  public mobileQuery: MediaQueryList;

  constructor(
    public media: MediaMatcher,
    private clipboard: Clipboard,
    private snack: MatSnackBar

    ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    console.log(this.mobileQuery)
  }

  prepareToCopy(id: string){
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
}
