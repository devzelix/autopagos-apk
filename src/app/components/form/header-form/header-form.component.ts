import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.scss'],
})
export class HeaderFormComponent implements OnInit {
  @Output() goHomeEmitter = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  goHome() {
    this.goHomeEmitter.emit();
  }
}
