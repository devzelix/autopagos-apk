import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Ano, Month, TypeAccount } from '../form/camposSubscription/camposSuscription';
import { ApiBNCService } from 'src/app/services/ApiBNC';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-debito-credito-bnc',
  templateUrl: './debito-credito-bnc.component.html',
  styleUrls: ['./debito-credito-bnc.component.scss']
})
export class DebitoCreditoBNCComponent implements OnInit {
  @Input() DNI: string;
  @Input() SaldoBS: string;
  @Input() TypePay: string;
  @Input() Abonado: string;
  @Input() Contrato: string;
  @Output() OutputResponse = new EventEmitter<any>();

  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public regexCCV: RegExp = /^\d*$/;

  public TypeAcountDC: any[] = [{ id: 0, cuenta: "Principal" }, { id: 10, cuenta: "Ahorro" }, { id: 20, cuenta: "Corriente" }]//TypeAccount;
  public Months = Month;
  public Anos = Ano;

  POS_VirtualForm: FormGroup
  CreditoForm: FormGroup

  constructor(
    private fb: UntypedFormBuilder,
    private apiBNC: ApiBNCService
  ) { }

  ngOnInit() {

    this.POS_VirtualForm = this.fb.group({
      pref_ci: ['', [Validators.required]],
      CI: ['', [Validators.required, Validators.minLength(6)]],
      CardName: ['', [Validators.required, Validators.minLength(6)]],
      CardNumber: ['', [Validators.required, Validators.minLength(10)]],
      CardHolderId: [''],
      CardPIN: [''],
      CVV: ['', [Validators.required, Validators.pattern(this.regexCCV), Validators.maxLength(3)]],
      fvncmtoMes: ['', [Validators.required]],
      fvncmtoAno: ['', [Validators.required]],
      AccountType: ['', [Validators.required]],
      CardType: [''],
      Amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      identifierTransaction: ['']
    })

    this.CreditoForm = this.fb.group({
      pref_ci: ['', [Validators.required]],
      CI: ['', [Validators.required, Validators.minLength(6)]],
      CardName: ['', [Validators.required, Validators.minLength(6)]],
      CardNumber: ['', [Validators.required, Validators.minLength(10)]],
      Description: ['', [Validators.required, Validators.minLength(6)]],
      Amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
    })

    this.POS_VirtualForm.get('pref_ci')?.setValue('V')
    this.POS_VirtualForm.get('CI')?.setValue(this.DNI)
    this.POS_VirtualForm.get('Amount')?.setValue(this.SaldoBS)
    //this.POS_VirtualForm.get('CardType')?.setValue(this.TypePay)

    this.CreditoForm.get('pref_ci')?.setValue('V')
    this.CreditoForm.get('CI')?.setValue(this.DNI)
    this.CreditoForm.get('Amount')?.setValue(this.SaldoBS)

  }

  ProcesarPago() {
    console.log("Datos POS Virtual")
    let DatosJson: any
    switch (this.TypePay) {
      case "Débito Maestro":
        DatosJson = this.POS_VirtualForm.value
        this.apiBNC.Pay_POs_Virtual({
          ...DatosJson,
          TipoPago: this.TypePay,
          Abonado: this.Abonado,
          Contrato: this.Contrato
        }).then((ResPay: any) => {
          if (ResPay && ResPay.status === true) {
            this.OutputResponse.emit({
              Tipo: "Pago Realizado",
              monto : DatosJson.Amount
            })
          } else { this.invalidForm(ResPay.MsgError || ResPay.message, ''); }
        }).catch(err => console.error(err))
        break;
      case "Credito":
        DatosJson = this.CreditoForm.value
        this.apiBNC.Pay_Credit({
          ...DatosJson,
          TipoPago: this.TypePay,
          Abonado: this.Abonado,
          Contrato: this.Contrato
        }).then((ResPay: any) => {
          if (ResPay && ResPay.status === true) {
            this.OutputResponse.emit({
              Tipo: "Pago Realizado"
            })
          } else { this.invalidForm(ResPay.MsgError || ResPay.message, ''); }
        }).catch(err => console.error(err))
        break
    }
    console.log(this.TypePay)
    console.log(DatosJson)
  }

  ResetForm() {
    this.POS_VirtualForm.reset()
    this.CreditoForm.reset()
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
