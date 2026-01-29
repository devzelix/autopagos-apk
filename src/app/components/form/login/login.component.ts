import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ITypeDNI } from 'src/app/interfaces/payment-opt';

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @Input() loginTypeSelectValue: string = 'V';
  @Input() dniValue: string = '';

  @Output() onLogin = new EventEmitter<{ type: string; dni: string }>();
  @Output() onTypeChange = new EventEmitter<ITypeDNI>();
  @Output() onKeyStroke = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<void>();

  public showDniDropdown: boolean = false;
  public dniOptions: ITypeDNI[] = ['V', 'J', 'E'];

  constructor() {}

  ngOnInit(): void {}

  toggleDniDropdown() {
    this.showDniDropdown = !this.showDniDropdown;
  }

  selectDniType(type: ITypeDNI, event: Event) {
    event.stopPropagation();
    this.loginTypeSelectValue = type;
    this.onTypeChange.emit(type);
    this.showDniDropdown = false;
  }

  onKeyClick(val: any) {
    this.onKeyStroke.emit(val.toString());
  }

  onDeleteClick() {
    this.onDelete.emit();
  }

  onIngresar() {
    this.onLogin.emit({
      type: this.loginTypeSelectValue,
      dni: this.dniValue,
    });
  }
}
