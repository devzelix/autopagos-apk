import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const isNegativeNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const amount = control.get('amount');
    return parseFloat(amount?.value) < 0 ? { isNegative: true } : null;
  };