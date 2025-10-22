import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminPanelService {

  constructor() { }

  public authAdmin(user: string, pass: string): boolean {
    // Aquí iría la lógica real de autenticación, por ahora es un ejemplo simple
    if (user === 'admin' && pass === '12345678') {
      return true;
    }
    return false;
  }
}
