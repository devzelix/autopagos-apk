import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import { IPaymentTypes, ITransactionInputs, ITypeDNI } from 'src/app/interfaces/payment-opt';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { VposerrorsService } from 'src/app/services/vposuniversal/vposerrors.service';
import { VposuniversalRequestService } from 'src/app/services/vposuniversal/vposuniversal-request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-payment',
  templateUrl: './modal-payment.component.html',
  styleUrls: ['./modal-payment.component.scss']
})
export class ModalPaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('inputDni') inputDni: ElementRef<HTMLInputElement>;
  @ViewChild('inputMount') inputMount: ElementRef<HTMLInputElement>;
  @Output() closeEmmit: EventEmitter<void> = new EventEmitter() // => close event emmitter
  @Output() onSubmitPayForm: EventEmitter<void> = new EventEmitter() // => on submit event emitter, resets all
  @Input() paymentType: IPaymentTypes;
  @Input() dniValue: string;
  @Input() mountValue: number = 0;
  @Input() amountContrato: number = 0;
  @Input() nroContrato: string = '';
  @Input() nroAbonado: string = '';
  @Input() activeInputFocus: ITransactionInputs = 'dni';
  public formPayment: FormGroup;
  public typeDNI: ITypeDNI = 'V';
  public _dataApi: any;
  public sendPayment: boolean = false;
  public isDniDisabled: boolean = true;
  public isMountDisabled: boolean = true;
  private mountFormat: string = '0.00';

  public formErrorMessage?: {inputName: ITransactionInputs, errorMsg: string}

  constructor(
    private fb: FormBuilder,
    private _ApiVPOS: VposuniversalRequestService,//API VPOSUniversal PINPAD -By:MR-
    private _printer: PrinterService,
    private _errorsvpos: VposerrorsService // PrinterService instance used to print on Printer -By:MR-
  ) {
    this.formPayment = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Validación requerida y solo números
      mount: [{value:''}, [Validators.required ]], //Validators.min(0), Validators.pattern(/\./g) // Validación requerida y monto positivo
      accountType: ['Corriente', Validators.required] // Valor por defecto y validación requerida
    });
  }

  ngOnInit(): void {
    this.dni?.setValue(this.dniValue)
    this.mount?.setValue(this.mountValue)
    this.setCurrencyMountFormat()

    /* if (this.activeInputFocus === 'dni') {
      this.mount?.disable();
    }
    else if (this.activeInputFocus ==='mount') {
      this.dni?.disable();
    } */

/*
    if (this.activeInputFocus === 'dni' && this.inputDni && !this.dni?.disable) {
      console.log('SETEA FOCUS')
      this.inputDni.nativeElement.focus();
    }
    else if (this.inputMount && !this.mount?.disable) {
      this.inputMount.nativeElement.focus()
    } */
  }

  ngAfterViewInit(): void {

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
  get isDniInputDisabled() {
    return this.dni?.disabled;
  }
  get isMountInputDisabled() {
    return this.mount?.disabled;
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

        if (!this._dataApi || !this._dataApi?.data.datavpos) {
          Swal.fire({
            icon: 'error',
            title: 'Ha ocurrido un error, intente nuevamente más tarde',
            showConfirmButton: false,
            allowOutsideClick: true,
            timer: 4000,
          })
        }

        console.log(
          this._dataApi.data.datavpos.mensajeRespuesta,
          this._errorsvpos.getErrorMessage(this._dataApi.data.datavpos.codRespuesta),
          this._dataApi.data.datavpos.codRespuesta
        );

        if(this._dataApi.data.datavpos.codRespuesta === '00'){

          this.generarPDF().catch((err) => {
            console.log(err);
          });

          Swal.fire({
            icon: 'success',
            title: 'Pago procesado con éxito \n'+this._errorsvpos.getErrorMessage(this._dataApi.data.datavpos.codRespuesta),
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 4000, // El modal se cerrará después de 5 segundos
            didClose: () => this.onSubmitPayForm.emit()
          });
        } else {

          if (this._dataApi.data.datavpos.codRespuesta === '51'){
            this.generarPDF().catch((err) => {
              console.log(err);
            });
          }

          Swal.fire({
            icon: 'error',
            title: this._errorsvpos.getErrorMessage(this._dataApi.data.datavpos.codRespuesta), //'Error al procesar el pago \n'+
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 4000, // El modal se cerrará después de 5 segundos
            // didClose: () => this.onCloseModal()
          });
        }


      } catch (error) {

        let _messageError: string = 'Ha ocurrido un error\nConsulte con el personal de Fibex';
        let timeShow: number = 4000;

        if (this.dni?.value === "90000000") {
          _messageError = 'Muestrele este error a un técnico \n Error: '+(error instanceof Error ? error.message : 'Desconocido');
          timeShow = 6000;
        }

        Swal.fire({
          icon: 'error',
          title: _messageError,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: timeShow, // El modal se cerrará después de 5 segundos
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
    try {

      let inputValue = this.formPayment.get(this.activeInputFocus)?.value

      if (this.formPayment.get(this.activeInputFocus)?.disabled) return;

      if (this.activeInputFocus === 'dni' && typeof inputValue === 'string' && inputValue.length < 8) {

        this.formPayment.get(this.activeInputFocus)?.setValue(inputValue += value);

      }
      else if (this.activeInputFocus === 'mount' && (!String(inputValue ?? '') || String(inputValue)?.replace(/\,/g, '').length < 10) ) {

        this.setCurrencyMountFormat(value)
      }

      this.validateFormErrors()
    } catch (error) {
      console.error('Error onTecladoInput', error)
    }
  }

  /**
   * on delete pinpad event
   */
  public deleteLastCharacter = (): void => {
    let inputValue = this.formPayment.get(this.activeInputFocus)?.value

    if (this.formPayment.get(this.activeInputFocus)?.disabled) return;

    this.formPayment.get(this.activeInputFocus)?.setValue(inputValue.slice(0, -1));

    if (this.activeInputFocus === 'mount') {
      this.setCurrencyMountFormat();
    }
    else this.isDniDisabled = false;

    this.validateFormErrors()
  }

  /**
   * Function to change the active Input on Focus
   * @param focusInputName name of the focus input
   */
  public onFocus = (focusInputName: 'dni' | 'mount' | 'accountType') => {
    console.log('onfocus', focusInputName)

    if (this.formPayment.get(focusInputName)?.disabled) return;

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
  public async requestCard(): Promise<any> {
    try {

      console.log('in requestCard')
      let macAddress = '';

      try {
        macAddress  = await this.getMacAddress();
      } catch (error) {
        console.error(error)
      }

      console.log('macAddress', macAddress);
      console.log('this.mount?.value', this.mount?.value)
      this.mountFormat = String(this.mount?.value).replace(/\,/g, '');
      console.log('MOUNT', this.mountFormat)

      let _desciptionText: string =
      Number(this.mountFormat) === Number(this.amountContrato) ? 'Pago - Mensualidad' :
      Number(this.mountFormat) > Number(this.amountContrato) ? 'Adelanto - Mensualidad' :
      Number(this.mountFormat) < Number(this.amountContrato) ? 'Abono - Mensualidad' :
      'Pago';

      console.log('MENSAJE AQUÏ >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>','Contrato:', this.nroContrato, 'Abonado:', this.nroAbonado);

      const responseJSON = await this._ApiVPOS.cardRequest(this.dni?.value, this.mountFormat, this.nroAbonado, this.nroContrato, macAddress);

      console.log('responseJSON', responseJSON);

      return responseJSON;

    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function to get the current MAC-ADDRESS
   * @param type Type of string
   */
  public async getMacAddress(){

    const macaddress: string = await this._printer.getMacAddress();

    console.log('macaddress', macaddress);

    return macaddress;

  }


  /**
   * Function to generate a PDF with the payment data
   * @param data data to be included in the PDF
   */
  public async generarPDF() {

    let _dataApiClient = []; // Data to tiket print
    let _desciptionText: string =
      Number(this.mountFormat) === this.amountContrato ? 'Pago de Mensualidad' :
      Number(this.mountFormat) > this.amountContrato ? 'Adelanto de Mensualidad' :
      Number(this.mountFormat) < this.amountContrato ? 'Abono de Mensualidad' :
      'Pago';

    console.log(this.amountContrato, this.mount,_desciptionText);

    // to genarate tiket and printer this
    _dataApiClient = [
      {
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.data.datavpos.numeroReferencia,
        'numSeq': this._dataApi.data.datavpos.numSeq,
        'ciClient': this.dniValue || 'unknown',
        'abonumber': this.nroContrato,
        'describe': _desciptionText,
        'amount': String(this.mount?.value),
        'methodPayment': this._dataApi.data.datavpos.tipoProducto,
        'totalAmount': String(this.mount?.value),
        'saldo': String(this.mount?.value),
        'status': this._dataApi.data.datavpos.mensajeRespuesta,
      }
    ];

    // console.log('My data: '+this._dataApi.data.datavpos.nombreVoucher);
    // console.log('Ref number: '+this._dataApi.data.datavpos.numeroReferencia);
    // console.log('Answer Message: '+this._dataApi.data.datavpos.mensajeRespuesta);
    // console.log('Product type: '+this._dataApi.data.datavpos.tipoProducto);
    // console.log('Number autoritation: '+this._dataApi.data.datavpos.numeroAutorizacion);
    // // console.log('Number card: '+this._dataApi.data.datavpos.numeroTarjeta);
    // console.log('Amount: '+this._dataApi.data.datavpos.montoTransaccion);
    // console.log('CI: '+this._dataApi.data.datavpos.cedula);

    // console.log(_dataApiClient);

    if(_dataApiClient[0]['status'] === 'NEGADA 116          NEGADA') {

      // TODO ANALIZAR ESTO QUE ESTA CABLEADO
      _dataApiClient = [{
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.data.datavpos.numeroReferencia,
        'numSeq': this._dataApi.data.datavpos.numSeq,
        'ciClient': this._dataApi.data.datavpos.cedula,
        'abonumber': this.nroContrato,
        'describe': 'Pago Fallido',
        'amount': '00.00',
        'methodPayment': this._dataApi.data.datavpos.tipoProducto,
        'totalAmount': '00.00Bs.',
        'saldo': '0,00Bs.',
        'status': this._dataApi.data.datavpos.mensajeRespuesta,
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

  private setCurrencyMountFormat = (value?: string) => {
    const inputValue: number | string = this.mount?.value;
    console.log('inputValue', inputValue)
    const currentValue = String(inputValue ?? '').replace(/\./g, '').replace(/\,/g, '')

    const newAmountValue: number = parseInt(value ? (currentValue + value) : currentValue)

    const currency = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(newAmountValue / 100);
    console.log('currency', currency)

    this.mount?.setValue(currency);
  }

  public setInputFocus = (input: ITransactionInputs) => {

    if (this.formPayment.get(input)?.disabled) return;

    this.activeInputFocus = input;

    if (input === 'dni' && this.inputDni && !this.dni?.disable) {
      console.log('SETEA FOCUSSSSS')
      this.inputDni.nativeElement.focus()
      this.inputMount.nativeElement.disabled = false;
    }
    else if (input ==='mount' && this.inputMount && !this.mount?.disable) {
      console.log('SETEA FOCUSSS MOUNT')
      this.inputMount.nativeElement.focus()
      this.inputMount.nativeElement.disabled = false;
    }
  }

  public onInputValueChange = (event:Event, inputName: ITransactionInputs) => {
    const regex = /^\d+$/;
    let value = (event.target as HTMLInputElement).value;
    const isMountActive: boolean = (inputName === 'mount')

    if (isMountActive) value = value.replace(/\,/g, '').replace(/\./g, '')

    if (!regex.test(value)) {
      this[inputName]?.setValue(this[inputName]?.value.slice(0, -1))
    }

    if (isMountActive) {
      this.setCurrencyMountFormat()
    }

    this.validateFormErrors()
  }

  public onEditDniValue = () => {
    if (this.inputDni) {
      console.log('SETEA FOCUSS')
      this.inputDni.nativeElement.disabled = false;
      this.dni?.setValue('')
      this.inputDni.nativeElement.focus();
      this.isDniDisabled = false;
      if (this.dni) this.dni.enable()
    }
    this.validateFormErrors()
  }

  public onEditMountValue = () => {
    if (this.inputMount) {
      console.log('SETEA FOCUSS')
      this.inputMount.nativeElement.disabled = false;
      this.mount?.setValue('')
      this.inputMount.nativeElement.focus();
      this.isMountDisabled = false;
      if (this.mount) this.mount.enable()
    }
    this.validateFormErrors()
  }

  private validateFormErrors = (): void  => {
    try {

      if (!this.dni?.value || this.dni?.value.length < 7) {
        this.formErrorMessage = {inputName:'dni', errorMsg: 'Ingrese una cédula válida'}
        return;
      }

      this.formErrorMessage = {inputName:'dni', errorMsg: ''}

      if (!this.mount?.value) {
        this.formErrorMessage = {inputName:'mount', errorMsg: 'Ingrese un monto válido'}
        return;
      }
      const mount = parseInt(this.mount?.value.replace(/\,/g, ''))
      if (mount <= 0 ) {
        this.formErrorMessage = {inputName:'mount', errorMsg: 'Ingrese un monto válido'}
        return;
      }

      this.formErrorMessage = {inputName:'mount', errorMsg: ''}

    } catch (error) {
      console.error(error)
    }
  }

}
