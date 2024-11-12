import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-welcome-view',
  templateUrl: './welcome-view.component.html',
  styleUrls: ['./welcome-view.component.scss']
})
export class WelcomeViewComponent implements OnInit {
  @Output() showFormEmitter = new EventEmitter<void>()
  constructor() { }

  ngOnInit(): void {
  }

  showForm = () => {
    this.showFormEmitter.emit()
  }

}
