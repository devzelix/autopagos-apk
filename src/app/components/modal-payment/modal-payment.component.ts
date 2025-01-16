import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
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
  public _dataApi: any;
  public _dataApiClient: any;
  public sendPayment: boolean = false;

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
  public  onSubmit = async ()  => {
    this.sendPayment = true; // Indica que se está enviando el pago al API

    if (this.formPayment.valid) {

      try {

        this._dataApi = await this.requestCard();

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', this._dataApi.data.data.mensajeRespuesta);

        if(this._dataApi.data.data.codRespuesta === '00' && this._dataApi.data.data.mensajeRespuesta === 'APROBADA'){

          this.generarPDF().catch((err) => {
            console.log(err);
          });

          Swal.fire({
            icon: 'success',
            title: 'Pago procesado con éxito \n'+this._dataApi.data.data.mensajeRespuesta,
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 4000, // El modal se cerrará después de 5 segundos
            didClose: () => this.onSubmitPayForm.emit()
          });
        } else if (this._dataApi.data.data.codRespuesta === '51'){

          this.generarPDF().catch((err) => {
            console.log(err);
          });

          Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pago \n TRANSACCIÓN NEGADA',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 4000, // El modal se cerrará después de 5 segundos
            // didClose: () => this.onCloseModal()
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pago \n'+this._dataApi.data.data.mensajeRespuesta,
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 4000, // El modal se cerrará después de 5 segundos
            // didClose: () => this.onCloseModal()
          });
        }


      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar el pago \n'+ (error instanceof Error ? error.message : "Error desconocido"),
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 4000, // El modal se cerrará después de 5 segundos
          // didClose: () => this.onCloseModal()
        });
      }
      finally {
        this.sendPayment = false;
      }

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
  public async requestCard() {

    let macAddress = await this.getMacAddress();

    console.log('macAddress', macAddress);
    // Monto dincamico #String(this.mount?.value)#
    const responseJSON = await this._ApiVPOS.cardRequest(this.dni?.value, '1', 'CV52633', macAddress);

    console.log('responseJSON', responseJSON);

    return responseJSON;
  }

  /**
   * Function to get the current MAC-ADDRESS
   * @param type Type of string
   */
  public async getMacAddress(){

    const macaddress: any = await this._printer.getMacAddress();

    console.log('macaddress', macaddress.data.mac);

    return macaddress.data.mac;

  }


  /**
   * Function to generate a PDF with the payment data
   * @param data data to be included in the PDF
   */
  public async generarPDF() {

    let _dataApiClient = []; // Data to tiket print

    // to genarate tiket and printer this
    _dataApiClient = [
      {
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.data.data.numeroReferencia,
        'nameClient': 'Thomas',
        'ciClient': this.dniValue || 'unknown',
        'abonumber': 'CV52633',
        'describe': 'Pago',
        'amount': String(this.mount?.value),
        'methodPayment': this._dataApi.data.data.tipoProducto,
        'totalAmount': String(this.mount?.value),
        'saldo': String(this.mount?.value),
        'status': this._dataApi.data.data.mensajeRespuesta,
      }
    ];

    // console.log('My data: '+this._dataApi.data.data.nombreVoucher);
    // console.log('Ref number: '+this._dataApi.data.data.numeroReferencia);
    // console.log('Answer Message: '+this._dataApi.data.data.mensajeRespuesta);
    // console.log('Product type: '+this._dataApi.data.data.tipoProducto);
    // console.log('Number autoritation: '+this._dataApi.data.data.numeroAutorizacion);
    // // console.log('Number card: '+this._dataApi.data.data.numeroTarjeta);
    // console.log('Amount: '+this._dataApi.data.data.montoTransaccion);
    // console.log('CI: '+this._dataApi.data.data.cedula);

    // console.log(_dataApiClient);

    if(_dataApiClient[0]['status'] === 'NEGADA 116          NEGADA') {

      // TODO ANALIZAR ESTO QUE ESTA CABLEADO
      _dataApiClient = [{
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.data.data.numeroReferencia,
        'nameClient': 'Miguel',
        'ciClient': this._dataApi.data.data.cedula,
        'abonumber': 'V1242',
        'describe': 'MENS OCT 2024',
        'amount': '00.00',
        'methodPayment': this._dataApi.data.data.tipoProducto,
        'totalAmount': '00.00Bs.',
        'saldo': '0,00Bs.',
        'status': this._dataApi.data.data.mensajeRespuesta,
      }];
    }

    // Validación de campos indefinidos
    const hasUndefinedFields = Object.values(_dataApiClient[0]).some(value => value === undefined || value === null || value === '');

    if (!hasUndefinedFields) {
      // Generar PDF con los datos del comprobante
      await this._printer.printTitek(_dataApiClient);
      console.log('PDF genetrado');

    } else {
        console.error('Uno o más campos en _dataApiClient están indefinidos o vacíos.');
    }
    // to genarate tiket and printer this
  }

  private getTime(type: 'date' | 'time') {
    const date = new Date();
    let time: string;

    if (type === 'date') {
      // Formatear la fecha en formato español
      time = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      // Formatear la hora en formato 24 horas
      time = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    return time;
  }


}
