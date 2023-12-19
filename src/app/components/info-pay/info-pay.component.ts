import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPayInfoData } from 'src/app/interfaces/bankList';

@Component({
  selector: 'app-info-pay',
  templateUrl: './info-pay.component.html',
  styleUrls: ['./info-pay.component.scss']
})
/**
 * Table section showing user payment information.
 */
export class InfoPayComponent implements OnInit {
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>()
  @Input() stateTableData: IPayInfoData[] = [];
  @Input() showStateTable: boolean = false;

  constructor(
    // private dialogRef: MatDialogRef<InfoPayComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: {fecha_reg:Date,numero_ref:number,status_pd:string}[]
  ) {
  }

  ngOnInit(): void {
  }

  public dismiss = (): void => {
    // this.dialogRef.close()
    // this.showStateTable = false;
    this.closeEvent.emit()
  }

}
