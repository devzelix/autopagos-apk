import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IPaymentTypes, ITypeDNI } from 'src/app/interfaces/payment-opt';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
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
  @Input() mountValue: number = 0;
  public formPayment: FormGroup;
  public activeInputFocus: 'dni' | 'mount' | 'accountType' = 'dni';
  public typeDNI: ITypeDNI = 'V';

  constructor(
    private fb: FormBuilder,
    private _ApiVPOS: VposuniversalRequestService,//API VPOSUniversal PINPAD -By:MR-
    private _printer: PrinterService, // PrinterService instance used to print on Printer -By:MR-
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
  public  onSubmit = ()  => {
    if (this.formPayment.valid) {
      console.log(this.formPayment.value);

      let requestBack = this.requestCard();

      console.log('RESPUESTGA >>>>>>>>>>>>>>>>>>>>>>>>>>>>',requestBack);

      // to genarate tiket and printer this
      // let requestBackClient = [{
      //   'date': '2024-10-31',
      //   'hours': '12:00:00 PM',
      //   'refundNumber': requestBack.data.numeroReferencia,
      //   'nameClient': 'Miguel',
      //   'ciClient': this.dni,
      //   'abonumber': ,
      //   'describe': 'MENS OCT 2024',
      //   'amount': this.mount,
      //   'methodPayment': requestBack.data.tipoProducto,
      //   'totalAmount': this.mount,
      //   'saldo': '0,00Bs.',
      //   'status': requestBack.data.mensajeRespuesta,
      // }];

      // console.log('My data: '+requestBack.data.nombreVoucher);
      // console.log('Ref number: '+requestBack.data.numeroReferencia);
      // console.log('Answer Message: '+requestBack.data.mensajeRespuesta);
      // console.log('Product type: '+requestBack.data.tipoProducto);
      // console.log('Number autoritation: '+requestBack.data.numeroAutorizacion);
      // console.log('Number card: '+requestBack.data.numeroTarjeta);
      // console.log('Amount: '+requestBack.data.montoTransaccion);
      // console.log('CI: '+requestBack.data.cedula);

      // // Generar PDF con los datos del comprobante
      // // this.generarPDF(requestBackClient);

      // if(requestBackClient[0]['status'] === 'SALDO INSUFICIENTE'){
      //   requestBackClient = [{
      //     'date': '2024-10-31',
      //     'hours': '12:00:00 PM',
      //     'refundNumber': 'Negadada',
      //     'nameClient': 'Miguel',
      //     'ciClient': requestBack.data.cedula,
      //     'abonumber': 'V1242',
      //     'describe': 'MENS OCT 2024',
      //     'amount': '00.00',
      //     'methodPayment': 'Transacción Negada',
      //     'totalAmount': '00.00Bs.',
      //     'saldo': '0,00Bs.',
      //     'status': requestBack.data.mensajeRespuesta,
      //   }];
      // }

      // // Validación de campos indefinidos
      // const hasUndefinedFields = Object.values(requestBackClient[0]).some(value => value === undefined || value === null || value === '');

      // if (!hasUndefinedFields) {
      //   // Generar PDF con los datos del comprobante
      //   this.generarPDF(requestBackClient);
      // } else {
      //     console.error('Uno o más campos en requestBackClient están indefinidos o vacíos.');
      // }
      // to genarate tiket and printer this

      Swal.fire({
        icon: 'success',
        title: 'Pago procesado con éxito',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 4000, // El modal se cerrará después de 5 segundos
        didClose: () => this.onSubmitPayForm.emit()
      });

    } else {
      console.log('Formulario no válido');
    }

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
    const mountValue: string = parseFloat(String(this.mount?.value)).toFixed(2)
    console.log('requestCard MOUNT VALUE', this.mount, mountValue);
    console.log('dni: ', this.dni?.value);
    return this._ApiVPOS.cardRequest(this.dni?.value, mountValue, 'CV52633', '3F-8B-6A-4D-R2-6C');
  }

  /**
   * Function to generate a PDF with the payment data
   * @param data data to be included in the PDF
   */
  public generarPDF(requestBackClient: any) {
    this._printer.printTitek(requestBackClient);
  }
}
