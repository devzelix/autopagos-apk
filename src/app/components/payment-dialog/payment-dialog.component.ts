import { Component, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PaymentDialogOptionsComponent } from '../payment-dialog-options/payment-dialog-options.component';
import { PAYMENT_OPTION } from '../../providers/payment-data-opt';
@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {

  public mobileQuery: MediaQueryList;
  public showPaymentOpt: boolean = false;
  public ENUM_PAYMENT_OPTION: typeof PAYMENT_OPTION = PAYMENT_OPTION;
  public paymentOptSelected: { option: PAYMENT_OPTION };

  constructor(
    public media: MediaMatcher,
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PaymentDialogComponent>

  ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
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
}
