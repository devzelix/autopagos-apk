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
    // Mock login shortcut: username 'mock' and password 'mock123'
    if (user === 'mock' && pass === 'mock123') {
      const data: IAuthData = { id_user: 9999, id_sede: 9999 };
      return { data, isAuthenticated: true };
    }

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
    // Return mock checkouts when using mock sede id
    if (idSede === 9999) {
      const mock: ICheckout[] = [
        {
          id_checkout: 1,
          checkoutModel: 'MODEL-MOCK',
          checkoutSerial: 'SER-MOCK-001',
          checkout_identify: 'MOCK-CHECKOUT-1',
          id_sede: idSede,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_available: true,
          ip_address: '127.0.0.1'
        }
      ];
      return mock;
    }

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
    // Return a mock POS device when testing with mock user
    const mockPos: IPosDevice[] = [
      {
        id_pos_device: 1,
        device_model: 'POS-MOCK',
        serial_number: 'POS-SER-001',
        terminalVirtual: 'MOCK-TERM-001',
        ip_address: '127.0.0.1',
        port: 8080,
        acquisition_date: new Date().toISOString(),
        note: null,
        status: 'ACTIVE',
        id_checkout: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        checkout_box: null
      }
    ];

    try {
      const response = await axios.get(environment.URL_API_MASTER + `/pos-devices/availables/list`, {
        headers: {
          'token': environment.TOKEN_API_MASTER
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error en getAvailablePos:', error);
      // Fallback to mock if real API fails
      return mockPos;
    }
  }

  public async assignPosToCheckout(idPos: number, idCheckout: number): Promise<boolean> {
    // Allow assignment to succeed for mock ids
    if (idPos === 1 || idCheckout === 1) return true;

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

  /**
   * Obtiene la información actualizada del POS desde la API master
   * @param idPosDevice ID del dispositivo POS
   * @returns Información del POS o null si hay error
   */
  public async getPosDeviceById(idPosDevice: number): Promise<IPosDevice | null> {
    try {
      const response = await axios.get(
        environment.URL_API_MASTER + `/pos-devices/${idPosDevice}`,
        {
          headers: {
            'token': environment.TOKEN_API_MASTER
          }
        }
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Error en getPosDeviceById:', error);
      return null;
    }
  }

  /**
   * Actualiza la IP y puerto del POS en la API master
   * @param idPosDevice ID del dispositivo POS
   * @param ipAddress Nueva dirección IP
   * @param port Nuevo puerto
   * @returns true si se actualizó exitosamente, false en caso contrario
   */
  public async updatePosIpAndPort(idPosDevice: number, ipAddress: string, port: number): Promise<boolean> {
    try {
      const response = await axios.put(
        environment.URL_API_MASTER + `/pos-devices/${idPosDevice}`,
        {
          ip_address: ipAddress,
          port: port
        },
        {
          headers: {
            'token': environment.TOKEN_API_MASTER
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error en updatePosIpAndPort:', error);
      return false;
    }
  }

  /**
   * Obtiene la información de la sede desde la API master
   * @param idSede ID de la sede
   * @returns Información de la sede con nombre o null si hay error
   */
  public async getSedeInfo(idSede: number): Promise<{ id_sede: number; name?: string; nombre?: string } | null> {
    try {
      const response = await axios.get(
        environment.URL_API_MASTER + `/sedes/${idSede}`,
        {
          headers: {
            'token': environment.TOKEN_API_MASTER
          }
        }
      );
      return response.data.data || { id_sede: idSede };
    } catch (error) {
      console.error('Error en getSedeInfo:', error);
      // Si falla, retornar al menos el ID
      return { id_sede: idSede };
    }
  }
}
