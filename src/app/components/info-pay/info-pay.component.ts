import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-pay',
  templateUrl: './info-pay.component.html',
  styleUrls: ['./info-pay.component.scss']
})
export class InfoPayComponent implements OnInit {

  @Output() closeEmit: EventEmitter<void> = new EventEmitter<void>()
  @Input() data: {fecha_reg:Date,numero_ref:number,status_pd:string}[] = []

  constructor(
    private dialogRef: MatDialogRef<InfoPayComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: {fecha_reg:Date,numero_ref:number,status_pd:string}[]
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
