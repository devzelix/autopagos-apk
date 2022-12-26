import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog }  from '@angular/material/dialog';
import { ImageComponent } from '../image/image.component';
import { RegisterPayService } from '../../services/register-pay.service';
import { UplaodImageService } from '../../services/uplaod-image.service';
import { TasaService } from '../../services/tasa.service';

import { MatStepper } from '@angular/material/stepper';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';


@Component({
  selector: 'app-serial',
  templateUrl: './serial.component.html',
  styleUrls: ['./serial.component.scss']
})
export class SerialComponent implements OnInit {

  public bankList: string[] = [];
  public formFibex: FormGroup;
  public firstFormFibex: FormGroup;
  public secondFormFibex: FormGroup;
  public thirdFormFibex: FormGroup;
  public listContratos: { id_contrato: string, contrato: string, saldo: string, cliente: string, monto_pend_conciliar: number, subscription:  string  } [] = [];
  public paquetesContratos: { id_contrato: string, paquete: string }[] = [];
  public cambio_act: number = 0;
  public lastAmount: string = '';
  public banco : string = '';
  public imageUrl: string = '';
  public imageUploaded: boolean = false;
  public idContrato: string = '';
  public paquete: string = '';
  public regexEmail: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public regexUrl: RegExp = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
  public payReported: boolean = false;
  public playDuplicated: boolean  = false;
  public dniConsulted: boolean = false;
  public nameClient: string = '';
  public saldoUSD: string = '';
  public saldoBs: string = '';
  public saldoClienr: string = '';
  public subscription: string = '';
  public monto_pend_conciliar = 0;
  public Contar = 0;
  DisableReg: boolean = false;
  public lastDni: string = '';
  public saldoText: string = '';


  constructor(
    private registerPayService: RegisterPayService,
    private fb: FormBuilder,
    private uplaodImageService: UplaodImageService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private tasaService: TasaService
  ) {
    this.registerPayService.getBancosList()
    .subscribe((res) => {
      // Si la carga de bancos falla no es posible registrar el pago...
      // Es importante tener servidor de backup para esto Imaginando que SAE plus este caido debemos registrar pagos encolados.
      this.bankList = res.data.ConsultaBancos.Bancos
    });
  }

  init() {
    this.firstFormFibex = this.fb.group({
      name:['',[Validators.required]],
      dni: ['', [Validators.required, Validators.minLength(6)]],
      email: ['',[ Validators.required, Validators.pattern(this.regexEmail)]],
      bank: [''],
      nroContrato: ['',[Validators.required]],
      date: ['',[Validators.required]],
      amount: [''],
      img:['',[Validators.required]],
      serial: ['',[Validators.required]],
    });

    this.name?.disable();
  }

  ngOnInit(): void {
    this.init();
    this.route.queryParams
      .pipe(
        filter((param) => param['dni'])
      )
      .subscribe((res) => {
        if( res ) {
          this.searchServices(res['dni'], true);
          this.searchInfoEquipos(res['dni']);
        }
      });
  }

  get name() { return this.firstFormFibex.get('name'); }
  get dni() { return this.firstFormFibex.get('dni'); }
  get email() { return this.firstFormFibex.get('email'); }
  get nroContrato()  { return this.firstFormFibex.get('nroContrato'); }
  get bank()  { return this.firstFormFibex.get('bank'); }
  get amount() { return this.firstFormFibex.get('amount'); }
  get date() { return this.firstFormFibex.get('date'); }
  get img()  { return this.firstFormFibex.get('img'); }
  get serial() { return this.firstFormFibex.get('serial'); }

  uploadImagePayment($event: any) {
    let reader = new FileReader();
    reader.readAsDataURL($event.target.files[0]);
    reader.onload = (_event) => {
        let imageBase64: any = reader.result
        const fileList: FileList = $event.target.files;
        if (fileList.length > 0) {
            const file = fileList[0];
            if ( !this.uplaodImageService.verifyFileSize(file.size) ) {
                return;
            }
            //this.alertFindDni('Subiendo comprobante de pago', 'Porfavor espere' );
            //this.closeAlert();
           this.uplaodImageService.getUrlImageBase64({dataFileBase64: imageBase64}).subscribe(
            (res) => {
              imageBase64 = '';
              this.imageUrl = res.url;
              //console.log(this.imageUrl);
              //this.img?.patchValue(res.url);
              this.imageUploaded = true;
           });
        }
    }
  }

