import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { IC2PPayload, IC2PResponse } from '../interfaces/payment-methods.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebhookAutopagoService {
  private readonly C2P_API_URL = environment.url_api_webhook_caja;
  private readonly authToken = environment.api_webhook_caja_token;

  constructor() {}

  /**
   * Procesa un pago C2P usando axios
   */
  async processC2PPayment(payload: IC2PPayload): Promise<IC2PResponse> {
    try {
      const response: AxiosResponse<IC2PResponse> = await axios.post(
        `${this.C2P_API_URL}/r4-autopago/c2p`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          timeout: 30000 // 30 segundos timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error en petición C2P:', error);
      
      // Manejar errores de axios
      if (error.response) {
        // El servidor respondió con un código de error
        throw {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || 'Error en la respuesta del servidor'
        };
      } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        throw {
          status: 0,
          message: 'No se recibió respuesta del servidor'
        };
      } else {
        // Algo pasó al configurar la petición
        throw {
          status: 0,
          message: error.message || 'Error al procesar la petición'
        };
      }
    }
  }

  /**
   * Valida los datos del formulario C2P antes de enviar
   * @param data Datos del formulario
   * @returns true si es válido, mensaje de error si no
   */
  validateC2PData(data: any): { valid: boolean; error?: string } {
    if (!data.telefono || data.telefono.length !== 11) {
      return { valid: false, error: 'El teléfono debe tener 11 dígitos' };
    }

    if (!data.cedula || data.cedula.length < 6) {
      return { valid: false, error: 'La cédula debe tener al menos 6 dígitos' };
    }

    if (!data.banco) {
      return { valid: false, error: 'Debe seleccionar un banco' };
    }

    if (!data.monto || parseFloat(data.monto) <= 0) {
      return { valid: false, error: 'El monto debe ser mayor a 0' };
    }

    if (!data.otp || data.otp.length < 4) {
      return { valid: false, error: 'El token OTP debe tener al menos 4 dígitos' };
    }

    return { valid: true };
  }
}
