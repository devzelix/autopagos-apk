import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-btn-to-option',
  templateUrl: './btn-to-option.component.html',
  styleUrls: ['./btn-to-option.component.scss']
})
export class BtnToOptionComponent implements OnInit, OnDestroy {

  @Output() btnOption = new EventEmitter<string>();
  public btnSelected: string = 'test';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.btnSelected = 'test'; // Reset the selected button when the component is destroyed
  }

  public btnToOption(option: string) {

    this.btnSelected = option; // Set the selected button

    this.btnOption.emit(option);
  }

}
