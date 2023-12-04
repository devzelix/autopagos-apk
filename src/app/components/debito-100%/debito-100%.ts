import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Ano, Month, TypeAccount } from '../form/camposSubscription/camposSuscription';
import { ApiBNCService } from 'src/app/services/ApiBNC';
import Swal from 'sweetalert2';
import { Api100x100Service } from 'src/app/services/Api100x100Banco';

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

  Debito100x100: FormGroup

  constructor(
    private fb: UntypedFormBuilder,
    private _Api100x100: Api100x100Service
  ) { }

  ngOnInit() {

    this.Debito100x100 = this.fb.group({
      pref_ci: ['', [Validators.required]],
      CI: ['', [Validators.required, Validators.minLength(6)]],
      CountNumber: ['', [Validators.required, Validators.minLength(10)]],
      Amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      identifierTransaction: ['']
    })

    this.Debito100x100.get('pref_ci')?.setValue('V')
    this.Debito100x100.get('CI')?.setValue(this.DNI)
    this.Debito100x100.get('Amount')?.setValue(this.SaldoBS)
    //this.Debito100x100.get('CardType')?.setValue(this.TypePay)

  }

  PagoDebito100x100() {

    let datosPago :any

    datosPago = this.Debito100x100.value

    console.log("entre aqui 1",datosPago)
    this._Api100x100.CompraDebito({...datosPago,
        Abonado: this.Abonado,
        Contrato: this.Contrato}).then((resp: any) => {
          console.log("entre aqui 2",resp.hasOwnProperty('status')) 
          if (resp.hasOwnProperty('status')){
            if (resp.status == true) {
            console.log("entre aqui 2",resp.hasOwnProperty('status')) 
              this.OutputResponse.emit({
                Tipo: "Pago Realizado"
              })
              console.log(resp)        
            }else {
              this.invalidForm(`Hubo un problema`,`${resp.description}`);
            }
          }else{
            this.invalidForm("Error",`${resp.error}`)
          }
    }).catch((error: any) => console.error(error))
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
