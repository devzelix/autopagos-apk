import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn-to-option',
  templateUrl: './btn-to-option.component.html',
  styleUrls: ['./btn-to-option.component.scss']
})
export class BtnToOptionComponent implements OnInit {

  @Output() btnOption = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  public btnToOption(option: string) {
    this.btnOption.emit(option);
  }

}
