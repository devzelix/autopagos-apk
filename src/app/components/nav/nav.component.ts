import { Component, OnInit } from '@angular/core';
import { TasaService } from '../../services/tasa.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public tasa: string = '';
  public tasaExiste: boolean = false

  constructor( private tasaService: TasaService, public dialogTemplate: MatDialog,) { }

  ngOnInit(): void {
    this.tasaService.tasa.subscribe((res) => {
      this.tasaExiste = true;
      this.tasa = parseFloat(res).toFixed(2);
    })
  }

  // openDialogPM() {
  //   const dialog = this.dialogTemplate.open(PaymentDialogComponent, {
  //     height: '90vh',
  //     disableClose: false,
  //   })
  //   dialog.afterClosed().subscribe(result => {
  //   });
  // }
}
