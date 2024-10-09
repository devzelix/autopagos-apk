import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-keyboard-on-screen',
  templateUrl: './keyboard-on-screen.component.html',
  styleUrls: ['./keyboard-on-screen.component.scss']
})
export class KeyboardOnScreenComponent implements OnInit {
  @Output() valorTeclado = new EventEmitter<string>();
  @Output() deleteKeyEmitter = new EventEmitter<void>();
  @Output() enterEmitter = new EventEmitter<void>();
  @Input() isValidEnterBtn: boolean = false;
  @Input() classes: string = ''

  constructor() { }


  ngOnInit(): void {
  }

  public pressKey(num: string): void {
    this.valorTeclado.emit(num);
  }
  
  public deleteLast = (): void => this.deleteKeyEmitter.emit();

  /**
   * Function executed on enter pressed
   */
  public enterEmit = (): void => this.enterEmitter.emit();
}
