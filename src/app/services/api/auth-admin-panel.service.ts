import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { IAuthData } from 'src/app/interfaces/auth-response.interface';
import { ICheckout } from 'src/app/interfaces/checkout.interface';
import { IPosDevice } from 'src/app/interfaces/pos-device.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminPanelService {

  constructor() { }

  public async authAdmin(user: string, pass: string): Promise<{ data: IAuthData | null, isAuthenticated: boolean }> {
    try {
      const response = await axios.post(environment.URL_API_MASTER + '/auth/admin', {
        username: user,
        password: pass
      }, {
        headers: {
          'token': environment.TOKEN_API_MASTER
        }
      });

      if (response.status === 200) {
        return { data: response.data.response, isAuthenticated: true };
      }

      return { data: null, isAuthenticated: false };
    } catch (error) {
      console.error('Error en authAdmin:', error);
      return { data: null, isAuthenticated: false };
    }
  }

  public async getUserCheckouts(idSede: number): Promise<ICheckout[]> {
    try {
      const response = await axios.get(environment.URL_API_MASTER + `/checkouts/sede/${idSede}`, {
        headers: {
          'token': environment.TOKEN_API_MASTER
        }
      });
      // Retornar array de cajas y filtrar solo las disponibles
      const checkouts: ICheckout[] = response.data.data || [];
      return checkouts.filter(checkout => checkout.is_available);
    } catch (error) {
      console.error('Error en getUserCheckouts:', error);
      return [];
    }
  }

  public async getAvailablePos(): Promise<IPosDevice[]> {
    try {
      const response = await axios.get(environment.URL_API_MASTER + `/pos-devices/availables/list`, {
        headers: {
          'token': environment.TOKEN_API_MASTER
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error en getAvailablePos:', error);
      return [];
    }
  }

  public async assignPosToCheckout(idPos: number, idCheckout: number): Promise<boolean> {
    try {
      const response = await axios.post(
        environment.URL_API_MASTER + `/pos-devices/availables/assignCheckout/${idPos}`,
        {
          id_checkout: idCheckout
        },
        {
          headers: {
            'token': environment.TOKEN_API_MASTER
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error en assignPosToCheckout:', error);
      return false;
    }
  }
}
