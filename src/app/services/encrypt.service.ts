import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  secretKey: string = 'T0rNaDoK4tr1Na?RTgcNmhKU='

  /**
   * Permite encriptar objetos y strings
   * @param obj objeto o cualquier otra cosa que pueda ser encriptado
   * @returns valor encriptado
   */
  public Encrypt(obj: any) {
    if(obj instanceof Object) {
      const newObj: any = obj instanceof Array ? [] : {};

      for (let keyName in obj) {
        newObj[keyName] = this.Encrypt(obj[keyName]);
      }

      return newObj;
    }
    return String(this.EncryptDatos(obj));
  }

  /**
   * Permite desencriptar objetos y strings
   * @param obj objeto o cualquier otra cosa que pueda ser desencriptado
   * @returns valor desencriptado
   */
  public Descrypt(obj: any) {
    if(obj instanceof Object) {
      const newObj: any = obj instanceof Array ? [] : {};

      for (let keyName in obj) {
        newObj[keyName] = this.Descrypt(obj[keyName]);
      }

      return newObj;
    }
    else if(typeof obj === "string") {
      return String(this.DecryptDatos(obj));
    }
    return obj;
  }

  /**
   * Permite encriptar un string
   * @param str string a encriptar
   * @returns string encriptado
   */
  private EncryptDatos(str: string) {
      let encrypted = CryptoJS.AES.encrypt(str, environment.KeyEncriptado, {
          keySize: 16,
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
      }).toString();

      return encrypted
  }

  /**
   * Permite desencriptar un texto
   * @param Data string descriptado
   * @returns data desencriptado
   */
  private DecryptDatos(str: string) {
    return CryptoJS.AES.decrypt(str, environment.KeyEncriptado, {
      keySize: 16,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
  }

  btoa(str:string){
    return btoa(str)
  }

}
