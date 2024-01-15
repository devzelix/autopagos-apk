import { Component, OnInit, ViewChild, OnDestroy, OnChanges, AfterViewInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormGroup, FormBuilder, Validators, AbstractControl, FormControl, NgControlStatus, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { ThisReceiver } from '@angular/compiler';
import { Clipboard } from '@angular/cdk/clipboard';

import { ImageComponent } from '../image/image.component';
import { DialogDetailComprobantesComponent } from '../dialog-detail-comprobantes/dialog-detail-comprobantes.component';


import { isNegativeNumber } from '../../validators/customValidatorAmount';

import { nanoid } from 'nanoid'
import { BankList } from '../../interfaces/bankList';
import { BanksDays } from '../../interfaces/banksDays';
import { Contratos } from '../../interfaces/contratos';
import { DataSlide, TypeAccount, Month, Ano, MetodoDePago2, MetodoDePago3, PlantillaConfirmPago, DatosPagoMovil, FormasDePago, ListBankPago } from './camposSubscription/camposSuscription';
import { MiscelaneosService } from '../../utils/miscelaneos.service';
import { ApiMercantilService } from '../../services/ApiMercantil';
import { TypeBrowserService } from '../../services/TypeBrowser';
import { MatStepper, StepState } from '@angular/material/stepper';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
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
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { PaymenDialogZelleComponent } from '../paymen-dialog-zelle/paymen-dialog-zelle.component';
import { ResponseMethod } from 'src/app/interfaces/response';
import { InfoPayComponent } from '../info-pay/info-pay.component';
import { Api100x100Service } from 'src/app/services/Api100x100Banco';




export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.style.scss']
})
export class FormComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('picker') date_: MatDatepickerInput<Date>;

  public PlantillaTempPago: any = JSON.parse(JSON.stringify(PlantillaConfirmPago));
  animal: string;
  name2: string;
  fecha: string = 'sssssssssssssss';
  // displayedColumns: string[] = ['Comprobante', 'Status', 'Fecha'];
  displayedColumns: string[] = ['Fecha', 'Status'];

  public BankEmisor = BankEmisorS
  public bancoSeleccionado : string = ""
  public RegexPhone = /^(412|414|424|416|426|0412|0414|0424|0416|0426|58412|58414|58424|58416|58426)[0-9]{7}$/gm
  private idUnicoClient: any = nanoid(10);
  public bankList: BankList[] = [];
  public formFibex: UntypedFormGroup;
  public firstFormFibex: UntypedFormGroup;
  public secondFormFibex: UntypedFormGroup;
  public thirdFormFibex: UntypedFormGroup;
  public fourthFormFibex: UntypedFormGroup;
  public PgMovilForm: FormGroup;
  public PgMovilRegForm: FormGroup;
  public PgMovilBNCForm: FormGroup;
  public DebitoCredito: FormGroup;
  public TypeForm: FormGroup;
  public CriptomonedaForm: FormGroup;
  public FirtZelleForm: FormGroup;
  public AllComprobantesPago: any = [];
  public retentionImageUrl: string = '';
  public retentionimageUploaded: boolean = false;
  public ErrorRegistrando: boolean = false;
  public MessageErrorRegistrado: string = "";
  CuentaAnulada: boolean = false
  public uploadingRetentionImg: boolean = false;
  public validFormats = ['jpg', 'jpeg', 'png', 'pdf'];
  public extn: any = "";
  public indexof: number;
  public ValidExtension: boolean = true;
  public retentionImgExtn: any = "";
  public retentionImgIndexof: number;
  public ValidRetentionImgExtension: boolean = true;
  public possibleWithholdingAgent: boolean = false
  public selectedRetentionOption: number | null
  public DataPagoMovilPublic: any = DatosPagoMovil;

  public listContratos: Contratos[] = [];
  public paquetesContratos: { id_contrato: string, paquete: string }[] = [];
  public cambio_act: number = 0;
  public lastAmount: string = '';
  public banco: string = '';
  public BancoSelect: any //con esta variable se todos los datos del banco que seleccione el cliente
  public imageUrl: string = '';
  public imageUploaded: boolean = false;
  public idContrato: string = '';
  public paquete: /* any = [] */string = '';
  public regexEmail: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
  private temp2: any
  public dateInvalid: boolean = false;
  public sendingPay: boolean = false;
  public invalidAmount: boolean = false;
  public uploadingImg: boolean = false;
  public tasaCambio: string = '';
  public errorDate: boolean = false;
  public daysFeriados: BanksDays[] | any = [];
  public BancoDefault: string = "Mercantil"
  public bancooo : string = "100x100Banco"
  public LoadingLengthAbonado: boolean = false;
  ExitRef: Boolean = true //para saber si el campo de comprobante esta vacio o no
  AllService: any = []
  ListService: any = []
  LenthgInvalidDnI: boolean = false;
  AllDataClient: any = []
  enableBtn: Boolean = false
  totalAmount: number = 0;
  PagoMetodosHTML2: any = FormasDePago;
  MetodosPagoMovil: any = ListBankPago
  //sPagoMercantilBCO:any =[];
  ConsultarPagoMovilboolean: boolean = false;
  RegistrarPagoMovilboolean: boolean = false;
  BankSelectPagoMovil: boolean = false //creado por juan para saber si la persona selecciono un pago o no
  ShowalertBankNationals: boolean = false //creado por juan
  ShowOptionPagoMovil: boolean = false //creado por juan
  ShowFormDebitoCredito: Boolean = false
  ShowFormDebitoCreditoBNC: Boolean = false
  ShowFormDebito100x100: Boolean = false
  DebitoCreditoboolean: boolean = false;
  ShowOptionBNCPagoMovil: boolean = false
  Criptomoneda: boolean = false;
  Otros: boolean = false;
  tipo_pago: any;
  AppFibex: boolean = false;
  ClienteFibex: boolean = false;
  ZellePay: boolean = false;
  BancoPago: any;
  public PaymenMethod: string = "";
  private TypeNavegador: string = "";
  private IpAddress: any = "";
  public TypeAcountDC: any[] = TypeAccount;
  public Creditoboolaean: boolean = false;
  public Debitoboolean: boolean = false;
  public PrimeraVez: boolean = true;
  public Months = Month;
  public Anos = Ano;
  public ReciboPay: boolean = false;
  public SelectPagoc2p: string = "mercantil";
  public controllerKey: boolean;
  public values = '';
  public PinEnviado: boolean = false;
  public PinError: number = 0;
  public ConcatenaTimer: string = "";
  public SetInterval: any = "";
  public Minutes: any = "";
  public Second: any = "";
  public BackFormaPago: boolean = false;//Regresar para reportar o pagar

  // Variables de hcaptcha
  public hcaptchaForm: FormGroup
  public verifyDNI: boolean = false
  public captchaControl: boolean | undefined = true
  public readonlyDNI: boolean = false
  private ComprobanteReportado: string = "";
  private CountCompReport: number = 0;
  public Kiosco: boolean = false;
  public abonado: string = '';
  public PagoPendiente: boolean = false;
  public DataPagoPendiente: any = "";
  public LoadingPagoPendiente: boolean = false;
  public LoadingCheckReferencia: boolean = false;
  @Input() state: StepState
  paymentMethod: string = 'standard'
  public showStateTable: boolean = false;
  public stateTableData: { fecha_reg: Date, numero_ref: number, status_pd: string }[];

  constructor(
    public registerPayService: RegisterPayService,
    private fb: UntypedFormBuilder,
    private uplaodImageService: UplaodImageService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private tasaService: TasaService,
    private dataBankService: DataBankService,
    private _snackBar: MatSnackBar,
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
    public _ApiBNC: ApiBNCService
    //private hcaptchaService: NgHcaptchaService
  ) {
    this.cacheService.clear();

    this.dataBankService.bankList.subscribe((banks) => {
      this.bankList = banks.sort((a, b) => a.Banco.localeCompare(b.Banco));;
      this.banksFiltered = [...this.bankList];
      this.banksFiltered = this.deleteDuplicated(this.banksFiltered, 'id_cuba');
    });
  }

  ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    //Write your code here
    console.log(this.captchaService.validControl);
  }

  ngAfterViewInit(): void {
    if (this._helper.dniToReload) {
      setTimeout(() => {
        this.searchServicesv2(this._helper.dniToReload, true, true)
        setTimeout(() => {
          this._helper.dniToReload = ''
        }, 200);
      }, 500);
    }
  }

  MyInit() {
    this.firstFormFibex = this.fb.group({
      name: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.pattern(this.regexEmail)]],
      bank: ['', [Validators.required]],
      nroContrato: ['', [Validators.required]],
      date: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      idpago: ['']
    }, { validator: isNegativeNumber });

    this.secondFormFibex = this.fb.group({
      voucher: ['', [Validators.required, Validators.maxLength(30)]],
      nameTitular: [''],
      dniTitular: [''],
      emailTitular: [''],
      BancoEmisor: ['']
    });

    this.thirdFormFibex = this.fb.group({
      img: ['', [Validators.required]],
      note: ['']
    });

    this.fourthFormFibex = this.fb.group({
      retentionImg: ['', [Validators.required]],
      retentionAmount: ['', [Validators.required, Validators.pattern(this.regexAmount)]]
    });

    this.PgMovilForm = this.fb.group({
      tlforiginReg: ['', [Validators.required, Validators.pattern(this.RegexPhone)]],
      tlfdestinReg: ['584129637516', [Validators.required]],
      prec_i: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      referencia: ['', [Validators.required]],
      datepgmovil: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      validator: Validators.compose(
        [
          isNegativeNumber
        ])
    });

    this.PgMovilRegForm = this.fb.group({
      tlforigin: ['584129637516', [Validators.required]],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      tlfdestin: ['', [Validators.required, Validators.pattern(this.RegexPhone)]],
      auth: [''],
      amountPm: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      validator: Validators.compose(
        [
          isNegativeNumber
        ])
    });

    this.PgMovilBNCForm = this.fb.group({
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.minLength(11)]],
      Desciption: ['', [Validators.required, Validators.minLength(4)]],
      amountPm: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      validator: Validators.compose(
        [
          isNegativeNumber
        ])
    });

    this.DebitoCredito = this.fb.group({
      BancoSeleccionado: [''],
      ccv: ['', [Validators.required, Validators.pattern(this.regexCCV), Validators.maxLength(3)]],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      typeCuenta: ['', [Validators.required]],
      Ncard: ['', [Validators.required, Validators.maxLength(18)]],
      Clavetlfonica: [''],
      fvncmtoMes: ['', [Validators.required]],
      fvncmtoAno: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      validator: Validators.compose(
        [
          isNegativeNumber
        ])
    });

    this.CriptomonedaForm = this.fb.group({
      Referencia_Cripto: ['', [Validators.required]],
      Monto_Cripto: [``, [Validators.required]],
      c_i_Cripto: ['', [Validators.required, Validators.minLength(6)]],
      Pref_ci_Cripto: ['', [Validators.required]]
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
    })
    return list;
  }

  handleSuccess(e: any) {
    console.log("ReCaptcha", e);
  }

  handleReset(e: any) {
    console.log("ReCaptcha", e);
  }

  handleExpire(e: any) {
    console.log("ReCaptcha", e);
  }

  handleError(e: any) {
    console.log("ReCaptcha", e);
  }

  handleLoad(e: any) {
    console.log("ReCaptcha", e);
  }

  ngOnInit(): void {
    this.MyInit();
    this._ApiMercantil.GetAddress()
      .then((resp: any) => this.IpAddress = resp)
      .catch((error: any) => console.log(error));

    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();

    this.route.queryParams.pipe(filter((param) => param['dni'])).subscribe((res) => {

      if (res['dni']) {
        this.dni?.setValue(`${res['dni']}`)
        this.searchServicesv2(res['dni'], true, true)

        if (res['linkedToContractProcess'] === "approved") {
          this.tasaService.getSaldoBCV().subscribe((res) => {
            this.tasaCambio = res
          })

          this.PagoMetodosHTML2 = MetodoDePago2.filter(x => x.idpago != 4 && x.idpago != 6)
          this.registerPayService.linkedToContractProcess = `${res['linkedToContractProcess']}`
          this.registerPayService.dniCustomerContract = `${res['dni']}`
          this.registerPayService.amountCustomerContract = `${res['amount']}`

        } else {

          if (res['kiosco']) {

            this.Kiosco = true;
            this.fourthFormFibex.get('retentionImg')?.clearValidators();
            this.fourthFormFibex.get('retentionAmount')?.clearValidators();
            this.thirdFormFibex.get('img')?.clearValidators();
            this.fourthFormFibex.get('retentionImg')?.updateValueAndValidity();
            this.fourthFormFibex.get('retentionAmount')?.updateValueAndValidity();
            this.thirdFormFibex.get('img')?.updateValueAndValidity();
          }
          this.PagoMetodosHTML2 = FormasDePago;
        }
      }
    });
    this.dateOfPay();
    this.amountInvalid();
    this.amountInvalidCreditoDebitoPagoMovil();
    this.getDaysFeriados();
  }

  DNIvalidation = (inputDni: any) => {
    const dni_ = inputDni.value
    if (dni_.length >= 1 && dni_.length < 6) {
      this.dni?.reset()
      this.captchaService.validControl = false
      this.nameClient = '';
      this.saldoUSD = '';
      this.saldoBs = '';
      this.dniConsulted = true;
      this.lastDni = "";
      this.name?.setValue('');
      this.alertFindDni('La cédula debe ser mínimo 6 carácteres', '');
      setTimeout(() => this.closeAlert(), 1000);
    }
  }

  SendOption(page: number, option: any, value: any) {
    let temp = value
    //Anticlon y evitar valores vacios
    if (value != "" && temp != this.temp2 && value != undefined) {
      if (page == 0 && option == 5) {
        value = value.toLocaleString('en-GB')
      }

      this.temp2 = temp;
      DataSlide[page].Data[option].Data = value;
      let Data = DataSlide[page].Data[option];
      try {
        this._Consultas.Send(Data.Option, Data.Data, Data.id, "", this.idUnicoClient);
      } catch (error) {
        console.error(error)
      }
    }
  }

  BancoEmisor(Bank: any) {
    switch (Bank.Banco) {
      case 'USD BANCO MERCANTIL':
      case 'EUR BANCO MERCANTIL':
        this.secondFormFibex.get('voucher')?.setValidators([Validators.maxLength(10), Validators.required, Validators.minLength(4), this.CharacterSpecial()]);
        this.secondFormFibex.get('voucher')?.updateValueAndValidity();
        break;

      case 'ZELLE WELL FARGO pagos.zelle@fibextelecom.net':
      case 'USD BANK OF AMERICA TRANSFERENCIA':
        this.secondFormFibex.get('voucher')?.setValidators([Validators.maxLength(14), Validators.required, Validators.minLength(4), this.CharacterSpecial()]);
        this.secondFormFibex.get('voucher')?.updateValueAndValidity();
        break;

      default:
        if (Bank.hasOwnProperty('Max')) {
          this.secondFormFibex.get('BancoEmisor')?.setValue(Bank.Banco)
          this.secondFormFibex.get('voucher')?.setValidators([Validators.maxLength(Bank.Max), Validators.required, Validators.minLength(4), this.NumericReference()]);
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

      const NumericVAlid = hasNumeric

      return !NumericVAlid ? { NumericRefence: true } : null;
    }
  }

  CharacterSpecial(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;

      if (!value) {
        return null;
      }

      const hasCaracteresSpecial = /^[\w\-\.]+$/i.test(value);

      return !hasCaracteresSpecial ? { CaracterInvalid: true } : null;
    }
  }

  keypressControPhones(event: any, formcontrol: string, TypeFormKey: FormGroup) {
    console.log(event)
    var inp = String.fromCharCode(event.keyCode);

    if (TypeFormKey.get(formcontrol)?.value == undefined || TypeFormKey.get(formcontrol)?.value == null || TypeFormKey.get(formcontrol)?.value == '') {
      return
    };
    if ((String(TypeFormKey.get(formcontrol)?.value).slice(0, 1) != '5' && String(TypeFormKey.get(formcontrol)?.value).slice(0, 1) != '') ||
      (String(TypeFormKey.get(formcontrol)?.value).slice(1, 2) != '8' && String(TypeFormKey.get(formcontrol)?.value).slice(1, 2) != '')) {
      TypeFormKey.get(formcontrol)?.reset();
      TypeFormKey.get(formcontrol)?.setValue(`58`);
      return;
    }

    if ((String(TypeFormKey.get(formcontrol)?.value).slice(2, 3) == '0' && String(TypeFormKey.get(formcontrol)?.value).slice(2, 3) != '')) {
      TypeFormKey.get(formcontrol)?.reset();
      TypeFormKey.get(formcontrol)?.setValue('58');
      return;
    }
    if (/^[0-9]$/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }


  //Transferencia
  get name() { return this.firstFormFibex.get('name'); }
  get dni() { return this.firstFormFibex.get('dni'); }
  get email() { return this.firstFormFibex.get('email'); }
  get nroContrato() { return this.firstFormFibex.get('nroContrato'); }
  get bank() { return this.firstFormFibex.get('bank'); }
  get amount() { return this.firstFormFibex.get('amount'); }
  get date() { return this.firstFormFibex.get('date'); }

  get voucher() { return this.secondFormFibex.get('voucher'); }
  get nameTitular() { return this.secondFormFibex.get('nameTitular'); }
  get dniTitular() { return this.secondFormFibex.get('dniTitular'); }
  get emailTitular() { return this.secondFormFibex.get('emailTitular'); }

  get note() { return this.thirdFormFibex.get('note'); }
  get img() { return this.thirdFormFibex.get('img'); }
  //Reporte de pago Movil
  get c_iPagMovil() { return this.PgMovilForm.get('c_i'); }
  get tlforiginReg() { return this.PgMovilForm.get('tlforiginReg'); }
  get tlfdestinReg() { return this.PgMovilForm.get('tlfdestinReg'); }
  get referenciapm() { return this.PgMovilForm.get('referencia'); }
  get datepgmovil() { return this.PgMovilForm.get('datepgmovil'); }
  get cantidad() { return this.PgMovilForm.get('cantidad'); }
  get prec_i() { return this.PgMovilForm.get('prec_i'); }
  //Pago Movil Mercantil
  get tlforigin() { return this.PgMovilRegForm.get('tlforigin'); }
  get c_iRegPgoMvil() { return this.PgMovilRegForm.get('c_i'); }
  get pref_ci() { return this.PgMovilRegForm.get('pref_ci'); }
  get tlfdestin() { return this.PgMovilRegForm.get('tlfdestin'); }
  get auth() { return this.PgMovilRegForm.get('auth'); }
  get amountPm() { return this.PgMovilRegForm.get('amountPm'); }
  // Pago Movil BNC
  get pref_ci_bnc() { return this.PgMovilBNCForm.get('pref_ci') }
  get c_i_bnc() { return this.PgMovilBNCForm.get('c_i') }
  get Desciption_bnc() { return this.PgMovilBNCForm.get('Desciption') }
  get amountPm_bnc() { return this.PgMovilBNCForm.get('amountPm') }
  //Debito o Credito
  get BancoSeleccionado() { return this.DebitoCredito.get('BancoSeleccionado') }
  get ccv() { return this.DebitoCredito.get('ccv'); }
  get typeCuenta() { return this.DebitoCredito.get('typeCuenta'); }
  get pref_ciDC() { return this.DebitoCredito.get('pref_ci'); }
  get Ncard() { return this.DebitoCredito.get('Ncard'); }
  get fvncmtoMes() { return this.DebitoCredito.get('fvncmtoMes'); }
  get fvncmtoAno() { return this.DebitoCredito.get('fvncmtoAno'); }
  get cantidadDC() { return this.DebitoCredito.get('cantidad'); }
  get c_iDC() { return this.DebitoCredito.get('c_i'); }
  get Clavetlfonica() { return this.DebitoCredito.get('Clavetlfonica'); }
  //Criptomoneda
  get Referencia_Cripto() { return this.CriptomonedaForm.get('Referencia_Cripto'); }
  get Monto_Cripto() { return this.CriptomonedaForm.get('Monto_Cripto'); }
  get c_i_Cripto() { return this.CriptomonedaForm.get('c_i_Cripto'); }
  get Pref_ci_Cripto() { return this.CriptomonedaForm.get('Pref_ci_Cripto'); }
  //Retencion
  get retentionAmount() { return this.fourthFormFibex.get('retentionAmount'); }
  get retentionImg() { return this.fourthFormFibex.get('retentionImg'); }


  ClearCedula(Cedula: any) {
    if (Cedula) {
      var regex = /(\d+)/g;
      const CedulaLimpia = Cedula.match(regex)
      return CedulaLimpia.join("")
    }
  }

  validateEmail(event: any): void {
    const keyCode = event.keyCode;
    const excludedKeys = [64, 45, 46, 95];
    if (!((keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57) || (keyCode >= 97 && keyCode <= 122) || (excludedKeys.includes(keyCode)))) {
      event.preventDefault();
    }
  }

  TipoPago(x: number) {
    this.ShowOptionPagoMovil = false
    //Modal para pagar Zelle
    if (x == 10) {
      this.openDialogZelle();
      return;
    }
    this.tipo_pago = x;
    this.ConsultarPagoMovilboolean = false;
    this.RegistrarPagoMovilboolean = false;
    this.DebitoCreditoboolean = false;
    this.Debitoboolean = false;
    this.Creditoboolaean = false;
    this.Criptomoneda = false;
    this.Otros = false;
    this.PrimeraVez = false;

    //Débito
    if (x == 0) {
      this.DebitoCreditoboolean = !this.DebitoCreditoboolean;
      this.PaymenMethod = "tdd";
      this.Debitoboolean = !this.Debitoboolean;
      this.DebitoCredito.get('cantidad')?.setValue(this.saldoBs);
      this.DebitoCredito.get('typeCuenta')?.setValue('Corriente');
      this.DebitoCredito.get('c_i')?.setValue(this.dni?.value);
      this.DebitoCredito.get('pref_ci')?.setValue('V');
      // this.DebitoCredito.get('Clavetlfonica')?.setValidators([Validators.required, Validators.maxLength(4)]);//Validators.required, //this.DebitoCredito.get('Clavetlfonica')?.setValidators([Validators.maxLength(8)]);
      // this.DebitoCredito.get('Clavetlfonica')?.updateValueAndValidity();
      this.DebitoCredito.get('typeCuenta')?.setValidators([Validators.required]);
      this.DebitoCredito.get('typeCuenta')?.updateValueAndValidity();
      this.Otros = true;
      setTimeout(() => {
        this.NextMatStepper()
      }, 300);
    }
    //Crédito
    if (x == 1) {
      this.DebitoCreditoboolean = !this.DebitoCreditoboolean;
      this.PaymenMethod = "tdc";
      this.DebitoCredito.get('cantidad')?.setValue(this.saldoBs);
      this.DebitoCredito.get('c_i')?.setValue(this.dni?.value);
      this.DebitoCredito.get('pref_ci')?.setValue('V');
      // this.DebitoCredito.get('Clavetlfonica')?.setValidators([]);
      // this.DebitoCredito.get('Clavetlfonica')?.updateValueAndValidity();
      this.DebitoCredito.get('typeCuenta')?.setValidators([]);
      this.DebitoCredito.get('typeCuenta')?.updateValueAndValidity();
      this.Creditoboolaean = !this.Creditoboolaean;
      this.Otros = true;
      setTimeout(() => {
        this.NextMatStepper()
      }, 300);

    }
    //Pago Movil
    if (x == 2) {
      //Por default selecciono el Pago Móvil para Mercantil
      this.TypeForm = this.PgMovilRegForm;
      this.SelectPagoc2p = "mercantil";
      //this.RegistrarPagoMovilboolean = !this.RegistrarPagoMovilboolean; //comentado por juan
      this.ShowOptionPagoMovil = true
      this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
      this.PgMovilRegForm.get('pref_ci')?.setValue('V');
      this.PgMovilRegForm.get('c_i')?.setValue(this.dni?.value);
      this.Otros = true;
      setTimeout(() => {
        this.NextMatStepper()
      }, 300);
    }
    //Transferencia
    if (x == 4) {
      setTimeout(() => {
        this.NextMatStepper();
        //this.PagoMetodosHTML2 = MetodoDePago3;
      }, 300);
    }
    //Criptomoneda
    if (x == 5) {
      this.checkLocalStorageData().then((result) => {
        this.router.navigate(['coinx']);
      }).catch((err) => {
        console.log('No se han podido llenar los datos correctamente.')
      });
    }
    //Zelle
    if (x == 6) {
      let BankZelle = this.banksFiltered.filter((bank: any) => bank.id_cuba == 'CUBA2A448529C1B50236')
      this.firstFormFibex.get('bank')?.setValue(BankZelle[0].Banco);

      this.bankSelected(BankZelle[0]);
      setTimeout(() => {
        this.NextMatStepper();
      }, 300);
    }
    //Paypal
    if (x == 9) {
      this.checkLocalStorageData().then((result) => {
        this.router.navigate(['paypal']);
      }).catch((err) => {
        console.log('No se han podido llenar los datos correctamente.')
      });
    }
    //Stripe
    if (x == 28) {
      this.checkLocalStorageData().then((result) => {
        this.router.navigate(['stripe']);
      }).catch((err) => {
        console.log('No se han podido llenar los datos correctamente.')
      });
    }
    //Reportar
    if (x == 29) {
      this.PagoMetodosHTML2 = MetodoDePago2;
      this.Otros = true;
    }
    //Pagar
    if (x == 30) {
      this.PagoMetodosHTML2 = MetodoDePago3;
      this.Otros = true;
    }
  }

  FormaPago(x: number) {
    this.BackFormaPago = !this.BackFormaPago;
    //Reportar
    if (x == 29) {

      console.log("SaldoUSD")
      console.log(this.saldoUSD);

      if (Number(this.saldoUSD) < 0) {
        this.LoadingPagoPendiente = !this.LoadingPagoPendiente;
        this.registerPayService.StatusPayAbonado(this.nroContrato?.value)
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
          }).catch((err: any) => { console.log(err); this.PagoMetodosHTML2 = MetodoDePago2; this.LoadingPagoPendiente = !this.LoadingPagoPendiente; })
      } else {
        this.PagoMetodosHTML2 = MetodoDePago2;
      }


    }
    //Pagar
    if (x == 30) {
      this.PagoMetodosHTML2 = MetodoDePago3;
      let SubscriptionZelle = this._Consultas.PagoZelleOb.subscribe((resp) => {
        this.TipoPago(6);
        SubscriptionZelle.unsubscribe();
      })
    }

    if (x == 31) {
      this.PagoPendiente = false;
      this.PagoMetodosHTML2 = FormasDePago;
    }
  }

  checkLocalStorageData() {
    return new Promise<void>((resolve, reject) => {
      localStorage.setItem("Name", this._seguridadDatos.encrypt(this.nameClient));
      localStorage.setItem("Monto", this._seguridadDatos.encrypt(this.saldoUSD));
      localStorage.setItem("MontoBs", this._seguridadDatos.encrypt(this.saldoBs));
      localStorage.setItem("Subscription", this._seguridadDatos.encrypt(this.subscription));
      localStorage.setItem("idContrato", this._seguridadDatos.encrypt(this.idContrato));
      localStorage.setItem("dni", this._seguridadDatos.encrypt(this.dni?.value));
      localStorage.setItem("Saldo", this._seguridadDatos.encrypt(this.saldoText));
      localStorage.setItem("Service", this._seguridadDatos.encrypt(JSON.stringify(this.paquete)));
      localStorage.setItem("Abonado", this._seguridadDatos.encrypt(this.nroContrato?.value));
      localStorage.setItem("IpAdress", this._seguridadDatos.encrypt(this.IpAddress.ip));
      localStorage.setItem("TasaCambio", this._seguridadDatos.encrypt(this.tasaCambio));
      resolve()
    })
  }

  ComprobarPgoMovil() {
    //Solo para consultar por referencias de pago Moviles
    let DatosUserAgent = {
      Browser: this.TypeNavegador,
      AddresIp: this.IpAddress.ip,
      tlforigin: this.tlforiginReg?.value.toString(),
      tlfdestinReg: this.tlfdestinReg?.value,
      Cantidad: Number(this.cantidad?.value),
      Date: this.datepgmovil?.value.toISOString(),
      Reference: this.referenciapm?.value,
      Name: this.name?.value,
      Abonado: this.nroContrato?.value,
      idContrato: this.idContrato,
      c_i: this.prec_i?.value + this.c_iPagMovil?.value,
      Cliente: this.idContrato != "" ? true : false
    }

    console.log("ComprobarPgoMovil");
    console.log(DatosUserAgent);

    this.alertFindDniMercantil('Comprobando pago', 'Por favor espere...');
    this._ApiMercantil.ConsultaPagoMovil(DatosUserAgent)
      .then((resp: any) => {
        if (resp.hasOwnProperty('registrado')) {
          this.alertexit('El pago ya fue registrado anteriormente', '');
          this.ResetFormCD();
        } else {
          if (resp.hasOwnProperty('error_list')) {
            this.invalidForm('No se encuentra dicho pago', 'Intente nuevamente!');
            this.Antibruteforce();
          } else if (resp.hasOwnProperty('transaction_list')) {
            this.ReciboPay = true;
            this.alertexit("Pago aprobado");
          } else if (resp.hasOwnProperty('status')) {
            this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!');
          } else {
            this.invalidForm(`Error intente mas tarde!`);
          }
        }
      })
      .catch((error: any) => console.error(error)) //Tengo que decirle al usuario que paso con la el pago que realizo
  }

  RegistrarPgoMovil() {
    //Para realizar pago Móviles
    if (this.auth?.value != "") {

      let DatosUserAgent = {
        Browser: this.TypeNavegador,
        AddresIp: this.IpAddress.ip,
        tlforigin: this.tlforigin?.value,
        c_i: this.pref_ci?.value + this.c_iRegPgoMvil?.value,
        tlfdestin: this.tlfdestin?.value.toString(),
        auth: this.auth?.value,
        cantidad: this.amountPm?.value,
        invoice: "", //Máximo 25 caracteres esto se llena en el Backend
        Name: this.name?.value,
        Abonado: this.nroContrato?.value,
        idContrato: this.idContrato,
        Cliente: this.idContrato != "" ? true : false
      }
      this.alertFindDniMercantil('Registrando pago', 'Por favor espere...');
      this._ApiMercantil.C2PCompra(DatosUserAgent)
        .then((resp: any) => {
          this.closeAlert2();
          if (resp.hasOwnProperty('error_list')) {
            // this.alertFindDni(`${resp.error_list[0].description}`,'');
            this.invalidForm(`${resp.error_list[0].description}`)
          } else if (resp.hasOwnProperty('transaction_c2p_response')) {
            if (resp.transaction_c2p_response.trx_status == "approved") {
              this.ReciboPay = true;
              this.registerPayService.linkedToContractProcess === "approved" ? this.registerPayService.paySubs(resp, this.registerPayService.dniCustomerContract) : ''
              this.alertexit("Pago aprobado");
            } else {
              this.invalidForm(`Tu transacción fue rechazada por el banco, valide el monto ingresado`);
            }
          } else if (resp.hasOwnProperty('status')) {
            this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!')
          } else {
            this.invalidForm(`Error intente mas tarde!`);
          }
        })
        .catch((error: any) => { this.invalidForm(`Error por favor intente más tarde`); console.error(error) }) //Tengo que decirle al usuario que paso con la el pago que realizo
    } else {
      this.invalidForm(`Error debe colocar la clave de autorización!`);
    }

  }

  PagoC2P100x100() {
    this.alertFindDniMercantil("Procesando su pago", "Por favor espere");
    let datosPago = {
      c_i: this.pref_ci?.value + this.c_iRegPgoMvil?.value,
      tlfdestin: this.tlfdestin?.value.toString(),
      cantidad: this.amountPm?.value,
      Abonado: this.nroContrato?.value,
      idContrato: this.idContrato,
      name_user:this.nameClient
    }

    this._Api100x100.C2PCompra(datosPago).then((resp: any) => {
      if (resp.hasOwnProperty('error')) {
        // this.alertFindDni(`${resp.error_list[0].description}`,'');
        this.invalidForm(`${resp.error}`)
      } else if (resp.hasOwnProperty('status')) {
        if (resp.status == true) {
          this.ReciboPay = true;
          this.registerPayService.linkedToContractProcess === "approved" ? this.registerPayService.paySubs(resp, this.registerPayService.dniCustomerContract) : ''
          this.alertexit("Pago aprobado");
        } else {
          this.invalidForm(`Tu transacción fue rechazada por el banco`);
        }
      } else {
        this.invalidForm(`Error intente mas tarde!`);
      }

    }).catch((error: any) => console.error(error))
  }


  ClaveAuthPgoMovil(Tipo?: string) {
    //Clave de Autorización Pgo Móvil
    let DatosUserAgent = {
      browser_agent: this.TypeNavegador,
      ipaddress: this.IpAddress.ip,
      destination_id: this.pref_ci?.value + this.c_iRegPgoMvil?.value,
      destination_mobile_number: this.tlfdestin?.value.toString(),
    }
    this.alertFindDni('Enviando clave de autorización', 'Por favor espere...');
    switch (Tipo) {
      case "BNC":
        console.log("Se debe llamar el metodo para generar el pin")
        break;
      default:
        this._ApiMercantil.C2PClave(DatosUserAgent)
          .then((resp: any) => {
            if (resp.hasOwnProperty('error_list')) {
              this.invalidForm(`${resp.error_list[0].description}`, '');
            } else if (resp.hasOwnProperty('transactionScpInfoResponse')) {
              this.PinEnviado = true;
              this.ReenvioMethod(1, 59);
              this.ButtonGetAuthMercantil();
            } else if (resp.hasOwnProperty('status')) {
              this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!');
            } else {
              this.invalidForm(`Error intente mas tarde!`);
            }
          })
          .catch((error: any) => console.error(error)) //Tengo que decirle al usuario que paso con la el pago que realizo
        break;
    }
  }

  TipoBankSelect(Evento: any) {
    console.log("TipoBankSelect",Evento)
    switch (Evento.Tipo) {
      case "PagoMovil":
        if (Evento.Opcion === 'otros') { this.ShowalertBankNationals = true } else { this.SelectedPagoC2P({ '_value': Evento.Opcion }); }
        this.BankSelectPagoMovil = true
        break;
      case "Debito":
        if (Evento.Opcion === "BNC") {
          this.ShowFormDebitoCreditoBNC = true
        } else if (Evento.Opcion === "100% Banco") {
          this.ShowFormDebito100x100 = true
        }else {
          this.ShowFormDebitoCredito = true
        }
        break
        case "Credito":
          if (Evento.Opcion === "BNC") {
            this.ShowFormDebitoCreditoBNC = true
          }else {
            this.ShowFormDebitoCredito = true
          }
          break  
    }
  }

  OutputCreditoDebitoBNC(Event: any) {
    switch (Event.Tipo) {
      case "Regresar":
        this.ResetFormCD()
        this.ScrollUp()
        break;
      case "Pago Realizado":
        this.ShowFormDebitoCreditoBNC = false
        this.ReciboPay = true
        break;
    }
  }

  OutputDebito100x100(Event: any) {
    console.log("OutputDebito100x100",Event)
    switch (Event.Tipo) {
      case "Regresar":
        this.ResetFormCD()
        this.ScrollUp()
        break;
      case "Pago Realizado":
        this.ShowFormDebito100x100 = false
        this.alertexit("Pago aprobado");
        this.ReciboPay = true
        break;
    }
  }

  SelectedPagoC2P(value?: any) {
    console.log("Value SelectpagoC2P ")
    console.log(value)
    let Valor = value._value;
    this.SelectPagoc2p = value._value;
    switch (Valor) {
      case "otros":
        this.ShowalertBankNationals = false
        this.ConsultarPagoMovilboolean = true;
        this.RegistrarPagoMovilboolean = false;
        this.TypeForm = this.PgMovilForm;
        this.PgMovilForm.get('cantidad')?.setValue(this.saldoBs);
        this.PgMovilRegForm.get('amountPm')?.setValue('');
        this.PgMovilForm.get('prec_i')?.setValue('V');
        this.PgMovilForm.get('c_i')?.setValue(this.dni?.value);
        /* this.warningSimpleFormMercantilConButton(`Debes realizar un Pago Móvil con los datos a continuación:`,
          `<strong> Teléfono: </strong> 584129637516  <br/>  <strong>Rif: </strong> J-30818251-6  <br/> <strong> Banco:</strong> Mercantil(0105)<br><br> <p style="color:red"><strong>NOTA:</strong> Luego de realizar la operación debes reportar el pago en el formulario presentado.</p>`, ''); */
        break;
      case "mercantil":
        this.bancoSeleccionado = "Mercantil";
        this.TypeForm = this.PgMovilRegForm;
        this.ConsultarPagoMovilboolean = false;
        this.RegistrarPagoMovilboolean = true;
        this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
        this.PgMovilForm.get('cantidad')?.setValue('');
        this.PgMovilRegForm.get('pref_ci')?.setValue('V');
        this.PgMovilRegForm.get('c_i')?.setValue(this.dni?.value);
        break;
      case "BNC":
        this.TypeForm = this.PgMovilRegForm;
        this.ShowOptionBNCPagoMovil = true
        this.PgMovilBNCForm.get('amountPm')?.setValue(this.saldoBs);
        this.PgMovilBNCForm.get('cantidad')?.setValue('');
        this.PgMovilBNCForm.get('pref_ci')?.setValue('V');
        this.PgMovilBNCForm.get('c_i')?.setValue(this.dni?.value);
        break;
      case "100% Banco":
        this.bancoSeleccionado = "100x100 Banco";
        this.TypeForm = this.PgMovilRegForm;
        this.ConsultarPagoMovilboolean = false;
        this.RegistrarPagoMovilboolean = true;
        this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
        this.PgMovilForm.get('cantidad')?.setValue('');
        this.PgMovilRegForm.get('pref_ci')?.setValue('V');
        this.PgMovilRegForm.get('c_i')?.setValue(this.dni?.value);  
    }
  }

  GetEventsBNCPagoMovil(Dato: any) {
    console.log(Dato)
    switch (Dato) {
      case "BackToList":
        this.ShowOptionPagoMovil = true
        this.BankSelectPagoMovil = false
        this.ShowOptionBNCPagoMovil = false
        this.ReciboPay = false;
        break;
      case "Solicitar Pin":
        this.AmountIncorrectConfirm(this.amountPm?.value, 'this.ClaveAuthPgoMovilBNC()', 'c2pBNC')
        break
    }
  }

  async PagoP2PBNC() {
    const { value: token } = await Swal.fire({
      title: "Ingresa el token de autorización",
      input: "number",
      inputLabel: "token de autorización",
      inputPlaceholder: "token de autorización",
      validationMessage: "Debes ingresar un token valido.",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Pagar",
      inputAttributes: {
        maxlength: "6",
        autocapitalize: "off",
        autocorrect: "off"
      },
      inputValidator(value) {
        return new Promise((resolve) => {
          if (value.length == 6) {
            resolve(null);
          } else {
            resolve("Tu token no es valido");
          }
        })
      },
    });

    if (token) {
      const Datospago = {
        "Abonado": this.nroContrato?.value,
        "IdContrato": this.idContrato,
        "ChildClientID": this.pref_ci?.value + this.c_i_bnc?.value,
        "Amount": this.amountPm_bnc?.value,
        "Description": this.Desciption_bnc?.value
      }

      this._ApiBNC.PayP2P(Datospago).then((ResPay: any) => {
        if (ResPay && ResPay.status === true) {
          this.ShowOptionBNCPagoMovil = false
          this.ReciboPay = true
          Swal.fire({
            icon: "success",
            title: "Pago Móvil procesado correctamente.",
            showConfirmButton: false,
            timer: 1500
          });
        } else { this.invalidForm(ResPay.MsgError || ResPay.message, ''); }
      }).catch(err => console.error(err))
    }
  }

  PagoDebito() {
    console.log("Pase")
    let DatosUserAgent = {
      Browser: this.TypeNavegador,
      AddresIp: this.IpAddress.ip,
      ccv: this.ccv?.value,
      typeCuenta: this.typeCuenta?.value,
      Ncard: this.Ncard?.value,
      vencmto: this.fvncmtoAno?.value + '/' + this.fvncmtoMes?.value,
      cantidadDC: this.cantidadDC?.value,
      c_iDC: this.pref_ciDC?.value + this.c_iDC?.value,
      invoice: "", //El nro de factura se asigna en el backend
      PaymenMethod: this.PaymenMethod,
      Name: this.name?.value,
      Abonado: this.nroContrato?.value,
      idContrato: this.idContrato,
      Cliente: this.idContrato != "" ? true : false
    }
    //Si es Debito debo autoriza el pago en caso contrario no debo hacerlo
    if (!this.Creditoboolaean) {
      try {
        this.alertFindDniMercantil('Autorizando su pago', 'Por favor espere...');
        //Primero debo autorizar el pago
        this._ApiMercantil.GetAuthTDDv2(DatosUserAgent)
          .then((resp: any) => {
            if (resp.hasOwnProperty('error_list')) {
              this.invalidForm(`${resp.error_list[0].description}`, '');
            } else if (resp.hasOwnProperty('authentication_info')) {
              this.PinEnviado = true;
              this.ReenvioMethod(1, 59);
              this.ButtonGetAuthDebito(DatosUserAgent);

              /*if (resp.authentication_info.trx_status == "approved") {
                //Luego debo realizar la compra o retiro del dinero solicitado por el cliente
                this._ApiMercantil.CompraTDD(DatosUserAgent)
                  .then((resp: any) => {
                    if (resp.hasOwnProperty('error_list')) {
                      this.invalidForm(`${resp.error_list[0].description}`, '');
                    } else if (resp.hasOwnProperty('transaction_response')) {
                      if (resp.transaction_response.trx_status == "approved") {
                        this.alertexit("Pago realizado exitosamente");
                        this.ReciboPay = true;
                        this.registerPayService.linkedToContractProcess === "approved" ? this.registerPayService.paySubs(resp, this.registerPayService.dniCustomerContract) : ''
                      } else {
                        this.invalidForm(`Tu transacción fue rechazada por el banco, valide el monto ingresado`);
                      }
                    } else if (resp.hasOwnProperty('status')) {
                      this.invalidForm(`${resp.status.description}`);
                    } else {
                      this.invalidForm(`Error intente más tarde!`);
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                  })
              } else {
                this.invalidForm(`Tu transacción fue rechazada por el banco, valide los datos ingresados`);
              }*/
            } else if (resp.hasOwnProperty('status')) {
              this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!');
            } else {
              this.invalidForm(`Error intente más tarde!`);
            }
          })
          .catch((error: any) => {
            console.error(error);
            this.invalidForm(`Error por favor intente más tarde!`);
          })
      } catch (error) {
        console.error(error);
        this.invalidForm(`Error por favor intente más tarde!`)
      }
      //Tengo que decirle al usuario que paso con la el pago que realizo
    } else {
      try {
        //Credito
        this.alertFindDniMercantil('Enviando clave de autorización', 'Por favor espere...');
        this._Consultas.GeneratePin(String(this.dni?.value), "PinPagos")
          .then((resp: any) => {
            if (resp && resp.status) {
              this.PinEnviado = true;
              this.ReenvioMethod(1, 59);
              this.AuthCreditoReuso()
                .then((resp) => {
                  if (resp) {
                    this.alertFindDniMercantil('Realizando su pago', 'Por favor espere...');
                    this._ApiMercantil.CompraTDDv2(DatosUserAgent)
                      .then((resp: any) => {
                        if (resp.hasOwnProperty('error_list')) {
                          this.invalidForm(`${resp.error_list[0].description}`, '');
                        } else if (resp.hasOwnProperty('transaction_response')) {
                          if (resp.transaction_response.trx_status == "approved") {
                            this.alertexit("Pago realizado exitosamente");
                            this.ReciboPay = true;
                            this.PinEnviado = false;
                            this.registerPayService.linkedToContractProcess === "approved" ? this.registerPayService.paySubs(resp, this.registerPayService.dniCustomerContract) : ''
                          } else {
                            this.invalidForm(`Tu transacción fue rechazada por el banco, valide el monto ingresado`);
                          }
                        } else if (resp.hasOwnProperty('status')) {
                          this.invalidForm(`${resp.status.description}`);
                        } else {
                          this.invalidForm(`Error intente más tarde!`);
                        }
                      })
                      .catch((error: any) => {
                        this.invalidForm(`Error por favor intente más tarde!`);
                      })
                  }
                })
                .catch((error: any) => this.invalidForm(`Error por favor intente más tarde!`))
            } else {
              this.invalidForm(`Error por favor intente más tarde!`)
            }
          })
          .catch((error: any) => { console.error(error); this.invalidForm(`Error por favor intente más tarde!`) })
      } catch (error) {
        console.error(error);
        this.invalidForm(`Error por favor intente más tarde!`)
      }
    }
  }

  ConfirmPagoDebito(DatosUserAgent: any): void {
    DatosUserAgent.Clavetlfonica = this.Clavetlfonica?.value;
    this.alertFindDniMercantil('Comprobando pago', 'Por favor espere...');
    this._ApiMercantil.CompraTDDv2(DatosUserAgent)
      .then((resp: any) => {
        console.log(resp);
        if (resp.hasOwnProperty('error_list')) {
          this.invalidForm(`${resp.error_list[0].description}`, '');
        } else if (resp.hasOwnProperty('transaction_response')) {
          if (resp.transaction_response.trx_status == "approved") {
            this.alertexit("Pago realizado exitosamente");
            this.ReciboPay = true;
            this.registerPayService.linkedToContractProcess === "approved" ? this.registerPayService.paySubs(resp, this.registerPayService.dniCustomerContract) : ''
          } else {
            this.invalidForm(`Tu transacción fue rechazada por el banco, valide el monto ingresado`);
          }
        } else if (resp.hasOwnProperty('status')) {
          this.invalidForm(`${resp.status.description}`);
        } else {
          this.invalidForm(`Error intente más tarde!`);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.invalidForm(`Error intente más tarde!`);
      })
  }

  ReenvioMethod(Minute: number, Seconds: number) {
    //Esto es el código para Reenvio
    var date = new Date();
    date.setMinutes(Minute);
    date.setSeconds(Seconds);
    // Función para rellenar con ceros
    var padLeft = (n: any) => "00".substring(0, "00".length - n.length) + n;
    // Asignar el intervalo a una variable para poder eliminar el intervale cuando llegue al limite
    this.SetInterval = setInterval(() => {

      this.ConcatenaTimer = ":"
      // Asignar el valor de minutos
      this.Minutes = padLeft(date.getMinutes() + "");
      // Asignqr el valor de segundos
      this.Second = padLeft(date.getSeconds() + "");
      // Restarle a la fecha actual 1000 milisegundos
      date = new Date(date.getTime() - 1000);

      // Si llega a 2:45, eliminar el intervalo
      if (this.Minutes == '00' && this.Second == '00') {
        this.Minutes = "";
        this.Second = "";
        this.ConcatenaTimer = ""
        clearInterval(this.SetInterval);
        this.PinEnviado = false;
      }

    }, 1000);
  }

  AuthCreditoReuso() {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: 'Clave de autorización',
        text: "Enviado vía WhatsApp y SMS",
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: (resp) => {
          if (resp && resp.length === 6) {
            return this._Consultas.VerificarPin(String(this.dni?.value), resp)
              .then((resp: any) => {
                if (resp && !resp.status) {
                  Swal.showValidationMessage(
                    `PIN incorrecto`
                  )
                  ++this.PinError
                  if (this.PinError === 3) {
                    setTimeout(() => {
                      window.location.reload()
                    }, 1000);
                  }
                } else if (resp && resp.status) {
                  return resp
                } else {
                  Swal.showValidationMessage(
                    `Error al intentar enviar el PIN intente nuevamente`
                  )
                }
              })
              .catch((error: any) => Swal.showValidationMessage(
                `Request failed: ${error}`
              ))
          } else {
            return Swal.showValidationMessage(
              `Longitud de pin es incorrecto deben ser 6 carácteres máximo`
            )
          }

        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(true);
        }

      })
    })
  }

  uploadImagePayment($event: any) {
    this.uploadingImg = true;
    let reader = new FileReader();
    reader.readAsDataURL($event.target.files[0]);
    reader.onload = (_event) => {
      let imageBase64: any = reader.result
      const fileList: FileList = $event.target.files;
      if (fileList.length > 0) {
        const file = fileList[0];
        if (!this.uplaodImageService.verifyFileSize(file.size)) {
          this.uploadingImg = false;
          return;
        }
        this.uplaodImageService.getUrlImageBase64({ dataFileBase64: imageBase64 }).subscribe(
          (res) => {
            this.uploadingImg = false;
            if (res.status === 500 || res.status === 400) {
              return;
            }

            imageBase64 = '';
            this.imageUrl = res.url;
            this.SendOption(2, 0, res.url);
            this.imageUploaded = true;
          }, (err) => {
            this.uploadingImg = false;
            console.error('error registro pago', err);
          });
      }
    }
  }

  uploadImagePayment2($event: any) {
    const fileBlood = $event.target.files[0];
    this.uploadingImg = true;
    let reader = new FileReader();
    reader.readAsBinaryString(fileBlood);
    reader.onload = (_event) => {
      let imageBase64: any = `data:${fileBlood.type};base64,${btoa(reader.result as string)}`
      const fileList: FileList = $event.target.files;
      //Extraigo la extension del arhivo que subio
      this.extn = fileList[0].name.split(".").pop();
      //Valido si es aceptado la extenxion
      this.indexof = this.validFormats.indexOf(this.extn.toLowerCase());

      if (this.indexof != -1) {
        this.ValidExtension = true;
        if (fileList.length > 0) {
          const file = fileList[0];
          if (!this.uplaodImageService.verifyFileSize(file.size)) {
            this.uploadingImg = false;
            return;
          }

          var dt = new Date();
          let year = dt.getFullYear();
          let month = (dt.getMonth() + 1).toString().padStart(2, "0");
          let day = dt.getDate().toString().padStart(2, "0");
          let Hour = dt.getHours().toString();
          let Minute = dt.getMinutes().toString();
          let Second = dt.getSeconds().toString();
          let NameCloud = this.nroContrato?.value + '-' + day + '-' + month + '-' + year + '-' + Hour + Minute + Second

          //OLD SERVICE TO CONVERT IMG//PDF FILES

          //Paso el file en base64 y el nombre que se le asignara
          // this._Cloudinary.UploadImagenCloudynariSignature(imageBase64, NameCloud)
          //   .then((response: any) => {
          //     if (response.hasOwnProperty('error')) {
          //       this.countErrorUploadImage(imageBase64, NameCloud);
          //       return;
          //     }
          //     this.uploadingImg = false;
          //     imageBase64 = '';

          //     this.imageUrl = response.secure_url;
          //     this.SendOption(2, 0, response.url);
          //     this.imageUploaded = true;
          //   })
          //   .catch((error: any) => {
          //     console.error(error);
          //     this.countErrorUploadImage(imageBase64, NameCloud)
          //   })



          //NEW SERVICE TO CONVERT IMG//PDF FILES
          try {
            this._Cloudinary.upload_images(imageBase64, NameCloud)
              .then((url) => {
                imageBase64 = '';
                this.uploadingImg = false;
                this.imageUrl = url;
                // this.imageUrl = res.url;
                this.SendOption(2, 0, url);
                this.imageUploaded = true;
              })
              .catch((err) => {
                console.error(err);
                this.countErrorUploadImage(imageBase64, NameCloud)
                this.uploadingImg = false;
              })

          } catch (error) {
            console.error(error);
            this.countErrorUploadImage(imageBase64, NameCloud)
          }
        }
      } else {
        this.ValidExtension = false;
        this.uploadingImg = false;
      }
    }
  }

  VerifyRefencia(NroRef?: any) {
    try {
      this.LoadingCheckReferencia = true
      this.registerPayService.ReferenciaMes(NroRef)
        .then((response: any) => {
          this.LoadingCheckReferencia = false
          if (response && response.codigo === 1000) {
            this.secondFormFibex = this.fb.group({
              voucher: ['', [Validators.required]],
            });

            this.ExitRef = false

            this.invalidForm('Ya existe un pago registrado con la misma referencia y cuenta bancaria.');
          } else {
            this.voucher?.setValue(NroRef);
            this.NextMatStepper()
          }
        })
        .catch((error: any) => {
          this.LoadingCheckReferencia = false
          this.secondFormFibex = this.fb.group({
            voucher: ['', [Validators.required]],
          });

          this.ExitRef = false

          this.invalidForm('Error al intentar validar su referencia, por favor intente más tarde.');
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
      console.error(error)
    }
  }

  NextMatStepper() {
    this.stepper.next();
  }

  uploadRetentionImagePayment2($event: any) {
    this.uploadingRetentionImg = true;
    let reader = new FileReader();
    reader.readAsDataURL($event.target.files[0]);
    reader.onload = (_event) => {
      let imageBase64: any = reader.result
      const fileList: FileList = $event.target.files;
      //Extraigo la extension del arhivo que subio
      this.retentionImgExtn = fileList[0].name.split(".").pop();
      //Valido si es aceptado la extenxion
      this.retentionImgIndexof = this.validFormats.indexOf(this.retentionImgExtn.toLowerCase());
      if (this.retentionImgIndexof != -1) {
        this.ValidRetentionImgExtension = true;
        if (fileList.length > 0) {
          const file = fileList[0];
          if (!this.uplaodImageService.verifyFileSize(file.size)) {
            this.uploadingRetentionImg = false;
            return;
          }
          var dt = new Date();
          let year = dt.getFullYear();
          let month = (dt.getMonth() + 1).toString().padStart(2, "0");
          let day = dt.getDate().toString().padStart(2, "0");
          let Hour = dt.getHours().toString();
          let Minute = dt.getMinutes().toString();
          let Second = dt.getSeconds().toString();
          let NameCloud = this.nroContrato?.value + '-' + day + '-' + month + '-' + year + '-' + Hour + Minute + Second

          //NEW SERVICE TO CONVERT IMG//PDF FILES

          //Paso el file en base64 y el nombre que se le asignara
          // this._Cloudinary.UploadImagenCloudynariSignature(imageBase64, NameCloud)
          //   .then((response: any) => {
          //     if (response.hasOwnProperty('error')) {
          //       this.countErrorUploadImage(imageBase64, NameCloud);
          //       return;
          //     }
          //     this.uploadingRetentionImg = false;
          //     imageBase64 = '';
          //     this.retentionImageUrl = response.secure_url;
          //     this.SendOption(2, 0, response.url);
          //     this.retentionimageUploaded = true;
          //   })
          //   .catch((error: any) => {
          //     console.error(error);
          //     this.countErrorUploadImage(imageBase64, NameCloud)
          //   })


          //NEW SERVICE TO CONVERT IMG//PDF FILES

          try {
            this._Cloudinary.upload_images(imageBase64, NameCloud)
              .then((url) => {
                imageBase64 = '';
                this.uploadingRetentionImg = false;
                this.retentionImageUrl = url;
                this.SendOption(2, 0, url);
                this.retentionimageUploaded = true;
              })
              .catch((err) => {
                console.error(err);
                this.countErrorUploadImage(imageBase64, NameCloud);
              })

          } catch (error) {
            console.error(error);
            this.countErrorUploadImage(imageBase64, NameCloud)
          }
        }
      } else {
        this.ValidRetentionImgExtension = false;
        this.uploadingRetentionImg = false;
      }
    }
  }

  savePayment() {
    this.DisableReg = true
    if (this.firstFormFibex.invalid || this.secondFormFibex.invalid || this.thirdFormFibex.invalid || (this.fourthFormFibex.invalid && (this.possibleWithholdingAgent && this.selectedRetentionOption == 2))) {
      if (!this.regexUrl.test(this.imageUrl)) {
        this.invalidForm('La imagen de pago es requerida');
        this.closeAlert();
        this.DisableReg = false
        return;
      }
      if (!this.regexUrl.test(this.retentionImageUrl) && this.possibleWithholdingAgent && this.selectedRetentionOption == 2) {
        this.invalidForm('La imagen de pago del comprobante por ser agente de retención es requerida');
        this.closeAlert();
        this.DisableReg = false
        return;
      }
      this.invalidForm('Existen campos requeridos que no fueron llenados correctamente');
      this.closeAlert();
      this.DisableReg = false
      return;
    }
    let contractInfo = this.listContratos.find((info) => {
      if (this.nroContrato) {
        return this.nroContrato.value === info.contrato;
      }
      return {};
    })
    var saldo = "0";

    if (this.BancoNacional(this.banco) && contractInfo?.saldo != undefined) {
      saldo = (parseFloat(contractInfo.saldo) * this.cambio_act).toFixed(2)
    } else {
      if (contractInfo?.saldo != undefined) {
        saldo = parseFloat(contractInfo?.saldo).toFixed(2)
      }
    }

    var dt = new Date(this.date?.value);
    let year = dt.getFullYear();
    let month = (dt.getMonth() + 1).toString().padStart(2, "0");
    let day = dt.getDate().toString().padStart(2, "0");
    let date = year + "/" + month + "/" + day;

    this.sendingPay = true;
    const DataForRegister = {
      ...this.firstFormFibex.value,
      ...this.secondFormFibex.value,
      ...this.thirdFormFibex.value,
      img: this.selectedRetentionOption == 2 ? this.imageUrl + ' -Retención:' + this.retentionImageUrl + ' -Monto:' + this.retentionAmount?.value : this.imageUrl,
      name: contractInfo?.cliente,
      amount: this.totalAmount > 0 ? String(this.totalAmount) : this.amount?.value,
      date,
      id_Cuba: this.BancoSelect.id_cuba,
      Browser: this.TypeNavegador,
      AddresIp: this.IpAddress.ip,
    }

    const ContratoActual: any = this.listContratos.find((CA: any) => CA.contrato === DataForRegister.nroContrato)

    if (ContratoActual && ContratoActual.status_contrato != "ANULADO" || ContratoActual.status_contrato != "RETIRADO" && DataForRegister.amount > 0) {
      DataForRegister.IdContrato = ContratoActual.id_contrato
      this.registerPayService.registerPayClientv2(DataForRegister)
        .then((res: any) => {
          this.DisableReg = false
          if (res) {

            this.sendingPay = false;
            if (res && res.length > 0) {
              try {
                // res.data.forEach((Data: any) => {
                if (res[0].to == "DUPLICADO") {
                  this.playDuplicated = true;
                  this.payReported = false;
                } else if (res[0].to.includes('Error')) {
                  this.ErrorRegistrando = true;
                  this.MessageErrorRegistrado = res[0].to;
                } else {
                  this.SendOption(3, 0, true);
                  this.payReported = true;
                  this.playDuplicated = false;
                }
                // });

              } catch (error) {
                this.payReported = true;
              }

              this.ScrollUp()
              this.Contar = 10;
              this.Contador();

            }
          }
        })
        .catch((error: any) => {
          console.error(error);
        })

    } else {
      this.CuentaAnulada = true;
      this.playDuplicated = false;
      this.ScrollUp()
      this.Contar = 10;
      this.Contador()
    }

  }

  ScrollUp(Eventd?: any) {
    window.scroll(0, 0);
  }

  ResetForm() {

    this.nameClient = '';
    this.imageUrl = '';
    this.imageUploaded = false
    this.DisableReg = false
    this.cambio_act = 0;
    this.MyInit()
    this.ScrollUp()

    this.firstFormFibex.patchValue({
      name: '',
      dni: '',
      email: '',
      bank: '',
      nroContrato: '',
      date: '',
      amount: ''
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
    this.ShowFormDebitoCredito = false
    this.ShowFormDebitoCreditoBNC = false
    this.ShowFormDebito100x100 = false
    this.ReciboPay = false;
  }

  Contador() {
    this.Contar--
    if (this.Contar <= 0) {
      window.location.reload();   // Para verificar porque no registra el pago
    } else {
      setTimeout(() => this.Contador(), 1000);
    }

  }

  get disbaleButtonIfAmountIsInvalid(): boolean {
    return parseFloat(this.firstFormFibex.get('amount')?.value) < 0;
  }

  get disbaleButtonIfAmountIs0(): boolean {
    if (this.firstFormFibex.get('amount')?.value) {
      return this.firstFormFibex.get('amount')?.value.length === 0;
    } else { return false }
  }

  get disbaleButtonIfDateIsInvalid(): boolean {
    return this.dateInvalid;
  }

  get disableBtnAmountInvalid(): boolean {
    return this.invalidAmount;
  }

  get disableLengthContrato() {
    return this.nroContrato?.value.length === 0;
  }

  /*searchServices(dni: any, fromParmas?: boolean, NextContrato?: boolean) {
    this.possibleWithholdingAgent = false
    this.selectedRetentionOption = null
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
    if (dni_ === this.lastDni) {
      return;
    }
    this.dniConsulted = false;
    if (dni_.length >= 6) {
      this.alertFindDniMercantil('Buscando información del cliente', 'Por favor espere...');
      //Busco el tipo de cliente
      this.registerPayService.getTypeClient(dni_).then((result: any) => {
        if (result.length > 0 && result[0].TipoCliente != "NATURAL") {
          this.possibleWithholdingAgent = true
        }
      })
      //Busco por su Cédula
      //this.SearchDataClient(dni_)
      this.registerPayService.getSaldoByDni(dni_).then((res: any) => {
        this.lastDni = dni_;
        this.closeAlert();

        try {
          if (res.length > 0 || this.registerPayService.linkedToContractProcess === 'approved') {

            this.listContratos = [];
            this.ComprobantesPago = [];
            this.SendOption(0, 0, dni_);

            if (this.registerPayService.linkedToContractProcess != 'approved') {
              //Valido los estatus de los contratos
              res.forEach((dataContrato: any) => {
                var ValidOno = this.ValidStatusContrato(dataContrato.status_contrato);
                if (ValidOno) {
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
              });

              if (this.listContratos.length == 0) {
                this.invalidForm('Todos los contratos para esta cuenta están ANULADOS o RETIRADO!');
                this.lastDni = "";
              }

              //Esto solo va aplicar cuando solo sea un abonado para que la pantalla pase automática
              if (NextContrato) {
                if (this.listContratos.length == 1) {
                  this.AppFibex = true;
                  setTimeout(() => {
                    this.NextMatStepper();
                  }, 300);
                }
              }

              // if (this.registerPayService.linkedToContractProcess != 'approved') {
              //   this.tasaService.tasa.next(this.cambio_act.toString());
              //   this.tasaCambio = this.cambio_act.toString();
              //   // this.filterContracts();
              //   if (this.listContratos.length === 0) {
              //     this.dni?.setValue('')
              //     return;
              //   };

              //   this.idContrato = this.listContratos[0].id_contrato;
              //   this.nroContrato?.setValue(this.listContratos[0].contrato);
              //   this.SendOption(0, 3, this.listContratos[0].contrato);
              //   this.filterBankByFranquicia(this.listContratos[0].franquicia);
              //   this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
              //   this.nameClient = this.listContratos[0].cliente;
              //   this.name?.setValue(res[0].cliente);
              //   // this.SearchEmailContra(this.listContratos[0].contrato)
              // }

            } else {

              this.dni?.setValue(dni_);
              // this.searchInfoEquipos(dni_);
              this.nameClient = String(dni_);
              this.name?.setValue(String(dni_));
              this.cambio_act = Number(this.tasaCambio)
            }

            // EMITIR TASA DEL DÍA
            if (this.registerPayService.linkedToContractProcess != 'approved') {
              this.tasaService.tasa.next(this.cambio_act.toString());
              this.tasaCambio = this.cambio_act.toString();
              // this.filterContracts();
              // if (this.listContratos.length === 0) {
              //   this.dni?.setValue('')
              //   return;
              // };
              this.closeAlert2();
              this.readonlyDNI = true;
              this.idContrato = this.listContratos[0].id_contrato;
              this.nameClient = this.listContratos[0].cliente;
              this.name?.setValue(res[0].cliente);
              this.nroContrato?.setValue(this.listContratos[0].contrato);
              // this.SearchEmailContra(this.listContratos[0].contrato)
              this.SendOption(0, 3, this.listContratos[0].contrato);
              this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
              this.filterBankByFranquicia(this.listContratos[0].franquicia);
              this.dni?.setValue(dni_);
              this.searchInfoEquipos(dni_).then((result) => {
              }).catch((err) => {
                console.log('falló el ingreso de datos del usuario')
              });
            }

            if (this.registerPayService.linkedToContractProcess != 'approved') {
              //Busco su numeros de comprobantes
              this.registerPayService.getComprobantClient2(dni_)
                .then((comprobante: any) => {

                  if (comprobante.length > 0) {

                    //Voy a mostrar los últimos 5 comprobante voy a ordenarlo por fecha
                    this.AllComprobantesPago = comprobante;
                    let temp = comprobante.slice().sort((a: any, b: any) => b.Fecha.getTime() - a.Fecha.getTime());
                    temp = temp.slice(0, 5);
                    this.ValidateReferenciaLast(temp)
                  }
                })
                .catch((error: any) => console.error(error));
            }


            //Esto se hacer por si el usuario preciomente selecciona un banco
            if (this.BancoNacional(this.banco)) {
              if (!Number.isNaN(parseFloat(this.listContratos[0].saldo)) || !Number.isNaN(parseFloat(this.registerPayService.amountCustomerContract))) {

                if (this.registerPayService.linkedToContractProcess != 'approved') {
                  // Convertir en una función para que no se repita
                  this.validateIfAmountIsNegativer(this.listContratos[0].saldo, true);

                  this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);

                  this.saldoUSD = parseFloat(this.listContratos[0].saldo).toFixed(2);
                  this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
                } else {
                  // this.registerPayService.amountCustomerContract
                  this.validateIfAmountIsNegativer(this.registerPayService.amountCustomerContract, true);

                  this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);

                  this.saldoUSD = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
                  this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat('0').toFixed(2);
                }

              } else {
                this.amount?.setValue(0);
                this.lastAmount = '0';
              }
            } else {
              //this.validateIfAmountIsNegativer(this.listContratos[0].saldo);
              this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);
              this.saldoUSD = parseFloat(this.listContratos[0].saldo).toFixed(2);
              this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
              this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
            }

            //Esto lo uso para el CoinCoinx y Paypal NO BORRAR
            localStorage.setItem("Name", this._seguridadDatos.encrypt(this.nameClient));
            localStorage.setItem("Monto", this._seguridadDatos.encrypt(this.saldoUSD));
            localStorage.setItem("MontoBs", this._seguridadDatos.encrypt(this.saldoBs));
            localStorage.setItem("Subscription", this._seguridadDatos.encrypt(this.subscription));
            localStorage.setItem("idContrato", this._seguridadDatos.encrypt(this.idContrato));
            localStorage.setItem("dni", this._seguridadDatos.encrypt(this.dni?.value));
            localStorage.setItem("Abonado", this._seguridadDatos.encrypt(this.abonado));

            if (this.listContratos.length === 1) {
              this.listContratos.find((cliente) => {
                this.verifySaldo(cliente.saldo);
              });
            }
          } else {
            //this.hcaptcha.reset()
            this.nameClient = '';
            this.saldoUSD = '';
            this.saldoBs = '';
            this.lastAmount = '';
            this.dniConsulted = true;
            this.patchValueAllForm();
            this.invalidForm('Debe colocar una cédula válida');
            //this.verifyDNI = false;
            this.lastDni = "";
            setTimeout(() => this.closeAlert(), 1000);
            this.banksFiltered = [...this.bankList];
            this.listContratos = [];
            this.banksFiltered = [...this.bankList];
          }
        } catch (error) {

          if (this.registerPayService.linkedToContractProcess == 'approved') {
            this.tasaService.getSaldoBCV().subscribe((res) => {
              this.tasaCambio = res
            })
            this.closeAlert2();
            this.listContratos = [];
            this.ComprobantesPago = [];
            //this.verifyDNI = true;
            this.SendOption(0, 0, dni_);

            this.dni?.setValue(dni_);
            // this.searchInfoEquipos(dni_);
            this.nameClient = String(dni_);
            this.name?.setValue(String(dni_));
            this.cambio_act = parseFloat(this.tasaCambio)
            this.AppFibex = true

            //Esto se hacer por si el usuario preciomente selecciona un banco
            if (this.BancoNacional(this.banco)) {
              if (!Number.isNaN(parseFloat(this.registerPayService.amountCustomerContract))) {
                // this.registerPayService.amountCustomerContract
                this.validateIfAmountIsNegativer(this.registerPayService.amountCustomerContract, true);
                this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
                this.saldoUSD = (parseFloat(this.registerPayService.amountCustomerContract) / this.cambio_act).toFixed(2);
                this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract)).toFixed(2);
                this.subscription = parseFloat('No aplica').toFixed(2);
              } else {
                this.amount?.setValue(0);
                this.lastAmount = '0';
              }
            } else {
              this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
              this.saldoUSD = (parseFloat(this.registerPayService.amountCustomerContract) / this.cambio_act).toFixed(2);
              this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract)).toFixed(2);
              this.subscription = parseFloat('No aplica').toFixed(2);
            }
            if (NextContrato) {
              this.AppFibex = true;
              setTimeout(() => {
                this.NextMatStepper();
              }, 300);
            }
          }
          else {
            this.nameClient = '';
            this.saldoUSD = '';
            this.saldoBs = '';
            this.dniConsulted = true;
            this.lastDni = "";
            this.name?.setValue('');
            this.alertFindDni('Disculpe intente de nuevo', '');
            setTimeout(() => this.closeAlert(), 1000);
          }


        }

      })
    } else {
      // Esto lo hago porque el cliente ente busca una cedula valida y luego coloca una invalida
      // Se quedan los valores anteriores de la consulta anterior
      //this.hcaptcha.reset()
      this.dni?.setValue('')
      this.nameClient = '';
      this.saldoUSD = '';
      this.saldoBs = '';
      this.dniConsulted = true;
      this.lastDni = "";
      this.name?.setValue('');
      this.invalidForm('La cédula debe ser mínimo 6 carácteres', '');
      setTimeout(() => this.closeAlert(), 1000);
    }


  }*/

  searchServicesv2(dni: any, fromParmas?: boolean, NextContrato?: boolean) {
    //agreago por juan
    this.BankSelectPagoMovil = false
    this.ShowalertBankNationals = false
    this.ShowOptionPagoMovil = false
    //

    this.possibleWithholdingAgent = false
    this.selectedRetentionOption = null
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
    if (dni_ === this.lastDni) {
      return;
    }

    this.dniConsulted = false;
    if (dni_.length >= 6) {
      this.alertFindDniMercantil('Buscando información del cliente', 'Por favor espere...');
      //Busco el tipo de cliente
      this.registerPayService.getTypeClient(dni_).then((result: any) => {
        if (result.length > 0 && result[0].TipoCliente != "NATURAL") {
          this.possibleWithholdingAgent = true
        }
      })

      //Busco por su Cédula
      //this.SearchDataClient(dni_)
      this.registerPayService.getSaldoByDni(dni_).then((res: any) => {
        this.lastDni = dni_;
        this.closeAlert();
        console.log("saldo");
        console.log(res);

        try {
          if (res.length > 0 || this.registerPayService.linkedToContractProcess === 'approved') {

            this.listContratos = [];
            this.ComprobantesPago = [];
            this.SendOption(0, 0, dni_);

            if (this.registerPayService.linkedToContractProcess != 'approved') {
              //Valido los estatus de los contratos
              res.forEach((dataContrato: any) => {
                var ValidOno = this.ValidStatusContrato(dataContrato.status_contrato);
                if (ValidOno) {
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
              });

              if (this.listContratos.length == 0) {
                this.invalidForm('Todos los contratos para esta cuenta están ANULADOS o RETIRADO!');
                this.lastDni = "";
                return;
              }

              //Esto solo va aplicar cuando solo sea un abonado para que la pantalla pase automática
              if (NextContrato) {
                if (this.listContratos.length == 1) {

                  //! to validate franchise
                  this.abonado = this.listContratos[0].contrato
                  if (this.listContratos[0].franquicia.includes('FIBEX ARAGUA')) this.paymentMethod = 'aragua'
                  //this.DataPagoMovilPublic.push(parseFloat(this.registerPayService.amountCustomerContract).toFixed(2))
                  this.AppFibex = true;
                  setTimeout(() => {
                    this.NextMatStepper();
                  }, 300);
                } else {
                  this.SearchSectorAbonado();
                }
              }
            } else {
              this.dni?.setValue(dni_);
              this.nameClient = String(dni_);
              this.name?.setValue(String(dni_));
              this.cambio_act = Number(this.tasaCambio)
            }

            /* EMITIR TASA DEL DÍA */
            if (this.registerPayService.linkedToContractProcess != 'approved') {
              this.tasaService.tasa.next(this.cambio_act.toString());
              this.tasaCambio = this.cambio_act.toString();

              if (this.listContratos.length === 0) {
                this.dni?.setValue('')
                return;
              };

              this.closeAlert2();
              this.readonlyDNI = true;
              this.idContrato = this.listContratos[0].id_contrato;
              this.nameClient = this.listContratos[0].cliente;
              this.name?.setValue(res[0].cliente);
              this.nroContrato?.setValue(this.listContratos[0].contrato);
              this.SendOption(0, 3, this.listContratos[0].contrato);
              this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
              this.filterBankByFranquicia(this.listContratos[0].franquicia);
              this.dni?.setValue(dni_);
              this.searchInfoEquipos(dni_).then((result) => {
              }).catch((err) => {
                console.log('falló el ingreso de datos del usuario')
              });
            }

            if (this.registerPayService.linkedToContractProcess != 'approved') {
              //Busco su numeros de comprobantes
              this.registerPayService.getComprobantClient2(dni_)
                .then((comprobante: any) => {
                  console.log(comprobante);
                  if (comprobante.length > 0) {

                    //Voy a mostrar los últimos 5 comprobante voy a ordenarlo por fecha
                    this.AllComprobantesPago = comprobante;
                    let temp = comprobante.slice().sort((a: any, b: any) => b.Fecha.getTime() - a.Fecha.getTime());
                    temp = temp.slice(0, 5);
                    this.ValidateReferenciaLast(temp)
                  }
                })
                .catch((error: any) => console.error(error));
            }


            /*Esto se hacer por si el usuario preciomente selecciona un banco */
            if (this.BancoNacional(this.banco)) {
              if (!Number.isNaN(parseFloat(this.listContratos[0].saldo)) || !Number.isNaN(parseFloat(this.registerPayService.amountCustomerContract))) {

                if (this.registerPayService.linkedToContractProcess != 'approved') {
                  this.validateIfAmountIsNegativer(this.listContratos[0].saldo, true);

                  this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);

                  this.saldoUSD = parseFloat(this.listContratos[0].saldo).toFixed(2);
                  this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
                } else {
                  // this.registerPayService.amountCustomerContract
                  this.validateIfAmountIsNegativer(this.registerPayService.amountCustomerContract, true);

                  this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);

                  this.saldoUSD = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
                  this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat('0').toFixed(2);
                }

              } else {
                this.amount?.setValue(0);
                this.lastAmount = '0';
              }
            } else {
              //this.validateIfAmountIsNegativer(this.listContratos[0].saldo);
              this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);
              this.saldoUSD = parseFloat(this.listContratos[0].saldo).toFixed(2);
              this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
              this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
            }

            //Esto lo uso para el CoinCoinx y Paypal NO BORRAR
            localStorage.setItem("Name", this._seguridadDatos.encrypt(this.nameClient));
            localStorage.setItem("Monto", this._seguridadDatos.encrypt(this.saldoUSD));
            localStorage.setItem("MontoBs", this._seguridadDatos.encrypt(this.saldoBs));
            localStorage.setItem("Subscription", this._seguridadDatos.encrypt(this.subscription));
            localStorage.setItem("idContrato", this._seguridadDatos.encrypt(this.idContrato));
            localStorage.setItem("dni", this._seguridadDatos.encrypt(this.dni?.value));
            localStorage.setItem("Abonado", this._seguridadDatos.encrypt(this.abonado));


            if (this.listContratos.length === 1) {
              this.listContratos.find((cliente) => {
                this.verifySaldo(cliente.saldo);
              });
            }
          } else {
            //this.hcaptcha.reset()
            this.nameClient = '';
            this.saldoUSD = '';
            this.saldoBs = '';
            this.lastAmount = '';
            this.dniConsulted = true;
            this.patchValueAllForm();
            this.invalidForm('Debe colocar una cédula válida');
            //this.verifyDNI = false;
            this.lastDni = "";
            setTimeout(() => this.closeAlert(), 1000);
            this.banksFiltered = [...this.bankList];
            this.listContratos = [];
            this.banksFiltered = [...this.bankList];
          }
        } catch (error) {

          if (this.registerPayService.linkedToContractProcess == 'approved') {
            this.tasaService.getSaldoBCV().subscribe((res) => {
              this.tasaCambio = res
            })
            this.closeAlert2();
            this.listContratos = [];
            this.ComprobantesPago = [];
            //this.verifyDNI = true;
            this.SendOption(0, 0, dni_);

            this.dni?.setValue(dni_);
            // this.searchInfoEquipos(dni_);
            this.nameClient = String(dni_);
            this.name?.setValue(String(dni_));
            this.cambio_act = parseFloat(this.tasaCambio)
            this.AppFibex = true

            /*Esto se hacer por si el usuario preciomente selecciona un banco */
            if (this.BancoNacional(this.banco)) {
              if (!Number.isNaN(parseFloat(this.registerPayService.amountCustomerContract))) {
                // this.registerPayService.amountCustomerContract
                this.validateIfAmountIsNegativer(this.registerPayService.amountCustomerContract, true);
                this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
                this.saldoUSD = (parseFloat(this.registerPayService.amountCustomerContract) / this.cambio_act).toFixed(2);
                this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract)).toFixed(2);
                this.subscription = parseFloat('No aplica').toFixed(2);
              } else {
                this.amount?.setValue(0);
                this.lastAmount = '0';
              }
            } else {
              //this.validateIfAmountIsNegativer(this.listContratos[0].saldo);
              this.lastAmount = parseFloat(this.registerPayService.amountCustomerContract).toFixed(2);
              this.saldoUSD = (parseFloat(this.registerPayService.amountCustomerContract) / this.cambio_act).toFixed(2);
              this.saldoBs = (parseFloat(this.registerPayService.amountCustomerContract)).toFixed(2);
              this.subscription = parseFloat('No aplica').toFixed(2);
            }
            if (NextContrato) {
              this.AppFibex = true;
              setTimeout(() => {
                this.NextMatStepper();
              }, 300);
            }
          }
          else {
            this.nameClient = '';
            this.saldoUSD = '';
            this.saldoBs = '';
            this.dniConsulted = true;
            this.lastDni = "";
            this.name?.setValue('');
            this.alertFindDni('Disculpe intente de nuevo', '');
            setTimeout(() => this.closeAlert(), 1000);
          }


        }

      })
    } else {
      // Esto lo hago porque el cliente ente busca una cedula valida y luego coloca una invalida
      // Se quedan los valores anteriores de la consulta anterior
      //this.hcaptcha.reset()
      this.dni?.setValue('')
      this.nameClient = '';
      this.saldoUSD = '';
      this.saldoBs = '';
      this.dniConsulted = true;
      this.lastDni = "";
      this.name?.setValue('');
      this.invalidForm('La cédula debe ser mínimo 6 carácteres', '');
      setTimeout(() => this.closeAlert(), 1000);
    }


  }

  lengthContrat() {
    this.AppFibex = !this.AppFibex
  }

  SearchSectorAbonado() {

    this.LoadingLengthAbonado = true;
    let Value: any = "";
    this.listContratos.forEach((element: any, index: number) => {
      Object.entries(element).forEach(([key, value]) => {
        if (key == "contrato" && index < this.listContratos.length - 1) {
          Value += `'${value}',`;
        } else if (key == "contrato") {
          Value += `'${value}'`
        }
      })
    })

    this.registerPayService.AbonadoSearchSector(Value)
      .then((resp: any) => {
        this.LoadingLengthAbonado = false;
        if (resp && resp.codigo == 1010) {
          let SectorAbonado: any[] = JSON.parse(resp.data);
          SectorAbonado.forEach((element: any) => {
            let index = this.listContratos.findIndex((data: any) => data.contrato == element.nro_contrato)
            if (index != -1) {
              this.listContratos[index].sector = element.sector;
            }
          });
        }
      })
      .catch((error: any) => {
        this.LoadingLengthAbonado = false;
        console.error(error);
      })
  }

  ValidStatusContrato(Status: string) {
    var ContratosAccept = ['ACTIVO', 'POR CORTAR', 'POR INSTALAR', 'CORTADO', 'SUSPENDIDO'];
    return ContratosAccept.includes(Status);
  }

  ValidateLastReferencia(NroRef: any) {
    //Elimino todos los ceros a la izquierda
    NroRef = NroRef.replace(/^(0+)/g, '');
    //Busco en mi memoria de comprobante luego llamo al de API por si acaso
    const INDEX = this.AllComprobantesPago.findIndex((value: any) => value.Referencia == NroRef)
    // ValidateLastReferencia(NroRef: any) {
    //   //Busco en mi memoria de comprobante luego llamo al de API por si acaso
    //   const INDEX = this.AllComprobantesPago.findIndex((value: any) => value.Referencia == NroRef)

    if (INDEX != -1) {
      this.secondFormFibex = this.fb.group({
        voucher: ['', [Validators.required]]
      });
      this.invalidForm('Ya existe un pago registrado con la misma referencia y cuenta bancaria.');
    } else {
      this.VerifyRefencia(NroRef)
    }
  }

  ValidateReferenciaLast(Data: any) {
    Data.forEach((element: any, index: any) => {
      this.registerPayService.ConsultarEstadoDeposito(this.nroContrato?.value, element.Referencia).then((ResDeposito: any) => {
        if ((ResDeposito.success === "true") || ResDeposito.success === true) {
          element.Status = ResDeposito.data[0].estatus_deposito;
        } else if ((ResDeposito.success === "false") || ResDeposito.success === false) {
          element.Status = "SIN PROCESAR";
        }
      })
      if (index == Data.length - 1) {
        this.ComprobantesPago = Data
      }
    });
  }

  SearchEmailContra(Contrato: any) {
    try {
      let element: any = document.getElementById('InputEmail')
      if (Contrato) {

        const DataContra = this.AllDataClient.find((DC: any) => DC.idCliente === Contrato)

        if (DataContra && DataContra.email) {
          this.email?.setValue(DataContra.email)
          // element.disabled = true
        } else {
          // element.disabled = false
        }

      } else { element.disabled = false }

    } catch (error) {
      console.error(error)
    }
  }

  VerifyEmail() {
    try {

      const Email = this.email?.value.toLowerCase().trim();

      if (Email.includes("pagos3") || Email.includes("pago3") ||
        Email.includes("pagoshogar") || Email.includes("pagohogar") ||
        Email.includes("pagosempresa") || Email.includes("pagoempresa") ||
        Email.includes("pagospyme") || Email.includes("pagopyme") ||
        Email.includes("pagofibex") || Email.includes("pagosfibex") ||
        Email.includes("pagofibes") || Email.includes("pagosfibes") ||
        Email.includes("pagofivex") || Email.includes("pagosfivex") ||
        Email.includes("pagofives") || Email.includes("pagosfives")) {
        this.enableBtn = true
        Swal.fire({
          icon: 'error',
          title: 'Correo erróneo',
          text: 'Estimado cliente, se le recuerda que debe colocar su correo personal'
        })

      } else {
        this.enableBtn = false
      }

    } catch (error) {
      console.error(error)
    }
  }

  SearchServiceClient(Contrato: any) {
    try {
      this.AllService = []
      this.registerPayService.GetListService(Contrato).then((ResService: any) => {
        if (ResService.length > 0) {
          for (let index = 0; index < ResService.length; index++) {
            this.AllService.push(ResService[index].nombre_servicio.replace('FIBEX EXP', 'Fibex Express').replace('_', ' '))
          }
          this.paquete = this.AllService
          localStorage.setItem("Service", this._seguridadDatos.encrypt(JSON.stringify(this.paquete)));
        } else {
          this.selectInfoEquipos(Contrato)
        }

      }, (err) => {
        this.selectInfoEquipos(Contrato)
        console.error(err)
      })
    } catch (error) {
      console.error(error)
    }
  }

  searchInfoEquipos(dni: string) {
    return new Promise<void>((resolve, reject) => {
      this.paquetesContratos = [];
      // console.log(dni);
      this.registerPayService.infoEquiposClientes(dni)
        .then((res: any) => {
          // console.log(res);
          this.paquetesContratos = res.map((infoPaquete: any) => {
            return {
              id_contrato: infoPaquete.id_contrato,
              paquete: infoPaquete.paquetes
            }
          });
          if (this.paquetesContratos.length === 0) {
            // this.paquete = '';
            this.SearchServiceClient(this.idContrato)
            return;
          }
          this.SearchServiceClient(this.paquetesContratos[0].id_contrato)
        });
      resolve()
    })
  }

  selectInfoEquipos(id_contrato: string) {
    this.paquete = ''
    let paquete = this.paquetesContratos.find((index) => {
      return index.id_contrato === id_contrato
    })?.paquete;
    if (paquete !== undefined) {
      this.paquete = paquete;
    }
  }

  contractSelected(contrato: { contrato: string, saldo: string, id_contrato: string, subscription: string, franquicia: string }, ppal?: boolean) {
    this.BackFormaPago = false
    this.PagoMetodosHTML2 = FormasDePago;
    //! to validate franchise
    if (contrato.franquicia.includes('FIBEX ARAGUA')) this.paymentMethod = 'aragua'

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
    this.checkLocalStorageData()
    if (ppal) {
      this.AppFibex = true;
      //Para lograr un efecto de transición
      setTimeout(() => {
        this.NextMatStepper();
      }, 300);
    } else {
      this.bankSelected(this.BancoSelect);
    }
  }

  BancoNacional(StrBanco: string) {
    if (this.bank?.value.includes('USD') || this.bank?.value.includes('ZELLE') || this.bank?.value.includes('EUR') || this.bank?.value.includes('PAYPAL') || this.bank?.value.includes('STRIPE')) {
      this.secondFormFibex.get('BancoEmisor')?.setValidators([]);
      this.secondFormFibex.get('BancoEmisor')?.updateValueAndValidity();
      if (this.bank?.value.includes('EUR')) return 'EUR'
      else return false
    } else {
      this.secondFormFibex.get('BancoEmisor')?.setValidators([Validators.required]);
      this.secondFormFibex.get('BancoEmisor')?.updateValueAndValidity();
      return true
    }
  }

  bankSelected(bank: any) {
    console.log(bank)
    this.BancoSelect = bank
    this.banco = bank.Banco + bank.referencia_cuenta;
    if (this.BancoNacional(this.banco) && this.BancoNacional(this.banco) !== 'EUR') {
      console.log("por aqui")
      if (!Number.isNaN(Math.round(parseFloat(this.lastAmount)))) {
        this.validateIfAmountIsNegativer(this.lastAmount, true);
      }
    } else {
      console.log(bank)
      this.validateIfAmountIsNegativer(this.lastAmount);
      this.BancoEmisor(bank)
    }
  }

  alertFindDni(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      timer: 5000,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  alertFindDniMercantil(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      //timer: 5000,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  ButtonGetAuthMercantil() {

    Swal.fire({
      title: 'Clave de autorización',
      text: "Enviado vía sms",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (authClave) => {
        if (authClave && authClave.length === 8) {
          this.PgMovilRegForm.controls['auth'].setValue(authClave);
          return authClave
        } else {
          ++this.PinError
          if (this.PinError === 3) {
            setTimeout(() => {
              window.location.reload()
            }, 1000);
          }
          return Swal.showValidationMessage(
            `Longitud de pin es incorrecto deben ser 8 carácteres máximo`
          )
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.RegistrarPgoMovil();
      }
    })
  }

  ButtonGetAuthDebito(DatosUserAgent: any) {

    Swal.fire({
      title: 'Clave de autorización',
      text: "Enviado vía sms",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (authClave) => {
        if (authClave && authClave.length === 8) {
          this.DebitoCredito.controls['Clavetlfonica'].setValue(authClave);
          return authClave
        } else {
          ++this.PinError
          if (this.PinError === 3) {
            setTimeout(() => {
              window.location.reload()
            }, 1000);
          }
          return Swal.showValidationMessage(
            `Longitud de pin es incorrecto deben ser 8 carácteres máximo`
          )
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.ConfirmPagoDebito(DatosUserAgent);
      }
    })
  }

  alertDniAmount(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      icon: 'success',
      timer: 5000
    })
  }

  invalidForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'error'
    })
  }

  warningSimpleForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'warning',
      timer: 4000
    })
  }

  warningSimpleFormMercantil(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'warning',
    })
  }

  warningSimpleFormMercantilConButton(text: string, optionalText: string = '', buttontext: string) {
    return Swal.fire({
      title: text,
      html: optionalText,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Copiar Datos'
    }).then((result) => {
      if (result.isDismissed) {
        this.copyText(DatosPagoMovil[0]);
        this.openSnackBar('Datos copiados!')
      }
    })

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
      confirmButtonText: 'Continuar'
    }).then((result) => {
      if (result.isConfirmed && !use) {
        if (!this.disbaleButtonIfAmountIsInvalid &&
          !this.disbaleButtonIfAmountIs0 &&
          this.firstFormFibex.valid &&
          !this.disbaleButtonIfDateIsInvalid &&
          !this.invalidAmount) {
          this.NextMatStepper();
        }
      }
    })
  }

  warnignFormGeneral(text: string, html: string, ButtonCancel: string, ButtonConfirm: string, NameMetodo: string) {
    console.log('warnignFormGeneral')
    console.log("metodo",NameMetodo)
    Swal.fire({
      title: text,
      html: html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00184E',
      cancelButtonColor: '#f44336',
      cancelButtonText: ButtonCancel,
      confirmButtonText: ButtonConfirm
    }).then((result) => {
      if (result.isConfirmed) {
        //Metodo que voy a llamar
        switch (NameMetodo) {
          case 'this.ClaveAuthPgoMovil()':
            this.ClaveAuthPgoMovil();
            break;
          case 'this.ClaveAuthPgoMovilBNC()':
            this.ClaveAuthPgoMovil('BNC');
            break;
          case 'this.PagoDebito()':
            this.PagoDebito();
            break;
          case 'this.PagoC2P100x100()':
            this.PagoC2P100x100();
            break;  
          default:
            eval(NameMetodo);
            break;
        }

      }
    })
      .catch((error: any) => {
        console.error(error);
      })
    this.PlantillaTempPago = JSON.parse(JSON.stringify(PlantillaConfirmPago));
  }

  alertexit(text: string, optionalText: string = '') {
    Swal.fire(
      text,
      optionalText,
      'success'
    )
  }

  closeAlert() {
    setTimeout(() => {
      Swal.close();
    }, 2500)
  }

  closeAlert2() {
    Swal.close();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ImageComponent, {
      // panelClass: 'custom-size-standard',
      data: this.imageUrl
    });

    dialogRef.afterClosed().subscribe((deleteImage: boolean) => {
      if (deleteImage) {
        this.img?.setValue('');
        this.imageUrl = '';
        this.imageUploaded = false;
      }
    });
  }

  verifySaldo(saldo: string) {
    if (parseFloat(saldo) <= 0) {
      this.alertDniAmount('Usted no posee deuda pendiente', 'Tiene un saldo a favor de: ' + (parseFloat(saldo) * -1).toFixed(2) + ' REGISTRO PAGO ADELANTADO');
      setTimeout(() => {
      }, 1500)
    }
  }

  deleteImagePay() {
    this.img?.setValue('');
    this.imageUrl = '';
    this.imageUploaded = false;
    this.SendOption(2, 0, "deleteimage");
  }

  deleteRetentionImagePay() {
    this.retentionImg?.setValue('');
    this.retentionImageUrl = '';
    this.retentionimageUploaded = false;
  }

  validateIfAmountIsNegativer(amount: string, national?: boolean) {
    let saldoUSD = parseFloat(amount).toFixed(2);
    if (national) {
      if ((Number(saldoUSD)) <= 0) {
        this.amount?.setValue('');
        this.saldoText = 'SALDO A FAVOR';
        localStorage.setItem("Saldo", this._seguridadDatos.encrypt(this.saldoText));
      } else if (Number(saldoUSD) > 0) {
        this.saldoText = 'SALDO';
        localStorage.setItem("Saldo", this._seguridadDatos.encrypt(this.saldoText));
        this.amount?.setValue('');
        this.SendOption(0, 4, this.amount?.value)
      }
      return;
    }

    if (Number(saldoUSD) <= 0) {
      this.amount?.setValue('');
      this.saldoText = 'SALDO A FAVOR';
      localStorage.setItem("Saldo", this._seguridadDatos.encrypt(this.saldoText));
    } else if (Number(saldoUSD) > 0) {
      this.saldoText = 'SALDO';
      localStorage.setItem("Saldo", this._seguridadDatos.encrypt(this.saldoText));
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
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?', 0);
          return;
        }
      } else {
        if (Number(this.amount?.value) > Number(this.saldoBs)) {
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?', 0);
          return;
        }
      }
    }
    this.totalAmount = Number(this.amount?.value);
    this.NextMatStepper();
  }

  nextStepWithRetention(verifyAmount?: boolean) {
    if (this.nroContrato?.value.length === 0) {
      this.invalidForm('Debes seleccionar un contrato para avanzar', '');
      return;
    }
    if (verifyAmount) {

      if (!this.BancoNacional('')) {
        if (Number(this.totalAmount) > Number(this.saldoUSD)) {
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?', 0);
          return;
        }
      } else {
        if (Number(this.totalAmount) > Number(this.saldoBs)) {
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?', 0);
          return;
        }
      }
    }
    this.NextMatStepper();
  }

  considerWithholdingAmount() {
    this.totalAmount = Number(this.amount?.value) + Number(this.retentionAmount?.value)
  }

  resetParams() {
    this.retentionAmount?.reset();
    this.retentionImg?.reset()
    this.retentionImageUrl = '';
    this.retentionimageUploaded = false;
    this.considerWithholdingAmount();

    if (this.selectedRetentionOption == 1) {
      //Quito el required pq el usuario no decide subir la retencion
      this.fourthFormFibex.get('retentionImg')?.clearValidators();
      this.fourthFormFibex.get('retentionAmount')?.clearValidators();
      this.fourthFormFibex.get('retentionImg')?.updateValueAndValidity();
      this.fourthFormFibex.get('retentionAmount')?.updateValueAndValidity();
      this.possibleWithholdingAgent = false;
    } else {
      //Campo requerido de imagen de retencion
      this.fourthFormFibex.get('retentionImg')?.setValidators([Validators.required]);
      this.fourthFormFibex.get('retentionAmount')?.setValidators([Validators.required]);
      this.fourthFormFibex.get('retentionImg')?.updateValueAndValidity();
      this.fourthFormFibex.get('retentionAmount')?.updateValueAndValidity();
      this.possibleWithholdingAgent = true;
    }
  }

  filterBankByFranquicia(franquicia: string) {
    if (franquicia === 'FIBEX ARAGUA') {
      this.banksFiltered = this.bankList.filter((bank) => {
        return bank.Franquicia.includes(franquicia);
      });
      return;
    }

    this.banksFiltered = this.bankList.filter((bank) => {
      return bank.Franquicia.includes('FIBEX-all');
    });

  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, 'OK', {
      duration: 5000
    });
  }

  countErrorUploadImage(filebase64: any, NameFile: string) {
    if (this.counterErrors >= 2) {
      if (this.counterErrors >= 5) {
        if (this.counterErrors === 8 || !environment.PHPUpload) {
          this.showMessageErrorUpload = true;
          this.counterErrors = 0;
          this.openSnackBar('Error al subir la imagen, intente más tarde');
          this.uploadingImg = false;
          return;
        }
        if (environment.PHPUpload) {
          this._UploadPHP.uploadFilePHP(filebase64, NameFile)
            .then((response: any) => {
              if (response.error) {
                this.openSnackBar('Error al subir la imagen, intente nuevamente');
                this.counterErrors++;
                return;
              }
              this.uploadingImg = false;
              filebase64 = '';
              this.imageUrl = response.url;
              this.SendOption(2, 0, response.url);
              this.imageUploaded = true;
            })
            .catch((error: any) => {
              this.openSnackBar('Error al subir la imagen, intente nuevamente');
              console.error(error);
              this.counterErrors++;
            })
          return;
        }
      }

      this.uplaodImageService.getUrlImageBase64({ dataFileBase64: filebase64 }).subscribe(
        (res) => {
          this.uploadingImg = false;
          if (res.status === 500 || res.status === 400) {
            this.openSnackBar('Error al subir la imagen, intente nuevamente');
            this.counterErrors++;
            this.img?.setValue('');
            return;
          }

          filebase64 = '';
          this.imageUrl = res.url;
          this.SendOption(2, 0, res.url);
          this.imageUploaded = true;
        }, (err) => {
          this.uploadingImg = false;
          console.error('error registro pago', err);
          this.openSnackBar('Error al subir la imagen, intente nuevamente');
          this.counterErrors++;
          this.img?.setValue('');
        });
    } else {
      this.img?.setValue('');
      this.openSnackBar('Error al subir la imagen, intente nuevamente');
      this.counterErrors++;
      this.uploadingImg = false;
    }

  }

  patchValueAllForm() {
    this.firstFormFibex.patchValue({
      name: '',
      dni: '',
      email: '',
      bank: '',
      nroContrato: '',
      date: '',
      amount: ''
    });
    this.secondFormFibex.patchValue({
      voucher: '',
      nameTitular: '',
      dniTitular: '',
      emailTitular: '',
      BancoEmisor: '',
    })
    this.thirdFormFibex.patchValue({
      img: '',
      note: ''
    })
    this.fourthFormFibex.patchValue({
      retentionImg: '',
      retentionAmount: ''
    })
  }

  imageNotUploaded() {
    this.ScrollUp()
    if (this.showMessageErrorUpload) {
      return;
    }
    if (this.img?.invalid && this.img?.value == '' && !this.regexUrl.test(this.imageUrl)) {
      this.invalidForm('La imagen de pago es requerida');
      this.closeAlert();
    }
  }

  incorrectBankAndAmount(value: string) {

    if (Number(this.amount?.value) === 0) {
      this.amount?.reset()
      this.invalidForm("Monto incorrecto", "Por favor ingrese un monto mayor a 0")
      this.enableBtn = true;
      return
    } else { this.enableBtn = false }

    if (this.invalidAmount) return;
    this.SendOption(0, 4, this.amount?.value)
    let saldousd = Number(this.saldoUSD) - Number(value);
    let saldobs = Number(this.saldoBs) - Number(value);
    if (saldousd < 0) saldousd = saldousd * (-1);
    if (saldobs < 0) saldobs = saldobs * (-1);

    if (this.possibleWithholdingAgent && this.BancoNacional('') && this.BancoNacional('') != "EUR" && this.selectedRetentionOption == 2) {
      this.warnignForm(`Está a punto de reportar ${value} BOLIVARES.`,
        `En caso de ser agente de retención, no considere la cantidad a retener e incorpórelo en el apartado de Retención.`, 1);
    }

    if (this.possibleWithholdingAgent && !this.BancoNacional('') && this.selectedRetentionOption == 2 && saldousd < 1) {
      this.warnignForm(`Está a punto de reportar ${value} DÓLARES.`,
        `En caso de ser agente de retención, no considere la cantidad a retener e incorpórelo en el apartado de Retención.`, 1);
    }

    if (this.possibleWithholdingAgent && this.BancoNacional('') == "EUR" && this.selectedRetentionOption == 2) {
      this.warnignForm(`Está a punto de reportar ${value} <span style="color:red;"> EUROS.<span>`,
        `En caso de ser agente de retención, no considere la cantidad a retener e incorpórelo en el apartado de Retención.`, 1);
    }

    if (this.BancoNacional('') && this.BancoNacional('') != "EUR" && !this.possibleWithholdingAgent) {
      this.warnignForm(`¿Reportar pago? Monto en bolívares: ${value}`,
        `El monto debe ser expresado en BOLíVARES para el ${this.bank?.value}.`, 1);
    }

    if (!this.BancoNacional('') && !this.possibleWithholdingAgent) {
      this.warnignForm(`¿Reportar pago? Monto en dólares: ${value}`,
        `El monto debe ser expresado en DÓLARES para el ${this.bank?.value}.`, 1);
    }

    if (this.BancoNacional('') == "EUR" && !this.possibleWithholdingAgent) {
      this.warnignForm(`Está a punto de reportar ${value} <span style="color:red;"> EUROS </span>, ¿estas seguro?`,
        `El monto debe ser expresado en DÓLARES para el ${this.bank?.value}.`, 1);
    }

    this.totalAmount = Number(this.amount?.value);
  }

  AmountIncorrectConfirm(value: string, Metodo: string, type?: string) {
    console.log("AmountIncorrectConfirm");
    console.log("value",value)
    if (Number(value) === 0) {
      this.invalidForm("Monto incorrecto", "Por favor ingrese un monto mayor a 0");
      this.cantidadDC?.reset();
      return
    } else if (!this.invalidAmount) {
      let saldobs = Number(this.saldoBs) - Number(value);
      if (saldobs < 0) saldobs = saldobs * (-1);

      if (type != undefined && type != null && type != "") {


        let PlantillaPago: any = this.PlantillaTempPago.filter((plantilla: any) => plantilla.tipo == type);
        PlantillaPago[0].replace.forEach((replaceRem: any, index: number) => {

          PlantillaPago[0].html = PlantillaPago[0].html.replace(replaceRem, String(eval(PlantillaPago[0].campos[index])))

          if (index == PlantillaPago[0].replace.length - 1) {

            this.warnignFormGeneral(`Tus datos de pagos son los siguientes:`,
              PlantillaPago[0].html, "Editar Datos", "Procesar Pago", Metodo);
          }
        })

      } else {
        this.warnignFormGeneral(`¿Reportar pago?`,
          `Monto en Bolívares: ${value} BOLIVARES`, "Cancelar", "Continuar", Metodo)
      }
    }
  }

  AmountIncorrectConfirmv2(value: string, Metodo: string, type?: string) {
    if (Number(value) === 0) {
      this.invalidForm("Monto incorrecto", "Por favor ingrese un monto mayor a 0");
      this.cantidadDC?.reset();
      return
    } else if (!this.invalidAmount) {
      let saldobs = Number(this.saldoBs) - Number(value);
      if (saldobs < 0) saldobs = saldobs * (-1);

      if (type != undefined && type != null && type != "") {


        let PlantillaPago: any = this.PlantillaTempPago.filter((plantilla: any) => plantilla.tipo == type);
        PlantillaPago[0].replace.forEach((replaceRem: any, index: number) => {

          PlantillaPago[0].html = PlantillaPago[0].html.replace(replaceRem, String(eval(PlantillaPago[0].campos[index])))

          if (index == PlantillaPago[0].replace.length - 1) {

            this.warnignFormGeneral(`Tus datos de pagos son los siguientes:`,
              PlantillaPago[0].html, "Editar Datos", "Procesar Pago", Metodo);
          }
        })

      } else {
        this.warnignFormGeneral(`Está a punto de reportar ${value} BOLIVARES, ¿estas seguro?`,
          `El monto debe ser expresado en BOLIVARES.`, "Editar Monto", "Seguir adelante", Metodo)
      }
    }
  }

  Antibruteforce() {
    if (this.ComprobanteReportado == "") {
      this.ComprobanteReportado = this.referenciapm?.value;
      // console.log(this.ComprobanteReportado)
    }

    if (this.ComprobanteReportado == this.referenciapm?.value) {
      if (this.CountCompReport == 2) {
        this.ComprobanteReportado = "";
        this.ResetFormCD();
        this.CountCompReport = 0;
      } else {
        ++this.CountCompReport;
        console.log(this.CountCompReport)
      }
    } else {
      this.ComprobanteReportado = this.referenciapm?.value;
      this.CountCompReport = 1;
    }

  }

  dateOfPay() {
    this.date?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          let date = new Date(value).getTime()
          const { days } = this.miceService.timeDifference(new Date().getTime(), date);
          if (days > 182) {

            this.invalidForm('No puede reportar un pago con más de 6 meses', 'Por favor diríjase a una oficina comercial');
            this.firstFormFibex.get('date')?.setValue('');
            this.dateInvalid = true;
            this.errorDate = !this.errorDate;
            return;
          }
          this.dateInvalid = false;
          let feriadoDay = this.daysFeriados.find((days: BanksDays) => days.fecha === new Date(value).toISOString());
          if (feriadoDay !== undefined) {
            let month = feriadoDay.mes.charAt(0).toUpperCase() + feriadoDay.mes.slice(1);
            this.warningSimpleForm(`El día ${feriadoDay.diasemana.toLowerCase()} ${feriadoDay.dia} de ${month} es feriado nacional`, `
            ¿Esta seguro que su pago cae en la fecha que usted indica?
            `);
          }
        }
      }
    })
  }

  amountInvalid() {
    this.amount?.valueChanges.subscribe({
      next: (value) => {
        if (this.BancoNacional('')) {
          if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 6) {
            this.invalidAmount = true;
            this.invalidForm(`Usted no puede reportar con más de 6 meses de su subscripción`, ``);
            this.amount?.setValue('');
            return;
          }
        }
        if (!this.BancoNacional('')) {
          if (Number(value) > Number(this.saldoUSD) && Number(value) > Number(this.subscription) * 6) {
            this.invalidAmount = true;
            this.invalidForm(`Usted no puede reportar con más de 6 meses de su subscripción`, ``);
            this.amount?.setValue('');
            return;
          }
        }
        this.invalidAmount = false;
      }
    })
  }

  amountInvalidCreditoDebitoPagoMovil() {
    this.cantidadDC?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 6) {
          this.invalidAmount = true;
          this.invalidForm(`Usted no puede reportar con más de 6 meses de su subscripción`, ``);
          this.cantidadDC?.setValue('');
          return;
        }
        this.invalidAmount = false;
      }
    });

    this.cantidad?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 6) {
          this.invalidForm(`Usted no puede reportar con más de 6 meses de su subscripción`, ``);
          this.cantidad?.setValue('');
          this.invalidAmount = true;
          return;
        }
        this.invalidAmount = false;
      }
    });

    this.amountPm?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 6) {
          this.invalidForm(`Usted no puede reportar con más de 6 meses de su subscripción`, ``);
          this.amountPm?.setValue('');
          this.invalidAmount = true;
          return;
        }
        this.invalidAmount = false;
      }
    });
  }

  filterContracts() {
    let contractsNull = this.listContratos.map((contract) => {
      if (contract.status_contrato === 'ANULADO') {
        return contract.contrato;
      }
      return '';
    })
    let numbersContracts: string = ''
    if (contractsNull.length > 0) {
      contractsNull = contractsNull.filter(contracts => contracts != '');
      numbersContracts = contractsNull.join('\n');
    }
    this.listContratos = this.listContratos.filter((contract) => contract.status_contrato !== 'ANULADO');
    if (this.listContratos.length === 0) {
      this.saldoBs = '';
      this.saldoUSD = '';
      this.subscription = '';
      this.nameClient = ''
    }
  }

  getDaysFeriados() {
    this._Consultas.getDaysFeriados().then((res) => {
      this.daysFeriados = res;
    });
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  openDialogPM() {
    const dialog = this.dialogTemplate.open(PaymentDialogComponent, {
      data: this.paymentMethod,
      // maxHeight: '86vh',
      // minHeight: '36vh',
      // disableClose: false,
      panelClass: ['custom-size-standard', 'animated', 'fadeInUp']
    })
    dialog.afterClosed().subscribe(result => {
    });
  }

  openInfoPayDialog() {
    console.log(this.nroContrato?.value);
    this.registerPayService.StatusPayAbonadoTeen(this.nroContrato?.value)
      .then((response: any) => {
        const dialog = this.dialogTemplate.open(InfoPayComponent, {
          panelClass: ['custom-size-lg', 'animated', 'fadeInUp'],
          data: response.data.length > 0 ? JSON.parse(response.data) : []
        })
        dialog.afterClosed().subscribe(result => {
        });
      }).catch((err: any) => console.error(err));
  }

  logMensaje(mensaje: string) {
    console.log("mensaje",mensaje);
  }

  public openInfoPay(): void {
    try {
      console.log('openInfoPay')
      this.registerPayService.StatusPayAbonadoTeen(this.nroContrato?.value)
        .then((response: any) => {
          console.log('response', response)
          this.showStateTable = true;
          this.stateTableData = response.data.length > 0 ? JSON.parse(response.data) : []
          // this.stateTableData = [
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'REGISTRADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'RECHAZADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'RECHAZADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          //   {
          //     fecha_reg: new Date(),
          //     numero_ref: 565415656,
          //     status_pd: 'PROCESADO'
          //   },
          // ]
          console.log('this.stateTableData', this.stateTableData)
        })
    } catch (error) {
      console.error(error)
    }
  }

  openDialogZelle() {
    const dialog = this.dialogTemplate.open(PaymenDialogZelleComponent, {
      maxHeight: '86vh',
      minHeight: '36vh',
      // disableClose: false,
    })
    dialog.afterClosed().subscribe(result => {
    });
  }
}



