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
      console.log('🔍 Buscando checkouts para sede:', idSede);
      const response = await axios.get(environment.URL_API_MASTER + `/checkouts/sede/${idSede}`, {
        headers: {
          'token': environment.TOKEN_API_MASTER
        }
      });
      
      console.log('📦 Respuesta completa del endpoint:', response);
      console.log('📦 response.data:', response.data);
      console.log('📦 response.data.data:', response.data.data);
      console.log('📦 response.data.response:', response.data.response);

      // Intentar ambas estructuras posibles
      let checkouts: ICheckout[] = [];
      
      if (response.data.response) {
        checkouts = Array.isArray(response.data.response) ? response.data.response : [];
        console.log('✅ Usando response.data.response, encontradas:', checkouts.length);
      } else if (response.data.data) {
        checkouts = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('✅ Usando response.data.data, encontradas:', checkouts.length);
      } else if (Array.isArray(response.data)) {
        checkouts = response.data;
        console.log('✅ Usando response.data directamente, encontradas:', checkouts.length);
      }

      console.log('📋 Checkouts antes del filtro:', checkouts);
      
      // Retornar array de cajas y filtrar solo las disponibles
      const availableCheckouts = checkouts.filter(checkout => checkout.is_available);
      console.log('✅ Checkouts disponibles después del filtro:', availableCheckouts.length);
      
      return availableCheckouts;
    } catch (error: any) {
      console.error('❌ Error en getUserCheckouts:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
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