  savePayment () {
    this.DisableReg = true
    if( this.firstFormFibex.invalid  ) {
        if( !this.regexUrl.test(this.imageUrl) ) {
          this.invalidForm('La imagen de pago es requerida');
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
      if( this.nroContrato ) {
        return this.nroContrato.value === info.contrato;
      }
      return {};
    })
    var saldo = "0";
    if (this.BancoNacional(this.banco) &&  contractInfo?.saldo != undefined)  {
      saldo = (parseFloat(contractInfo.saldo) * this.cambio_act).toFixed(2)
    } else {
      if (contractInfo?.saldo != undefined)  {
        saldo = parseFloat(contractInfo?.saldo).toFixed(2)
      }
    }
    let date = this.date?.value !== undefined ?  `${new Date(this.date.value).getMonth() + 1}/${new Date(this.date.value).getDate()}/${new Date(this.date.value).getFullYear()}` :
      `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`;
      this.registerPayService.registerEquipo({
        ...this.firstFormFibex.value,
        img: this.imageUrl,
        name: contractInfo?.cliente,
        amount : this.amount?.value,
        date
      }).subscribe((res) => {
        this.DisableReg = false
        // console.log(res);
        this.payReported  = true;
        this.playDuplicated  = false;
        this.ScrollUp()
        this.Contar = 10;
        this.Contador()
      })
  }

  ScrollUp(Eventd?:any) {
    window.scroll(0,0);
  }

