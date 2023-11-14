import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Ano, Month, TypeAccount } from '../form/camposSubscription/camposSuscription';

@Component({
  selector: 'app-debito-credito-bnc',
  templateUrl: './debito-credito-bnc.component.html',
  styleUrls: ['./debito-credito-bnc.component.scss']
})
export class DebitoCreditoBNCComponent implements OnInit {

  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public regexCCV: RegExp = /^\d*$/;

  public TypeAcountDC: any[] = TypeAccount;
  public Months = Month;
  public Anos = Ano;

  POS_VirtualForm: FormGroup
  CreditoForm: FormGroup

  constructor(
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {

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
      CardType: ['', [Validators.required]],
      Amount: ['', [Validators.required, Validators.pattern(this.regexAmount)]],
      identifierTransaction: ['']
    })

  }

}
