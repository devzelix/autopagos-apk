import { Injectable } from '@angular/core';
import axios from 'axios';
import { IUbiiposDataSend } from 'src/app/interfaces/api/ubiipos';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import { LocalstorageService } from '../localstorage.service';
import { LogService } from '../log.service';
import { ILog } from 'src/app/interfaces/log.interface';
import { handleApiError } from 'src/app/utils/api-tools';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UbiiposService {
  constructor(
    private _logService: LogService,
    private _localStorageService: LocalstorageService
  ) { }

  private getHostUbii() {
    try {
      // Get host
      const hostUbii: string =
        this._localStorageService.get<string>('ubiiposHost') ?? '';

      console.log('🔍 [UbiPOS] Obteniendo host desde localStorage:', hostUbii || 'NO CONFIGURADO');

      // Get url
      const url: string | null = hostUbii ? `${hostUbii}/api/spPayment` : null;

      if (!url) {
        console.warn('⚠️ [UbiPOS] Host no configurado en localStorage');
      } else {
        console.log('✅ [UbiPOS] URL construida:', url);
      }

      return url;
    } catch (error) {
      console.error('❌ [UbiPOS] Error al obtener host:', error);
      return null;
    }
  }

  /**
   * UBIIPOS TEST
   * @param iptest: string
   * @returns resReturn: IResponse
   */
  async testUbiipos(iptest: string): Promise<IResponse> {
    console.log('🧪 [UbiPOS Test] Iniciando test de conexión...');
    console.log('🧪 [UbiPOS Test] IP a probar:', iptest);

    let resReturn: IResponse;

    try {
      // Validate `iptest`
      if (!iptest) {
        console.error('❌ [UbiPOS Test] IP no proporcionada');
        resReturn = {
          status: 400,
          message: 'IP address is required',
        };

        return resReturn;
      }

      const bodyReq: IRequest = {
        url: `${iptest}/api/spPayment`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          paymentId: 'Taubii',
          customerId: '1000000',
          amount: '100', // String
          operation: 'PAYMENT',
        },
        timeout: environment.API_TIMEOUT_STANDARD,
      };

      // 📋 LOG COMPLETO DEL REQUEST
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [UbiPOS Test] REQUEST COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL:', bodyReq.url);
      console.log('🔧 METHOD:', bodyReq.method);
      console.log('📋 HEADERS:', JSON.stringify(bodyReq.headers, null, 2));
      console.log('📦 BODY:', JSON.stringify(bodyReq.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Make request
      const response = await axios.request(bodyReq);

      // 📋 LOG COMPLETO DEL RESPONSE
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [UbiPOS Test] RESPONSE COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 STATUS:', response.status, response.statusText);
      console.log('📋 HEADERS:', JSON.stringify(response.headers, null, 2));
      console.log('📦 DATA:', JSON.stringify(response.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const transCodeResult = response.data?.TRANS_CODE_RESULT || 'UNKNOWN';
      const isSuccess = transCodeResult === '00';

      console.log('📊 [UbiPOS Test] TRANS_CODE_RESULT:', transCodeResult);
      console.log('📊 [UbiPOS Test] Transacción exitosa:', isSuccess);

      resReturn = {
        status: response.status,
        message:
          response.data.TRANS_MESSAGE_RESULT !== ''
            ? response.data.TRANS_MESSAGE_RESULT
            : response.statusText,
        data: response.data as any,
      };

      console.log('✅ [UbiPOS Test] Respuesta formateada:', resReturn);

      // Verificar si la transacción fue realmente exitosa
      const isTransactionSuccess = transCodeResult === '00';

      // LOGS SAVE - Usar el estado real de la transacción
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: isTransactionSuccess,
        http_method: 'POST',
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: transCodeResult,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      if (!isTransactionSuccess) {
        console.warn('⚠️ [UbiPOS Test] Transacción rechazada:', {
          code: transCodeResult,
          message: response.data.TRANS_MESSAGE_RESULT,
        });
      }

      return resReturn;
    } catch (error) {
      console.error('❌ [UbiPOS Test] Error en la petición:', error);

      const errRes: IResponse = handleApiError(error);

      console.error('❌ [UbiPOS Test] Error procesado:', {
        status: errRes.status,
        message: errRes.message,
      });

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${iptest}/api/spPayment`,
        req_body: JSON.stringify({
          paymentId: 'Taubii',
          customerId: '1000000',
          amount: '100', // String
          operation: 'PAYMENT',
        }),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      // Retornar el error sin mostrar alert, el componente se encargará de mostrarlo en Swal
      return errRes;
    }
  }

  /**
   * PAYMENT UBIIPOS
   * @param request: IUbiiposDataSend
   * @returns resReturn: IResponse
   */
  async paymentUbiipos(request: IUbiiposDataSend): Promise<IResponse> {
    console.log('💳 [UbiPOS Payment] Iniciando procesamiento de pago...');
    console.log('💳 [UbiPOS Payment] Datos recibidos:', JSON.stringify(request, null, 2));

    let resReturn: IResponse;

    try {
      // Get url
      const url: string | null = this.getHostUbii();

      // Validate url
      if (!url) {
        console.error('❌ [UbiPOS Payment] Host no configurado');
        resReturn = {
          status: 400,
          message: 'Ubiipos host is not configured',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this._localStorageService.get<string>('ubiiposHost')
            ? this.getHostUbii() ?? 'Ubiipos host is not configured'
            : resReturn.message,
          req_body: JSON.stringify({
            paymentId: 'Taubii',
            ...request,
          }),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      // Get body
      const body: IUbiiposDataSend = {
        paymentId: 'Taubii',
        ...request,
      };

      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: body,
        timeout: environment.API_TIMEOUT_STANDARD,
      };

      // 📋 LOG COMPLETO DEL REQUEST
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [UbiPOS Payment] REQUEST COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL:', bodyReq.url);
      console.log('🔧 METHOD:', bodyReq.method);
      console.log('📋 HEADERS:', JSON.stringify(bodyReq.headers, null, 2));
      console.log('📦 BODY:', JSON.stringify(bodyReq.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Make request
      const response = await axios.request(bodyReq);

      // 📋 LOG COMPLETO DEL RESPONSE
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [UbiPOS Payment] RESPONSE COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 STATUS:', response.status, response.statusText);
      console.log('📋 HEADERS:', JSON.stringify(response.headers, null, 2));
      console.log('📦 DATA:', JSON.stringify(response.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Verificar si la transacción fue realmente exitosa
      const transCodeResult = response.data?.TRANS_CODE_RESULT || 'UNKNOWN';
      const isTransactionSuccess = transCodeResult === '00';

      console.log('📊 [UbiPOS Payment] TRANS_CODE_RESULT:', transCodeResult);
      console.log('📊 [UbiPOS Payment] TRANS_MESSAGE_RESULT:', response.data?.TRANS_MESSAGE_RESULT || 'Sin mensaje');
      console.log('📊 [UbiPOS Payment] Transacción exitosa:', isTransactionSuccess);

      if (isTransactionSuccess) {
        console.log('✅ [UbiPOS Payment] Transacción APROBADA');
        console.log('✅ [UbiPOS Payment] Referencia:', response.data?.REFERENCIA);
        console.log('✅ [UbiPOS Payment] Terminal:', response.data?.TERMINAL);
        console.log('✅ [UbiPOS Payment] Confirmación:', response.data?.TRANS_CONFIRM_NUM);
      } else {
        console.warn('⚠️ [UbiPOS Payment] Transacción RECHAZADA');
        console.warn('⚠️ [UbiPOS Payment] Código de error:', transCodeResult);
        console.warn('⚠️ [UbiPOS Payment] Mensaje:', response.data?.TRANS_MESSAGE_RESULT);
        console.warn('⚠️ [UbiPOS Payment] Referencia:', response.data?.REFERENCIA);
      }

      resReturn = {
        status: response.status,
        message:
          response.data.TRANS_MESSAGE_RESULT !== ''
            ? response.data.TRANS_MESSAGE_RESULT
            : response.statusText,
        data: response.data as any,
      };

      console.log('📋 [UbiPOS Payment] Respuesta formateada:', JSON.stringify(resReturn, null, 2));

      // LOGS SAVE - Usar el estado real de la transacción
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS',
        is_success: isTransactionSuccess,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(body),
        res_code: transCodeResult,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      return resReturn;
    } catch (error) {
      console.error('❌ [UbiPOS Payment] Error en la petición:', error);

      const errRes: IResponse = handleApiError(error);

      console.error('❌ [UbiPOS Payment] Error procesado:', {
        status: errRes.status,
        message: errRes.message,
        url: this.getHostUbii() ?? 'Ubiipos host is not configured',
      });

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',
        req_body: JSON.stringify({
          paymentId: 'Taubii',
          ...request,
        }),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });
      return errRes;
    }
  }

  /**
   * UBIPOS PRINT TICKET
   * @returns resReturn: IResponse
   */
  async printTicket(): Promise<IResponse> {
    console.log('🖨️ [UbiPOS Print] Iniciando reimpresión de ticket...');

    let resReturn: IResponse;

    const bodyPrint: IUbiiposDataSend = {
      paymentId: 'fibexUbii',
      operation: 'PRINT',
    };

    try {
      // Get url
      const url: string | null = this.getHostUbii();

      // Validate url
      if (!url) {
        console.error('❌ [UbiPOS Print] Host no configurado');
        resReturn = {
          status: 400,
          message: 'Ubiipos host is not configured',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS-PRINT',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this._localStorageService.get<string>('ubiiposHost')
            ? this.getHostUbii() ?? 'Ubiipos host is not configured'
            : resReturn.message,
          req_body: JSON.stringify(bodyPrint),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: bodyPrint,
        timeout: environment.API_TIMEOUT_STANDARD,
      };

      // 📋 LOG COMPLETO DEL REQUEST
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [UbiPOS Print] REQUEST COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL:', bodyReq.url);
      console.log('🔧 METHOD:', bodyReq.method);
      console.log('📋 HEADERS:', JSON.stringify(bodyReq.headers, null, 2));
      console.log('📦 BODY:', JSON.stringify(bodyReq.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Make request
      const response = await axios.request(bodyReq);

      // 📋 LOG COMPLETO DEL RESPONSE
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [UbiPOS Print] RESPONSE COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 STATUS:', response.status, response.statusText);
      console.log('📋 HEADERS:', JSON.stringify(response.headers, null, 2));
      console.log('📦 DATA:', JSON.stringify(response.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      resReturn = {
        status: response.status,
        message: response.statusText,
        data: response.data as any,
      };

      console.log('✅ [UbiPOS Print] Ticket enviado a impresión');

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-PRINT',
        is_success: true,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,

        req_body: JSON.stringify(bodyPrint),
        res_code: resReturn.message || resReturn.status.toString() || 'OK', // Asegurar valor válido
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      return resReturn;
    } catch (error) {
      console.error('❌ [UbiPOS Print] Error en la petición:', error);

      const errRes: IResponse = handleApiError(error);

      console.error('❌ [UbiPOS Print] Error procesado:', {
        status: errRes.status,
        message: errRes.message,
      });

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-PRINT',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',

        req_body: JSON.stringify(bodyPrint),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  async closeBatch(): Promise<IResponse> {
    console.log('🔄 [UbiPOS CloseBatch] Iniciando cierre de lote...');

    let resReturn: IResponse;

    const bodyClose: IUbiiposDataSend = {
      paymentId: 'Taubii',
      operation: 'SETTLEMENT',
      settleType: 'N',
    };

    try {
      // Get url
      const url: string | null = this.getHostUbii();

      // Validate url
      if (!url) {
        console.error('❌ [UbiPOS CloseBatch] Host no configurado');
        resReturn = {
          status: 400,
          message: 'Ubiipos host is not configured',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS-CLOSE-BATCH',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',

          req_body: JSON.stringify(bodyClose),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: bodyClose,
        timeout: environment.API_TIMEOUT_STANDARD,
      };

      // 📋 LOG COMPLETO DEL REQUEST
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [UbiPOS CloseBatch] REQUEST COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL:', bodyReq.url);
      console.log('🔧 METHOD:', bodyReq.method);
      console.log('📋 HEADERS:', JSON.stringify(bodyReq.headers, null, 2));
      console.log('📦 BODY:', JSON.stringify(bodyReq.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const response = await axios.request(bodyReq);

      // 📋 LOG COMPLETO DEL RESPONSE
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [UbiPOS CloseBatch] RESPONSE COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 STATUS:', response.status, response.statusText);
      console.log('📋 HEADERS:', JSON.stringify(response.headers, null, 2));
      console.log('📦 DATA:', JSON.stringify(response.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Verificar estructura de respuesta
      const transCodeResult = response.data?.TRANS_CODE_RESULT || 'UNKNOWN';
      const isTransactionSuccess = transCodeResult === '00';

      console.log('📊 [UbiPOS CloseBatch] TRANS_CODE_RESULT:', transCodeResult);
      console.log('📊 [UbiPOS CloseBatch] TRANS_MESSAGE_RESULT:', response.data?.TRANS_MESSAGE_RESULT || 'Sin mensaje');
      console.log('📊 [UbiPOS CloseBatch] RESPONSE_TYPE:', response.data?.RESPONSE_TYPE);
      console.log('📊 [UbiPOS CloseBatch] Cierre exitoso:', isTransactionSuccess);

      if (isTransactionSuccess) {
        console.log('✅ [UbiPOS CloseBatch] Cierre de lote APROBADO');
        console.log('✅ [UbiPOS CloseBatch] Terminal:', response.data?.TERMINAL);
        console.log('✅ [UbiPOS CloseBatch] Afiliado:', response.data?.AFILIADO);
        console.log('✅ [UbiPOS CloseBatch] Confirmación:', response.data?.TRANS_CONFIRM_NUM);
      } else {
        console.warn('⚠️ [UbiPOS CloseBatch] Cierre de lote RECHAZADO');
        console.warn('⚠️ [UbiPOS CloseBatch] Código de error:', transCodeResult);
        console.warn('⚠️ [UbiPOS CloseBatch] Mensaje:', response.data?.TRANS_MESSAGE_RESULT);
      }

      resReturn = {
        status: response.status,
        message: response.statusText,
        data: response.data as any,
      };

      console.log('📋 [UbiPOS CloseBatch] Respuesta formateada:', JSON.stringify(resReturn, null, 2));

      // LOGS SAVE - Usar el estado real del cierre
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-CLOSE-BATCH',
        is_success: isTransactionSuccess,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,

        req_body: JSON.stringify(bodyClose),
        res_code: transCodeResult,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      return resReturn;
    } catch (error) {
      console.error('❌ [UbiPOS CloseBatch] Error en la petición:', error);

      const errRes: IResponse = handleApiError(error);

      console.error('❌ [UbiPOS CloseBatch] Error procesado:', {
        status: errRes.status,
        message: errRes.message,
        url: this.getHostUbii() ?? 'Ubiipos host is not configured',
      });

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-CLOSE-BATCH',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',
        req_body: JSON.stringify(bodyClose),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  /**
   * VOID TRANSACTION UBIIPOS
   * Anula una transacción previamente aprobada
   * @param reference Número de referencia de la transacción a anular
   * @returns resReturn: IResponse
   */
  async voidTransaction(reference: string): Promise<IResponse> {
    console.log('🔄 [UbiPOS Void] Iniciando anulación de transacción...');
    console.log('🔄 [UbiPOS Void] Referencia:', reference);

    let resReturn: IResponse;

    try {
      // Validar referencia
      if (!reference || reference.trim() === '') {
        console.error('❌ [UbiPOS Void] Referencia no proporcionada');
        resReturn = {
          status: 400,
          message: 'Reference is required for VOID operation',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS-VOID',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',
          req_body: JSON.stringify({ reference: reference || 'NO_PROVIDED' }),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      // Get url
      const url: string | null = this.getHostUbii();

      // Validate url
      if (!url) {
        console.error('❌ [UbiPOS Void] Host no configurado');
        resReturn = {
          status: 400,
          message: 'Ubiipos host is not configured',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS-VOID',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: 'Ubiipos host is not configured',
          req_body: JSON.stringify({ reference }),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      // Construir body - El API espera paymentId directamente en el body
      const paymentId = 'Taubii';

      const body = {
        paymentId: paymentId,
        reference: reference.trim(),
        operation: 'VOID'
      };

      // Validar que paymentId no esté vacío
      if (!body.paymentId || body.paymentId.trim() === '') {
        console.error('❌ [UbiPOS Void] paymentId está vacío');
        resReturn = {
          status: 400,
          message: 'paymentId is required and cannot be empty',
        };

        // LOGS SAVE ERROR
        this._logService.storagelog({
          date_time: new Date(),
          log_type: 'UBIIPOS-VOID',
          is_success: false,
          http_method: 'POST',
          status: resReturn.status,
          route_api: url,
          req_body: JSON.stringify({ reference, paymentId: 'EMPTY' }),
          res_code: 'ERROR',
          res_body: JSON.stringify(resReturn.message),
          numSubscriber: null,
        });

        return resReturn;
      }

      console.log('🔑 [UbiPOS Void] paymentId:', body.paymentId);
      console.log('🔑 [UbiPOS Void] reference:', body.reference);
      console.log('🔑 [UbiPOS Void] operation:', body.operation);

      // Get headers
      const bodyReq: IRequest = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: body,
        timeout: environment.API_TIMEOUT_STANDARD,
      };

      // 📋 LOG COMPLETO DEL REQUEST
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [UbiPOS Void] REQUEST COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL:', bodyReq.url);
      console.log('🔧 METHOD:', bodyReq.method);
      console.log('📋 HEADERS:', JSON.stringify(bodyReq.headers, null, 2));
      console.log('📦 BODY COMPLETO:', JSON.stringify(bodyReq.data, null, 2));
      console.log('🔑 paymentId:', bodyReq.data.paymentId);
      console.log('🔑 reference:', bodyReq.data.reference);
      console.log('🔑 operation:', bodyReq.data.operation);
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Make request
      const response = await axios.request(bodyReq);

      // 📋 LOG COMPLETO DEL RESPONSE
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [UbiPOS Void] RESPONSE COMPLETO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 STATUS:', response.status, response.statusText);
      console.log('📋 HEADERS:', JSON.stringify(response.headers, null, 2));
      console.log('📦 DATA:', JSON.stringify(response.data, null, 2));
      console.log('⏰ TIMESTAMP:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Verificar respuesta
      const transCodeResult = response.data?.TRANS_CODE_RESULT || 'UNKNOWN';
      const isTransactionSuccess = transCodeResult === '00';

      console.log('📊 [UbiPOS Void] TRANS_CODE_RESULT:', transCodeResult);
      console.log('📊 [UbiPOS Void] TRANS_MESSAGE_RESULT:', response.data?.TRANS_MESSAGE_RESULT || 'Sin mensaje');
      console.log('📊 [UbiPOS Void] Anulación exitosa:', isTransactionSuccess);

      if (isTransactionSuccess) {
        console.log('✅ [UbiPOS Void] Transacción ANULADA exitosamente');
        console.log('✅ [UbiPOS Void] Referencia:', response.data?.REFERENCIA);
        console.log('✅ [UbiPOS Void] Terminal:', response.data?.TERMINAL);
        console.log('✅ [UbiPOS Void] Confirmación:', response.data?.TRANS_CONFIRM_NUM);
      } else {
        console.warn('⚠️ [UbiPOS Void] Anulación RECHAZADA');
        console.warn('⚠️ [UbiPOS Void] Código de error:', transCodeResult);
        console.warn('⚠️ [UbiPOS Void] Mensaje:', response.data?.TRANS_MESSAGE_RESULT);
      }

      resReturn = {
        status: response.status,
        message: response.data.TRANS_MESSAGE_RESULT || response.statusText,
        data: response.data as any,
      };

      console.log('📋 [UbiPOS Void] Respuesta formateada:', JSON.stringify(resReturn, null, 2));

      // LOGS SAVE - Usar el estado real de la anulación
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-VOID',
        is_success: isTransactionSuccess,
        http_method: bodyReq.method as ILog['http_method'],
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(body),
        res_code: transCodeResult,
        res_body: JSON.stringify(resReturn.data),
        numSubscriber: null,
      });

      return resReturn;
    } catch (error) {
      console.error('❌ [UbiPOS Void] Error en la petición:', error);

      const errRes: IResponse = handleApiError(error);

      console.error('❌ [UbiPOS Void] Error procesado:', {
        status: errRes.status,
        message: errRes.message,
        url: this.getHostUbii() ?? 'Ubiipos host is not configured',
      });

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: new Date(),
        log_type: 'UBIIPOS-VOID',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: this.getHostUbii() ?? 'Ubiipos host is not configured',
        req_body: JSON.stringify({ reference }),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }
}

// RESPONSE SUCCESS PAYMENT
/* {
    "RESPONSE_TYPE": "PAYMENT",
    "TRANS_CODE_RESULT": "00",
    "TRANS_MESSAGE_RESULT": "",
    "TRANS_CONFIRM_NUM": "460622",
    "FECHA": "1008135155",
    "BIN": "54346421",
    "TERMINAL": "U1000273",
    "AFILIADO": "000000000100344",
    "LOTE": "000003",
    "TRACE": "000106",
    "REFERENCIA": "251008000106",
    "METODO_ENTRADA": "CONTACTLESS",
    "TIPO_TARJETA": "CREDITO",
    "PAN": "543464******3894"
} */

// RESPONSE CIERRE DE LOTE
/* {
    "RESPONSE_TYPE": "SETTLEMENT",
    "TRANS_CODE_RESULT": "00",
    "TRANS_MESSAGE_RESULT": "",
    "TRANS_CONFIRM_NUM": "595729",
    "FECHA": "1009150938",
    "BIN": "NO_BIN",
    "TERMINAL": "U1000273",
    "AFILIADO": "000000000100344",
    "LOTE": "NO_LOTE",
    "TRACE": "NO_TRACE",
    "REFERENCIA": "NO_REFERENCIA",
    "METODO_ENTRADA": "NO_METODO_ENTRADA",
    "TIPO_TARJETA": "NO_TIPO_TARJETA",
    "PAN": "NO_PAN"
} */