  ResetForm() {
    this.nameClient = '';
    this.saldoClienr = '';
    this.imageUrl = '';
    this.imageUploaded = false
    this.DisableReg = false
    this.cambio_act = 0;
    this.init()
    this.ScrollUp()
    this.firstFormFibex.patchValue({
      name:'',
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
  Contador() {
    this.Contar--
    if (this.Contar <= 0 ) {
      window.location.reload();
    }  else {
      setTimeout(() => this.Contador(), 1000);
    }
  }

  searchServices(dni: any, fromParmas?: boolean) {
    let dni_: string  = '';
    if( !fromParmas ) {
      dni_ = dni.value;
    } else if ( fromParmas ) {
      dni_ = dni;
    }

    if( dni_ === this.lastDni ) {
      return;
    }

    this.lastDni = dni_;

    this.nroContrato?.setValue('');
    this.amount?.setValue('');
    this.dniConsulted = false;
    if( dni_.length >= 6 ) {
      this.alertFindDni('Buscando información del cliente', 'Por favor espere...' );
      this.registerPayService.getSaldoByDni(dni_)
        .then((res:any) => {
          this.closeAlert();
          try {
              // console.log(res)
              if(res.length > 0 ) {
                console.log(res);
                this.listContratos = [];
                res.forEach((dataContrato: any) => {
                    this.listContratos.push({
                      id_contrato: dataContrato.id_contrato,
                      contrato: dataContrato.nro_contrato,
                      saldo: dataContrato.saldo,
                      cliente: dataContrato.cliente,
                      monto_pend_conciliar: dataContrato.monto_pend_conciliar,
                      subscription:  dataContrato.suscripcion,
                    });
                    this.cambio_act = dataContrato.cambio_act;
                });
                this.tasaService.tasa.next(this.cambio_act.toString());
                this.idContrato = this.listContratos[0].id_contrato;
                this.nameClient = this.listContratos[0].cliente;
                this.name?.setValue(res[0].cliente);
                this.nroContrato?.setValue(this.listContratos[0].contrato);
                this.monto_pend_conciliar = this.listContratos[0].monto_pend_conciliar;
                this.dni?.setValue(dni_);
                this.searchInfoEquipos(dni_);

              /*Esto se hacer por si el usuario preciomente selecciona un banco */
                if (this.BancoNacional(this.banco)) {
                  if (!Number.isNaN(parseFloat(this.listContratos[0].saldo))) {
                    this.validateIfAmountIsNegativer(this.listContratos[0].saldo, true);

                    this.lastAmount = parseFloat(this.listContratos[0].saldo ).toFixed(2);
                    console.log(parseInt(this.listContratos[0].saldo) <= 0)
                    this.saldoUSD =  parseFloat(this.listContratos[0].saldo).toFixed(2);
                    this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
                    this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
                  } else {
                    this.amount?.setValue(0);
                    this.lastAmount = '0';
                  }
                } else {
                  this.validateIfAmountIsNegativer(this.listContratos[0].saldo);
                  this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);
                  this.saldoUSD =  parseFloat(this.listContratos[0].saldo).toFixed(2);
                  this.saldoBs = (parseFloat(this.listContratos[0].saldo) * this.cambio_act).toFixed(2);
                  this.subscription = parseFloat(this.listContratos[0].subscription).toFixed(2);
                }
              //this.amount?.setValue(parseFloat(this.listContratos[0].saldo).toFixed(2));
              //this.lastAmount = parseFloat(this.listContratos[0].saldo).toFixed(2);
              if( this.listContratos.length === 1 ) {
                this.listContratos.find((cliente) => {
                  this.verifySaldo(cliente.saldo);
                });
              }
            } else {
              this.nameClient = '';
              this.saldoUSD =  '';
              this.saldoBs = '';
              this.dniConsulted = true;
              this.name?.setValue('');
              this.dni?.setValue('');
              this.alertFindDni('Debe colocar una cédula valida', 'Por favor espere...' );
              setTimeout(() => this.closeAlert(), 1000);

            }
          } catch (error) {
            this.nameClient = '';
              this.saldoClienr = '';
              this.dniConsulted = true;
              this.name?.setValue('');
            this.alertFindDni('Disculpe intente de nuevo', '' );
            setTimeout(() => this.closeAlert(), 1000);
          }

        })
    } else {
        // Esto lo hago porque el cliente ente busca una cedula valida y luego coloca una invalida
        // Se quedan los valores anteriores de la consulta anterior
        this.nameClient = '';
        this.saldoClienr = '';
        this.dniConsulted = true;
        this.name?.setValue('');
        this.alertFindDni('Disculpe intente de nuevo', '' );
        setTimeout(() => this.closeAlert(), 1000);
    }


  }

  searchInfoEquipos(dni: string) {
    this.paquetesContratos = [];
    console.log(dni);
    this.registerPayService.infoEquiposClientes(dni)
      .then((res: any) => {
        console.log(res);
        this.paquetesContratos = res.map((infoPaquete: any) => {
          return {
            id_contrato: infoPaquete.id_contrato,
            paquete: infoPaquete.paquetes
          }
        });
        if( this.paquetesContratos.length === 0 ) {
          this.paquete = '';
          return;
        }
        this.selectInfoEquipos(this.paquetesContratos[0].id_contrato);
      });
  }

  selectInfoEquipos(id_contrato: string) {
    console.log(id_contrato);
    let paquete =  this.paquetesContratos.find((index) => {
      console.log(index);
      return index.id_contrato === id_contrato
    })?.paquete;
    console.log(paquete, '-------------------------------------------------paquete');
    if( paquete !== undefined ) {
      this.paquete = paquete;
    }
  }

  contractSelected( contrato : { contrato: string, saldo: string, id_contrato: string, subscription: string } ) {
    this.validateIfAmountIsNegativer(contrato.saldo);
    this.lastAmount = parseFloat(contrato.saldo).toFixed(2);
    //this.verifySaldo(contrato.saldo);
    this.saldoUSD =  parseFloat(contrato.saldo).toFixed(2);
    this.saldoBs = (parseFloat(contrato.saldo) * this.cambio_act).toFixed(2);
    this.idContrato = contrato.id_contrato;
    this.subscription = parseFloat(contrato.subscription).toFixed(2);
    this.selectInfoEquipos(this.idContrato);
    this.bankSelected(this.banco);
  }

  BancoNacional(StrBanco: string) {
    if( StrBanco.toLowerCase().indexOf('mercantil') >= 0
        || StrBanco.toLowerCase().indexOf('bnc') >= 0
        || StrBanco.toLowerCase().indexOf('bs.') >= 0) {
          return true
    } else return false
  }

  bankSelected(bank: string) {
    this.banco = bank;
    if(this.BancoNacional(bank)) {
      console.log("Pase1")
      if (!Number.isNaN(parseFloat(this.lastAmount))) {
        this.validateIfAmountIsNegativer(this.lastAmount, true);      }
    } else {
      console.log("Pase2")
      this.amount?.setValue(this.lastAmount);
      this.saldoClienr = this.lastAmount + ' Saldo';
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


  alertDniAmount(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      icon: 'success',
      timer: 5000
    })
  }

  invalidForm (text: string) {
    Swal.fire({
      title: text,
      icon: 'error'
    })
  }

  closeAlert() {
    setTimeout(() => {
      Swal.close();
    }, 2500)
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ImageComponent, {
      width: '300px',
      data: this.imageUrl,
    });

    dialogRef.afterClosed().subscribe((deleteImage: boolean) => {
          if( deleteImage ) {
            this.img?.setValue('');
            this.imageUrl = '';
            this.imageUploaded = false;
          }
    });
  }

  verifySaldo (saldo: string) {
    if (parseFloat(saldo) <= 0) {
      this.alertDniAmount('Usted no posee deuda pendiente', 'Tiene un saldo a favor de: '+ parseFloat(saldo) * - 1  + ' REGISTO PAGO ADELANTADO');
      setTimeout(() => {
        // this.ResetForm();
      }, 1500)
      // this.nameClient = '';
      // this.saldoClienr = '';
    }
  }

  deleteImagePay () {
    this.img?.setValue('');
    this.imageUrl = '';
    this.imageUploaded = false;
  }

  zoomIn() {
    let full = document.getElementById('img-full') as HTMLElement;
    if( full ) {
      full.requestFullscreen().then()
    }
  }

  validateIfAmountIsNegativer(amount: string, national?: boolean) {
    if( national ) {
      if( parseInt(amount) <= 0) {
        this.amount?.setValue('');
        this.saldoText = 'SALDO A FAVOR';
      } else if (  parseInt(amount) > 0 ) {
        this.saldoText = 'SALDO';
        this.amount?.setValue((parseFloat(amount) * this.cambio_act).toFixed(2));
      }
      return;
    }

    if( parseInt(amount) <= 0) {
      this.amount?.setValue('0');
      this.saldoText = 'SALDO A FAVOR';
    } else if (  parseInt(amount) > 0 ) {
      this.saldoText = 'SALDO';
      this.amount?.setValue(parseFloat(amount).toFixed(2));1
    }

  }

}
