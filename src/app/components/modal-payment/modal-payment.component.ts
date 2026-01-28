import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IPaymentTypes,
  ITransactionInputs,
  ITypeDNI,
} from 'src/app/interfaces/payment-opt';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
import { VposerrorsService } from 'src/app/services/vposuniversal/vposerrors.service';
import Swal from 'sweetalert2';
import { IPrintTicket } from 'src/app/interfaces/printer.interface';
import { UbiiposService } from 'src/app/services/api/ubiipos.service';
import { IUbiiposDataSend } from 'src/app/interfaces/api/ubiipos';
import { IResponse } from 'src/app/interfaces/api/handlerResReq';
import { PaymentsService } from 'src/app/services/api/payments.service';
import {
  IPaymentCreate,
  IPaymentRegister,
} from 'src/app/interfaces/api/payment';
import { PdfService } from 'src/app/services/api/pdf.service';
import { DirectPrinterService } from 'src/app/services/api/direct-printer.service';
import { getPaymentDescription, handleApiError } from 'src/app/utils/api-tools';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import axios from 'axios';
import { environment } from 'src/environments/environment';
// Nuevos imports para flujo de pago multi-método
import { WebhookAutopagoService } from 'src/app/services/webhook-autopago.service';
import { 
  PaymentMethodType, 
  IC2PPayload, 
  IC2PResponse,
  IStepConfig 
} from 'src/app/interfaces/payment-methods.interface';
import { C2P_STEP_CONFIG } from 'src/app/config/payment-methods.config';

