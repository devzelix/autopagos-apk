import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Ano, Month, TypeAccount } from '../form/camposSubscription/camposSuscription';
import { ApiBNCService } from 'src/app/services/ApiBNC';
import Swal from 'sweetalert2';
import { Api100x100Service } from 'src/app/services/Api100x100Banco';
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { PlantillaConfirmPago } from '../form/camposSubscription/camposSuscription';


@Component({
  selector: 'app-debito-100x100',
  templateUrl: './debito-100x100.html',
  //styleUrls: ['./debito-credito-bnc.component.scss']
})
export class Debit100x100 implements OnInit {
  @Input() DNI: string;
  @Input() SaldoBS: string;
  @Input() Abonado: string;
  @Input() Contrato: string;
  @Output() OutputResponse = new EventEmitter<any>();

  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public regexCCV: RegExp = /^\d*$/;
  public PinError: number = 0;
  public PlantillaTempPago: any = JSON.parse(JSON.stringify(PlantillaConfirmPago));


  Debito100x100: FormGroup
  cantidadDC: any;
  invalidAmount: any;
  saldoBs: any;
  ListBank: any;
  NameBank:string = ''

  constructor(
    private fb: UntypedFormBuilder,
    private _Api100x100: Api100x100Service,
    private _seguridadDatos: SeguridadDatos
  ) { }

  ngOnInit() {

    this.Debito100x100 = this.fb.group({
      pref_ci: ['', [Validators.required]],
      CI: ['', [Validators.required, Validators.minLength(6)]],
      Bank: ['', [Validators.required]],
      CountNumber: ['', [Validators.required, Validators.minLength(11)]],
      Amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      Auth: [''],
      identifierTransaction: ['']
    })
    this._Api100x100.ListBank()
    .then((resp: any) => {
      this.ListBank = resp
    }).catch((error: any) => console.error(error))

    this.Debito100x100.get('pref_ci')?.setValue('V')
    this.Debito100x100.get('CI')?.setValue(this.DNI)
    this.Debito100x100.get('Amount')?.setValue(this.SaldoBS)
    //this.Debito100x100.get('CardType')?.setValue(this.TypePay)

  }

  get pref() { return this.Debito100x100.get('pref_ci'); }
  get dni() { return this.Debito100x100.get('CI'); }
  get Amount() { return this.Debito100x100.get('Amount'); }
  get CountNumber() { return this.Debito100x100.get('CountNumber'); }

  ButtonGetAuthC2P(title:string,text:string,bank:string) {

    Swal.fire({
      title: "Pin de autorización",
      text: "Por favor coloque su pin de autorización",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (authClave) => {
        if (authClave && authClave.length === 8) {
          this.Debito100x100.controls['Auth'].setValue(authClave);
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
        this.PagoDebito100x100();
      }
    })
  }

  PagoDebito100x100() {
    this.alertFind("Procesando su pago", "Por favor espere")
    //Desencripto el localstorage para obtenerel nombre del usuario
    let name_user = this._seguridadDatos.decrypt(localStorage.getItem("Name")!) ? this._seguridadDatos.decrypt(localStorage.getItem("Name")!): "";
    //Esta lógica identifica si es número de telfono o nro de cuenta ya que en backend se lleva por este numero para identifcar el tipo
    let ValueIdentifier = this.CountNumber?.value.length == 11 || this.CountNumber?.value.length == 12 ? "202" : "222"
    this.Debito100x100.controls['identifierTransaction'].setValue(ValueIdentifier);

    this._Api100x100.CompraDebito({...this.Debito100x100.value,Abonado: this.Abonado,Contrato: this.Contrato,name_user: name_user})
    .then((resp: any) => {
        if (resp.hasOwnProperty('status')){
          if (resp.status == true) {
            this.OutputResponse.emit({
              Tipo: "Pago Realizado",
              Monto: this.Debito100x100.get('Amount')?.value
            })
          }else {
            this.invalidForm(`Hubo un problema`,`${resp.description}`);
          }
        }else{
          this.invalidForm("Error",`${resp.error}`)
        }
  }).catch((error: any) => console.error(error))
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
    this.PlantillaTempPago = JSON.parse(JSON.stringify(PlantillaConfirmPago));
  }

  AmountIncorrectConfirm(value: string, Metodo: string, type?: string) {
    console.log(this.Amount?.value);
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

  alertFind(title: string, message: string) {
    Swal.fire({
      title,
      html: message,
      //timer: 5000,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }



  ResetForm() {
    this.Debito100x100.reset()
    console.log("entre aqui 2",this.OutputResponse)
    this.OutputResponse.emit({
      Tipo: "Regresar"
    })
  }

  invalidForm(text: string, optionalText: string = '') {
    Swal.fire({
      title: text,
      html: optionalText,
      icon: 'error'
    })
  }

}
