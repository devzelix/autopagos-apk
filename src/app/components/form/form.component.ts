import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { ThisReceiver } from '@angular/compiler';

import { ImageComponent } from '../image/image.component';
import { DialogDetailComprobantesComponent } from '../dialog-detail-comprobantes/dialog-detail-comprobantes.component';

import { RegisterPayService } from '../../services/register-pay.service';
import { UplaodImageService } from '../../services/uplaod-image.service';
import { TasaService } from '../../services/tasa.service';
import { DataBankService } from '../../services/data-bank.service';
import { UploadPHPService } from '../../services/UploadPHP.service';
import { isNegativeNumber } from '../../validators/customValidatorAmount';
import { ConsultasService } from '../../services/consultas.service';
import { CloudynariService } from '../../services/cloudDinary.service';
import { nanoid } from 'nanoid'
import { BankList } from '../../interfaces/bankList';
import { BanksDays } from '../../interfaces/banksDays';
import { Contratos } from '../../interfaces/contratos';
import { DataSlide, TypeAccount, Month, Ano, MetodoDePago2 } from './camposSubscription/camposSuscription';
import { MiscelaneosService } from '../../utils/miscelaneos.service';
import { ApiMercantilService } from '../../services/ApiMercantil';
import { TypeBrowserService } from '../../services/TypeBrowser';
import { NgHcaptchaService } from 'ng-hcaptcha';


import { MatStepper } from '@angular/material/stepper';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';





