import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IC2PPayload, IC2PResponse } from '../interfaces/payment-methods.interface';

@Injectable({
  providedIn: 'root'
})
export class C2pPaymentService {
  private apiUrl = 'https://pf269175-9194.use2.devtunnels.ms/api/r4-autopago/c2p';
  private authToken = 'a5118521-62d6-4d0c-bace-12e11bc64087';

  constructor(private http: HttpClient) {}

  /**
   * Procesa un pago C2P
   * @param payload Datos del pago C2P
   * @returns Observable con la respuesta de la API
   */
  processC2PPayment(payload: IC2PPayload): Observable<IC2PResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<IC2PResponse>(this.apiUrl, payload, { headers }).pipe(
      map(response => {
        console.log('✅ Respuesta C2P exitosa:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error en pago C2P:', error);
        return throwError(() => error);
      })
    );
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
