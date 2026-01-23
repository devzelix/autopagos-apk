import {
  Component,
  OnInit,
  ViewChild,
  Input,
  HostListener,
  OnDestroy
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormGroup, Validators,
  AbstractControl, ValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { Clipboard } from '@angular/cdk/clipboard';

import { isNegativeNumber } from '../../validators/customValidatorAmount';

import { nanoid } from 'nanoid';
import { BankList } from '../../interfaces/bankList';
import { BanksDays } from '../../interfaces/banksDays';
import { Contratos, IUserListItem, IUserSaldo } from '../../interfaces/contratos';
import {
  DataSlide,
  TypeAccount,
  Month,
  Ano,
  MetodoDePago2,
  MetodoDePago3,
  PlantillaConfirmPago,
  DatosPagoMovil,
  FormasDePago,
  ListBankPago
} from './camposSubscription/camposSuscription';
import { MiscelaneosService } from '../../utils/miscelaneos.service';
import { ApiMercantilService } from '../../services/ApiMercantil';
import { TypeBrowserService } from '../../services/TypeBrowser';
import { MatStepper, StepState } from '@angular/material/stepper';
import Swal from 'sweetalert2';
import { debounceTime, filter, fromEvent, merge, Subject, Subscription, switchMap, takeUntil, tap, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

//Servicios
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { ConsultasService } from '../../services/consultas.service';
import { CloudynariService } from '../../services/cloudDinary.service';
import { CaptchaThomasService } from 'captcha-thomas';
import { HelperService } from 'src/app/services/helper.service';
import { ClearCacheService } from 'src/app/services/clear-cache.service';
import { RegisterPayService } from '../../services/register-pay.service';
import { UplaodImageService } from '../../services/uplaod-image.service';
import { BankEmisorS } from '../../interfaces/bankList';
import { TasaService } from '../../services/tasa.service';
import { DataBankService } from '../../services/data-bank.service';
import { UploadPHPService } from '../../services/UploadPHP.service';
import { ApiBNCService } from 'src/app/services/ApiBNC';

//Modal
import { IAccount, ResponseMethod } from 'src/app/interfaces/response';
import { Api100x100Service } from 'src/app/services/Api100x100Banco';
import { HelperModalsService } from 'src/app/services/helper-modals.service';
import { IPaymentTypes, ITransactionInputs, ITypeDNI } from 'src/app/interfaces/payment-opt';
import { UniquePaymentComponent } from '../unique-payment/unique-payment.component';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { CheckoutSessionService } from 'src/app/services/checkout-session.service';

enum PAGES_NAVIGATION {
  LOGIN,
  MAIN_MENU,
  PAYMENT_CARDS,
  PAYMENT_FORMS,
  USER_LIST_SELECT,
}

type IHandlerNav = {
  [key in PAGES_NAVIGATION]: () => void
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.style.scss'],
})
export class FormComponent implements OnInit {
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {

    // NO ejecutar si el login del admin está visible (evita interceptar eventos del formulario de login)
    if (!this.isAdminLogged) {
      return; // Salir si el admin no ha iniciado sesión
    }

    if (this.showDniForm && !this.AppFibex && this.listContratos.length < 1 && !this.LoadingLengthAbonado) {

      if (event.key === 'Backspace') return this.deleteLastCharacter();
      else if (event.key === 'Enter' && this.dni?.value.length > 5) this.searchServicesv2(this.firstFormFibex.get('dni'), false, true)
      else if (/^[0-9]+$/.test(event.key)) this.onTecladoInput(event.key)

    }

  }
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('picker') date_: MatDatepickerInput<Date>;

  @ViewChild('viewUnique') viewUniquePayments: UniquePaymentComponent;

  public PlantillaTempPago: any = JSON.parse(
    JSON.stringify(PlantillaConfirmPago)
  );
  animal: string;
  name2: string;
  fecha: string = 'sssssssssssssss';
  // displayedColumns: string[] = ['Comprobante', 'Status', 'Fecha'];
  displayedColumns: string[] = ['Fecha', 'Status'];

  private activitySubscription: Subscription;
  private warningSubscription: Subscription;
  private logoutSubscription: Subscription;

  private destroy$ = new Subject<void>();

  public BankEmisor = BankEmisorS;
  public bancoSeleccionado: string = '';
  public RegexPhone =
    /^(412|414|424|416|426|0412|0414|0424|0416|0426|58412|58414|58424|58416|58426)[0-9]{7}$/gm;
  private idUnicoClient: any = nanoid(10);
  public bankList: BankList[] = [];
  private saldoUser: string = '0.00';
  public saldoMounted: number = 0;
  public formFibex: UntypedFormGroup;
  public firstFormFibex: UntypedFormGroup;
  public secondFormFibex: UntypedFormGroup;
  public thirdFormFibex: UntypedFormGroup;
  public fourthFormFibex: UntypedFormGroup;
  public PgMovilForm: FormGroup;
  public PgMovilRegForm: FormGroup;
  public PgMovilBNCForm: FormGroup;
  public montoDebitoBNC: string;
  public DebitoCredito: FormGroup;
  public DebitoInmediato: FormGroup;
  public TypeForm: FormGroup;
  public CriptomonedaForm: FormGroup;
  public FirtZelleForm: FormGroup;
  public AllComprobantesPago: any = [];
  public retentionImageUrl: string = '';
  public retentionimageUploaded: boolean = false;
  public ErrorRegistrando: boolean = false;
  public MessageErrorRegistrado: string = '';
  CuentaAnulada: boolean = false;
  public uploadingRetentionImg: boolean = false;
  public validFormats = ['jpg', 'jpeg', 'png', 'pdf'];
  public extn: any = '';
  public indexof: number;
  public ValidExtension: boolean = true;
  public retentionImgExtn: any = '';
  public retentionImgIndexof: number;
  public ValidRetentionImgExtension: boolean = true;
  public possibleWithholdingAgent: boolean = false;
  public selectedRetentionOption: number | null;
  public DataPagoMovilPublic: any = DatosPagoMovil;

  public listContratos: Contratos[] = [];
  public paquetesContratos: { id_contrato: string; paquete: string }[] = [];
  public cambio_act: number = 0;
  public lastAmount: string = '';
  public banco: string = '';
  public BancoSelect: any; //con esta variable se todos los datos del banco que seleccione el cliente
  public imageUrl: string = '';
  public imageUploaded: boolean = false;
  public idContrato: string = '';
  public paquete: /* any = [] */ string = '';
  public regexEmail: RegExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public regexUrl: RegExp = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public regexCCV: RegExp = /^\d*$/;
  public payReported: boolean = false;
  public playDuplicated: boolean = false;
  public dniConsulted: boolean = false;
  public nameClient: string = '';
  public saldoUSD: string = '';
  public saldoBs: string = '';
  public subscription: string = '';
  public ComprobantesPago: any = [];
  public monto_pend_conciliar = 0;
  public Contar = 0;
  DisableReg: boolean = false;
  public lastDni: string = '';
  public saldoText: string = '';
  public dateToDay: Date = new Date();
  public banksFiltered: BankList[] = [];
  public counterErrors: number = 0;
  public showMessageErrorUpload: boolean = false;
  private temp2: any;
  public dateInvalid: boolean = false;
  public sendingPay: boolean = false;
  public invalidAmount: boolean = false;
  public uploadingImg: boolean = false;
  public tasaCambio: string = '';
  public errorDate: boolean = false;
  public daysFeriados: BanksDays[] | any = [];
  public BancoDefault: string = 'Mercantil';
  public bancooo: string = '100x100Banco';
  public LoadingLengthAbonado: boolean = false;
  ExitRef: Boolean = true; //para saber si el campo de comprobante esta vacio o no
  AllService: any = [];
  ListService: any = [];
  LenthgInvalidDnI: boolean = false;
  AllDataClient: any = [];
  enableBtn: Boolean = false;
  totalAmount: number = 0;
  PagoMetodosHTML2: any = FormasDePago;
  MetodosPagoMovil: any = ListBankPago;
  //sPagoMercantilBCO:any =[];
  ConsultarPagoMovilboolean: boolean = false;
  RegistrarPagoMovilboolean: boolean = false;
  BankSelectPagoMovil: boolean = false; //creado por juan para saber si la persona selecciono un pago o no
  ShowalertBankNationals: boolean = false; //creado por juan
  ShowOptionPagoMovil: boolean = false; //creado por juan
  ShowFormDebitoCredito: Boolean = false;
  ShowFormDebitoCreditoBNC: Boolean = false;
  ShowFormDebito100x100: Boolean = false;
  DebitoCreditoboolean: boolean = false;
  ShowOptionBNCPagoMovil: boolean = false;
  Criptomoneda: boolean = false;
  Otros: boolean = false;
  tipo_pago: any;
  AppFibex: boolean = false;
  ClienteFibex: boolean = false;
  ZellePay: boolean = false;
  BancoPago: any;
  public PaymenMethod: string = '';
  private TypeNavegador: string = '';
  private IpAddress: any = '';
  public TypeAcountDC: any[] = TypeAccount;
  public Creditoboolaean: boolean = false;
  public Debitoboolean: boolean = false;
  public PrimeraVez: boolean = true;
  public Months = Month;
  public Anos = Ano;
  public ReciboPay: boolean = false;
  public SelectPagoc2p: string = 'mercantil';
  public controllerKey: boolean;
  public values = '';
  public PinEnviado: boolean = false;
  public PinError: number = 0;
  public ConcatenaTimer: string = '';
  public SetInterval: any = '';
  private timeoutIds: any[] = [];
  public Minutes: any = '';
  public Second: any = '';
  public BackFormaPago: boolean = false; //Regresar para reportar o pagar
  public ShowBankList: boolean;
  // Variables de hcaptcha
  public hcaptchaForm: FormGroup;
  public verifyDNI: boolean = false;
  public captchaControl: boolean | undefined = true;
  public readonlyDNI: boolean = false;
  public Kiosco: boolean = false;
  public abonado: string = '';
  public PagoPendiente: boolean = false;
  public DataPagoPendiente: any = '';
  public LoadingPagoPendiente: boolean = false;
  public LoadingCheckReferencia: boolean = false;
  public ListBank: any;
  @Input() state: StepState;
  paymentMethod: string = 'standard';
  public showStateTable: boolean = false;
  public stateTableData: {
    fecha_reg: Date;
    numero_ref: number;
    status_pd: string;
  }[];
  banksListBNC: any[] = [];
  ReciboPayBNC: boolean = false;
  montoDebito100: any;
  ReciboPayDebitoCreditoBNC: boolean = false;
  NameBank: string = '';
  public inputValue: string = '';
  public showDniForm: boolean = true;
  public loginTypeSelectValue: string = 'V';
  public userGreeting: string = '';
  public userServices: string[] = [];
  public showMainMenuPage2: boolean = false;
  public navActive: PAGES_NAVIGATION = PAGES_NAVIGATION.LOGIN;
  public ENUM_NAV: typeof PAGES_NAVIGATION = PAGES_NAVIGATION;
  public showTransactionModal: boolean = false;
  public showAnulationModal: boolean = false;
  public selectedPaymentType: IPaymentTypes;
  public monthPayCount: number = 1;
  public mountTotalMonthBs: string = '0.00';
  public mountTotalMonthUSD: string = '0.00';
  public activePaymentMonth: number = 1;
  public showFormView: boolean = false;
  public activeTransactionInputFocus: ITransactionInputs = 'dni';
  public isActiveLoginInput: boolean = false;
  public mainTitle: string = '';
  public userSelectList: IUserListItem[] = []
  public clientNames: string = '';
  // para mostrar o ocultar el modulo administrativo
  public showaBtnAdmin: boolean = true;
  public showadmin: boolean = false;
  // Control para mostrar el login del administrador al inicio
  // false = mostrar login, true = ocultar login (mostrar contenido principal)
  // Inicializado en null para no mostrar nada hasta validar sesión
  public isAdminLogged: boolean | null = null;

  constructor(
    public registerPayService: RegisterPayService,
    private fb: UntypedFormBuilder,
    private uplaodImageService: UplaodImageService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private tasaService: TasaService,
    private dataBankService: DataBankService,
    private _snackBar: MatSnackBar,
    private _helperModal: HelperModalsService,
    private _Consultas: ConsultasService,
    private miceService: MiscelaneosService,
    private _Cloudinary: CloudynariService,
    private _UploadPHP: UploadPHPService,
    private _ApiMercantil: ApiMercantilService,
    private _Api100x100: Api100x100Service,
    private _TypeBrowserService: TypeBrowserService,
    public router: Router,
    public captchaService: CaptchaThomasService,
    private clipboard: Clipboard,
    private _seguridadDatos: SeguridadDatos,
    private _helper: HelperService,
    private cacheService: ClearCacheService,
    public dialogTemplate: MatDialog,
    public helper: HelperService,
    public _ApiBNC: ApiBNCService,
    private _localStorageService: LocalstorageService,
    private _checkoutSessionService: CheckoutSessionService
  ) {

    this.cacheService.clear();

    this.dataBankService.bankList.subscribe((banks) => {
      this.bankList = banks.sort((a, b) => a.Banco.localeCompare(b.Banco));
      this.banksFiltered = [...this.bankList];
      this.banksFiltered = this.deleteDuplicated(this.banksFiltered, 'id_cuba');
    });

    this._ApiBNC
      .listBanks()
      .then((res: any) => {
        if (res.status == true) {
          this.banksListBNC = res.Bancos;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  MyInit() {
    this.firstFormFibex = this.fb.group(
      {
        name: ['', [Validators.required]],
        dni: ['', [Validators.required, Validators.minLength(6)]],
        email: ['', [Validators.required, Validators.pattern(this.regexEmail)]],
        bank: ['', [Validators.required]],
        nroContrato: ['', [Validators.required]],
        date: ['', [Validators.required]],
        amount: [
          '',
          [Validators.required, Validators.pattern(this.regexAmount)],
        ],
        idpago: [''],
      },
      { validator: isNegativeNumber }
    );

    this.secondFormFibex = this.fb.group({
      voucher: ['', [Validators.required, Validators.maxLength(30)]],
      nameTitular: [''],
      dniTitular: [''],
      emailTitular: [''],
      BancoEmisor: [''],
    });

    this.thirdFormFibex = this.fb.group({
      img: ['', [Validators.required]],
      note: [''],
    });

    this.fourthFormFibex = this.fb.group({
      retentionImg: ['', [Validators.required]],
      retentionAmount: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
    });

    this.PgMovilForm = this.fb.group({
      tlforiginReg: [
        '',
        [Validators.required, Validators.pattern(this.RegexPhone)],
      ],
      tlfdestinReg: ['584129637516', [Validators.required]],
      prec_i: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      referencia: ['', [Validators.required]],
      datepgmovil: ['', [Validators.required]],
      cantidad: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
      validator: Validators.compose([isNegativeNumber]),
    });

    this.PgMovilRegForm = this.fb.group({
      tlforigin: ['584129637516', [Validators.required]],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      tlfdestin: [
        '',
        [Validators.required, Validators.pattern(this.RegexPhone)],
      ],
      auth: [''],
      BankList: [''],
      amountPm: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
      validator: Validators.compose([isNegativeNumber]),
    });

    this.PgMovilBNCForm = this.fb.group({
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.minLength(11)]],
      codeBank: ['', [Validators.required, Validators.minLength(4)]],
      amountPm: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
      validator: Validators.compose([isNegativeNumber]),
    });

    this.DebitoCredito = this.fb.group({
      BancoSeleccionado: [''],
      ccv: [
        '',
        [
          Validators.required,
          Validators.pattern(this.regexCCV),
          Validators.maxLength(3),
        ],
      ],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      typeCuenta: ['', [Validators.required]],
      Ncard: ['', [Validators.required, Validators.maxLength(18)]],
      Clavetlfonica: [''],
      fvncmtoMes: ['', [Validators.required]],
      fvncmtoAno: ['', [Validators.required]],
      cantidad: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
      validator: Validators.compose([isNegativeNumber]),
    });

    this.DebitoInmediato = this.fb.group({
      BancoSeleccionado: [''],
      ccv: [
        '',
        [
          Validators.required,
          Validators.pattern(this.regexCCV),
          Validators.maxLength(3),
        ],
      ],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      typeCuenta: ['', [Validators.required]],
      Ncard: ['', [Validators.required, Validators.maxLength(18)]],
      Clavetlfonica: [''],
      fvncmtoMes: ['', [Validators.required]],
      fvncmtoAno: ['', [Validators.required]],
      cantidad: [
        '',
        [Validators.required, Validators.pattern(this.regexAmount)],
      ],
      validator: Validators.compose([isNegativeNumber]),
    });

    this.CriptomonedaForm = this.fb.group({
      Referencia_Cripto: ['', [Validators.required]],
      Monto_Cripto: [``, [Validators.required]],
      c_i_Cripto: ['', [Validators.required, Validators.minLength(6)]],
      Pref_ci_Cripto: ['', [Validators.required]],
    });

    this.name?.disable();
  }

  deleteDuplicated(array: any[], key: string) {
    let list: any[] = [];
    array.forEach((items: any) => {
      const objExists = list.filter((obj: any) => obj[key] === items[key]);
      if (objExists === undefined || objExists.length === 0) {
        list.push(items);
      }
    });
    return list;
  }



  async ngOnInit(): Promise<void> {
    // IMPORTANTE: Validar sesión ANTES de inicializar cualquier cosa
    // Esto asegura que el Swal aparezca antes de que se renderice el login
    console.log('Iniciando validación de sesión...');
    await this.validateAndRestoreSession();
    console.log('Validación de sesión completada. isAdminLogged:', this.isAdminLogged);
    
    // Configurar listener para resetear al welcome-view cuando se oculta el carrusel
    this.setupResetToWelcomeListener();
    
    // Inicializar formularios después de validar sesión
    this.MyInit();

    this._ApiMercantil
      .GetAddress()
      .then((resp: any) => (this.IpAddress = resp))
      .catch((error: any) => console.log(error));

    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();

    this.route.queryParams
      .pipe(filter((param) => param['dni']))
      .subscribe((res) => {
        if (res['dni']) {
          this.dni?.setValue(`${res['dni']}`);
          this.searchServicesv2(res['dni'], true, true);

          if (res['linkedToContractProcess'] === 'approved') {
            this.tasaService.getSaldoBCV().subscribe((res) => {
              this.tasaCambio = res;
            });

            this.PagoMetodosHTML2 = MetodoDePago2.filter(
              (x) => x.idpago != 4 && x.idpago != 6
            );
            this.registerPayService.linkedToContractProcess = `${res['linkedToContractProcess']}`;
            this.registerPayService.dniCustomerContract = `${res['dni']}`;
            this.registerPayService.amountCustomerContract = `${res['amount']}`;
          } else {
            if (res['kiosco']) {
              this.Kiosco = true;
              this.fourthFormFibex.get('retentionImg')?.clearValidators();
              this.fourthFormFibex.get('retentionAmount')?.clearValidators();
              this.thirdFormFibex.get('img')?.clearValidators();
              this.fourthFormFibex
                .get('retentionImg')
                ?.updateValueAndValidity();
              this.fourthFormFibex
                .get('retentionAmount')
                ?.updateValueAndValidity();
              this.thirdFormFibex.get('img')?.updateValueAndValidity();
            }
            this.PagoMetodosHTML2 = FormasDePago;
          }
        }

      });
    // this.dateOfPay();
    // this.amountInvalid();
    // this.amountInvalidCreditoDebitoPagoMovil();
    // this.getDaysFeriados();
  }

  /**
   * Valida y restaura la sesión de caja al iniciar la aplicación
   * Si hay sesión válida, muestra un Swal PRIMERO para confirmar si continuar o hacer nueva asignación
   * Si no hay sesión o el usuario elige nueva asignación, muestra el login
   */
  private async validateAndRestoreSession(): Promise<void> {
    // Inicializar como null para no mostrar nada hasta validar
    this.isAdminLogged = null;
    
    // Verificar si hay sesión guardada (sin validar aún)
    const session = this._checkoutSessionService.getSession();
    console.log('🔍 Sesión encontrada en localStorage:', session);
    
    if (!session) {
      console.log('❌ No hay sesión guardada, mostrando login');
      this.isAdminLogged = false;
      return;
    }
    
    // Validar la sesión
    const validation = await this._checkoutSessionService.validateSession();
    console.log('✅ Validación de sesión:', validation);
    
    if (validation.isValid && session) {
      console.log('✅ Sesión válida encontrada, mostrando Swal...');
      
      // Obtener información formateada de la sesión (incluye nombre de la sede)
      const sessionInfoHtml = await this._checkoutSessionService.getFormattedSessionInfo();
      
      // Formatear fecha de la sesión para el separador
      const sessionDate = new Date(session.sessionTimestamp);
      const formattedDate = sessionDate.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Hay sesión válida, mostrar Swal PRIMERO antes de cualquier cosa con información detallada
      const result = await Swal.fire({
        title: 'Sesión existente encontrada',
        html: `
          <div style="text-align: left; margin: 15px 0;">
            <p style="margin-bottom: 15px; font-weight: 600; color: #357CFF; font-size: 16px;">Información de la sesión:</p>
            ${sessionInfoHtml}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="margin-top: 15px; font-weight: 500; color: #1a202c;">¿Qué deseas hacer?</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continuar con esta sesión',
        cancelButtonText: 'Nueva asignación',
        confirmButtonColor: '#357CFF',
        cancelButtonColor: '#dc3545',
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          confirmButton: 'fibex-swal-confirm-btn',
          cancelButton: 'fibex-swal-cancel-btn danger',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '520px',
        padding: '2rem',
        didOpen: () => {
          // Aplicar estilos inline después de que se abra el modal
          const confirmBtn = document.querySelector('.swal2-confirm.fibex-swal-confirm-btn') as HTMLElement;
          const cancelBtn = document.querySelector('.swal2-cancel.fibex-swal-cancel-btn') as HTMLElement;
          
          if (confirmBtn) {
            confirmBtn.style.background = 'linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)';
            confirmBtn.style.backgroundImage = 'linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)';
            confirmBtn.style.color = '#ffffff';
            confirmBtn.style.border = 'none';
            confirmBtn.style.borderRadius = '12px';
            confirmBtn.style.padding = '14px 28px';
            confirmBtn.style.fontSize = '15px';
            confirmBtn.style.fontWeight = '600';
            confirmBtn.style.fontFamily = "'Poppins', sans-serif";
            confirmBtn.style.boxShadow = '0 4px 14px rgba(53, 124, 255, 0.4)';
            confirmBtn.style.minWidth = '120px';
          }
          
          if (cancelBtn) {
            cancelBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            cancelBtn.style.backgroundImage = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            cancelBtn.style.color = '#ffffff';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '12px';
            cancelBtn.style.padding = '14px 28px';
            cancelBtn.style.fontSize = '15px';
            cancelBtn.style.fontWeight = '600';
            cancelBtn.style.fontFamily = "'Poppins', sans-serif";
            cancelBtn.style.boxShadow = '0 4px 14px rgba(220, 53, 69, 0.4)';
            cancelBtn.style.minWidth = '120px';
          }
        }
      });

      if (result.isConfirmed) {
        // Usuario acepta continuar con la sesión existente
        this.isAdminLogged = true; // Ocultar login, mostrar contenido
        console.log('Sesión de caja restaurada exitosamente');
        this._checkoutSessionService.renewSession();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Usuario quiere hacer nueva asignación, limpiar sesión y mostrar login
        this._checkoutSessionService.clearSession();
        this.isAdminLogged = false; // Mostrar login
        console.log('Usuario eligió hacer nueva asignación, mostrando login');
      }
    } else {
      // No hay sesión válida, mostrar login directamente para asignar caja y POS
      console.log('No hay sesión válida, mostrando login para asignar caja y POS');
      this.isAdminLogged = false; // Mostrar login
    }
  }

  ngOnDestroy(): void {
    // Emite para que el takeUntil() de activity$ funcione
    this.destroy$.next();
    this.destroy$.complete();

    // Limpia manualmente las suscripciones para estar seguros
    this.activitySubscription?.unsubscribe();
    this.warningSubscription?.unsubscribe();
    this.logoutSubscription?.unsubscribe();

    // Limpiar intervalos y timeouts
    if (this.SetInterval) {
      clearInterval(this.SetInterval);
      this.SetInterval = null;
    }
    
    // Limpiar todos los timeouts pendientes
    if (this.timeoutIds && this.timeoutIds.length > 0) {
      this.timeoutIds.forEach(id => clearTimeout(id));
      this.timeoutIds = [];
    }
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    console.log("Iniciando el temporizador de inactividad.");
    // --- Tiempos de configuración (en milisegundos) ---
    const TIME_FOR_WARNING = 90000; // 90 segundos para el aviso
    const TIME_FOR_LOGOUT = 30000;  // 30 segundos extra para el reseteo

    // --- Flujo de actividad del usuario ---
    const activity$ = merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'touchstart')
    ).pipe(takeUntil(this.destroy$)); // Gestiona la limpieza

    // ---- SUSCRIPCIÓN 1: INICIA EL AVISO Y EL CONTADOR FINAL ----
    // Esta suscripción se activa solo cuando el usuario ha estado inactivo.
    this.warningSubscription = activity$.pipe(
      debounceTime(TIME_FOR_WARNING)
    ).subscribe(() => {
      // Muestra el aviso
      Swal.fire({
        title: '¿Sigues ahí?',
        text: `Tu sesión se cerrará en ${TIME_FOR_LOGOUT / 1000} segundos.`,
        icon: 'warning',
        timer: TIME_FOR_LOGOUT,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'inactivity-warning-swal' // Clase única para identificarlo
        }
      });

      // Inicia el contador final para el reseteo
      this.logoutSubscription = timer(TIME_FOR_LOGOUT).subscribe(() => {
        console.log("Timeout final alcanzado. Reiniciando.");
        this.resetAllForms();
      });
    });

    // ---- SUSCRIPCIÓN 2: CANCELA EL PROCESO SI HAY ACTIVIDAD ----
    // Esta es la parte clave. Se suscribe a la actividad DIRECTAMENTE.
    this.activitySubscription = activity$.subscribe(() => {
      // Si el contador final está corriendo, lo cancela.
      if (this.logoutSubscription) {
        this.logoutSubscription.unsubscribe();
      }
      // Cierra el aviso de SweetAlert si está visible.
      this.closeInactivitySwal();
    });
  }

  private stopInactivityTimer(): void {
    console.log("Deteniendo el temporizador de inactividad.");
    this.activitySubscription?.unsubscribe();
    this.warningSubscription?.unsubscribe();
    this.logoutSubscription?.unsubscribe();
    this.closeInactivitySwal(); // Cierra cualquier alerta de Swal que esté abierta
  }

  private closeInactivitySwal(): void {
    // Primero, pregunta si hay un Swal abierto
    if (Swal.isVisible()) {
      // Luego, obtén el elemento del popup y revisa si tiene nuestra clase única
      const popup = Swal.getPopup();
      if (popup && popup.classList.contains('inactivity-warning-swal')) {
        // Solo si es nuestro aviso de inactividad, ciérralo.
        Swal.close();
      }
    }
  }


  DNIvalidation = (inputDni: any) => {
    const dni_ = inputDni.value;
    if (dni_.length >= 1 && dni_.length < 6) {
      this.dni?.reset();
      this.captchaService.validControl = false;
      this.nameClient = '';
      this.userGreeting = '';
      this.saldoUSD = '';
      this.saldoBs = '';
      this.dniConsulted = true;
      this.lastDni = '';
      this.name?.setValue('');
      this.alertFindDni('La cédula debe ser mínimo 6 carácteres', '');
      const timeoutId = setTimeout(() => this.closeAlert(), 1000);
      this.timeoutIds.push(timeoutId);
    }
  };

  SendOption(page: number, option: any, value: any) {
    let temp = value;
    //Anticlon y evitar valores vacios
    if (value != '' && temp != this.temp2 && value != undefined) {
      if (page == 0 && option == 5) {
        value = value.toLocaleString('en-GB');
      }

      this.temp2 = temp;
      DataSlide[page].Data[option].Data = value;
      let Data = DataSlide[page].Data[option];
      try {
        this._Consultas.Send(
          Data.Option,
          Data.Data,
          Data.id,
          '',
          this.idUnicoClient
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  BancoEmisor(Bank: any) {
    switch (Bank.Banco) {
      case 'USD BANCO MERCANTIL':
      case 'EUR BANCO MERCANTIL':
        this.secondFormFibex
          .get('voucher')
          ?.setValidators([
            Validators.maxLength(10),
            Validators.required,
            Validators.minLength(4),
            this.CharacterSpecial(),
          ]);
        this.secondFormFibex.get('voucher')?.updateValueAndValidity();
        break;

      case 'ZELLE WELL FARGO zellepagos@fibextelecom.net':
      case 'USD BANK OF AMERICA TRANSFERENCIA':
        this.secondFormFibex
          .get('voucher')
          ?.setValidators([
            Validators.maxLength(14),
            Validators.required,
            Validators.minLength(4),
            this.CharacterSpecial(),
          ]);
        this.secondFormFibex.get('voucher')?.updateValueAndValidity();
        break;

      default:
        if (Bank.hasOwnProperty('Max')) {
          this.secondFormFibex.get('BancoEmisor')?.setValue(Bank.Banco);
          this.secondFormFibex
            .get('voucher')
            ?.setValidators([
              Validators.maxLength(Bank.Max),
              Validators.required,
              Validators.minLength(4),
              this.NumericReference(),
            ]);
          this.secondFormFibex.get('voucher')?.updateValueAndValidity();
        }
        break;
    }
  }

  //Contraseña Alfanumerica echo por Michel C.
  NumericReference(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      const hasNumeric = /^[0-9]+$/.test(value);

      const NumericVAlid = hasNumeric;

      return !NumericVAlid ? { NumericRefence: true } : null;
    };
  }

  CharacterSpecial(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasCaracteresSpecial = /^[\w\-\.]+$/i.test(value);

      return !hasCaracteresSpecial ? { CaracterInvalid: true } : null;
    };
  }

  //Transferencia
  get name() {
    return this.firstFormFibex.get('name');
  }
  get dni() {
    return this.firstFormFibex.get('dni');
  }
  get email() {
    return this.firstFormFibex.get('email');
  }
  get nroContrato() {
    return this.firstFormFibex.get('nroContrato');
  }
  get bank() {
    return this.firstFormFibex.get('bank');
  }
  get amount() {
    return this.firstFormFibex.get('amount');
  }
  get date() {
    return this.firstFormFibex.get('date');
  }

  get voucher() {
    return this.secondFormFibex.get('voucher');
  }
  get nameTitular() {
    return this.secondFormFibex.get('nameTitular');
  }
  get dniTitular() {
    return this.secondFormFibex.get('dniTitular');
  }
  get emailTitular() {
    return this.secondFormFibex.get('emailTitular');
  }
  get BankUser() {
    return this.secondFormFibex.get('BancoEmisor');
  }

  get note() {
    return this.thirdFormFibex.get('note');
  }
  get img() {
    return this.thirdFormFibex.get('img');
  }
  //Reporte de pago Movil
  get c_iPagMovil() {
    return this.PgMovilForm.get('c_i');
  }
  get tlforiginReg() {
    return this.PgMovilForm.get('tlforiginReg');
  }
  get tlfdestinReg() {
    return this.PgMovilForm.get('tlfdestinReg');
  }
  get referenciapm() {
    return this.PgMovilForm.get('referencia');
  }
  get datepgmovil() {
    return this.PgMovilForm.get('datepgmovil');
  }
  get cantidad() {
    return this.PgMovilForm.get('cantidad');
  }
  get prec_i() {
    return this.PgMovilForm.get('prec_i');
  }

  //Pago Movil Mercantil
  get tlforigin() {
    return this.PgMovilRegForm.get('tlforigin');
  }
  get c_iRegPgoMvil() {
    return this.PgMovilRegForm.get('c_i');
  }
  get pref_ci() {
    return this.PgMovilRegForm.get('pref_ci');
  }
  get tlfdestin() {
    return this.PgMovilRegForm.get('tlfdestin');
  }
  get auth() {
    return this.PgMovilRegForm.get('auth');
  }
  get amountPm() {
    return this.PgMovilRegForm.get('amountPm');
  }
  get BankListC2P() {
    return this.PgMovilRegForm.get('BankList');
  }
  // Pago Movil BNC
  get pref_ci_bnc() {
    return this.PgMovilBNCForm.get('pref_ci');
  }
  get c_i_bnc() {
    return this.PgMovilBNCForm.get('c_i');
  }
  get phoneBeneficiary() {
    return this.PgMovilBNCForm.get('phone');
  }
  get amountPm_bnc() {
    return this.PgMovilBNCForm.get('amountPm');
  }
  get codeBank() {
    return this.PgMovilBNCForm.get('codeBank');
  }
  //Debito o Credito
  get BancoSeleccionado() {
    return this.DebitoCredito.get('BancoSeleccionado');
  }
  get ccv() {
    return this.DebitoCredito.get('ccv');
  }
  get typeCuenta() {
    return this.DebitoCredito.get('typeCuenta');
  }
  get pref_ciDC() {
    return this.DebitoCredito.get('pref_ci');
  }
  get Ncard() {
    return this.DebitoCredito.get('Ncard');
  }
  get fvncmtoMes() {
    return this.DebitoCredito.get('fvncmtoMes');
  }
  get fvncmtoAno() {
    return this.DebitoCredito.get('fvncmtoAno');
  }
  get cantidadDC() {
    return this.DebitoCredito.get('cantidad');
  }
  get c_iDC() {
    return this.DebitoCredito.get('c_i');
  }
  get Clavetlfonica() {
    return this.DebitoCredito.get('Clavetlfonica');
  }
  //Criptomoneda
  get Referencia_Cripto() {
    return this.CriptomonedaForm.get('Referencia_Cripto');
  }
  get Monto_Cripto() {
    return this.CriptomonedaForm.get('Monto_Cripto');
  }
  get c_i_Cripto() {
    return this.CriptomonedaForm.get('c_i_Cripto');
  }
  get Pref_ci_Cripto() {
    return this.CriptomonedaForm.get('Pref_ci_Cripto');
  }
  //Retencion
  get retentionAmount() {
    return this.fourthFormFibex.get('retentionAmount');
  }
  get retentionImg() {
    return this.fourthFormFibex.get('retentionImg');
  }

  ClearCedula(Cedula: any) {
    if (Cedula) {
      var regex = /(\d+)/g;
      const CedulaLimpia = Cedula.match(regex);
      return CedulaLimpia.join('');
    }
  }

  validateEmail(event: any): void {
    const keyCode = event.keyCode;
    const excludedKeys = [64, 45, 46, 95];
    if (
      !(
        (keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 97 && keyCode <= 122) ||
        excludedKeys.includes(keyCode)
      )
    ) {
      event.preventDefault();
    }
  }

  TipoPago(idType: number) {
    this.BankSelectPagoMovil = false;
    this.ShowOptionPagoMovil = false;
    this.showMainMenuPage2 = false;
    /* this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS; */
    this.selectedPaymentType = (idType === 28) ? 'Internacional' : (idType === 1) ? 'Nacional' : 'Débito'
    this.showTransactionModal = true

    console.log('TIPO PAGO', this.PagoMetodosHTML2, idType)
  }

  FormaPago(x: number) {
    this.BackFormaPago = !this.BackFormaPago;
    //Reportar
    if (x == 29) {
      //if (Number(this.saldoUSD) < 0) {
      this.LoadingPagoPendiente = !this.LoadingPagoPendiente;
      this.registerPayService
        .StatusPayAbonado(this.nroContrato?.value)
        .then((response: any) => {
          this.LoadingPagoPendiente = !this.LoadingPagoPendiente;
          let Response: ResponseMethod = response;
          console.log(response);
          if (Response && Response.codigo == 1002) {
            //Pago en el lapso de 72 horas
            this.PagoPendiente = true;
            this.DataPagoPendiente = JSON.parse(Response.data);
            this.DataPagoPendiente.Pendiente = this.PagoPendiente;
          } else {
            this.PagoMetodosHTML2 = MetodoDePago2;
          }
        })
        .catch((err: any) => {
          console.log(err);
          this.PagoMetodosHTML2 = MetodoDePago2;
          this.LoadingPagoPendiente = !this.LoadingPagoPendiente;
        });
    }
    //Pagar
    if (x == 30) {
      this.PagoMetodosHTML2 = MetodoDePago3;
      /*  let SubscriptionZelle = this._Consultas.PagoZelleOb.subscribe((resp) => {
         console.log('respuesta subscription', resp)
         this.TipoPago(6);
         SubscriptionZelle.unsubscribe();
       }); */
    }

    if (x == 31) {
      this.PagoPendiente = false;
      this.PagoMetodosHTML2 = FormasDePago;
    }

    if (this.userSelectList.length === 1) {
      this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS
    }
    this.loadInitMonthMountValues()
    console.log('FORMA PAGO', this.PagoMetodosHTML2, x)
  }

  checkLocalStorageData() {
    return new Promise<void>((resolve, reject) => {
      localStorage.setItem(
        'Name',
        this._seguridadDatos.encrypt(this.nameClient)
      );
      localStorage.setItem(
        'Monto',
        this._seguridadDatos.encrypt(this.saldoUSD)
      );
      localStorage.setItem(
        'MontoBs',
        this._seguridadDatos.encrypt(this.saldoBs)
      );
      localStorage.setItem(
        'Subscription',
        this._seguridadDatos.encrypt(this.subscription)
      );
      localStorage.setItem(
        'idContrato',
        this._seguridadDatos.encrypt(this.idContrato)
      );
      localStorage.setItem(
        'dni',
        this._seguridadDatos.encrypt(this.dni?.value)
      );
      localStorage.setItem(
        'Saldo',
        this._seguridadDatos.encrypt(this.saldoText)
      );
      localStorage.setItem(
        'Service',
        this._seguridadDatos.encrypt(JSON.stringify(this.paquete))
      );
      localStorage.setItem(
        'Abonado',
        this._seguridadDatos.encrypt(this.nroContrato?.value)
      );
      localStorage.setItem(
        'IpAdress',
        this._seguridadDatos.encrypt(this.IpAddress.ip)
      );
      localStorage.setItem(
        'TasaCambio',
        this._seguridadDatos.encrypt(this.tasaCambio)
      );
      resolve();
    });
  }

  ReenvioMethod(Minute: number, Seconds: number) {
    //Esto es el código para Reenvio
    var date = new Date();
    date.setMinutes(Minute);
    date.setSeconds(Seconds);
    // Función para rellenar con ceros
    var padLeft = (n: any) => '00'.substring(0, '00'.length - n.length) + n;
    // Asignar el intervalo a una variable para poder eliminar el intervale cuando llegue al limite
    this.SetInterval = setInterval(() => {
      this.ConcatenaTimer = ':';
      // Asignar el valor de minutos
      this.Minutes = padLeft(date.getMinutes() + '');
      // Asignqr el valor de segundos
      this.Second = padLeft(date.getSeconds() + '');
      // Restarle a la fecha actual 1000 milisegundos
      date = new Date(date.getTime() - 1000);

      // Si llega a 2:45, eliminar el intervalo
      if (this.Minutes == '00' && this.Second == '00') {
        this.Minutes = '';
        this.Second = '';
        this.ConcatenaTimer = '';
        clearInterval(this.SetInterval);
        this.PinEnviado = false;
      }
    }, 1000);
  }

  AuthCreditoReuso() {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: 'Clave de autorización',
        text: 'Enviado vía Correo y SMS',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: (resp) => {
          if (resp && resp.length === 6) {
            return this._Consultas
              .VerificarPin(String(this.dni?.value), resp)
              .then((resp: any) => {
                if (resp && !resp.status) {
                  Swal.showValidationMessage(`PIN incorrecto`);
                  ++this.PinError;
                  if (this.PinError === 3) {
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                } else if (resp && resp.status) {
                  return resp;
                } else {
                  Swal.showValidationMessage(
                    `Error al intentar enviar el PIN intente nuevamente`
                  );
                }
              })
              .catch((error: any) =>
                Swal.showValidationMessage(`Request failed: ${error}`)
              );
          } else {
            return Swal.showValidationMessage(
              `Longitud de pin es incorrecto deben ser 6 carácteres máximo`
            );
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(true);
        }
      });
    });
  }

  VerifyRefencia(NroRef?: any) {
    try {
      this.LoadingCheckReferencia = true;
      let Data = {
        Abonado: this.nroContrato?.value,
        Referencia: NroRef,
        Fecha: this.date?.value,
        Monto: this.amount?.value,
        BancoEmisor: this.BankUser?.value,
        BancoReceptor: this.BancoSelect,
      };
      this.registerPayService
        .ReferenciaMes(Data)
        .then((response: any) => {
          this.LoadingCheckReferencia = false;
          if (response && response.codigo === 1000) {
            this.secondFormFibex = this.fb.group({
              voucher: ['', [Validators.required]],
            });

            this.ExitRef = false;

            this.invalidForm(
              'Ya existe un pago registrado con la misma referencia y cuenta bancaria.'
            );
          } else {
            this.voucher?.setValue(NroRef);
            this.NextMatStepper();
          }
        })
        .catch((error: any) => {
          this.LoadingCheckReferencia = false;
          this.secondFormFibex = this.fb.group({
            voucher: ['', [Validators.required]],
          });

          this.ExitRef = false;

          this.invalidForm(
            'Error al intentar validar su referencia, por favor intente más tarde.'
          );
        });
      /*if (NroRef || this.voucher?.value) {
        // console.log("Pase1")
        this.registerPayService.ConsultarEstadoDeposito(this.nroContrato?.value, NroRef || this.voucher?.value).then((ResDeposito: any) => {
          console.log(ResDeposito)
          if (ResDeposito == undefined)   this.NextMatStepper()   // temporal porque esta fallando Jhonattan

          if ((ResDeposito && ResDeposito.success === "true") || ResDeposito.success === true) {

            this.secondFormFibex = this.fb.group({
              voucher: ['', [Validators.required]],
            });

            this.ExitRef = false

            this.invalidForm('Ya existe un pago registrado con la misma referencia y cuenta bancaria.');
          } else if ((ResDeposito && ResDeposito.success === "false") || ResDeposito.success === false) {
            this.voucher?.setValue(NroRef);
            this.NextMatStepper()
          }

        })

      } else {
        this.ExitRef = false
      }*/
    } catch (error) {
      console.error(error);
    }
  }

  NextMatStepper() {
    this.stepper.next();
  }

  private CloudNameComprobante: string = '';
  private CloudNameRetencion: string = '';



  private imageComprobanteURL: string | undefined;
  private imageRetencionURL: string | undefined;



  ScrollUp(Eventd?: any) {
    window.scroll(0, 0);
  }

  ResetForm() {
    this.nameClient = '';
    this.userGreeting = '';
    this.imageUrl = '';
    this.imageUploaded = false;
    this.DisableReg = false;
    this.cambio_act = 0;
    this.MyInit();
    this.ScrollUp();

    this.firstFormFibex.patchValue({
      name: '',
      dni: '',
      email: '',
      bank: '',
      nroContrato: '',
      date: '',
      amount: '',
    });
    Object.keys(this.firstFormFibex.controls).forEach((key) => {
      const control = this.firstFormFibex.controls[key];
      control.setErrors(null);
    });

  }

  ResetFormCD() {
    this.DebitoCredito.reset();
    this.PgMovilRegForm.reset();
    this.PgMovilBNCForm.reset();
    //this.firstFormFibex.reset();
    this.PgMovilForm.reset();
    this.PgMovilForm.get('tlfdestinReg')?.setValue('584129637516');
    this.PgMovilRegForm.get('tlforigin')?.setValue('584129637516');
    this.PgMovilRegForm.get('BankList')?.setValidators([]);
    this.ShowFormDebitoCredito = false;
    this.ShowFormDebitoCreditoBNC = false;
    this.ShowFormDebito100x100 = false;
    this.ReciboPay = false;
    this.ShowBankList = false;
    this.ShowFormDebito100x100 = false;
    this.ReciboPayBNC = false;
  }

  /**
   * Function to reset all
   */
  public resetAllForms = () => {
    try {
      // this.firstFormFibex.reset()
      this.firstFormFibex.get('dni')?.setValue('')
      this.handleShowTransactionModal(false)
      this.loginTypeSelectValue = 'V';
      this.userGreeting = '';
      this.userServices = [];
      this.showMainMenuPage2 = false;
      this.showDniForm = true;
      this.navActive = PAGES_NAVIGATION.LOGIN;
      this.AppFibex = false;
      this.lastDni = '';
      this.ScrollUp();
      this.showFormView = false;
      this.activeTransactionInputFocus = 'dni';
      this.handleShowFormView(false);
      this.isActiveLoginInput = false;
      this.showaBtnAdmin = true;
      this.showadmin = false;
      this.setMainTitle('');


    } catch (error) {
      console.error('Error resetting all forms:', error);
    }
  }

  // Contador() {
  //   this.Contar--;
  //   if (this.Contar <= 0) {
  //     window.location.reload(); // Para verificar porque no registra el pago
  //   } else {
  //     setTimeout(() => this.Contador(), 1000);
  //   }
  // }

  get disbaleButtonIfAmountIsInvalid(): boolean {
    return parseFloat(this.firstFormFibex.get('amount')?.value) < 0;
  }

  get disbaleButtonIfAmountIs0(): boolean {
    if (this.firstFormFibex.get('amount')?.value) {
      return this.firstFormFibex.get('amount')?.value.length === 0;
    } else {
      return false;
    }
  }

  get disbaleButtonIfDateIsInvalid(): boolean {
    return this.dateInvalid;
  }

  get disableBtnAmountInvalid(): boolean {
    return this.invalidAmount;
  }

  searchServicesv2(dni: any, fromParmas?: boolean, NextContrato?: boolean) {
    return new Promise<void>((resolve, reject) => {
      console.log('in searchServicesv2 function')

      //agreago por juan
      this.BankSelectPagoMovil = false;
      this.ShowalertBankNationals = false;
      this.ShowOptionPagoMovil = false;
      //

      this.possibleWithholdingAgent = false;
      this.selectedRetentionOption = null;
      let dni_: string = '';

      if (!fromParmas) {
        dni_ = dni.value;
      } else if (fromParmas) {
        dni_ = dni;
      }

      if (dni_) {
        dni_ = this.ClearCedula(dni_);
      }

      this.banksFiltered = [...this.bankList];
      /* if (dni_ === this.lastDni) {
        return reject();
      } */

      this.dniConsulted = false;
      if (dni_.length >= 6) {
        this.alertFindDniMercantil(
          'Buscando información del cliente',
          'Por favor espere...'
        );
        //Busco el tipo de cliente
        this.registerPayService.getTypeClient(dni_).then((result: any) => {
          if (result.length > 0 && result[0].TipoCliente != 'NATURAL') {
            this.possibleWithholdingAgent = true;
          }
        });

        //Busco por su Cédula
        //this.SearchDataClient(dni_)
        this.registerPayService.getSaldoByDni(dni_).then((res: IUserSaldo[]) => {
          console.log('RES USER 2', res)
          this.lastDni = dni_;
          this.closeAlert();

          try {
            if (
              res.length > 0 ||
              this.registerPayService.linkedToContractProcess === 'approved'
            ) {
              this.listContratos = [];
              this.userSelectList = [];
              this.ComprobantesPago = [];
              this.SendOption(0, 0, dni_);
              if (this.registerPayService.linkedToContractProcess != 'approved') {
                //Valido los estatus de los contratos
                res.forEach((dataContrato: IUserSaldo, index: number) => {
                  let isValid: boolean = this.ValidStatusContrato(
                    dataContrato.status_contrato
                  );

                  this.userSelectList.push({
                    ...dataContrato,
                    is_user_valid: isValid,
                    saldo: (parseFloat(dataContrato.saldo) > 0) ? parseFloat(dataContrato.saldo) : Math.abs(parseFloat(dataContrato.saldo)),
                    status_contrato: dataContrato.status_contrato.toLowerCase(),
                    isDebtor: (parseFloat(dataContrato.saldo) > 0)
                  });

                  if (isValid) {
                    this.listContratos.push({
                      id_contrato: dataContrato.id_contrato,
                      contrato: dataContrato.nro_contrato,
                      saldo: dataContrato.saldo,
                      cliente: dataContrato.cliente,
                      monto_pend_conciliar: dataContrato.monto_pend_conciliar,
                      subscription: dataContrato.suscripcion,
                      franquicia: dataContrato.franquicia,
                      status_contrato: dataContrato.status_contrato,
                    });
                    this.cambio_act = parseFloat(dataContrato.cambio_act);
                  }
                  if (dataContrato.franquicia.includes('FIBEX ARAGUA')) {
                    this.paymentMethod = 'aragua';
                  }
                  if (index == res.length - 1 && this.paymentMethod != 'aragua') {
                    this.AppFibex = true;
                    this.showDniForm = false;

                    console.log('userSelectList', this.userSelectList)
                    if (this.userSelectList.length === 1) {
                      this.showMainMenuPage2 = true
                      this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS
                    }
                    else {
                      this.navActive = PAGES_NAVIGATION.USER_LIST_SELECT;
                      this.setMainTitle('Seleccione una cuenta para continuar')
                    }

                    console.warn('HACE RESOLVEE 1')
                    resolve()
                  }
                });

                if (this.listContratos.length == 0) {
                  this.invalidForm(
                    'Todos los contratos para esta cuenta están ANULADOS o RETIRADO!'
                  );
                  this.lastDni = '';
                  return reject();
                }

                //Esto solo va aplicar cuando solo sea un abonado para que la pantalla pase automática
                if (NextContrato) {
                  if (this.listContratos.length == 1) {
                    console.log('this.listContratos.length == 1')
                    // console.log('Ingrese')
                    if (Number(this.listContratos[0].subscription) > 0) {
                      //   console.log('acaaa')
                      //! to validate franchise
                      this.abonado = this.listContratos[0].contrato;
                      if (
                        this.listContratos[0].franquicia.includes('FIBEX ARAGUA')
                      )
                        this.paymentMethod = 'aragua';
                      //this.DataPagoMovilPublic.push(parseFloat(this.registerPayService.amountCustomerContract).toFixed(2))
                      this.AppFibex = true;
                      this.showMainMenuPage2 = true;
                      this.showDniForm = false;
                      // this.navActive = PAGES_NAVIGATION.MAIN_MENU;
                      console.warn('GO TO PAYMENT_CARD 2')
                      this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS;
                      console.warn('HACE RESOLVEEE 2')
                      resolve()

                      /*  setTimeout(() => {
                         this.NextMatStepper();
                       }, 300); */
                    } else {
                      //console.log('Estoy aca');
                      this.invalidForm('Esta cuenta es exonerada');
                      /* this.lastDni = '';
                      this.AppFibex = false;
                      this.showMainMenuPage2 = false;
                      this.navActive = PAGES_NAVIGATION.LOGIN;
                      return reject(); */
                    }
                  } else {
                    console.log('PAsar por la funcion SearchSectorAbonado')

                    this.SearchSectorAbonado();
                  }
                }
              } else {
                this.dni?.setValue(dni_);
                this.nameClient = String(dni_);
                this.setGreeting(this.nameClient)
                this.name?.setValue(String(dni_));
                this.cambio_act = Number(this.tasaCambio);
              }

              /* EMITIR TASA DEL DÍA */
              if (this.registerPayService.linkedToContractProcess != 'approved') {
                this.tasaService.tasa.next(this.cambio_act.toString());
                this.tasaCambio = this.cambio_act.toString();

                if (this.listContratos.length === 0) {
                  this.dni?.setValue('');
                  return reject();
                }

                this.closeAlert2();
                this.readonlyDNI = true;
                this.idContrato = this.listContratos[0].id_contrato;
                this.nroContrato?.setValue(this.listContratos[0].contrato);
                this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
                this.nameClient = this.listContratos[0].cliente;
                console.error('ERROR NO PASA POR AQUI')
                console.log('EL DNI MENORRR', this.subscription);

                this.setGreeting(this.nameClient)
                this.name?.setValue(res[0].cliente);
                this.nroContrato?.setValue(this.listContratos[0].contrato);
                this.SendOption(0, 3, this.listContratos[0].contrato);
                this.monto_pend_conciliar =
                  this.listContratos[0].monto_pend_conciliar;
                // this.filterBankByFranquicia(this.listContratos[0].franquicia);
                this.dni?.setValue(dni_);
                this.searchInfoEquipos(dni_)
                  .then((result) => { })
                  .catch((err) => {
                    console.log('falló el ingreso de datos del usuario');
                    reject()
                  });
              }

              if (this.registerPayService.linkedToContractProcess != 'approved') {
                //Busco su numeros de comprobantes
                this.registerPayService
                  .getComprobantClient2(dni_)
                  .then((comprobante: any) => {
                    if (comprobante.length > 0) {
                      //Voy a mostrar los últimos 5 comprobante voy a ordenarlo por fecha
                      this.AllComprobantesPago = comprobante;

                      let temp = comprobante
                        .slice()
                        .sort(
                          (a: any, b: any) =>
                            b.Fecha.getTime() - a.Fecha.getTime()
                        );
                      temp = temp.slice(0, 5);
                      console.log(' pasa por ValidateReferenciaLast')
                      this.ValidateReferenciaLast(temp);
                    }
                  })
                  .catch((error: any) => console.error(error));
              }

              this.setActiveContrato(this.listContratos[0])

              if (this.listContratos.length === 1) {
                this.listContratos.find((cliente) => {
                  this.verifySaldo(cliente.saldo);
                });
              }
            } else {
              //this.hcaptcha.reset()
              this.nameClient = '';
              this.userGreeting = '';
              this.saldoUSD = '';
              this.saldoBs = '';
              this.lastAmount = '';
              this.dniConsulted = true;
              this.patchValueAllForm();
              this.invalidForm('Debe colocar una cédula válida');
              //this.verifyDNI = false;
              this.lastDni = '';
              const timeoutId = setTimeout(() => this.closeAlert(), 1000);
      this.timeoutIds.push(timeoutId);
              this.banksFiltered = [...this.bankList];
              this.listContratos = [];
              this.userSelectList = []
              this.banksFiltered = [...this.bankList];
              reject()
            }
          } catch (error) {
            console.error('ERROR EN EL TRY CATCH DE searchServicesv2', error)
            if (this.registerPayService.linkedToContractProcess == 'approved') {
              this.tasaService.getSaldoBCV().subscribe((res) => {
                this.tasaCambio = res;
              });
              this.closeAlert2();
              this.listContratos = [];
              this.userSelectList = []
              this.ComprobantesPago = [];
              //this.verifyDNI = true;
              this.SendOption(0, 0, dni_);

              this.dni?.setValue(dni_);
              // this.searchInfoEquipos(dni_);
              console.log('EL DNI MENORRR', dni_);

              this.nameClient = String(dni_);
              this.setGreeting(this.nameClient)
              this.name?.setValue(String(dni_));
              this.cambio_act = parseFloat(this.tasaCambio);
              this.AppFibex = true;
              this.showMainMenuPage2 = true;
              this.showDniForm = false;
              // this.navActive = PAGES_NAVIGATION.MAIN_MENU;
              console.warn('GO TO PAYMENT_CARD 3')
              this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS;
              console.warn('HACE RESOLVEEE 3')
              resolve()

              /*Esto se hacer por si el usuario preciomente selecciona un banco */
              if (this.BancoNacional(this.banco)) {
                if (
                  !Number.isNaN(
                    parseFloat(this.registerPayService.amountCustomerContract)
                  )
                ) {
                  // this.registerPayService.amountCustomerContract
                  this.validateIfAmountIsNegativer(
                    this.registerPayService.amountCustomerContract,
                    true
                  );
                  this.lastAmount = parseFloat(
                    this.registerPayService.amountCustomerContract
                  ).toFixed(2);
                  this.saldoUSD = (
                    parseFloat(this.registerPayService.amountCustomerContract) /
                    this.cambio_act
                  ).toFixed(2);
                  this.saldoBs = parseFloat(
                    this.registerPayService.amountCustomerContract
                  ).toFixed(2);
                  this.subscription = parseFloat('No aplica').toFixed(2);
                } else {
                  this.amount?.setValue(0);
                  this.lastAmount = '0';
                }
              } else {
                //this.validateIfAmountIsNegativer(this.listContratos[0].saldo);
                this.lastAmount = parseFloat(
                  this.registerPayService.amountCustomerContract
                ).toFixed(2);
                this.saldoUSD = (
                  parseFloat(this.registerPayService.amountCustomerContract) /
                  this.cambio_act
                ).toFixed(2);
                this.saldoBs = parseFloat(
                  this.registerPayService.amountCustomerContract
                ).toFixed(2);
                this.subscription = parseFloat('No aplica').toFixed(2);
              }
              if (NextContrato) {
                this.AppFibex = true;
                this.showMainMenuPage2 = true
                this.showDniForm = false;
                // this.navActive = PAGES_NAVIGATION.MAIN_MENU;
                console.warn('GO TO PAYMENT_CARD 4')
                this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS;
                console.warn('HACE RESOLVEEE 4')
                resolve()
                /*  setTimeout(() => {
                   this.NextMatStepper();
                 }, 300); */
              }
            } else {
              this.nameClient = '';
              this.userGreeting = '';
              this.saldoUSD = '';
              this.saldoBs = '';
              this.dniConsulted = true;
              this.lastDni = '';
              this.name?.setValue('');
              this.alertFindDni('Disculpe intente de nuevo', '');
              const timeoutId = setTimeout(() => this.closeAlert(), 1000);
      this.timeoutIds.push(timeoutId);
              reject()
            }
          }
        });
      } else {
        // Esto lo hago porque el cliente ente busca una cedula valida y luego coloca una invalida
        // Se quedan los valores anteriores de la consulta anterior
        //this.hcaptcha.reset()
        this.dni?.setValue('');
        this.nameClient = '';
        this.userGreeting = '';
        this.saldoUSD = '';
        this.saldoBs = '';
        this.dniConsulted = true;
        this.lastDni = '';
        this.name?.setValue('');
        this.invalidForm('La cédula debe ser mínimo 6 carácteres', '');
        const timeoutId = setTimeout(() => this.closeAlert(), 1000);
      this.timeoutIds.push(timeoutId);
        reject()
      }
    })

  }

  SearchSectorAbonado() {
    this.LoadingLengthAbonado = true;
    let Value: any = '';
    this.listContratos.forEach((element: any, index: number) => {
      Object.entries(element).forEach(([key, value]) => {
        if (key == 'contrato' && index < this.listContratos.length - 1) {
          Value += `'${value}',`;
        } else if (key == 'contrato') {
          Value += `'${value}'`;
        }
      });
    });

    this.registerPayService
      .AbonadoSearchSector(Value)
      .then((resp: any) => {
        this.LoadingLengthAbonado = false;
        if (resp && resp.codigo == 1010) {
          let SectorAbonado: any[] = JSON.parse(resp.data);
          SectorAbonado.forEach((element: any) => {
            let index = this.listContratos.findIndex(
              (data: any) => data.contrato == element.nro_contrato
            );
            if (index != -1) {
              this.listContratos[index].sector = element.sector;
            }
          });
        }
      })
      .catch((error: any) => {
        this.LoadingLengthAbonado = false;
        console.error(error);
      });
  }

  ValidStatusContrato(Status: string) {
    var ContratosAccept = [
      'ACTIVO',
      'POR CORTAR',
      'POR INSTALAR',
      'CORTADO',
      'SUSPENDIDO',
    ];
    return ContratosAccept.includes(Status);
  }

  ValidateLastReferencia(NroRef: any) {
    //Elimino todos los ceros a la izquierda
    NroRef = NroRef.replace(/^(0+)/g, '');
    //Busco en mi memoria de comprobante luego llamo al de API por si acaso
    const INDEX = this.AllComprobantesPago.findIndex(
      (value: any) => value.Referencia == NroRef
    );
    // ValidateLastReferencia(NroRef: any) {
    //   //Busco en mi memoria de comprobante luego llamo al de API por si acaso
    //   const INDEX = this.AllComprobantesPago.findIndex((value: any) => value.Referencia == NroRef)

    if (INDEX != -1) {
      this.secondFormFibex = this.fb.group({
        voucher: ['', [Validators.required]],
      });
      this.invalidForm(
        'Ya existe un pago registrado con la misma referencia y cuenta bancaria.'
      );
    } else {
      this.VerifyRefencia(NroRef);
    }
  }

  async ValidateReferenciaLast(Data: any) {
    try {
      // Procesar todas las consultas en paralelo para mejor rendimiento
      const promises = Data.map((element: any) => 
        this.registerPayService
          .ConsultarEstadoDeposito(this.nroContrato?.value, element.Referencia)
          .then((ResDeposito: any) => {
            if (ResDeposito.success === 'true' || ResDeposito.success === true) {
              element.Status = ResDeposito.data[0].estatus_deposito;
            } else if (
              ResDeposito.success === 'false' ||
              ResDeposito.success === false
            ) {
              element.Status = 'SIN PROCESAR';
            }
            return element;
          })
          .catch(() => {
            element.Status = 'SIN PROCESAR';
            return element;
          })
      );
      
      // Esperar a que todas las promesas se resuelvan
      this.ComprobantesPago = await Promise.all(promises);
    } catch (error) {
      console.error('Error en ValidateReferenciaLast:', error);
      this.ComprobantesPago = Data;
    }
  }

  SearchServiceClient(Contrato: any) {
    try {
      this.AllService = [];
      this.registerPayService.GetListService(Contrato).then(
        (ResService: any) => {
          if (ResService.length > 0) {
            for (let index = 0; index < ResService.length; index++) {
              this.AllService.push(
                ResService[index].nombre_servicio
                  .replace('FIBEX EXP', 'Fibex Express')
                  .replace('_', ' ')
              );
            }
            this.userServices = [
              ...this.AllService,
              ...this.AllService,
              ...this.AllService
            ]
            console.log('this.userServices', this.userServices)
            this.paquete = this.AllService;
            localStorage.setItem(
              'Service',
              this._seguridadDatos.encrypt(JSON.stringify(this.paquete))
            );
          } else {
            this.selectInfoEquipos(Contrato);
          }
        },
        (err) => {
          this.selectInfoEquipos(Contrato);
          console.error(err);
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  searchInfoEquipos(dni: string) {
    return new Promise<void>((resolve, reject) => {
      this.paquetesContratos = [];
      // console.log(dni);
      this.registerPayService.infoEquiposClientes(dni).then((res: any) => {
        // console.log(res);
        this.paquetesContratos = res.map((infoPaquete: any) => {
          return {
            id_contrato: infoPaquete.id_contrato,
            paquete: infoPaquete.paquetes,
          };
        });
        if (this.paquetesContratos.length === 0) {
          // this.paquete = '';
          this.SearchServiceClient(this.idContrato);
          return;
        }
        this.SearchServiceClient(this.paquetesContratos[0].id_contrato);
      });
      resolve();
    });
  }

  selectInfoEquipos(id_contrato: string) {
    this.paquete = '';
    let paquete = this.paquetesContratos.find((index) => {
      return index.id_contrato === id_contrato;
    })?.paquete;
    if (paquete !== undefined) {
      this.paquete = paquete;
    }
  }

  contractSelected(
    contrato: {
      contrato: string;
      saldo: string;
      id_contrato: string;
      subscription: string;
      franquicia: string;
    },
    ppal?: boolean
  ) {
    this.BackFormaPago = false;
    this.PagoMetodosHTML2 = FormasDePago;
    //! to validate franchise
    if (contrato.franquicia.includes('FIBEX ARAGUA'))
      this.paymentMethod = 'aragua';

    this.lastAmount = parseFloat(contrato.saldo).toFixed(2);
    this.verifySaldo(contrato.saldo);
    this.saldoUSD = parseFloat(contrato.saldo).toFixed(2);
    this.saldoBs = (parseFloat(contrato.saldo) * this.cambio_act).toFixed(2);
    //this.DataPagoMovilPublic.length>3 ? this.DataPagoMovilPublic.pop() : this.DataPagoMovilPublic.push(this.saldoBs)
    this.idContrato = contrato.id_contrato;
    this.subscription = parseFloat(contrato.subscription).toFixed(2);
    this.nroContrato?.setValue(contrato.contrato);
    this.SearchServiceClient(this.idContrato);
    this.abonado = this.nroContrato?.value;
    this.validateIfAmountIsNegativer(contrato.saldo, true);
    this.checkLocalStorageData();
    //console.log(this.subscription)
    console.log(ppal);
    console.log(Number(this.subscription));
    if (ppal && Number(this.subscription) > 0) {
      this.AppFibex = true;
      this.showMainMenuPage2 = true;
      this.showDniForm = false;
      // this.navActive = PAGES_NAVIGATION.MAIN_MENU;
      console.warn('GO TO PAYMENT_CARD 5')
      this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS;

      //Para lograr un efecto de transición
      /*  setTimeout(() => {
         this.NextMatStepper();
       }, 300); */
    } else {
      console.log('Pase por aqui2');
      this.invalidForm('Esta cuenta es exonerada');
      this.lastDni = '';
      //this.AppFibex = false;
    }
  }

  BancoNacional(StrBanco: string) {
    if (
      this.bank?.value.includes('USD') ||
      this.bank?.value.includes('ZELLE') ||
      this.bank?.value.includes('EUR') ||
      this.bank?.value.includes('PAYPAL') ||
      this.bank?.value.includes('STRIPE') ||
      this.bank?.value.includes('BOFA')
    ) {
      this.secondFormFibex.get('BancoEmisor')?.setValidators([]);
      this.secondFormFibex.get('BancoEmisor')?.updateValueAndValidity();
      if (this.bank?.value.includes('EUR')) return 'EUR';
      else return false;
    } else {
      this.secondFormFibex
        .get('BancoEmisor')
        ?.setValidators([Validators.required]);
      this.secondFormFibex.get('BancoEmisor')?.updateValueAndValidity();
      return true;
    }
  }

  alertFindDni(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      timer: 5000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  alertFindDniMercantil(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      //timer: 5000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }


  alertDniAmount(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      icon: 'success',
      timer: 5000,
    });
  }

  invalidForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'error',
    });
  }


  warnignForm(text: string, html: string, next: number, use?: boolean) {
    Swal.fire({
      title: text,
      html: html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00184E',
      cancelButtonColor: '#f44336',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
    }).then((result) => {
      if (result.isConfirmed && !use) {
        if (
          !this.disbaleButtonIfAmountIsInvalid &&
          !this.disbaleButtonIfAmountIs0 &&
          this.firstFormFibex.valid &&
          !this.disbaleButtonIfDateIsInvalid &&
          !this.invalidAmount
        ) {
          this.NextMatStepper();
        }
      }
    });
  }

  closeAlert() {
    setTimeout(() => {
      Swal.close();
    }, 2500);
  }

  closeAlert2() {
    Swal.close();
  }

  verifySaldo(saldo: string) {
    if (parseFloat(saldo) <= 0) {
      this.alertDniAmount(
        'Usted no posee deuda pendiente',
        'Tiene un saldo a favor de: ' +
        (parseFloat(saldo) * -1).toFixed(2) +
        ' REGISTRO PAGO ADELANTADO'
      );
      setTimeout(() => { }, 1500);
    }
  }

  validateIfAmountIsNegativer(amount: string, national?: boolean) {
    let saldoUSD = parseFloat(amount).toFixed(2);
    if (national) {
      if (Number(saldoUSD) <= 0) {
        this.amount?.setValue('');
        this.saldoText = 'SALDO A FAVOR';
        localStorage.setItem(
          'Saldo',
          this._seguridadDatos.encrypt(this.saldoText)
        );
      } else if (Number(saldoUSD) > 0) {
        this.saldoText = 'SALDO';
        localStorage.setItem(
          'Saldo',
          this._seguridadDatos.encrypt(this.saldoText)
        );
        this.amount?.setValue('');
        this.SendOption(0, 4, this.amount?.value);
      }
      return;
    }

    if (Number(saldoUSD) <= 0) {
      this.amount?.setValue('');
      this.saldoText = 'SALDO A FAVOR';
      localStorage.setItem(
        'Saldo',
        this._seguridadDatos.encrypt(this.saldoText)
      );
    } else if (Number(saldoUSD) > 0) {
      this.saldoText = 'SALDO';
      localStorage.setItem(
        'Saldo',
        this._seguridadDatos.encrypt(this.saldoText)
      );
      this.amount?.setValue('');
    }
  }

  resetStepper() {
    this.stepper.selectedIndex = 0;
  }

  nextStep(verifyAmount?: boolean) {
    if (this.nroContrato?.value.length === 0) {
      this.invalidForm('Debes seleccionar un contrato para avanzar', '');
      return;
    }
    if (verifyAmount) {
      if (!this.BancoNacional('')) {
        if (Number(this.amount?.value) > Number(this.saldoUSD)) {
          this.warnignForm(
            'Esta apunto de reportar un saldo mayor a su deuda pendiente',
            '¿Está seguro que sea continuar?',
            0
          );
          return;
        }
      } else {
        if (Number(this.amount?.value) > Number(this.saldoBs)) {
          this.warnignForm(
            'Esta apunto de reportar un saldo mayor a su deuda pendiente',
            '¿Está seguro que sea continuar?',
            0
          );
          return;
        }
      }
    }
    this.totalAmount = Number(this.amount?.value);
    this.NextMatStepper();
  }


  patchValueAllForm() {
    this.firstFormFibex.patchValue({
      name: '',
      dni: '',
      email: '',
      bank: '',
      nroContrato: '',
      date: '',
      amount: '',
    });
    this.secondFormFibex.patchValue({
      voucher: '',
      nameTitular: '',
      dniTitular: '',
      emailTitular: '',
      BancoEmisor: '',
    });
    this.thirdFormFibex.patchValue({
      img: '',
      note: '',
    });
    this.fourthFormFibex.patchValue({
      retentionImg: '',
      retentionAmount: '',
    });
  }



  public openInfoPay(): void {
    try {
      this.closeAlert();
      this.registerPayService
        .StatusPayAbonadoTeen(this.nroContrato?.value)
        .then((response: any) => {
          this.showStateTable = true;
          this.stateTableData = response.data.length
            ? JSON.parse(response.data)
            : [];
          console.log('SHOW TABLE VALUE DATA', this.stateTableData, this.showStateTable)
        });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Function to handle input from the virtual keyboard
   * @param value - The value to be added to the input
   */

  public onTecladoInput(value: string): void {
    // this.inputValue += value; // Agregar el valor recibido al input
    let dniFormValue = this.firstFormFibex.get('dni')?.value

    if (typeof dniFormValue === 'string' && (this.loginTypeSelectValue === 'V' && dniFormValue.length < 8 || (['E', 'J',].includes(this.loginTypeSelectValue)) && dniFormValue.length < 15)) this.firstFormFibex.get('dni')?.setValue(dniFormValue += value);
  }

  // Función para eliminar el último carácter
  deleteLastCharacter(): void {
    let dniFormValue = this.firstFormFibex.get('dni')?.value
    this.firstFormFibex.get('dni')?.setValue(dniFormValue.slice(0, -1));
    // this.inputValue = this.inputValue.slice(0, -1); // Eliminar el último carácter
  }

  /**
   * Function to change the DNI type in the form
   * @param value
  */
  public onLoginTypeChange = (value: ITypeDNI): void => {
    this.loginTypeSelectValue = value;
    if (value === 'V') {
      const formValue = this.firstFormFibex.get('dni')?.value;
      this.firstFormFibex.get('dni')?.setValue(formValue.slice(0, 8))
    }
  }

  /**
   * Function to set the initial client greeting
   */
  public setGreeting = (nameClient: string): string => {
    console.log('nameClient', this.nroContrato?.value);

    return this.userGreeting = 'Hola, ' + this.getShortName(nameClient.toLowerCase());
  }


  /**
   * Function to go steb back
   */
  public goStepBack = () => {
    // Definir títulos para cada paso
    const STEP_TITLES: Partial<Record<PAGES_NAVIGATION, string>> = {
      [PAGES_NAVIGATION.LOGIN]: '',
      [PAGES_NAVIGATION.USER_LIST_SELECT]: 'Seleccionar Usuario',
      [PAGES_NAVIGATION.PAYMENT_CARDS]: 'Tarjetas de Pago',
      [PAGES_NAVIGATION.PAYMENT_FORMS]: 'Formulario de Pago'
    };

    // Función para actualizar el título basado en el paso
    const updateTitleForStep = (step: PAGES_NAVIGATION) => {
      const title = STEP_TITLES[step] || '';
      this.setMainTitle(title);
      // O si tienes una función titleFn específica:
      // this.titleFn(title);
    };

    const goToLoginFn = () => {
      this.firstFormFibex.get('dni')?.setValue('');
      this.ResetForm();
      this.loginTypeSelectValue = 'V';
      this.listContratos = [];
      this.userSelectList = [];
      this.LoadingLengthAbonado = false;
      this.showMainMenuPage2 = false;
      this.showDniForm = true;
      this.navActive = PAGES_NAVIGATION.LOGIN;
      this.showaBtnAdmin = true;
      this.showadmin = false;

      // Actualizar título para LOGIN
      updateTitleForStep(PAGES_NAVIGATION.LOGIN);
    };

    const HANDLE_NAV_FN: Partial<IHandlerNav> = {
      [PAGES_NAVIGATION.USER_LIST_SELECT]: () => {
        goToLoginFn();
      },

      [PAGES_NAVIGATION.PAYMENT_CARDS]: () => {
        if (this.userSelectList.length > 1) {
          this.navActive = PAGES_NAVIGATION.USER_LIST_SELECT;
          this.showadmin = false;

          // Actualizar título para USER_LIST_SELECT
          updateTitleForStep(PAGES_NAVIGATION.USER_LIST_SELECT);
        } else {
          goToLoginFn();
        }
      },

      [PAGES_NAVIGATION.PAYMENT_FORMS]: () => {
        this.ResetFormCD();
        this.ScrollUp();
        this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS;

        // Actualizar título para PAYMENT_CARDS
        updateTitleForStep(PAGES_NAVIGATION.PAYMENT_CARDS);
      }
    };

    const handleStepFn: (() => void) | undefined = HANDLE_NAV_FN[this.navActive];

    if (handleStepFn !== undefined) {
      handleStepFn();
    }
  };

  // Método adicional para navegar hacia adelante con títulos
  public goStepForward = (nextStep: PAGES_NAVIGATION) => {
    const STEP_TITLES: Partial<Record<PAGES_NAVIGATION, string>> = {
      [PAGES_NAVIGATION.LOGIN]: 'Iniciar Sesión',
      [PAGES_NAVIGATION.USER_LIST_SELECT]: 'Seleccionar Usuario',
      [PAGES_NAVIGATION.PAYMENT_CARDS]: 'Tarjetas de Pago',
      [PAGES_NAVIGATION.PAYMENT_FORMS]: 'Formulario de Pago'
    };

    this.navActive = nextStep;
    const title = STEP_TITLES[nextStep] || '';
    this.setMainTitle(title);
  };

  // Método helper para obtener el título del paso actual
  public getCurrentStepTitle = (): string => {
    const STEP_TITLES: Partial<Record<PAGES_NAVIGATION, string>> = {
      [PAGES_NAVIGATION.LOGIN]: 'Iniciar Sesión',
      [PAGES_NAVIGATION.USER_LIST_SELECT]: 'Seleccionar Usuario',
      [PAGES_NAVIGATION.PAYMENT_CARDS]: 'Tarjetas de Pago',
      [PAGES_NAVIGATION.PAYMENT_FORMS]: 'Formulario de Pago'
    };

    return STEP_TITLES[this.navActive] || '';
  };

  /**
   * Function to check for lastest payments
   */
  public checkLatestPayments = async () => {
    try {
      this.nroContrato?.setValue('')

      let dni_: string = this.dni?.value;

      if (dni_) dni_ = this.ClearCedula(dni_);

      this.banksFiltered = [...this.bankList];

      // if (dni_ === this.lastDni) return;

      this.dniConsulted = false;
      if (dni_.length <= 6) {

        this.dni?.setValue('');
        this.nameClient = '';
        this.userGreeting = '';
        this.saldoUSD = '';
        this.saldoBs = '';
        this.dniConsulted = true;
        this.lastDni = '';
        this.name?.setValue('');
        this.invalidForm('La cédula debe ser mínimo 6 carácteres', '');
        const timeoutId = setTimeout(() => this.closeAlert(), 1000);
      this.timeoutIds.push(timeoutId);
        return
      }

      this.alertFindDniMercantil(
        'Buscando información del cliente',
        'Por favor espere...'
      );

      //Busco por su Cédula
      const dniUserResult: IAccount[] = await this.registerPayService.getSaldoByDni(dni_) as IAccount[]
      console.log('dniUserREsult', dniUserResult)
      this.lastDni = dni_;
      // this.closeAlert();

      if (dniUserResult.length === 0) {
        this.nameClient = '';
        this.userGreeting = '';
        this.saldoUSD = '';
        this.saldoBs = '';
        this.lastAmount = '';
        this.dniConsulted = true;
        this.patchValueAllForm();
        this.invalidForm('Debe colocar una cédula válida');
        this.lastDni = '';
        this.closeAlert()
        // setTimeout(() => , 1000);
        this.banksFiltered = [...this.bankList];
        this.listContratos = [];
        this.userSelectList = []
        this.banksFiltered = [...this.bankList];
        return
      }

      this.listContratos = [];
      this.userSelectList = []
      this.ComprobantesPago = [];

      if (this.registerPayService.linkedToContractProcess != 'approved') {
        //Valido los estatus de los contratos
        dniUserResult.forEach((dataContrato: any, index: number) => {
          var isValid = this.ValidStatusContrato(dataContrato.status_contrato);

          if (isValid) {
            this.listContratos.push({
              id_contrato: dataContrato.id_contrato,
              contrato: dataContrato.nro_contrato,
              saldo: dataContrato.saldo,
              cliente: dataContrato.cliente,
              monto_pend_conciliar: dataContrato.monto_pend_conciliar,
              subscription: dataContrato.suscripcion,
              franquicia: dataContrato.franquicia,
              status_contrato: dataContrato.status_contrato,
            });
            this.cambio_act = dataContrato.cambio_act;
          }

          if (dataContrato.franquicia.includes('FIBEX ARAGUA')) this.paymentMethod = 'aragua';

        });

        /** When the user has all the accounts with invalid status */
        if (this.listContratos.length == 0) {
          this.invalidForm('Todos los contratos para esta cuenta están ANULADOS o RETIRADO!');
          this.lastDni = '';
          return;
        }

        if (this.listContratos.length == 1) { //* When is 1 account

          if (Number(this.listContratos[0].subscription) > 0) {//* when the account is valid status
            this.idContrato = this.listContratos[0].id_contrato;
            this.nameClient = this.listContratos[0].cliente;
            this.name?.setValue(dniUserResult[0].cliente);
            this.nroContrato?.setValue(this.listContratos[0].contrato);
            this.saldoUser = this.listContratos[0].saldo;
            this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
            console.log('this.monto_pend_conciliar', this.listContratos[0]);

            /* this.navActive = PAGES_NAVIGATION.MAIN_MENU; */

          } else { //* Cuando la cuenta esta exonerada
            this.invalidForm('Esta cuenta es exonerada');
            this.lastDni = '';
            this.AppFibex = false;
            this.showMainMenuPage2 = false;
            this.navActive = PAGES_NAVIGATION.LOGIN;
            return;
          }

        } else if (this.listContratos.length > 1) return this.SearchSectorAbonado();//* When is more than 1 account

        this.dni?.setValue('');

        /* this.dni?.setValue(dni_); */
      }

      if (this.nroContrato?.value.length) {
        this.tasaService.getTasaSae().then((tasaSae) => {
          console.log('TASA SAEEEE', tasaSae.precio * parseFloat(this.saldoUser),);
          const saldoUserBs = tasaSae.precio * parseFloat(this.saldoUser);
          this.saldoMounted = Number(saldoUserBs.toFixed(2))
          console.log('SALDO ABSOLUTO>>>>>>>>', Math.abs(this.saldoMounted));

        });

        this.openInfoPay()
      }

    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function to go to payment cards
   */
  public goToPayment = async () => {
    try {
      await this.searchServicesv2(this.dni, false, true).then(() => { this.showAdminist(this.dni?.value) }) //* => to login
      console.log('CONTRATO => ', this.nroContrato, this.userGreeting)
      this.loadInitMonthMountValues()
      this.FormaPago(30) //* => go To payment cards
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function to handle the transaction modal visibility
   * @param visibility value
   */
  public handleShowTransactionModal = (valueShow: boolean) => {
    this.showAnulationModal ? this.showAnulationModal = valueShow : this.showTransactionModal = valueShow
    // this.showTransactionModal = valueShow
    this.showadmin = false;
  }

  public loadInitMonthMountValues = () => {
    const subscription: number = Number(this.subscription)
    let saldoUSD: number = Number(this.saldoUSD)
    console.log('SALDOOOO>>>>>>>>>>>>>', parseFloat((parseFloat(this.mountTotalMonthUSD) * this.cambio_act).toFixed(2)).toFixed(2));


    this.monthPayCount = Math.round(saldoUSD / subscription)
    console.log('SUBSCRIPTION', this.cambio_act, this.saldoBs, parseFloat(this.saldoBs))
    this.mountTotalMonthUSD = saldoUSD > 0 ? parseFloat(this.saldoUSD).toFixed(2) : parseFloat(subscription.toFixed(2)).toFixed(2)
    this.mountTotalMonthBs = saldoUSD > 0 ? parseFloat(this.saldoBs).toFixed(2) : parseFloat((parseFloat(this.mountTotalMonthUSD) * this.cambio_act).toFixed(2)).toFixed(2)
  }


  public mountsToPaymentBs(moutnBs: string) {
    this.mountTotalMonthBs = parseFloat(moutnBs).toFixed(2);
  }

  public mountsToPaymentUSD(mountUSD: string) {
    this.mountTotalMonthUSD = parseFloat(mountUSD).toFixed(2);
  }

  public handleShowFormView = (showValue: boolean) => {
    this.showFormView = showValue;
    if (showValue) {
      this.startInactivityTimer();

      const formComponent = document.getElementsByTagName('app-form')[0]
      formComponent?.classList.add('m-auto')
    } else {
      this.stopInactivityTimer();
    }
  }

  /**
   * Escucha el evento para resetear al welcome-view cuando se oculta el carrusel
   */
  private setupResetToWelcomeListener(): void {
    document.addEventListener('resetToWelcome', (event: Event) => {
      this.showFormView = false;
      console.log('Reseteado al welcome-view desde carrusel');
    });
  }

  public onEditAmountClick = () => {
    console.log('SELECTED PAYMENT TYPE', this.selectedPaymentType)
    this.activeTransactionInputFocus = 'mount';
    this.handleShowTransactionModal(true)
  }

  /**
   * Function to get the short names
   * @param allNames All names (first and second name)
   * @returns just the short name
   */
  private getShortName(allNames: string) {
    const nombres = allNames.split(' ');
    return (nombres.length > 3) ? `${nombres[0]} ${nombres[nombres.length - 2]}`
      : (nombres.length === 3) ? `${nombres[0]} ${nombres[2]}`
        : allNames;
  }

  public setMainTitle = (newTitle: string) => {
    this.mainTitle = newTitle
  }

  public onUserSelected = (userSelected: IUserListItem): void => {
    try {

      const activeContrato = this.listContratos.find((contrato: Contratos) => contrato.id_contrato === userSelected.id_contrato)
      console.log('userSaldoSelected', this.navActive)

      if (!activeContrato) {
        Swal.fire({
          icon: 'error',
          // timer: 5000,
          // title: 'Error en la cuenta seleccionada',
          text: `El estatus: ${userSelected.status_contrato.toUpperCase()} de la cuenta seleccionada no permite esta operación. Por favor, comuníquese con el proveedor.`,
          showCloseButton: true,
          confirmButtonText: 'Cerrar',
        });
        return;
      }

      let dni_: string = this.dni?.value ? this.ClearCedula(this.dni?.value) : '';
      if (!dni_) return; //TODO: Handle error

      this.closeAlert2();
      this.readonlyDNI = true;
      this.idContrato = activeContrato.id_contrato;
      this.nameClient = activeContrato.cliente;
      this.setGreeting(this.nameClient)
      this.name?.setValue(this.clientNames);
      this.nroContrato?.setValue(activeContrato.contrato);
      this.SendOption(0, 3, activeContrato.contrato);
      this.monto_pend_conciliar =
        activeContrato.monto_pend_conciliar;
      // this.filterBankByFranquicia(activeContrato.franquicia);
      this.dni?.setValue(dni_);
      this.searchInfoEquipos(dni_)
        .then(() => {

          this.setActiveContrato(activeContrato)

          this.showMainMenuPage2 = true
          this.navActive = PAGES_NAVIGATION.PAYMENT_CARDS

        })
        .catch((err) => {
          console.log('falló el ingreso de datos del usuario', err);
        })

    } catch (error) {
      console.error(error)
    }
  }

  private setActiveContrato = (activeContrato: Contratos) => {
    try {

      /*Esto se hacer por si el usuario preciomente selecciona un banco */
      if (this.BancoNacional(this.banco)) {
        if (
          !Number.isNaN(parseFloat(activeContrato.saldo)) ||
          !Number.isNaN(
            parseFloat(this.registerPayService.amountCustomerContract)
          )
        ) {
          if (
            this.registerPayService.linkedToContractProcess != 'approved'
          ) {
            this.validateIfAmountIsNegativer(
              activeContrato.saldo,
              true
            );

            this.lastAmount = parseFloat(
              activeContrato.saldo
            ).toFixed(2);

            this.saldoUSD = parseFloat(
              activeContrato.saldo
            ).toFixed(2);
            this.saldoBs = (
              parseFloat(activeContrato.saldo) * this.cambio_act
            ).toFixed(2);
            this.subscription = parseFloat(
              activeContrato.subscription
            ).toFixed(2);
          } else {
            // this.registerPayService.amountCustomerContract
            this.validateIfAmountIsNegativer(
              this.registerPayService.amountCustomerContract,
              true
            );

            this.lastAmount = parseFloat(
              this.registerPayService.amountCustomerContract
            ).toFixed(2);

            this.saldoUSD = parseFloat(
              this.registerPayService.amountCustomerContract
            ).toFixed(2);
            this.saldoBs = (
              parseFloat(this.registerPayService.amountCustomerContract) *
              this.cambio_act
            ).toFixed(2);
            this.subscription = parseFloat('0').toFixed(2);
          }
        } else {
          this.amount?.setValue(0);
          this.lastAmount = '0';
        }
      } else {
        //this.validateIfAmountIsNegativer(activeContrato.saldo);
        this.lastAmount = parseFloat(activeContrato.saldo).toFixed(
          2
        );
        this.saldoUSD = parseFloat(activeContrato.saldo).toFixed(
          2
        );
        this.saldoBs = (
          parseFloat(activeContrato.saldo) * this.cambio_act
        ).toFixed(2);
        this.subscription = parseFloat(
          this.listContratos[0].subscription
        ).toFixed(2);
      }

      //Esto lo uso para el CoinCoinx y Paypal NO BORRAR
      localStorage.setItem(
        'Name',
        this._seguridadDatos.encrypt(this.nameClient)
      );
      localStorage.setItem(
        'Monto',
        this._seguridadDatos.encrypt(this.saldoUSD)
      );
      localStorage.setItem(
        'MontoBs',
        this._seguridadDatos.encrypt(this.saldoBs)
      );
      localStorage.setItem(
        'Subscription',
        this._seguridadDatos.encrypt(this.subscription)
      );
      localStorage.setItem(
        'idContrato',
        this._seguridadDatos.encrypt(this.idContrato)
      );
      localStorage.setItem(
        'dni',
        this._seguridadDatos.encrypt(this.dni?.value)
      );
      localStorage.setItem(
        'Abonado',
        this._seguridadDatos.encrypt(this.abonado)
      );

      console.log('SALDO', this.saldoUSD)

      if (parseFloat(this.saldoUSD) <= 0) {

        Swal.fire({
          icon: 'error',
          // timer: 5000,
          title: 'Usted no posee deuda pendiente',
          text: (parseFloat(this.saldoUSD) === 0) ? 'Estás al día' : `Tiene un saldo a favor de: ${Math.abs(parseFloat(this.saldoUSD)).toFixed(2).replace('.', ',')}$`,
          showCloseButton: true,
          confirmButtonText: 'Registrar Pago Adelantado',
          didClose: () => {
            console.warn('EL SWAQL FUE CERRADOOOOOO')
          }
        });

      }

    } catch (error) {
      console.error('Error en setActiveContrato', error)
    }
  }

  /*
   * To show administrative module
   * @return Boolean | undefined
   */
  public showAdminist(dni_value: string): boolean | undefined {
    if (dni_value === '1000000') {
      return this.showaBtnAdmin = false;
    }
    return this.showaBtnAdmin = true;
  }

  /**
   *
   * @param $event Event to show or hide the admin panel
   * @returns void
   */
  public handlerAdminPanel($event: string): void {
    console.log('EVENT', $event)
    if ($event === 'test') {
      this.showadmin = false;
      console.log('EVENT IF', $event, this.showadmin)
    } else if ($event === 'admin') {
      this.showadmin = true;
      console.log('EVENT ELSE IF', $event, this.showadmin)
    }
  }

  /**
   * Function to handle the admin login event
   * @param $event boolean value - true if logged in, false otherwise
   */
  public handlerAdminLogin($event: boolean): void {
    if ($event) {
      // Login exitoso, renovar sesión
      this._checkoutSessionService.renewSession();
    } else {
      // Logout o cancelación, limpiar sesión
      this._checkoutSessionService.clearSession();
    }
    console.log('EVENT ADMIN LOGIN', $event)
    this.isAdminLogged = $event;
  }

  // TrackBy functions para optimizar *ngFor
  trackByContratoId(index: number, contrato: any): any {
    return contrato.id_contrato || index;
  }

  trackByUserId(index: number, user: any): any {
    return user.id || user.dni || index;
  }

}
