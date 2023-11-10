import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { isNegativeNumber } from '../../../validators/customValidatorAmount';

@Component({
  selector: 'app-payment-mobile-bnc',
  templateUrl: './payment-mobile-bnc.component.html',
  styleUrls: ['./payment-mobile-bnc.component.scss']
})
export class PaymentMobileBNCComponent implements OnInit {
  @Input() saldoBs: String
  @Input() dni: String
  @Input() PinEnviado: boolean
  @Input() Minutes: any
  @Input() ConcatenaTimer: string
  @Input() Second: any
  @Output() BackEvents = new EventEmitter<string>();

  public RegexPhone = /^(412|414|424|416|426|0412|0414|0424|0416|0426|58412|58414|58424|58416|58426)[0-9]{7}$/gm
  public regexAmount: RegExp = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  public PgMovilRegForm: FormGroup;

  constructor(
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
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

    this.PgMovilRegForm.get('amountPm')?.setValue(this.saldoBs);
    this.PgMovilRegForm.get('pref_ci')?.setValue('V');
    this.PgMovilRegForm.get('c_i')?.setValue(this.dni);
  }

  get amountPm() { return this.PgMovilRegForm.get('amountPm'); }

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

  EmitEvent(Opcion: string) {
    switch (Opcion) {
      case "Regresar":
        this.PgMovilRegForm.reset();
        this.PgMovilRegForm.get('tlforigin')?.setValue('584129637516');
        this.BackEvents.emit("BackToList")
        break;
      case "Pin":
        this.BackEvents.emit("Solicitar Pin")
        break;
    }
  }

}
