import { inject, Injectable } from '@angular/core';
import { EncryptService } from './encrypt.service';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  private encryptService = inject(EncryptService)
  constructor() { }

  public set<T>(item: string, data: T) {
    try{
      const dataEncrypt = this.encryptService.Encrypt(JSON.stringify(data));
      localStorage.setItem(item, dataEncrypt);
    }catch(e){      
      this.removeAll()
      /* window.location.reload() */
    }
  }
  public get<T>(item: string): T | null | undefined {
    try{
      const dataEncrypt = localStorage.getItem(item);
      if (!dataEncrypt) return null;
      const decryptData = JSON.parse(this.encryptService.Descrypt(dataEncrypt) ?? '');
      return decryptData;
    }catch(e){
      console.error('ERROR getEncrypt', e);
      return null;
      /* this.removeAll() */
      /* window.location.reload() */
    }
  }

  /**
   * Removes all the local storage items
   */
  public removeAll() {
    console.log('in removeAll function')
    localStorage.clear();
  }

  public removeItem(item: string) {
    try {
      localStorage.removeItem(item);
    } catch (error) {
      console.error(error)
    }
  }
}
