import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-keyboard-on-screen',
  templateUrl: './keyboard-on-screen.component.html',
  styleUrls: ['./keyboard-on-screen.component.scss']
})
export class KeyboardOnScreenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Output() valorTeclado = new EventEmitter<string>();

  public pressKey(num: string): void {
    this.valorTeclado.emit(num);
  }

  public  clearScreen(): void {
    this.valorTeclado.emit(''); // Emitir vacío para limpiar
  }

  public deleteLast(currentValue: string): void {
    this.valorTeclado.emit(currentValue.slice(0, -1)); // Emitir el valor sin el último carácter
  }
}
