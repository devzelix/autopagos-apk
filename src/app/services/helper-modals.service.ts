import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class HelperModalsService {

  constructor() { }

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

  alertexit(text: string, optionalText: string = '') {
    return Swal.fire(
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
}
