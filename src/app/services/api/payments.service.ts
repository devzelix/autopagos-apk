import { Injectable } from '@angular/core';
import axios from "axios";
import { IPaymentCreate, IPaymentRegister } from "../../interfaces/api/payment";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor() {}

  /**
   * Payment Register on SAE PLUS
   * @param paymenteInfo 
   * @returns 
   */
  public async paymentRegisterOnSAE(paymenteInfo: IPaymentRegister) {
    try {
      // Validate file data
      if (!paymenteInfo) {
        throw new Error("No se ha proporcionado la informacion de la transaccion a registrar");
      }

      return await axios({
        url: `${environment.URL_API_MASTER}/administrative/payment/register-payment`,
        method: "POST",
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo,
      })
        .then((res) => {
          return Promise.resolve(res.data);
        })
        .catch((err) => {
          console.error(err);
          return Promise.reject(err);
        });
      
    } catch (err) {
      console.error(err);
      throw new Error("Error al registrar la transaccion");
    }
  }


  /**
   * Payment Create on Database
   * @param paymenteInfo 
   * @returns 
   */
  public async paymentCreate(paymenteInfo: IPaymentCreate) {
    try {
      // Validate file data
      if (!paymenteInfo) {
        throw new Error("No se ha proporcionado la informacion de la transaccion a registrar");
    }

      return await axios({
        url: `${environment.URL_API_MASTER}/administrative/payment/create-transaction`,
        method: "POST",
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: paymenteInfo,
      })
        .then((res) => {
          return Promise.resolve(res.data);
        })
        .catch((err) => {
          console.error(err);
          return Promise.reject(err);
        });
      
    } catch (err) {
      console.error(err);
      throw new Error("Error al crear la transaccion");
    }

  }
}