@Component({
  selector: 'app-modal-payment',
  templateUrl: './modal-payment.component.html',
  styleUrls: ['./modal-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalPaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputDni') inputDni: ElementRef<HTMLInputElement>;
  @ViewChild('inputMount') inputMount: ElementRef<HTMLInputElement>;
  @ViewChild('inputReference') inputReference: ElementRef<HTMLInputElement>;
  @Output() closeEmmit: EventEmitter<void> = new EventEmitter(); // => close event emmitter
  @Output() onSubmitPayForm: EventEmitter<void> = new EventEmitter(); // => on submit event emitter, resets all
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
  @Input() viewAdmin: boolean = true;
  public dolarBalance: string = '0.00';
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
  public abonadoInputActive: boolean = false;
  public macaddress: string = '';
  private dateNew: Date = new Date();

  public formErrorMessage?: { inputName: ITransactionInputs; errorMsg: string };
  private mountValueChangesSubscription?: any;
  private timeoutId?: any;

  // Propiedades para flujo de pago multi-método
  public showPaymentMethodSelector: boolean = true;
  public selectedPaymentMethod: PaymentMethodType | null = null;
  public showC2PForm: boolean = false;
  public c2pStepConfig: IStepConfig[] = C2P_STEP_CONFIG;
  public useVirtualKeyboard: boolean = true;
  public c2pFormData: any = {};
  public processingC2P: boolean = false;

  public showPuntoVentaForm: boolean = false;

  public showDebitoInmediatoForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _ubiipos: UbiiposService, // API Ubiipos -By:MR-
    private _pdfService: PdfService, //
    private _directPrinter: DirectPrinterService, // Impresión directa local -By:MR-
    // private _errorsvpos: VposerrorsService, // PrinterService instance used to print on Printer -By:MR-
    // private _adminAction: AdministrativeRequestService,
    private _registerTransaction: PaymentsService,
    private _localStorageService: LocalstorageService,
    private _webhookAutopagoS: WebhookAutopagoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formPayment = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      mount: [{ value: '' }, [Validators.required]],
      reference: [
        '000',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(6),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      // abonado: [!this.abonadoInputActive ? '1234567' : '', [Validators.required, Validators.minLength(6), Validators.maxLength(11)]],
      accountType: ['Corriente', Validators.required],
    });

    if (this.inputType === 'reference') {
      this.dni?.setValue('');
      this.reference?.setValue('');
    } else {
      this.dni?.setValue(this.dniValue);
    }

    this.mount?.setValue(this.mountValue);
    this.setCurrencyMountFormat();

    this.updateDolarBalance();

    // Suscripción optimizada con debounce para mejor rendimiento
    this.mountValueChangesSubscription = this.mount?.valueChanges.subscribe(() => {
      // Usar setTimeout para debounce y evitar múltiples cálculos
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.updateDolarBalance();
        this.cdr.markForCheck();
      }, 100);
    });

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

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    // Limpiar suscripciones y timeouts
    if (this.mountValueChangesSubscription) {
      this.mountValueChangesSubscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
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
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      Swal.close();
    }, 2500);
  }

  /**
   * On submit payment form async/await
   * @returns
   */
  public async onSubmit(): Promise<void> {
    this.sendPayment = true; // Indicate payment is being processed

    try {
      this.mountFormat = this.mount?.value.replace(',', '');

      if (!this.formPayment.valid) {
        console.log('Form is invalid');
        this.sendPayment = false;
        return;
      }

      this.alertFindDniMercantil('Realizando operación', 'Por favor espere...');

      // 1. Process card request
      const resPay: IResponse = await this.requestCardUbiiPos();

      console.warn('Card request response:', resPay);

      if (resPay.status !== 200) {
        Swal.fire({
          icon: 'error',
          title: 'Ha ocurrido un error, intente nuevamente más tarde',
          text: `Error: ${resPay.message} - Status: ${resPay.status}`,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 4000,
        });

        this.closeAlert();
        this.sendPayment = !this.formPayment.valid; // Always reset payment flag
        return;
      }

      if (resPay.data.TRANS_CODE_RESULT === '00') {
        let titleText: string = 'Transacción Procesada';
        let messageText: string = 'APROBADA';

        // Body to Create and print thermal ticket
        const digitalTicket: IPrintTicket = {
          date: this.dateNew.toLocaleDateString(),
          hours: this.dateNew.toLocaleTimeString(),
          refNumber: resPay.data.REFERENCIA,
          numSeq: resPay.data.TRANS_CONFIRM_NUM,
          abononumber: this.nroAbonado,
          status:
            resPay.data.TRANS_CODE_RESULT === '00'
              ? 'APROBADO'
              : resPay.data.TRANS_MESSAGE_RESULT,
          describe: getPaymentDescription(this.mountFormat, this.subscription),
          amount: this.mountFormat,
          methodPayment: `${resPay.data.METODO_ENTRADA} - ${resPay.data.TIPO_TARJETA}`,
          // Obtener checkoutIdentify desde LocalstorageService (valor desencriptado) o usar valor por defecto
          checkoutIdentify:
            this._localStorageService.get<string>('checkoutIdentify') || '',
          id_sede: this._localStorageService.get<number>('id_sede') ?? '',
          is_anulation: false,
        };

        // Guardar el último voucher en localStorage para poder reimprimirlo después
        this._localStorageService.set<IPrintTicket>('lastVoucher', digitalTicket);
        
        // 🖨️ NUEVO: Imprimir LOCALMENTE por HTTP (puerto 9100)
        try {
          console.log('🖨️ [Modal Payment] Iniciando impresión local...');
          const printResult = await this._directPrinter.printTicket(digitalTicket);
          
          if (printResult.success) {
            console.log('✅ [Modal Payment] Impreso exitosamente');
            console.log('📍 [Modal Payment] IP usada:', printResult.ip);
          } else {
            console.warn('⚠️ [Modal Payment] Error al imprimir:', printResult.message);
            // No bloquear el flujo si falla la impresión local
          }
        } catch (printError) {
          console.error('❌ [Modal Payment] Error de impresión:', printError);
          // No bloquear el flujo si falla la impresión local
        }
        
        // Request to create and print thermal ticket (ahora con skip_print)
        try {
          const ticketDigital = await this._pdfService.ticketCreateAndUpload(
            {
              ...digitalTicket,
              skip_print: true  // No imprimir en API Driver (ya se imprimió localmente)
            }
          );
          
          if (ticketDigital.status === 200 || ticketDigital.status === 201) {
            // El ticket se generó correctamente en la API driver
            // No se guarda en ningún endpoint aquí - eso se hace desde el módulo administrativo
            console.log('Ticket digital generado exitosamente');
            
            // COMENTADO: Este bloque intentaba guardar en API Master, pero no debe ejecutarse
            // en el flujo de pago. Los endpoints de upload se usan solo desde el módulo administrativo.
            /*
            // Obtener la URL del archivo generado
            const fileUrl = ticketDigital.data?.url || ticketDigital.data?.data?.url || '';
            // Extraer el nombre del archivo desde la URL o desde el path
            let fileName = ticketDigital.data?.file_name || ticketDigital.data?.data?.file_name || '';
            
            // Si no hay file_name, extraerlo de la URL
            if (!fileName && fileUrl) {
              const urlParts = fileUrl.split('/');
              fileName = urlParts[urlParts.length - 1] || '';
            }
            
            // Si aún no hay nombre, extraerlo del path
            if (!fileName) {
              const filePath = ticketDigital.data?.path || ticketDigital.data?.data?.path || '';
              if (filePath) {
                // Para Windows: usar backslash, para Unix: usar forward slash
                const pathParts = filePath.split(/[/\\]/);
                fileName = pathParts[pathParts.length - 1] || '';
              }
            }
            
            if (fileUrl && fileName) {
              // Extraer la ruta relativa del archivo
              let urlFile = fileUrl;
              const filesIndex = fileUrl.indexOf('files/');
              if (filesIndex !== -1) {
                urlFile = fileUrl.substring(filesIndex);
              }
              
              // Guardar en API Master usando el endpoint de files/upload
              const invoiceUploadData = {
                register: this._localStorageService.get<string>('checkoutIdentify') || '',
                invoices: [
                  {
                    reference_pay: resPay.data.REFERENCIA,
                    file_name: fileName,
                    url_file: urlFile
                  }
                ]
              };
              
              try {
                await axios.post(
                  `${environment.URL_API_MASTER}/administrative/files/closing/upload`,
                  invoiceUploadData,
                  {
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                      'token': environment.TOKEN_API_MASTER,
                    }
                  }
                );
              } catch (invoiceError: any) {
                console.error('Error al guardar factura en BD:', invoiceError);
                // No bloquear el flujo si falla el guardado en BD, solo loguear
              }
            }
            */
          }
        } catch (ticketError) {
          console.error('Error al generar ticket térmico:', ticketError);
          // No bloquear el flujo si falla la generación
        }

        // Body to Register on SAE
        const bodyResgister: IPaymentRegister = {
          dni: this.dni?.value,
          mount: this.mountFormat,
          abonado: this.nroAbonado,
          balance: this.saldoBs,
          id_contrato: this.nroContrato,
          reference: resPay.data.REFERENCIA,
          comment: `PAGO POR CAJA AUTOMATICA - ${resPay.data.FECHA} - ${resPay.data.METODO_ENTRADA} - ${resPay.data.TIPO_TARJETA}`,
          date: this.dateNew.toISOString().split('T')[0], // Formato YYYY-MM-DD requerido por SAE
        };

        //Logica para registrar el pago en SAE y montarlo en la base de dato de thomas cobertura
        console.log('Registrar en SAE...\n', bodyResgister);
        const saeRegister =
          await this._registerTransaction.paymentRegisterOnSAE(bodyResgister);
        console.log('Registrado en SAE\n', saeRegister.data);

        // Body to Create Payment on DB
        const bodyCreate: IPaymentCreate = {
          dateTransaction: this.dateNew.toISOString().split('T')[0], // Formato YYYY-MM-DD requerido por backend
          numSeq: resPay.data.TRANS_CONFIRM_NUM,
          numRef: resPay.data.REFERENCIA,
          numSubscriber: this.nroAbonado,
          lastCardNum: resPay.data.PAN.slice(-4),
          amount: this.mountFormat,
          terminalVirtual: resPay.data.TERMINAL,
          status:
            saeRegister.data.data.success &&
            saeRegister.data.message === 'ok'
              ? 'APPROVED'
              : 'PENDING',
        };

        // Request to create on DB
        console.log('Registrar en Thomas Cobertura...\n', bodyCreate);
        const createTransaction = await this._registerTransaction.paymentCreate(
          bodyCreate
        );
        console.log('Registrado en Thomas Cobertura\n', createTransaction.data);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: titleText,
          text: messageText,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 4000,
          didClose: () => this.onSubmitPayForm.emit(),
        });

        this.closeAlert();
        this.sendPayment = !this.formPayment.valid; // Always reset payment flag
        return;
      } else {
        Swal.fire({
          icon: 'error',
          title: resPay.data.TRANS_MESSAGE_RESULT,
          text: 'Transacción no aprobada',
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 7000,
        });

        this.closeAlert();
        this.sendPayment = !this.formPayment.valid; // Always reset payment flag
        return;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Ups! Algo salio mal.',
        text: 'Error en el servidor - Contacte al personal de fibex.',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 7000,
      });

      this.closeAlert();
      this.sendPayment = !this.formPayment.valid; // Always reset payment flag
      return;
    }
  }

  /**
   * This method is called when the user clicks on the 'Anular' button.
   * It sends a request to the server to anulate the transaction.
   * The method returns a Promise<void>.
   * @returns Promise<void>
   */
  public async anulateTransaction(): Promise<any> {
    // this.inProcess = true; // Indicate anulation is being processed

    // return new Promise(async (resolve, reject) => {
    //   this.alertFindDniMercantil('Realizando operación', 'Por favor espere...');

    //   this.getMacAddress()
    //     .then(async (macAddress: string) => {
    //       await this._adminAction
    //         .anulationPayment(
    //           this.dni?.value,
    //           this.reference?.value,
    //           macAddress
    //         )
    //         .then((res: any) => {
    //           console.log('response', res);

    //           this._dataApi = res.data.datavpos;

    //           const responseCode = this._dataApi.codRespuesta;
    //           const message =
    //             this._errorsvpos.getErrorMessageCode(responseCode);

    //           // 2. Handle success case (code '00')
    //           if (responseCode === '00') {
    //             this.generarPDF(true, 'Anulación de pago').catch(console.error); // Generate PDF async

    //             Swal.fire({
    //               icon: 'success',
    //               title: 'Acción realizada exitosamente\n' + message,
    //               timer: 4000,
    //               allowOutsideClick: false,
    //               showConfirmButton: false,
    //               didClose: () => {
    //                 Swal.fire({
    //                   icon: 'warning',
    //                   title:
    //                     'DEBE REALIZAR LA MODIFICACIÓN CORRESPONDIENTE EN SAE PLUS PARA  ANULAR EL PAGO DEL SISTEMA ',
    //                   confirmButtonText: 'Confirmar',
    //                   confirmButtonColor: '#d33',
    //                   showConfirmButton: true,
    //                   allowOutsideClick: false,
    //                   didClose: () => this.closeEmmit.emit(),
    //                 });
    //               },
    //             });
    //           }
    //           // 3. Handle other cases
    //           else {
    //             Swal.fire({
    //               icon: 'warning',
    //               title: 'Solicitud no procesada.\n' + message,
    //               showConfirmButton: false,
    //               allowOutsideClick: false,
    //               timer: 4000,
    //               // didClose: () => resolve()
    //             });
    //           }
    //           resolve(res);
    //         })
    //         .catch((err: Error) => {
    //           this.closeAlert();

    //           console.error(err);
    //           reject(err);
    //         });
    //     })
    //     .catch((err: Error) => {
    //       this.closeAlert();
    //       console.error(err);
    //       // 4. Handle request errors
    //       let _messageError: string = 'Ha ocurrido un error.';
    //       let timeShow: number = 4000;

    //       // if (this.dni?.value === "90000000") {
    //       //   _messageError = 'Muestrele este error a un técnico \n Error: '+(error instanceof Error ? error.message : 'Desconocido');
    //       //   timeShow = 6000;
    //       // }

    //       Swal.fire({
    //         icon: 'error',
    //         title: _messageError + '\n' + err.message,
    //         showConfirmButton: false,
    //         allowOutsideClick: false,
    //         timer: timeShow,
    //         // didClose: () => resolve()
    //       });
    //       reject(err);
    //     })
    //     .finally(() => {
    //       this.inProcess = false; // Reset processing state
    //     });
    // });
    return true;
  }

  /**
   * Function to handle the keyboard pressed events
   * @param value Value of the keyboard event
   */
  public onTecladoInput = (value: string): void => {
    try {
      let inputValue = this.formPayment.get(this.activeInputFocus)?.value;

      if (this.formPayment.get(this.activeInputFocus)?.disabled) return;

      if (
        this.activeInputFocus === 'dni' ||
        (this.activeInputFocus === 'reference' &&
          typeof inputValue === 'string' &&
          inputValue.length < 8)
      ) {
        this.formPayment
          .get(this.activeInputFocus)
          ?.setValue((inputValue += value));
      } else if (
        this.activeInputFocus === 'mount' &&
        (!String(inputValue ?? '') ||
          String(inputValue)?.replace(/\,/g, '').length < 10)
      ) {
        this.setCurrencyMountFormat(value);
      }

      this.validateFormErrors();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error onTecladoInput', error);
    }
  };

  /**
   * on delete pinpad event
   */
  public deleteLastCharacter = (): void => {
    let inputValue = this.formPayment.get(this.activeInputFocus)?.value;

    if (this.formPayment.get(this.activeInputFocus)?.disabled) return;

    this.formPayment
      .get(this.activeInputFocus)
      ?.setValue(inputValue.slice(0, -1));

    if (this.activeInputFocus === 'mount') {
      this.setCurrencyMountFormat();
    } else this.isDniDisabled = false;

    this.validateFormErrors();
    this.cdr.markForCheck();
  };

  /**
   * Function to change the active Input on Focus
   * @param focusInputName name of the focus input
   */
  public onFocus = (focusInputName: 'dni' | 'mount' | 'accountType') => {
    if (this.formPayment.get(focusInputName)?.disabled) return;

    this.activeInputFocus = focusInputName;
    this.cdr.markForCheck();
  };

  public onCloseModal = () => this.closeEmmit.emit();

  /**
   * Function to change the DNI type in the form
   * @param value
   */
  public onLoginTypeChange = (value: ITypeDNI): void => {
    this.typeDNI = value;
  };

  /**
   * Request UBIIPOS payment
   * @returns Promise<IResponse>
   */
  public async requestCardUbiiPos(): Promise<IResponse> {

    try {
      // PASOS PARA REALIZAR EL PAGO EN UBIIPOS
      // 1. Obtener Datos para realizar el pago.
      //    body: {
      //        "customerId": "Cedula o Rif del cliente", string
      //        "amount": Monto a pagar (En centavos, ej: 1000.00 => 100000), number
      //         "operation": "PAYMENT", string
      //      }
      // 2. Darle el formato correcto y aceptado por ubiipos al monto. (Sin comas ni puntos, con 2 decimales, ej: 1000.00 => 100000)
      // 3. Armar el cuerpo para la petición.
      // 4. Realizar la petición a ubiipos a través del servicio.
      // 5. Manejar la respuesta.

      const amountFormat = Math.round(
        parseFloat(this.mount?.value.replace(',', '')) * 100
      );

      const bodyUbiipos: IUbiiposDataSend = {
        customerId: this.dni?.value, // Solo el número del DNI, sin prefijo V o J
        amount: amountFormat.toString(), // Convertir a string
        operation: 'PAYMENT',
      };

      // console.log('bodyUbiipos', bodyUbiipos);

      const payRes: IResponse = await this._ubiipos.paymentUbiipos(bodyUbiipos);

      // console.log('payRes', payRes);

      return payRes;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR requestCardUbiiPos:', errRes);
      return errRes;
    }
  }

  /**
   * Function to get the current MAC-ADDRESS
   * @param type Type of string
   */
  public async getMacAddress(): Promise<String> {
    this.macaddress = await this._pdfService.getMacAddress();

    console.log('macaddress', this.macaddress);

    return this.macaddress;
  }

  /**
   * Function to generate a PDF with the payment data
   * @param data data to be included in the PDF
   */
  public async generarPDF(
    is_anulation: boolean,
    mensajeDefault: string = 'Pago'
  ) {
    let _dataApiClient: IPrintTicket; // Data to tiket print
    let _desciptionText: string = '';
    let amount: string = '';

    if (mensajeDefault != 'Pago') {
      _desciptionText = mensajeDefault;
    } else {
      _desciptionText =
        Number(this.mountFormat) === Number(this.subscription)
          ? 'Pago de Mensualidad'
          : Number(this.mountFormat) > Number(this.subscription)
          ? 'Adelanto de Mensualidad'
          : Number(this.mountFormat) < Number(this.subscription)
          ? 'Abono de Mensualidad'
          : mensajeDefault;
    }

    if (this._dataApi.montoTransaccion) {
      amount = this.formatAmount(this._dataApi.montoTransaccion);
    }

    console.log(this.subscription, this.mount, _desciptionText);

    // to genarate tiket and printer this
    // Obtener checkoutIdentify desde LocalstorageService (valor desencriptado) o usar valor por defecto
    const checkoutIdentify =
      this._localStorageService.get<string>('checkoutIdentify') || '';
    
    _dataApiClient = {
      date: this.getTime('date').toString(),
      hours: this.getTime('time').toString(),
      refNumber: this._dataApi.numeroReferencia,
      numSeq: this._dataApi.numSeq,
      abononumber: this.nroAbonado,
      status: this._dataApi.mensajeRespuesta,
      describe: _desciptionText,
      amount: amount,
      methodPayment: this._dataApi.tipoProducto,
      checkoutIdentify: checkoutIdentify,
      is_anulation: is_anulation,
    };

    if (_dataApiClient.status === 'NEGADA 116          NEGADA') {
      // TODO ANALIZAR ESTO QUE ESTA CABLEADO
        _dataApiClient = {
          date: this.getTime('date').toString(),
          hours: this.getTime('time').toString(),
          refNumber: this._dataApi.numeroReferencia,
          numSeq: this._dataApi.numSeq,
          abononumber: this.nroContrato,
          status: this._dataApi.mensajeRespuesta,
          describe: 'Pago Fallido',
          amount: '00.00',
          methodPayment: this._dataApi.tipoProducto,
          checkoutIdentify: checkoutIdentify,
          is_anulation: is_anulation,
        };
    }

    // Validación de campos indefinidos
    const hasUndefinedFields = Object.values(_dataApiClient).some(
      (value) => value === undefined || value === null || value === ''
    );

    if (!hasUndefinedFields) {
      // Generar PDF con los datos del comprobante
      await this._pdfService.ticketCreateAndUpload(_dataApiClient);
      console.log('PDF genetrado');
    } else {
      console.error(
        'Uno o más campos en _dataApiClient están indefinidos o vacíos.'
      );
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
        year: 'numeric',
      });
    } else {
      // Formatear la hora en formato 24 horas
      time = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
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
    const newAmountValue: string = parseFloat(
      value ? currentValue + value : currentValue || '0'
    ).toFixed(2);

    // 3. Formatear como moneda (USD) con 2 decimales fijos
    const formattedValue = (Number(newAmountValue) / 100)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // 4. Calcular montos de comparación (subscriptionBs y mount6Month)

    const subscriptionBs = parseFloat(
      (parseFloat(this.subscription) * parseFloat(this.tasaCambio)).toFixed(2)
    );
    let mount6Month = parseFloat(
      (
        (parseFloat(this.saldoBs) > 0 ? parseFloat(this.saldoBs) : 0) +
        subscriptionBs * 6
      ).toFixed(2)
    );

    // 5. Validar si el monto ingresado es mayor que mount6Month
    const isValidMount =
      parseFloat(formattedValue.replace(/,/g, '')) > mount6Month;

    // console.log(
    //   'subscription: ',this.subscription,
    //   'subscriptionBs: ', subscriptionBs,
    //   'saldoBs: ', this.saldoBs,
    //   'Amount6Month1: ', mount6Month,
    //   'Currency: ', formattedValue,
    //   'IsValidMount: ', isValidMount,
    // )

    if (isValidMount) {
      const defaultValue = parseFloat(this.mountValue)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      // Si el monto es mayor que mount6Month, mostrar alerta
      Swal.fire({
        icon: 'warning',
        title: 'Monto ingresado es mayor al monto máximo permitido',
        text: `El monto máximo permitido es Bs.${mount6Month
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      }).then(() => {
        this.mount?.setValue(defaultValue);
      });
    }

    // 6. Asignar el valor formateado al control del formulario
    this.mount?.setValue(formattedValue);
    this.cdr.markForCheck();
  };

  public setInputFocus = (input: ITransactionInputs) => {
    if (this.formPayment.get(input)?.disabled) return;

    this.activeInputFocus = input;

    if (input === 'dni' && this.inputDni && !this.dni?.disable) {
      this.inputDni.nativeElement.focus();
      this.inputMount.nativeElement.disabled = false;
    } else if (input === 'mount' && this.inputMount && !this.mount?.disable) {
      this.inputMount.nativeElement.focus();
      this.inputMount.nativeElement.disabled = false;
    }
    this.cdr.markForCheck();
  };

  public onInputValueChange = (event: Event, inputName: ITransactionInputs) => {
    const regex = /^\d+$/;
    let value = (event.target as HTMLInputElement).value;
    const isMountActive: boolean =
      inputName === 'mount' || inputName === 'reference';

    if (isMountActive) {
      value = value.replace(/\,/g, '').replace(/\./g, '');
    }

    if (!regex.test(value)) {
      this[inputName]?.setValue(this[inputName]?.value.slice(0, -1));
    }

    if (isMountActive) {
      this.setCurrencyMountFormat();
    }

    this.validateFormErrors();
  };

  private updateDolarBalance(): void {
    // 1. Obtiene el valor numérico de los bolívares, limpiando comas
    const mountValueBs =
      parseFloat(String(this.mount?.value).replace(/,/g, '')) || 0;

    // 2. Asegúrate de que la tasa de cambio sea un número válido para evitar errores
    const tasa = parseFloat(this.tasaCambio);
    if (isNaN(tasa) || tasa === 0) {
      this.dolarBalance = '0.00';
      return;
    }

    // 3. Calcula el equivalente en dólares
    const balanceInUsd = mountValueBs / tasa;

    // 4. Actualiza la propiedad con 2 decimales
    this.dolarBalance = balanceInUsd.toFixed(2);
  }

  public onEditDniValue = () => {
    if (this.inputDni) {
      this.inputDni.nativeElement.disabled = false;
      this.dni?.setValue('');
      this.inputDni.nativeElement.focus();
      this.isDniDisabled = false;
      if (this.dni) this.dni.enable();
    }
    this.validateFormErrors();
    this.cdr.markForCheck();
  };

  public onEditMountValue = () => {
    if (this.inputMount) {
      this.inputMount.nativeElement.disabled = false;
      this.mount?.setValue('');
      this.inputMount.nativeElement.focus();
      this.isMountDisabled = false;
      if (this.mount) this.mount.enable();
    }
    this.validateFormErrors();
    this.cdr.markForCheck();
  };

  private validateFormErrors = (): void => {
    try {
      if (!this.dni?.value || this.dni?.value.length < 7) {
        this.formErrorMessage = {
          inputName: 'dni',
          errorMsg: 'Ingrese una cédula válida',
        };
        return;
      }

      this.formErrorMessage = { inputName: 'dni', errorMsg: '' };

      if (!this.mount?.value) {
        this.formErrorMessage = {
          inputName: 'mount',
          errorMsg: 'Ingrese un monto válido',
        };
        return;
      }
      const mount = parseInt(this.mount?.value.replace(/\,/g, ''));
      if (mount <= 0) {
        this.formErrorMessage = {
          inputName: 'mount',
          errorMsg: 'Ingrese un monto válido',
        };
        return;
      }

      this.formErrorMessage = { inputName: 'mount', errorMsg: '' };
      this.cdr.markForCheck();
    } catch (error) {
      console.error(error);
    }
  };

  public formatAmount(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (num / 100).toFixed(2);
  }

  /**
   * Maneja la selecci\u00f3n de m\u00e9todo de pago
   */
  public onPaymentMethodSelected(method: PaymentMethodType): void {
    this.selectedPaymentMethod = method;
    this.showPaymentMethodSelector = false;
    this.showPuntoVentaForm = false;
    this.showDebitoInmediatoForm = false;
    this.showC2PForm = false;

    if (method === 'c2p') {
      this.showC2PForm = true;
      // Inicializar datos del formulario C2P con valores del modal
      this.c2pFormData = {
        nacionalidad: this.typeDNI,
        // cedula: this.dni?.value || '',
        monto: this.mount?.value || this.mountValue
      };
    } else if (method === 'punto_venta') {
      // Mantener el flujo actual de punto de venta
      this.showPuntoVentaForm = true;
    } else if (method === 'debito_inmediato') {
      // TODO: Implementar flujo de d\u00e9bito inmediato
      this.showDebitoInmediatoForm = true;
      this.c2pFormData = {
        nacionalidad: this.typeDNI,
        // cedula: this.dni?.value || '',
        monto: this.mount?.value || this.mountValue
      };
    }

    this.cdr.markForCheck();
  }

  /**
   * Maneja la finalizaci\u00f3n del formulario C2P
   */
  public async onC2PFormComplete(formData: any): Promise<void> {
    try {
      this.processingC2P = true;
      this.cdr.markForCheck();

      // Validar datos antes de enviar
      const validation = this._webhookAutopagoS.validateC2PData(formData);
      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Datos inv\u00e1lidos',
          text: validation.error,
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            confirmButton: 'fibex-swal-confirm-btn'
          },
          buttonsStyling: false
        });
        this.processingC2P = false;
        this.cdr.markForCheck();
        return;
      }

      // Mostrar loading
      Swal.fire({
        title: 'Procesando pago C2P',
        html: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Construir payload para API C2P
      const payload: IC2PPayload = {
        TelefonoDebito: formData.telefono,
        Cedula: `${formData.nacionalidad}${formData.cedula}`,
        Banco: formData.banco,
        Monto: formData.monto, // Ya viene en formato correcto (123.40)
        Otp: formData.otp,
        SaeData: {
          id_contrato: this.nroContrato,
          abonado: this.nroAbonado,
          saldoActual: this.saldoBs
        }
      };

      // Realizar petici\u00f3n C2P con axios
      const response = await this._webhookAutopagoS.processC2PPayment(payload);
      
      console.log('\u2705 Respuesta C2P:', response);

      if (response.status === 200 && response.data.status) {
        // Pago exitoso
        await this.handleSuccessfulC2PPayment(response, formData);
      } else {
        // Pago fallido
        Swal.fire({
          icon: 'error',
          title: 'Pago no procesado',
          text: response.data.message || 'No se pudo procesar el pago',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            confirmButton: 'fibex-swal-confirm-btn'
          },
          buttonsStyling: false
        });
      }

      this.processingC2P = false;
      this.cdr.markForCheck();
      
    } catch (error: any) {
      console.error('\u274c Error procesando C2P:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        text: error.message || 'Ocurri\u00f3 un error al procesar el pago. Por favor intente nuevamente.',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          confirmButton: 'fibex-swal-confirm-btn'
        },
        buttonsStyling: false
      });
      
      this.processingC2P = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Maneja un pago C2P exitoso
   */
  private async handleSuccessfulC2PPayment(response: IC2PResponse, formData: any): Promise<void> {
    const { c2pResponse, saeResponse } = response.data;

    // Mostrar modal de \u00e9xito
    await Swal.fire({
      icon: 'success',
      title: '\u00a1Pago Exitoso!',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p style="margin-bottom: 1rem;"><strong>Su pago ha sido procesado y conciliado autom\u00e1ticamente.</strong></p>
          <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0.5rem 0;"><strong>Referencia:</strong> ${c2pResponse.reference}</p>
          <p style="margin: 0.5rem 0;"><strong>Monto:</strong> Bs. ${formData.monto}</p>
          <p style="margin: 0.5rem 0;"><strong>Mensaje:</strong> ${c2pResponse.message}</p>
        </div>
      `,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      customClass: {
        popup: 'fibex-swal-popup',
        title: 'fibex-swal-title',
        htmlContainer: 'fibex-swal-html',
        confirmButton: 'fibex-swal-confirm-btn'
      },
      buttonsStyling: false,
      didClose: () => {
        this.onSubmitPayForm.emit();
      }
    });
  }

  /**
   * Regresa a la selección de métodos de pago o cierra el modal
   */
  public backToMethodSelector(): void {
    if (this.showC2PForm) {
      // Si está en el formulario C2P, regresa al selector
      this.showC2PForm = false;
      this.showPaymentMethodSelector = true;
      this.selectedPaymentMethod = null;
      this.c2pFormData = {};
      this.cdr.markForCheck();
    } 
    else if (this.showPuntoVentaForm) {
      this.showPuntoVentaForm = false;
      this.showPaymentMethodSelector = true;
      this.selectedPaymentMethod = null;
      this.c2pFormData = {};
      this.cdr.markForCheck();
    }
    else if (this.showDebitoInmediatoForm) {
      this.showDebitoInmediatoForm = false;
      this.showPaymentMethodSelector = true;
      this.selectedPaymentMethod = null;
      this.c2pFormData = {};
      this.cdr.markForCheck();
    }
    else if (this.showPaymentMethodSelector) {
      // Si está en el selector, cierra el modal
      this.onCloseModal();
    }
  }
}
