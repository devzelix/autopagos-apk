import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-payment',
  templateUrl: './modal-payment.component.html',
  styleUrls: ['./modal-payment.component.scss']
})
export class ModalPaymentComponent implements OnInit {
  public formPayment: FormGroup;
  public activeInputFocus: 'dni' | 'mount' | 'accountType' = 'dni';

  constructor(
    private fb: FormBuilder
  ) {
    this.formPayment = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Validación requerida y solo números
      mount: ['', [Validators.required, Validators.min(0)]], // Validación requerida y monto positivo
      accountType: ['Corriente', Validators.required] // Valor por defecto y validación requerida
    });
  }

  ngOnInit(): void {
  }

  public onSubmit = (event: Event) => {
    event.preventDefault();
    if (this.formPayment.valid) {
      console.log(this.formPayment.value);
    } else  console.log('Formulario no válido');
  }

  /**
   * Function to handle the keyboard pressed events 
   * @param value Value of the keyboard event
   */
  public onTecladoInput = (value: string): void => {
    let inputValue = this.formPayment.get(this.activeInputFocus)?.value

    if (typeof inputValue === 'string' && inputValue.length < 8) this.formPayment.get(this.activeInputFocus)?.setValue(inputValue += value);
  }

  public deleteLastCharacter = (): void => {
    let inputValue = this.formPayment.get(this.activeInputFocus)?.value
    this.formPayment.get(this.activeInputFocus)?.setValue(inputValue.slice(0, -1));
  }

  public onFocus = (focusInputName: 'dni' | 'mount' | 'accountType') => {
    console.log('onfocus', focusInputName)
    this.activeInputFocus = focusInputName
  }

}
