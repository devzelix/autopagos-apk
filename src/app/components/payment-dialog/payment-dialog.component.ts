import { Component, OnInit, Inject, inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentDialogOptionsComponent } from '../payment-dialog-options/payment-dialog-options.component';
import { PAYMENT_OPTION } from '../../providers/payment-data-opt';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { standardFormats } from '@angular-devkit/schematics/src/formats';
@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {

  public mobileQuery: MediaQueryList;
  public showPaymentOpt: boolean = false;
  public ENUM_PAYMENT_OPTION: typeof PAYMENT_OPTION = PAYMENT_OPTION;
  public paymentOptSelected: { option: PAYMENT_OPTION };
  changePaymentMethods: boolean = false;

  constructor(
    public media: MediaMatcher,
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: string = 'standard'

  ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
  }
  ngOnInit(): void {
    console.log(this.dialogData)
  
    this.setPaymentMethods(this.dialogData)
  }

  /*
    openDialog(option: string) {
      this.dialog.open(PaymentDialogOptionsComponent, {
        data: { option },
        maxHeight: '86vh',
        minHeight: '36vh',
        minWidth: '28%'
      })
    } */

  handleShowPaymentOpt(showOptComp: boolean, _option?: PAYMENT_OPTION): void {// show or hide PaymentDialogOptionsComponent with its options
    this.showPaymentOpt = showOptComp;
    if (_option) {
      this.paymentOptSelected = {
        option: _option
      }
    }
  }

  dismiss() {
    this.dialogRef.close()
  }

  setPaymentMethods(franchise: string){
    if(franchise === 'aragua') this.changePaymentMethods = !this.changePaymentMethods
  }
}
