import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { 
  IC2PPayload, 
  IC2PResponse,
  IGenerateOTPPayload,
  IGenerateOTPResponse,
  IProcessDebitoPayload,
  IProcessDebitoResponse
} from '../interfaces/payment-methods.interface';
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

  /**
   * Valida los datos del formulario de Débito Inmediato antes de enviar
   * @param data Datos del formulario
   * @param step Step actual (1 o 2)
   * @returns true si es válido, mensaje de error si no
   */
  validateDebitoData(data: any, step: number): { valid: boolean; error?: string } {
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

    // if (!data.nombre || data.nombre.trim().length < 3) {
    //   return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
    // }

    // if (!data.concepto || data.concepto.trim().length < 3) {
    //   return { valid: false, error: 'El concepto debe tener al menos 3 caracteres' };
    // }

    // Validar OTP solo en el step 2
    if (step === 2 && (!data.otp || data.otp.length < 4)) {
      return { valid: false, error: 'El PIN debe tener al menos 4 dígitos' };
    }

    return { valid: true };
  }

  /**
   * Genera el OTP para débito inmediato
   */
  async generateDebitoOTP(payload: IGenerateOTPPayload): Promise<IGenerateOTPResponse> {
    try {
      const response: AxiosResponse<IGenerateOTPResponse> = await axios.post(
        `${this.C2P_API_URL}/r4-autopago/generate-otp`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error generando OTP:', error);
      
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || 'Error al generar OTP'
        };
      } else if (error.request) {
        throw {
          status: 0,
          message: 'No se recibió respuesta del servidor'
        };
      } else {
        throw {
          status: 0,
          message: error.message || 'Error al procesar la petición'
        };
      }
    }
  }

  /**
   * Procesa el pago de débito inmediato
   */
  async processDebitoPayment(payload: IProcessDebitoPayload): Promise<IProcessDebitoResponse> {
    try {
      const response: AxiosResponse<IProcessDebitoResponse> = await axios.post(
        `${this.C2P_API_URL}/r4-autopago/process-inmediate-debit-count`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          timeout: 50000 // 50 segundos para coincidir con el contador
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error procesando débito inmediato:', error);
      
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || 'Error al procesar el pago'
        };
      } else if (error.request) {
        throw {
          status: 0,
          message: 'No se recibió respuesta del servidor'
        };
      } else {
        throw {
          status: 0,
          message: error.message || 'Error al procesar la petición'
        };
      }
    }
  }
}