export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.style.css']
})
export class FormComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('picker') date_: MatDatepickerInput<Date>;


  animal: string;
  name2: string;
  fecha: string = 'sssssssssssssss';
  displayedColumns: string[] = ['Comprobante', 'Status', 'buttons'];

  private idUnicoClient: any = nanoid(10);
  public bankList: BankList[] = [];
  public formFibex: UntypedFormGroup;
  public firstFormFibex: UntypedFormGroup;
  public secondFormFibex: UntypedFormGroup;
  public thirdFormFibex: UntypedFormGroup;
  public fourthFormFibex: UntypedFormGroup;
  public PgMovilForm: FormGroup;
  public PgMovilRegForm: FormGroup;
  public DebitoCredito: FormGroup;
  public TypeForm: FormGroup;
  CriptomonedaForm: FormGroup;
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
  public daysFeriados: BanksDays[] = [];
  ExitRef: Boolean = true //para saber si el campo de comprobante esta vacio o no
  AllService: any = []
  ListService: any = []
  LenthgInvalidDnI: boolean = false;
  AllDataClient: any = []
  enableBtn: Boolean = false
  totalAmount: number = 0;
  PagoMetodosHTML2 = MetodoDePago2;
  //sPagoMercantilBCO:any =[];
  ConsultarPagoMovilboolean: boolean = false;
  RegistrarPagoMovilboolean: boolean = false;
  DebitoCreditoboolean: boolean = false;
  Criptomoneda: boolean = false;
  tipo_pago: any;
  AppFibex: boolean = false;
  ClienteFibex: boolean = false;
  BancoPago: any;
  private PaymenMethod: string = "";
  private TypeNavegador: string = "";
  private IpAddress: any = "";
  public TypeAcountDC: any[] = TypeAccount;
  public Creditoboolaean: boolean = false;
  public Debitoboolean: boolean = false;
  public Months = Month;
  public Anos = Ano;
  public ReciboPay: boolean = false;

  // Variables de hcaptcha
  public hcaptchaForm: FormGroup
  public verifyDNI: boolean = false
  public captchaControl: boolean | undefined = true
  public readonlyDNI: boolean = false


  constructor(
    private registerPayService: RegisterPayService,
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
    private _TypeBrowserService: TypeBrowserService,
    public router: Router,
    //private hcaptchaService: NgHcaptchaService
  ) {
    this.dataBankService.bankList.subscribe((banks) => {

      this.bankList = banks;
      this.banksFiltered = [...this.bankList];
      this.banksFiltered = this.deleteDuplicated(this.banksFiltered, 'id_cuba');

    });
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
      voucher: ['', [Validators.required]],
      nameTitular: [''],
      dniTitular: [''],
      emailTitular: [''],
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
      prec_i: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      referencia: ['', [Validators.required]],
      datepgmovil: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
    }, { validator: isNegativeNumber });

    this.PgMovilRegForm = this.fb.group({
      tlforigin: ['584129637516', [Validators.required]],//584126584242
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      tlfdestin: ['', [Validators.required]],
      auth: [''],
      amountPm: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
    }, { validator: isNegativeNumber });

    /*this.DebitoCredito2 = this.fb.group({
      ccv: ['', [Validators.required, Validators.pattern(this.regexCCV)]],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      typeCuenta: ['', [Validators.required]],
      Ncard: ['', [Validators.required]],
      Clavetlfonica: ['', [Validators.required]],
      fvncmtoMes: ['', [Validators.required]],
      fvncmtoAno: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
    }, { validator: isNegativeNumber });*/

    this.DebitoCredito = this.fb.group({
      ccv: ['', [Validators.required, Validators.pattern(this.regexCCV), Validators.maxLength(3)]],
      pref_ci: ['', [Validators.required]],
      c_i: ['', [Validators.required, Validators.minLength(6)]],
      typeCuenta: ['', [Validators.required]],
      Ncard: ['', [Validators.required, Validators.maxLength(18)]],
      Clavetlfonica: ['', [Validators.required, Validators.maxLength(4)]],
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
      const objExists = list.find((obj: any) => obj[key] === items[key]);
      if (objExists === undefined) {
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
    this.hcaptchaForm = this.hcaptchaFormGroup();
    this.MyInit();
    this.captchaSubControl();
    this._ApiMercantil.GetAddress()
      .then((resp: any) => this.IpAddress = resp)
      .catch((error: any) => console.log(error));
    this.TypeNavegador = this._TypeBrowserService.detectBrowserVersion();
    this.route.queryParams
      .pipe(
        filter((param) => param['dni'])
      )
      .subscribe((res) => {
        if (res['dni']) {
          //Esto es solo cuando se resiva la cedula
          //this.AppFibex = !this.AppFibex;
          //this.searchServices(res['dni'], true, true, true);
          //this.searchInfoEquipos(res['dni']);
          this.dni?.setValue(`${res['dni']}`)
          //this.SendOption(0, 0, res['dni']);
          //this.IpAddress={ip:'192.168.1.7'}

        }
      });
    this.dateOfPay();
    this.amountInvalid();
    this.amountInvalidCreditoDebitoPagoMovil();
    this.getDaysFeriados();

  }

  // FORMGROUP DEL CAPTCHA
  hcaptchaFormGroup = () => {
    return this.fb.group({
      hcaptcha: new FormControl(
        { value: null, disabled: false },
        { validators: [Validators.required] }
      ),
    });
  }
  // FUNCIONES CONTROL DEL CAPTCHA
  DNIvalidation = (inputDni: any) => {
    const dni_ = inputDni.value
    if (dni_.length >= 1 && dni_.length < 6) {
      this.dni?.reset()
      this.hcaptcha?.reset()
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
  captchaSubControl = () => {
    this.hcaptcha?.valueChanges.subscribe(data => {
      this.hcaptcha?.valid ? this.captchaControl = false : this.captchaControl = true
      this.dni?.markAsTouched();
      this.dni?.updateValueAndValidity()
    });
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

  get hcaptcha() { return this.hcaptchaForm.get('hcaptcha'); }

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

  get c_iPagMovil() { return this.PgMovilForm.get('c_i'); }
  get referenciapm() { return this.PgMovilForm.get('referencia'); }
  get datepgmovil() { return this.PgMovilForm.get('datepgmovil'); }
  get cantidad() { return this.PgMovilForm.get('cantidad'); }
  get prec_i() { return this.PgMovilForm.get('prec_i'); }

  get tlforigin() { return this.PgMovilRegForm.get('tlforigin'); }
  get c_iRegPgoMvil() { return this.PgMovilRegForm.get('c_i'); }
  get pref_ci() { return this.PgMovilRegForm.get('pref_ci'); }
  get tlfdestin() { return this.PgMovilRegForm.get('tlfdestin'); }
  get auth() { return this.PgMovilRegForm.get('auth'); }
  get amountPm() { return this.PgMovilRegForm.get('amountPm'); }

  get ccv() { return this.DebitoCredito.get('ccv'); }
  get typeCuenta() { return this.DebitoCredito.get('typeCuenta'); }
  get pref_ciDC() { return this.DebitoCredito.get('pref_ci'); }
  get Ncard() { return this.DebitoCredito.get('Ncard'); }
  get fvncmtoMes() { return this.DebitoCredito.get('fvncmtoMes'); }
  get fvncmtoAno() { return this.DebitoCredito.get('fvncmtoAno'); }
  get cantidadDC() { return this.DebitoCredito.get('cantidad'); }
  get c_iDC() { return this.DebitoCredito.get('c_i'); }
  get Clavetlfonica() { return this.DebitoCredito.get('Clavetlfonica'); }

  get Referencia_Cripto() { return this.CriptomonedaForm.get('Referencia_Cripto'); }
  get Monto_Cripto() { return this.CriptomonedaForm.get('Monto_Cripto'); }
  get c_i_Cripto() { return this.CriptomonedaForm.get('c_i_Cripto'); }
  get Pref_ci_Cripto() { return this.CriptomonedaForm.get('Pref_ci_Cripto'); }

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
    this.tipo_pago = x;
    this.ConsultarPagoMovilboolean = false;
    this.RegistrarPagoMovilboolean = false;
    this.DebitoCreditoboolean = false;
    this.Debitoboolean = false;
    this.Creditoboolaean = false;
    this.Criptomoneda = false;

    //Pago Movil
    if (x == 2 || x == 3) {
      //Por default selecciono el Pago Móvil para Mercantil
      this.TypeForm = this.PgMovilRegForm;
      this.RegistrarPagoMovilboolean = !this.RegistrarPagoMovilboolean;
      this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
      this.PgMovilRegForm.get('pref_ci')?.setValue('V');
      this.PgMovilRegForm.get('c_i')?.setValue(this.dni?.value);
      // this.warningSimpleFormMercantil(`Actualmente el Pago Móvil esta disponible solo para Banco Mercantil`, `¿Esta seguro que su pago es de un Mercantil?`);
      this.NextMatStepper();
    }
    //Débito
    if (x == 0) {
      this.DebitoCreditoboolean = !this.DebitoCreditoboolean
      this.PaymenMethod = "tdd";
      this.Debitoboolean = !this.Debitoboolean;
      this.DebitoCredito.get('cantidad')?.setValue(this.saldoBs);
      this.DebitoCredito.get('typeCuenta')?.setValue('Corriente');
      this.DebitoCredito.get('c_i')?.setValue(this.dni?.value);
      this.DebitoCredito.get('pref_ci')?.setValue('V');
      this.warningSimpleFormMercantil(`Esta solo aplica para tarjetas Mercantil`, `De lo contrario regrese y seleccione la opción "Transferencia"`);
    }
    //Crédito
    if (x == 1) {
      this.DebitoCreditoboolean = !this.DebitoCreditoboolean;
      this.PaymenMethod = "tdc";
      this.DebitoCredito.get('cantidad')?.setValue(this.saldoBs);
      this.DebitoCredito.get('c_i')?.setValue(this.dni?.value);
      this.DebitoCredito.get('pref_ci')?.setValue('V');
      this.DebitoCredito.get('Clavetlfonica')?.setValidators([]);
      this.DebitoCredito.get('Clavetlfonica')?.updateValueAndValidity();
      this.DebitoCredito.get('typeCuenta')?.setValidators([]);
      this.DebitoCredito.get('typeCuenta')?.updateValueAndValidity();
      this.Creditoboolaean = !this.Creditoboolaean
    }
    //Criptomoneda
    if (x == 5) {
      /*const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mat-button button-material-back',
          cancelButton: 'mat-button button-material-next'
        },
        buttonsStyling: false
      })

      swalWithBootstrapButtons.fire({
        title: 'Datos de Wallet para pagar',
        //text: `Wallet: 4534LGFDKLM4534543FSD Monto USDT: 40,001001`,
        html:
        'Wallet: <b>4534LGFDKLM4534543FSD</b><br> ' +
        `Monto USDT: ${this.saldoUSD}1001`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'REPORTAR',
        cancelButtonText: 'CERRAR',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.Criptomoneda = !this.Criptomoneda;
          this.Monto_Cripto?.setValue(this.saldoUSD+'1001')
          this.NextMatStepper();
        }
      })*/
      this.router.navigate(['coinx']);
    }
  }

  ComprobarPgoMovil() {
    //Solo para consultar por referencias de pago Moviles
    let DatosUserAgent = {
      Browser: this.TypeNavegador,
      AddresIp: this.IpAddress.ip,
      Date: this.datepgmovil?.value.toISOString(),
      Reference: this.referenciapm?.value,
      Name: this.name?.value,
      Abonado: this.nroContrato?.value,
      idContrato: this.idContrato
    }
    this.alertFindDniMercantil('Comprobando pago', 'Por favor espere...');
    this._ApiMercantil.ConsultaPagoMovilxReferencia(DatosUserAgent)
      .then((resp: any) => {
        if (resp.hasOwnProperty('registrado')) {
          this.alertexit('El pago ya fue registrado anteriormente', '');
        } else {
          if (resp.hasOwnProperty('error_list')) {
            this.invalidForm('No se encuentra dicho pago', 'Intente nuevamente!');
          } else if (resp.hasOwnProperty('transaction_list')) {
            let ResBanco = resp.transaction_list[0];
            if (ResBanco.trx_status == "approved") {
              this.ReciboPay = true;
              this.alertexit("Pago aprobado");
            } else {
              this.invalidForm('El Banco no aprobo su transacción', 'Verifique el monto ingresado');
            }
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
        idContrato: this.idContrato
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

  ClaveAuthPgoMovil() {
    //Clave de Autorización Pgo Móvil
    let DatosUserAgent = {
      browser_agent: this.TypeNavegador,
      ipaddress: this.IpAddress.ip,
      destination_id: this.pref_ci?.value + this.c_iRegPgoMvil?.value,
      destination_mobile_number: this.tlfdestin?.value.toString(),
    }
    this.alertFindDni('Enviando clave de autorización', 'Por favor espere...');
    this._ApiMercantil.C2PClave(DatosUserAgent)
      .then((resp: any) => {
        if (resp.hasOwnProperty('error_list')) {
          this.invalidForm(`${resp.error_list[0].description}`, '');
        } else if (resp.hasOwnProperty('scp_info')) {
          this.ButtonGetAuthMercantil();
        } else if (resp.hasOwnProperty('status')) {
          this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!');
        } else {
          this.invalidForm(`Error intente mas tarde!`);
        }
      })
      .catch((error: any) => console.error(error)) //Tengo que decirle al usuario que paso con la el pago que realizo
  }

  SelectedPagoC2P(value: any) {
    let Valor = value._value
    if (Valor == "otros") {
      this.ConsultarPagoMovilboolean = !this.ConsultarPagoMovilboolean;
      this.RegistrarPagoMovilboolean = !this.RegistrarPagoMovilboolean;
      this.TypeForm = this.PgMovilForm;
      this.PgMovilForm.get('cantidad')?.setValue(this.saldoBs);
      this.PgMovilForm.get('prec_i')?.setValue('V');
      this.PgMovilForm.get('c_i')?.setValue(this.dni?.value);
      this.warningSimpleFormMercantil(`Debes realizar un Pago Móvil con los datos a continuación:`, ` <strong> Teléfono: </strong> 584129637516  <br/>  <strong>Rif: </strong> J-30818251-6  <br/> <strong> Banco:</strong> Mercantil(105) <br/><br/> Luego de realizar la operación debes reportar el pago en el formulario presentado.`);
    } else {
      this.TypeForm = this.PgMovilRegForm;
      this.RegistrarPagoMovilboolean = !this.RegistrarPagoMovilboolean;
      this.ConsultarPagoMovilboolean = !this.ConsultarPagoMovilboolean;
      this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
      this.PgMovilRegForm.get('pref_ci')?.setValue('V');
      this.PgMovilRegForm.get('c_i')?.setValue(this.dni?.value);
      this.warningSimpleFormMercantil(`Actualmente el Pago Móvil esta disponible solo para Banco Mercantil`, `¿Esta seguro que su pago es de un Mercantil?`);
    }
  }

  PagoDebito() {
    let DatosUserAgent = {
      Browser: this.TypeNavegador,
      AddresIp: this.IpAddress.ip,
      ccv: this.ccv?.value,
      typeCuenta: this.typeCuenta?.value,
      Ncard: this.Ncard?.value,
      vencmto: this.fvncmtoAno?.value + '/' + this.fvncmtoMes?.value,
      cantidadDC: this.cantidadDC?.value,
      c_iDC: this.pref_ciDC?.value + this.c_iDC?.value,
      Clavetlfonica: this.Clavetlfonica?.value,
      invoice: "", //El nro de factura se asigna en el backend
      PaymenMethod: this.PaymenMethod,
      Name: this.name?.value,
      Abonado: this.nroContrato?.value,
      idContrato: this.idContrato
    }
    //Si es Debito debo autoriza el pago en caso contrario no debo hacerlo
    if (!this.Creditoboolaean) {
      this.alertFindDniMercantil('Autorizando su pago', 'Por favor espere...');
      //Primero debo autorizar el pago
      this._ApiMercantil.GetAuthTDD(DatosUserAgent)
        .then((resp: any) => {
          if (resp.hasOwnProperty('error_list')) {
            this.invalidForm(`${resp.error_list[0].description}`, '');
          } else if (resp.hasOwnProperty('authentication_info')) {
            if (resp.authentication_info.trx_status == "approved") {
              //Luego debo realizar la compra o retiro del dinero solicitado por el cliente
              this._ApiMercantil.CompraTDD(DatosUserAgent)
                .then((resp: any) => {
                  if (resp.hasOwnProperty('error_list')) {
                    this.invalidForm(`${resp.error_list[0].description}`, '');
                  } else if (resp.hasOwnProperty('transaction_response')) {
                    if (resp.transaction_response.trx_status == "approved") {
                      this.alertexit("Pago realizado exitosamente");
                      this.ReciboPay = true;
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
            }
          } else if (resp.hasOwnProperty('status')) {
            this.invalidForm(`${resp.status.description}`, 'Contacte a un asesor!');
          } else {
            this.invalidForm(`Error intente más tarde!`);
          }
        })
        .catch((error: any) => {
          this.invalidForm(`Error por favor intente más tarde!`);
        }) //Tengo que decirle al usuario que paso con la el pago que realizo
    } else {
      //Credito
      this.alertFindDniMercantil('Realizando su pago', 'Por favor espere...');
      this._ApiMercantil.CompraTDD(DatosUserAgent)
        .then((resp: any) => {
          if (resp.hasOwnProperty('error_list')) {
            this.invalidForm(`${resp.error_list[0].description}`, '');
          } else if (resp.hasOwnProperty('transaction_response')) {
            if (resp.transaction_response.trx_status == "approved") {
              this.alertexit("Pago realizado exitosamente");
              this.ReciboPay = true;
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
        // this.alertFindDni('Subiendo comprobante de pago', 'Porfavor espere');
        // this.closeAlert();
        this.uplaodImageService.getUrlImageBase64({ dataFileBase64: imageBase64 }).subscribe(
          (res) => {
            this.uploadingImg = false;
            if (res.status === 500 || res.status === 400) {
              //this.countErrorUploadImage(imageBase64);
              return;
            }

            imageBase64 = '';
            this.imageUrl = res.url;
            this.SendOption(2, 0, res.url);
            //this.img?.patchValue(res.url);
            this.imageUploaded = true;
          }, (err) => {
            this.uploadingImg = false;
            // this.countErrorUploadImage(imageBase64);
            console.error('error registro pago', err);
            // console.error(err);
          });
      }
    }
  }

  uploadImagePayment2($event: any) {
    this.uploadingImg = true;
    let reader = new FileReader();
    reader.readAsDataURL($event.target.files[0]);
    reader.onload = (_event) => {
      let imageBase64: any = reader.result
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
          // console.log(NameCloud)
          //Paso el file en base64 y el nombre que se le asignara
          this._Cloudinary.UploadImagenCloudynariSignature(imageBase64, NameCloud)
            .then((response: any) => {
              if (response.hasOwnProperty('error')) {
                // this.uploadingImg = false;
                //this.openSnackBar('Error: '+response.error.message);
                this.countErrorUploadImage(imageBase64, NameCloud);
                return;
              }
              this.uploadingImg = false;
              imageBase64 = '';

              this.imageUrl = response.secure_url;
              // console.log(this.imageUrl)

              //var ext = value.substring(value.lastIndexOf('.') + 1).toLowerCase();
              this.SendOption(2, 0, response.url);
              //this.img?.patchValue(res.url);
              this.imageUploaded = true;
            })
            .catch((error: any) => {
              console.error(error);
              this.countErrorUploadImage(imageBase64, NameCloud)
            })
        }
      } else {
        this.ValidExtension = false;
        this.uploadingImg = false;
      }
    }
  }

  ValidateLastReferencia(NroRef: any) {
    //Busco en mi memoria de comprobante luego llamo al de API por si acaso
    const INDEX = this.AllComprobantesPago.findIndex((value: any) => value.Referencia == NroRef)

    if (INDEX != -1) {
      this.secondFormFibex = this.fb.group({
        voucher: ['', [Validators.required]]
      });
      this.invalidForm('Ya existe un pago registrado con la misma referencia y cuenta bancaria.');
    } else {
      this.VerifyRefencia(NroRef)
    }

  }

  VerifyRefencia(NroRef?: any) {
    try {

      if (NroRef || this.voucher?.value) {

        this.registerPayService.ConsultarEstadoDeposito(this.nroContrato?.value, NroRef || this.voucher?.value).subscribe((ResDeposito: any) => {
          if ((ResDeposito.success === "true") || ResDeposito.success === true) {

            this.secondFormFibex = this.fb.group({
              voucher: ['', [Validators.required]],
            });

            this.ExitRef = false

            this.invalidForm('Ya existe un pago registrado con la misma referencia y cuenta bancaria.');
          } else if ((ResDeposito.success === "false") || ResDeposito.success === false) {
            if (!NroRef) { this.NextMatStepper() }
          }

        })

      } else {
        this.ExitRef = false
      }

    } catch (error) {
      console.error(error)
    }
  }

  ValidateReferenciaLast(Data: any) {
    Data.forEach((element: any, index: any) => {
      this.registerPayService.ConsultarEstadoDeposito(this.nroContrato?.value, element.Referencia).subscribe((ResDeposito: any) => {
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

    // this.ComprobantesPago
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
          // console.log(NameCloud)
          //Paso el file en base64 y el nombre que se le asignara
          this._Cloudinary.UploadImagenCloudynariSignature(imageBase64, NameCloud)
            .then((response: any) => {
              if (response.hasOwnProperty('error')) {
                // this.uploadingRetentionImg = false;
                //this.openSnackBar('Error: '+response.error.message);
                this.countErrorUploadImage(imageBase64, NameCloud);
                return;
              }
              this.uploadingRetentionImg = false;
              imageBase64 = '';
              this.retentionImageUrl = response.secure_url;
              // console.log(this.retentionImageUrl)
              //var ext = value.substring(value.lastIndexOf('.') + 1).toLowerCase();
              this.SendOption(2, 0, response.url);
              //this.img?.patchValue(res.url);
              this.retentionimageUploaded = true;
            })
            .catch((error: any) => {
              console.error(error);
              this.countErrorUploadImage(imageBase64, NameCloud)
            })
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
    /**
     *
     */

    /*console.log(.
      {
        ...this.firstFormFibex.value,
        ...this.secondFormFibex.value,
        ...this.thirdFormFibex.value,
        img: this.imageUrl,
        name: contractInfo?.cliente,
        amount: this.amount?.value,
        date,
        id_Cuba: this.BancoSelect.id_cuba
      }
    )*/
    this.sendingPay = true;
    const DataForRegister = {
      ...this.firstFormFibex.value,
      ...this.secondFormFibex.value,
      ...this.thirdFormFibex.value,
      img: this.selectedRetentionOption == 2 ? this.imageUrl + ' -Retención:' + this.retentionImageUrl + ' -Monto:' + this.retentionAmount?.value : this.imageUrl,
      name: contractInfo?.cliente,
      amount: this.selectedRetentionOption == 2 ? this.totalAmount > 0 ? String(this.totalAmount+this.retentionAmount?.value) : this.amount?.value : 
      date,
      id_Cuba: this.BancoSelect.id_cuba
    }

    const ContratoActual: any = this.listContratos.find((CA: any) => CA.contrato === DataForRegister.nroContrato)

    if (ContratoActual && ContratoActual.status_contrato != "ANULADO" || ContratoActual.status_contrato != "RETIRADO" && DataForRegister.amount > 0) {
      DataForRegister.IdContrato = ContratoActual.id_contrato

      this.registerPayService.registerPayClient(DataForRegister)
        .then((res: any) => {
          this.DisableReg = false
          if (res) {

            this.sendingPay = false;
            if (res.data.ReportePago_Falla && res.data.ReportePago_Falla.length > 0) {
              try {
                //const index = res.data.ReportePago_Falla.findIndex((duplicado: any) => duplicado.to == "DUPLICADO");
                res.data.ReportePago_Falla.forEach((Data: any) => {
                  if (Data.to == "DUPLICADO") {
                    this.playDuplicated = true;
                    this.payReported = false;
                  } else if (Data.to.includes('Error')) {
                    this.ErrorRegistrando = true;
                    this.MessageErrorRegistrado = Data.to;
                  } else {
                    this.SendOption(3, 0, true);
                    this.payReported = true;
                    this.playDuplicated = false;
                  }
                });
                /* if (index > 0) {
                   this.playDuplicated = true;
                   this.payReported = false;
                 } else {
                   this.payReported = true;
                   this.playDuplicated = false;
                 }*/
              } catch (error) {
                this.payReported = true;
              }

              if (this.payReported) {
                const DataContra = this.AllDataClient.find((DC: any) => DC.idCliente === this.nroContrato?.value)

                if (DataContra && DataContra.email) {

                  if (this.email?.value.toLowerCase() != DataContra.email.toLowerCase()) {
                    const content = `El cliente *${this.listContratos[0].cliente}* con cédula: ${this.dni?.value} y *Nro. Abonado:* ${DataContra.idCliente || this.nroContrato?.value}, ha reportado un pago con un correo distinto al registrado en SAE.\n\n*Correo registrado en SAE:* ${DataContra.email.toLowerCase()}\n\n*Correo al registrar pago:* ${this.email?.value.toLowerCase()}`
                    this.registerPayService.SendWaNotif(content)
                  }

                }
              }

              this.ScrollUp()
              this.Contar = 10;
              this.Contador();

            } else {
              // console.log("-----2222222-------");
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

    // this.firstFormFibex.removeValidators(Validators.required);

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
    /*
      this.firstFormFibex.clearValidators();
      this.firstFormFibex.markAsPristine();
      this.firstFormFibex.markAsUntouched();
      this.secondFormFibex.reset({

      });
      this.thirdFormFibex.reset({

      });
    */

  }

  ResetFormCD() {
    this.DebitoCredito.reset();
    this.PgMovilRegForm.reset();
    this.PgMovilForm.reset();
    this.PgMovilRegForm.get('tlforigin')?.setValue('584129637516');
    this.ReciboPay = false;
  }

  Contador() {
    this.Contar--
    if (this.Contar <= 0) {
      window.location.reload();
      /*this.stepper.selectedIndex = 0;
      this.payReported  = false;
      this.playDuplicated  = false;
      this.ResetForm();*/
    } else {
      setTimeout(() => this.Contador(), 1000);
    }

  }

  CambiarFocusEnter(s?: any) {
    // Aqui debo lograr sacar el focus o disparar el evento blur para que puedan buscar con enter
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

  searchServices(dni: any, fromParmas?: boolean, NextContrato?: boolean, dataFromAUrl?: boolean) {
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
      this.registerPayService.getTypeClient(dni_).subscribe((result: any) => {
        if (result.length > 0 && result[0].TipoCliente != "NATURAL") {
          this.possibleWithholdingAgent = true
        }
      })
      this.SearchDataClient(dni_)
      this.registerPayService.getSaldoByDni(dni_)
        .subscribe((res) => {
          this.lastDni = dni_;
          this.closeAlert();
          try {
            if (res.length > 0) {
              this.closeAlert2();
              this.listContratos = [];
              this.ComprobantesPago = [];
              //this.verifyDNI = true;
              this.SendOption(0, 0, dni_);
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
                  this.readonlyDNI = true;
                  if (dataFromAUrl == undefined || dataFromAUrl == false) {
                    setTimeout(() => {
                      this.NextMatStepper();
                    }, 300);
                  }
                }
              }

              /* EMITIR TASA DEL DÍA */
              this.tasaService.tasa.next(this.cambio_act.toString());
              this.tasaCambio = this.cambio_act.toString();
              // this.filterContracts();
              if (this.listContratos.length === 0) {
                this.dni?.setValue('')
                return;
              };

              this.idContrato = this.listContratos[0].id_contrato;
              this.nameClient = this.listContratos[0].cliente;
              this.name?.setValue(res[0].cliente);
              this.nroContrato?.setValue(this.listContratos[0].contrato);
              // this.SearchEmailContra(this.listContratos[0].contrato)
              this.SendOption(0, 3, this.listContratos[0].contrato);
              this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
              this.filterBankByFranquicia(this.listContratos[0].franquicia);
              this.dni?.setValue(dni_);
              this.searchInfoEquipos(dni_);





              /*Esto se hacer por si el usuario preciomente selecciona un banco */
              if (this.BancoNacional(this.banco)) {
                if (!Number.isNaN(parseFloat(this.listContratos[0].saldo))) {
                  // Convertir en una función para que no se repita
                  this.validateIfAmountIsNegativer(this.listContratos[0].saldo, true);

                  this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);

                  this.saldoUSD = parseFloat(this.listContratos[0].saldo).toFixed(2);
                  this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
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

              //Esto lo uso para el CoinCoinx NO BORRAR
              localStorage.setItem("Name", this.nameClient);
              localStorage.setItem("Monto", this.saldoUSD);
              try {
                // this.SendOption(0,0,dni.value);
                this.SendOption(0, 6, this.nameClient);
                this.SendOption(0, 7, this.monto_pend_conciliar);
                this.SendOption(0, 8, this.saldoBs);
                this.SendOption(0, 9, this.saldoUSD);
              } catch (error) {
                console.error(error);
              }
              if (this.listContratos.length === 1) {
                this.listContratos.find((cliente) => {
                  this.verifySaldo(cliente.saldo);
                });
              }


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
            this.nameClient = '';
            this.saldoUSD = '';
            this.saldoBs = '';
            this.dniConsulted = true;
            this.lastDni = "";
            this.name?.setValue('');
            this.alertFindDni('Disculpe intente de nuevo', '');
            setTimeout(() => this.closeAlert(), 1000);
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

  ValidStatusContrato(Status: string) {
    var ContratosAccept = ['ACTIVO', 'POR CORTAR', 'POR INSTALAR', 'CORTADO', 'SUSPENDIDO'];
    return ContratosAccept.includes(Status);
  }

  SearchDataClient(Cedula: any) {
    try {

      this.registerPayService.GetDataClient(Cedula).then((Res: any) => {
        if (Res) {
          this.AllDataClient = Res
        }
      })

    } catch (error) {
      console.error(error)
    }
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

      const Email = this.email?.value.toLowerCase()

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
      this.registerPayService.GetListService(Contrato).subscribe((ResService: any) => {

        if (ResService.data.info.length > 0) {
          for (let index = 0; index < ResService.data.info.length; index++) {
            this.AllService.push(ResService.data.info[index].nombre_servicio)
          }

          this.paquete = this.AllService
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
    this.paquetesContratos = [];
    // console.log(dni);
    this.registerPayService.infoEquiposClientes(dni)
      .subscribe((res: any[]) => {
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
  }

  selectInfoEquipos(id_contrato: string) {
    // console.log(id_contrato);
    this.paquete = ''
    let paquete = this.paquetesContratos.find((index) => {
      // console.log(index);
      return index.id_contrato === id_contrato
    })?.paquete;
    // console.log(paquete, '-------------------------------------------------paquete');
    if (paquete !== undefined) {
      this.paquete = paquete;
    }
  }

  contractSelected(contrato: { contrato: string, saldo: string, id_contrato: string, subscription: string }, ppal?: boolean) {
    //this.validateIfAmountIsNegativer(contrato.saldo);
    this.lastAmount = parseFloat(contrato.saldo).toFixed(2);
    this.verifySaldo(contrato.saldo);
    this.saldoUSD = parseFloat(contrato.saldo).toFixed(2);
    this.saldoBs = (parseFloat(contrato.saldo) * this.cambio_act).toFixed(2);
    this.idContrato = contrato.id_contrato;
    this.subscription = parseFloat(contrato.subscription).toFixed(2);
    this.SearchServiceClient(this.idContrato)
    // this.selectInfoEquipos(this.idContrato);
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
    if (this.bank?.value.includes('USD') || this.bank?.value.includes('ZELLE')) return false
    else return true
  }

  bankSelected(bank: any) {
    this.BancoSelect = bank
    this.banco = bank.Banco + bank.referencia_cuenta;
    if (this.BancoNacional(this.banco)) {

      if (!Number.isNaN(Math.round(parseFloat(this.lastAmount)))) {
        this.validateIfAmountIsNegativer(this.lastAmount, true);
      }
    } else {
      this.validateIfAmountIsNegativer(this.lastAmount);
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
        this.PgMovilRegForm.controls['auth'].setValue(authClave);
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.RegistrarPgoMovil();
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

  warnignForm(text: string, html: string, next: number, use?: boolean) {
    Swal.fire({
      title: text,
      html: html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00184E',
      cancelButtonColor: '#f44336',
      cancelButtonText: 'Editar monto',
      confirmButtonText: 'Seguir adelante'
    }).then((result) => {
      if (result.isConfirmed && !use) {
        //console.log(!this.disbaleButtonIfAmountIsInvalid, !this.disbaleButtonIfAmountIs0, this.firstFormFibex.invalid, this.disbaleButtonIfDateIsInvalid)
        if (!this.disbaleButtonIfAmountIsInvalid &&
          !this.disbaleButtonIfAmountIs0 &&
          this.firstFormFibex.valid &&
          !this.disbaleButtonIfDateIsInvalid &&
          !this.invalidAmount) {
          //this.stepper.selectedIndex = next;
          this.NextMatStepper();
        }
      }
    })
  }

  warnignFormDebitoCredito(text: string, html: string) {
    Swal.fire({
      title: text,
      html: html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00184E',
      cancelButtonColor: '#f44336',
      cancelButtonText: 'Editar monto',
      confirmButtonText: 'Seguir adelante'
    }).then((result) => {
      if (result.isConfirmed) {
        this.PagoDebito();
      }
    })
      .catch((error: any) => {
        console.error(error);
      })
  }

  warnignFormGeneral(text: string, html: string, ButtonCancel: string, ButtonConfirm: string, NameMetodo: string) {
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
        eval(NameMetodo);
      }
    })
      .catch((error: any) => {
        console.error(error);
      })
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
      width: '300px',
      data: this.imageUrl,
    });

    dialogRef.afterClosed().subscribe((deleteImage: boolean) => {
      if (deleteImage) {
        this.img?.setValue('');
        this.imageUrl = '';
        this.imageUploaded = false;
      }
    });
  }

  openDialogCmprobante(dataC: any): void {
    // console.log(dataC);
    const dialogRef = this.dialog.open(DialogDetailComprobantesComponent, {
      width: '300px',
      data: dataC,
    });

    dialogRef.afterClosed().subscribe((dataC2: boolean) => {
      // console.log(dataC2);
    });
  }

  verifySaldo(saldo: string) {
    if (parseFloat(saldo) <= 0) {
      this.alertDniAmount('Usted no posee deuda pendiente', 'Tiene un saldo a favor de: ' + (parseFloat(saldo) * -1).toFixed(2) + ' REGISTO PAGO ADELANTADO');
      setTimeout(() => {
        // this.ResetForm();
      }, 1500)
      // this.nameClient = '';
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
    //this._Cloudinary.DeleteImageCloudynariSignature()
    // this.SendOption(2, 0, "deleteimage");
  }

  validateIfAmountIsNegativer(amount: string, national?: boolean) {
    // console.log("ValidarIfAomuntIsNegativer");
    if (national) {
      if (parseInt(amount) <= 0) {
        this.amount?.setValue('');
        this.saldoText = 'SALDO A FAVOR';
      } else if (parseInt(amount) > 0) {
        this.saldoText = 'SALDO';
        this.amount?.setValue('');
        this.SendOption(0, 4, this.amount?.value)
      }
      return;
    }

    if (parseInt(amount) <= 0) {
      this.amount?.setValue('');
      this.saldoText = 'SALDO A FAVOR';
    } else if (parseInt(amount) > 0) {
      this.saldoText = 'SALDO';
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
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?',0);
          return;
        }
      } else {
        if (Number(this.amount?.value) > Number(this.saldoBs)) {
          this.warnignForm('Esta apunto de reportar un saldo mayor a su deuda pendiente', '¿Está seguro que sea continuar?',0 );
          return;
        }
      }
    }
    this.totalAmount = Number(this.amount?.value);
    this.NextMatStepper();
    //this.stepper.selectedIndex = index;
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
    //this.totalAmount = Number(this.amount?.value); NO DESCOMENTAR, SINO NO SE SUMA EL MONTO TOTAL
    this.NextMatStepper();
    //this.stepper.selectedIndex = index;
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
          //this.img?.removeValidators(Validators.required);
          return;
        }
        if (environment.PHPUpload) {
          this._UploadPHP.uploadFilePHP(filebase64, NameFile)
            .then((response: any) => {
              if (response.error) {
                // this.uploadingImg = false;
                //this.openSnackBar('Error: '+response.error.message);
                this.openSnackBar('Error al subir la imagen, intente nuevamente');
                this.counterErrors++;
                return;
              }
              this.uploadingImg = false;
              filebase64 = '';
              this.imageUrl = response.url;
              this.SendOption(2, 0, response.url);
              //this.img?.patchValue(res.url);
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
          //this.img?.patchValue(res.url);
          this.imageUploaded = true;
        }, (err) => {
          this.uploadingImg = false;
          //this.countErrorUploadImage(imageBase64);
          console.error('error registro pago', err);
          this.openSnackBar('Error al subir la imagen, intente nuevamente');
          this.counterErrors++;
          this.img?.setValue('');
          // console.error(err);
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

    if (this.possibleWithholdingAgent && this.BancoNacional('') && this.selectedRetentionOption == 2 ) {
      this.warnignForm(`Está a punto de reportar ${value} BOLIVARES.`,
        `En caso de ser agente de retención, no considere la cantidad a retener e incorpórelo en el apartado de Retención.`, 1);
    }

    if (this.possibleWithholdingAgent && !this.BancoNacional('') && this.selectedRetentionOption == 2 && saldousd < 1) {
      this.warnignForm(`Está a punto de reportar ${value} DÓLARES.`,
        `En caso de ser agente de retención, no considere la cantidad a retener e incorpórelo en el apartado de Retención.`, 1);
    }

    if (this.BancoNacional('') &&  !this.possibleWithholdingAgent) {
      this.warnignForm(`Está a punto de reportar ${value} BOLIVARES, ¿estas seguro?`,
        `El monto debe ser expresado en BOLIVARES para el ${this.bank?.value}.`, 1);
    }

    if (!this.BancoNacional('') &&  !this.possibleWithholdingAgent) {
      this.warnignForm(`Está a punto de reportar ${value} DÓLARES, ¿estas seguro?`,
        `El monto debe ser expresado en DÓLARES para el ${this.bank?.value}.`, 1);
    }

    this.totalAmount = Number(this.amount?.value);
  }

  AmountIncorrectConfirm(value: string, Metodo: string) {
    if (Number(value) === 0) {
      this.invalidForm("Monto incorrecto", "Por favor ingrese un monto mayor a 0");
      this.cantidadDC?.reset();
      return
    } else if (!this.invalidAmount) {
      let saldobs = Number(this.saldoBs) - Number(value);
      if (saldobs < 0) saldobs = saldobs * (-1);
      /*this.warnignFormDebitoCredito(`Está a punto de reportar ${value} BOLIVARES, ¿estas seguro?`,
        `El monto debe ser expresado en BOLIVARES.`);*/
      this.warnignFormGeneral(`Está a punto de reportar ${value} BOLIVARES, ¿estas seguro?`,
        `El monto debe ser expresado en BOLIVARES.`, "Editar Monto", "Seguir adelante", Metodo)
    }
  }

  dateOfPay() {
    this.date?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          let date = new Date(value).getTime()
          const { days } = this.miceService.timeDifference(new Date().getTime(), date);
          if (days > 91) {

            this.invalidForm('No puede reportar un pago de hace 3 meses o más', 'Por favor diríjase a una oficina comercial');
            this.firstFormFibex.get('date')?.setValue('');
            this.dateInvalid = true;
            this.errorDate = !this.errorDate;
            //this.date_.value  = '';
            return;
          }
          this.dateInvalid = false;
          let feriadoDay = this.daysFeriados.find((days) => days.fecha === new Date(value).toISOString());
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
          if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 3) {
            this.invalidAmount = true;
            this.invalidForm(`Usted no puede reportar 3 meses de su subscripción`, ``);
            this.amount?.setValue('');
            return;
          }
        }
        if (!this.BancoNacional('')) {
          if (Number(value) > Number(this.saldoUSD) && Number(value) > Number(this.subscription) * 3) {
            this.invalidAmount = true;
            this.invalidForm(`Usted no puede reportar 3 meses de su subscripción`, ``);
            this.amount?.setValue('');
            return;
          }
        }
        if (Number(value) > 0) {
          //  this.incorrectBankAndAmount(value);
        }
        this.invalidAmount = false;
      }
    })
  }

  amountInvalidCreditoDebitoPagoMovil() {
    this.cantidadDC?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 3) {
          this.invalidAmount = true;
          this.invalidForm(`Usted no puede reportar 3 meses de su subscripción`, ``);
          this.cantidadDC?.setValue('');
          return;
        }
        this.invalidAmount = false;
      }
    });

    this.cantidad?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 3) {
          this.invalidForm(`Usted no puede reportar 3 meses de su subscripción`, ``);
          this.cantidad?.setValue('');
          this.invalidAmount = true;
          return;
        }
        this.invalidAmount = false;
      }
    });

    this.amountPm?.valueChanges.subscribe({
      next: (value) => {
        if (Number(value) > Number(this.saldoBs) && (Number(value) / Number(this.tasaCambio)) > Number(this.subscription) * 3) {
          this.invalidForm(`Usted no puede reportar 3 meses de su subscripción`, ``);
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
    //this.invalidForm('Usted posee contratos anulados '+numbersContracts, 'Por favor diríjase a una oficina comercial');
  }

  getDaysFeriados() {
    this._Consultas.getDaysFeriados().subscribe((res) => {
      //console.log(res)
      this.daysFeriados = res;
    });
  }

}


