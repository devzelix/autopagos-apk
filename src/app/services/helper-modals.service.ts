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
  alertImageModal(text: string, image: string, width= 400){
  /* return Swal.fire({
      imageUrl: image,
      imageWidth: width,
      imageHeight: height,
      imageAlt: "Imagen modal banco",
    });
    */
   return Swal.fire({
      title: 'Por favor espera',
      html: '<div class="loader"></div>', // Aquí puedes poner el código HTML de tu loader
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
        const img = new Image()
        img.src = image // Reemplaza esto con la ruta a tu imagen
        img.onload = () => {
          Swal.hideLoading()
          Swal.update({
            title: "",
            html: '<img src="' + img.src + `" width="${width}">`,
            showConfirmButton: true
          })
        }
      }
    })
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
