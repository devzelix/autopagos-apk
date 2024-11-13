import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IPaymentTypes, ITypeDNI } from 'src/app/interfaces/payment-opt';
import { VposuniversalRequestService } from 'src/app/services/vposuniversal/vposuniversal-request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-payment',
  templateUrl: './modal-payment.component.html',
  styleUrls: ['./modal-payment.component.scss']
})
export class ModalPaymentComponent implements OnInit {
  @Output() closeEmmit: EventEmitter<void> = new EventEmitter() // => close event emmitter
  @Output() onSubmitPayForm: EventEmitter<void> = new EventEmitter() // => on submit event emitter, resets all
  @Input() paymentType: IPaymentTypes;
  @Input() dniValue: string;
  @Input() mountValue: string = '0,00';
  public formPayment: FormGroup;
  public activeInputFocus: 'dni' | 'mount' | 'accountType' = 'dni';
  public typeDNI: ITypeDNI = 'V';

  constructor(
    private fb: FormBuilder,
    private _ApiVPOS: VposuniversalRequestService,//API VPOSUniversal PINPAD -By:MR-
  ) {
    this.formPayment = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Validación requerida y solo números
      mount: [{value:'', disabled: true}, [Validators.required, Validators.min(0)]], // Validación requerida y monto positivo
      accountType: ['Corriente', Validators.required] // Valor por defecto y validación requerida
    });
  }

  ngOnInit(): void {
    console.log('dni => value', this.dni?.value)
    console.log('mount => value', this.mountValue)
    this.dni?.setValue(this.dniValue)
    this.mount?.setValue(this.mountValue)
    this.mount?.disable()
  }

  /**
   * FORM GETTERS
   */
  get dni() {
    return this.formPayment.get('dni');
  }
  get mount() {
    return this.formPayment.get('mount');
  }
  get accountType() {
    return this.formPayment.get('accountType');
  }

  /**
   * On submit payment form
   * @param event 
   */
  public onSubmit = () => {
    if (this.formPayment.valid) {
      console.log(this.formPayment.value);

      Swal.fire({
        icon: 'success',
        title: 'Pago procesado con éxito',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 4000, // El modal se cerrará después de 5 segundos
        didClose: () => this.onSubmitPayForm.emit()
      });

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

  /**
   * on delete pinpad event
   */
  public deleteLastCharacter = (): void => {
    let inputValue = this.formPayment.get(this.activeInputFocus)?.value
    this.formPayment.get(this.activeInputFocus)?.setValue(inputValue.slice(0, -1));
  }

  /**
   * Function to change the active Input on Focus
   * @param focusInputName name of the focus input
   */
  public onFocus = (focusInputName: 'dni' | 'mount' | 'accountType') => {
    console.log('onfocus', focusInputName)
    this.activeInputFocus = focusInputName
  }

  public onCloseModal = () => this.closeEmmit.emit();

  /**
   * Function to change the DNI type in the form
   * @param value 
   */
  public onLoginTypeChange = (value: ITypeDNI): void => {
    this.typeDNI = value
  }

  /**
   * Function to call api method and reliaze payment
   * Funtions VPOSUniversal PINPAD// -By:MR-
   */
  public requestCard() {
    this._ApiVPOS.cardRequest(this.dniValue, this.mountValue);
  }
}
