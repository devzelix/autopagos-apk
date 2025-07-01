import { Debit100x100 } from './../debito-100%/debito-100%';
import { register } from 'swiper/element/bundle';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import { IPaymentTypes, ITransactionInputs, ITypeDNI } from 'src/app/interfaces/payment-opt';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
import { VposerrorsService } from 'src/app/services/vposuniversal/vposerrors.service';
import { VposuniversalRequestService } from 'src/app/services/vposuniversal/vposuniversal-request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-payment',
  templateUrl: './modal-payment.component.html',
  styleUrls: ['./modal-payment.component.scss'],
})
export class ModalPaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('inputDni') inputDni: ElementRef<HTMLInputElement>;
  @ViewChild('inputMount') inputMount: ElementRef<HTMLInputElement>;
  @ViewChild('inputReference') inputReference: ElementRef<HTMLInputElement>;
  @Output() closeEmmit: EventEmitter<void> = new EventEmitter() // => close event emmitter
  @Output() onSubmitPayForm: EventEmitter<void> = new EventEmitter() // => on submit event emitter, resets all
  @Input() paymentType: IPaymentTypes;
  @Input() dniValue: string;
  @Input() mountValue: string = '0.00';
  @Input() inputType: string;
  @Input() saldoBs: string = '0.00';
  @Input() tasaCambio: string = '0.00';
  @Input() subscription: string = '0';
  @Input() nroContrato: string = '';
  @Input() nroAbonado: string = '';
  @Input() activeInputFocus: ITransactionInputs = 'dni';
  public formPayment: FormGroup;
  public typeDNI: ITypeDNI = 'V';
  public _dataApi: any;
  public sendPayment: boolean = false;
  public inProcess: boolean = false;
  public isDniDisabled: boolean = true;
  public isMountDisabled: boolean = true;
  private mountFormat: string = '0.00';
  public ci_transaction: string = '';
  public numSeq_transaction: string = '';
  public abonadoInputActive: boolean = false

  public formErrorMessage?: {inputName: ITransactionInputs, errorMsg: string}

  constructor(
    private fb: FormBuilder,
    private _ApiVPOS: VposuniversalRequestService,//API VPOSUniversal PINPAD -By:MR-
    private _printer: PrinterService,
    private _errorsvpos: VposerrorsService, // PrinterService instance used to print on Printer -By:MR-
    private _adminAction: AdministrativeRequestService,
  ) {
  }

  ngOnInit(): void {
    this.formPayment = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      mount: [{value:''}, [Validators.required]],
      reference: [
        '000',
        [Validators.required, Validators.minLength(3), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]
      ],
      // abonado: [!this.abonadoInputActive ? '1234567' : '', [Validators.required, Validators.minLength(6), Validators.maxLength(11)]],
      accountType: ['Corriente', Validators.required]
    });

    if (this.inputType === 'reference') {
      this.dni?.setValue('');
      this.reference?.setValue('');
    } else {
      this.dni?.setValue(this.dniValue)
    }


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

  get reference() {
    return this.formPayment.get('reference');
  }

  // get abonado() {
  //   return this.formPayment.get('abonado');
  // }

  get accountType() {
    return this.formPayment.get('accountType');
  }
  get isDniInputDisabled() {
    return this.dni?.disabled;
  }
  get isMountInputDisabled() {
    return this.mount?.disabled;
  }

  alertFindDniMercantil(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  closeAlert() {
    setTimeout(() => {
      Swal.close();
    }, 2500);
  }

//   public confirmAnulation(): void {
//     Swal.fire({
//       icon: 'question',
//       title: '¿La cédula ingresada es la misma que la del abonado?',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, anular',
//       cancelButtonText: 'No, volver',
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       allowOutsideClick: false
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Usuario confirmó - ejecutar anulación
//         this.abonado?.setValue(this.dni?.value);

//         this.anulateTransaction()
//           .then((response) => {
//             console.log('Anulación completada:', response);
//           })
//           .catch((error) => {
//             console.error('Error en anulación:', error);
//           });
//       } else {
//         // Usuario canceló - cambiar boolean y cerrar
//         this.abonadoInputActive = true;
//         this.abonado?.setValue('')
//         // El Swal se cierra automáticamente
//       }
//     });
// }

  /**
   * On submit payment form
   * @param event
   */
  public onSubmit(): Promise<void> {
    this.sendPayment = true; // Indicate payment is being processed

    return new Promise<void>((resolve, reject) => {
      if (!this.formPayment.valid) {
        console.log('Form is invalid');
        this.sendPayment = false;
        resolve(); // Resolve immediately for invalid forms
        return;
      }

      this.alertFindDniMercantil(
          'Realizando operación',
          'Por favor espere...'
        );

      // 1. Process card request
      this.requestCard()
        .then((_dataApi) => {
          console.warn('Card request response:', _dataApi);



          // Handle missing response data
          if (!_dataApi || !_dataApi?.data.datavpos) {
            Swal.fire({
              icon: 'error',
              title: 'Ha ocurrido un error, intente nuevamente más tarde',
              showConfirmButton: false,
              allowOutsideClick: true,
              timer: 4000,
            })
          }

          this._dataApi = _dataApi.data.datavpos;

          const responseCode = this._dataApi.codRespuesta;
          const messageResponse = this._errorsvpos.getErrorMessageLeter(this._dataApi.mensajeRespuesta) ?? this._dataApi.mensajeRespuesta;
          const messageCodeRes = this._errorsvpos.getErrorMessageCode(responseCode)
          const message = responseCode === '05' ? messageCodeRes + ' \n' + messageResponse : messageCodeRes;

          console.log(
            this._dataApi.mensajeRespuesta,
            message,
            responseCode
          );

          // 2. Handle success case (code '00')
          if (responseCode === '00') {
            this.generarPDF().catch(console.error); // Generate PDF async

            Swal.fire({
              icon: 'success',
              title: 'Pago procesado con éxito \n'+message,
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 4000, // El modal se cerrará después de 5 segundos
              didClose: () => this.onSubmitPayForm.emit()
            });
          }
          // 3. Handle other cases
          else {
            // Special case for code '51'
            if (responseCode === '51') {

              this.generarPDF().catch(console.error);
            }

            Swal.fire({
              icon: 'error',
              title: message,
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 4000,
              didClose: () => resolve()
            });
          }
        })
        .catch((error) => {
          // 4. Handle request errors
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
            timer: timeShow,
            didClose: () => resolve()
          });
        })
        .finally(() => {
          this.closeAlert();
          this.sendPayment = !this.formPayment.valid; // Always reset payment flag
        });
    });
  }

  /**
   * This method is called when the user clicks on the 'Anular' button.
   * It sends a request to the server to anulate the transaction.
   * The method returns a Promise<void>.
   * @returns Promise<void>
   */
  public async anulateTransaction(): Promise<any> {
    this.inProcess = true; // Indicate anulation is being processed

    return new Promise(async (resolve, reject) => {

      this.alertFindDniMercantil(
          'Realizando operación',
          'Por favor espere...'
        );

      this.getMacAddress().then(async (macAddress: string) => {
        await this._adminAction.anulationPayment(this.dni?.value, this.reference?.value, macAddress)
        .then((res: any) => {
          console.log('response', res);

          this._dataApi = res.data.datavpos;

          const responseCode = this._dataApi.codRespuesta;
          const message = this._errorsvpos.getErrorMessageCode(responseCode);

          // 2. Handle success case (code '00')
          if (responseCode === '00') {
            this.generarPDF('Anulación de pago').catch(console.error); // Generate PDF async

            Swal.fire({
              icon: 'success',
              title: 'Acción realizada exitosamente\n'+message,
              timer: 4000,
              allowOutsideClick: false,
              showConfirmButton: false,
              didClose: () => {
                 Swal.fire({
              icon: 'warning',
              title: 'DEBE REALIZAR LA MODIFICACIÓN CORRESPONDIENTE EN SAE PLUS PARA  ANULAR EL PAGO DEL SISTEMA ',
              confirmButtonText: 'Confirmar',
              confirmButtonColor: '#d33',
              showConfirmButton: true,
              allowOutsideClick: false,
              didClose: () => this.closeEmmit.emit()
            });
              }
            });
          }
          // 3. Handle other cases
          else {
            Swal.fire({
              icon: 'warning',
              title: 'Solicitud no procesada.\n'+message,
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 4000,
              // didClose: () => resolve()
            });
          }
          resolve(res);
        }).catch((err: Error) => {
          this.closeAlert();

          console.error(err)
          reject(err);
        });
      }).catch((err: Error) => {
        this.closeAlert();
        console.error(err)
        // 4. Handle request errors
        let _messageError: string = 'Ha ocurrido un error.';
        let timeShow: number = 4000;

        // if (this.dni?.value === "90000000") {
        //   _messageError = 'Muestrele este error a un técnico \n Error: '+(error instanceof Error ? error.message : 'Desconocido');
        //   timeShow = 6000;
        // }

        Swal.fire({
          icon: 'error',
          title: _messageError +'\n'+ err.message,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: timeShow,
          // didClose: () => resolve()
        });
        reject(err);
      }).finally(() => {
          this.inProcess = false; // Reset processing state
      });
    });
  }



  /**
   * Function to handle the keyboard pressed events
   * @param value Value of the keyboard event
   */
  public onTecladoInput = (value: string): void => {
    try {

      let inputValue = this.formPayment.get(this.activeInputFocus)?.value

      if (this.formPayment.get(this.activeInputFocus)?.disabled) return;

      if (this.activeInputFocus === 'dni'	|| this.activeInputFocus === 'reference' && typeof inputValue === 'string' && inputValue.length < 8) {

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

    console.log('in requestCard');

    // Primero obtenemos la MAC
    return this.getMacAddress()
      .then(macAddress => {
          console.log('macAddress', macAddress);

          // Obtenemos el formato del monto
          this.mountFormat = String(this.mount?.value).replace(/\,/g, '');

          console.log(this.mountFormat, 'MOUNT');

          // Lanzamos cardRequest CON la MAC obtenida
          return this._ApiVPOS.cardRequest(
              this.dni?.value,
              this.mountFormat,
              this.nroAbonado,
              this.nroContrato,
              macAddress
          );
      })
      .then(cardData => {
          return cardData; // Resultado final
      })
      .catch(error => {
          console.error('SUPER ERRORRRORORORORO:', error);
          return error;
      });
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
  public async generarPDF(mensajeDefault: string = 'Pago') {

    let _dataApiClient = []; // Data to tiket print
    let _desciptionText: string = '';
    let amount: string = '';

    if(mensajeDefault != 'Pago'){
      _desciptionText = mensajeDefault;
    }else{
      _desciptionText = Number(this.mountFormat) === Number(this.subscription) ? 'Pago de Mensualidad' : Number(this.mountFormat) > Number(this.subscription) ? 'Adelanto de Mensualidad' : Number(this.mountFormat) < Number(this.subscription) ? 'Abono de Mensualidad' : mensajeDefault;
    }

    if(this._dataApi.montoTransaccion){
      amount = this.formatAmount(this._dataApi.montoTransaccion);
    }

    console.log(this.subscription, this.mount,_desciptionText);

    // to genarate tiket and printer this
    _dataApiClient = [
      {
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.numeroReferencia,
        'numSeq': this._dataApi.numSeq,
        'abonumber': this.nroAbonado,
        'describe': _desciptionText,
        'amount': amount,
        'methodPayment': this._dataApi.tipoProducto,
        'totalAmount': amount,
        'status': this._dataApi.mensajeRespuesta,
      }
    ];

    if(_dataApiClient[0]['status'] === 'NEGADA 116          NEGADA') {

      // TODO ANALIZAR ESTO QUE ESTA CABLEADO
      _dataApiClient = [{
        'date': this.getTime('date'),
        'hours': this.getTime('time'),
        'refundNumber': this._dataApi.numeroReferencia,
        'numSeq': this._dataApi.numSeq,
        'ciClient': this._dataApi.cedula,
        'abonumber': this.nroContrato,
        'describe': 'Pago Fallido',
        'amount': '00.00',
        'methodPayment': this._dataApi.tipoProducto,
        'totalAmount': '00.00Bs.',
        'saldo': '0,00Bs.',
        'status': this._dataApi.mensajeRespuesta,
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

  /**
   * Function to set the currency format in the mount input
   * @param value Value to be added to the current input value
   */
  private setCurrencyMountFormat = (value?: string) => {
    // 1. Obtener el valor actual del input y limpiarlo (eliminar puntos y comas)
    const inputValue: string | number = this.mount?.value;
    const currentValue = String(inputValue ?? '').replace(/[.,]/g, '');

    // 2. Construir el nuevo valor (concatenar si se pasa un nuevo dígito)
    const newAmountValue: string = parseFloat(value ? (currentValue + value) : currentValue || '0').toFixed(2);

    // 3. Formatear como moneda (USD) con 2 decimales fijos
    const formattedValue = (Number(newAmountValue) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // 4. Calcular montos de comparación (subscriptionBs y mount6Month)
    const subscriptionBs = parseFloat((parseFloat(this.subscription) * parseFloat(this.tasaCambio)).toFixed(2));
    let mount6Month = parseFloat(((parseFloat(this.saldoBs) > 0 ? parseFloat(this.saldoBs) : 0) + (subscriptionBs * 6)).toFixed(2));

    // 5. Validar si el monto ingresado es mayor que mount6Month
    const isValidMount = parseFloat(formattedValue.replace(/,/g, '')) > mount6Month;

    // console.log(
    //   'subscription: ',this.subscription,
    //   'subscriptionBs: ', subscriptionBs,
    //   'saldoBs: ', this.saldoBs,
    //   'Amount6Month1: ', mount6Month,
    //   'Currency: ', formattedValue,
    //   'IsValidMount: ', isValidMount,
    // )

    if (isValidMount) {

      const defaultValue = parseFloat(this.mountValue).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      // Si el monto es mayor que mount6Month, mostrar alerta
      Swal.fire({
        icon: 'warning',
        title: 'Monto ingresado es mayor al monto máximo permitido',
        text: `El monto máximo permitido es Bs.${mount6Month.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false
      }).then(() => {
        this.mount?.setValue(defaultValue);
      })
    }

    // 6. Asignar el valor formateado al control del formulario
    this.mount?.setValue(formattedValue);
  };

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
    const isMountActive: boolean = (inputName === 'mount' || inputName === 'reference')

    if (isMountActive) {
      value = value.replace(/\,/g, '').replace(/\./g, '')
    }

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

  public formatAmount(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (num / 100).toFixed(2);
  }

}
