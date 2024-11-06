import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ITypeDNI } from 'src/app/interfaces/payment-opt';

@Component({
  selector: 'app-tab-dni',
  templateUrl: './tab-dni.component.html',
  styleUrls: ['./tab-dni.component.scss']
})
export class TabDniComponent implements OnInit {
  @Output() typeDNIEmitter = new EventEmitter<ITypeDNI>();
  public typeDNI: ITypeDNI = 'V'

  constructor() { }

  ngOnInit(): void {
  }

   /**
   * Function to change the DNI type in the form
   * @param value 
   */
   public onTypeDNI = (value: ITypeDNI): void => {
    this.typeDNIEmitter.emit(value)
    this.typeDNI = value;
  }

}
