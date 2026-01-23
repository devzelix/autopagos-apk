import { Injectable } from '@angular/core';
import axios from 'axios';
import { IRequest, IResponse } from 'src/app/interfaces/api/handlerResReq';
import {
  IPrintTicket,
  IUploadFile,
  IClosingBatch,
} from 'src/app/interfaces/printer.interface';
import { handleApiError } from 'src/app/utils/api-tools';
import { environment } from 'src/environments/environment';
import { LogService } from '../log.service';
import { NetworkInfoService } from '../network-info.service';
import { LocalstorageService } from '../localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private dateNew: Date = new Date();
  private headersReq = {
    'Content-Type': 'application/json',
    'x-tkn': environment.API_PRINTER_TOKEN,
  };

  constructor(
    private _logService: LogService,
    private _networkInfo: NetworkInfoService,
    private _localStorageService: LocalstorageService
  ) { }

  /**
   * Obtiene la IP del checkout desde la sesión guardada (desde BD)
   * @returns Promise<string | null>
   */
  private async getCheckoutIpAddress(): Promise<string | null> {
    try {
      console.log('🔍 [PDF Service] Obteniendo IP del checkout desde sesión...');
      const checkoutIp = this._localStorageService.get<string>('checkout_ip_address');
      console.log('📡 [PDF Service] IP del checkout:', checkoutIp || 'No disponible');
      return checkoutIp || null;
    } catch (error) {
      console.error('❌ [PDF Service] Error al obtener IP del checkout:', error);
      return null;
    }
  }

  /**
   * @description: Funcion para imprimir un ticket
   * @param _dataTiket
   * @returns
   */
  public async ticketCreateAndUpload(
    dataTiket: IPrintTicket
  ): Promise<IResponse> {
    let res: IResponse;

    try {
      // Validate file data
      if (!dataTiket) {
        res = {
          status: 400,
          message:
            'No se ha proporcionado la informacion para generar el ticket digital.',
        };

        return res;
      }

      // Obtener la IP del checkout desde la sesión (guardada en BD)
      console.log('🔍 [PDF Service] Obteniendo IP del checkout...');
      const checkoutIpAddress = await this.getCheckoutIpAddress();
      console.log('📡 [PDF Service] IP del checkout obtenida:', checkoutIpAddress || 'No disponible');
      console.log('📦 [PDF Service] Datos del ticket antes de agregar IP:', dataTiket);

      const dataWithIp = {
        ...dataTiket,
        ipaddress: checkoutIpAddress || null, // IP del checkout desde BD
        is_closing: false, // Explícitamente indicar que NO es cierre de caja
      };

      console.log('✅ [PDF Service] Datos finales que se enviarán a API driver:', dataWithIp);
      console.log('🌐 [PDF Service] URL de API driver:', `${environment.API_Printer}/pdf/ticket-and-print`);

      const bodyReq: IRequest = {
        url: `${environment.API_Printer}/pdf/ticket-and-print`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-tkn': environment.API_PRINTER_TOKEN,
        },
        data: dataWithIp,
      };

      console.log('📤 [PDF Service] Enviando petición a API driver con body:', JSON.stringify(bodyReq.data, null, 2));

      const resultReq = await axios.request(bodyReq);

      res = {
        status: resultReq.status,
        message: 'Ticket digital creado.',
        data: resultReq.data.data,
      };

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'TICKET-FILE',
        is_success: true,
        http_method: 'POST',
        status: res.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: res.status.toString(),
        res_body: JSON.stringify(res.data),
        numSubscriber: null,
      });

      // Log removido para producción - mejora rendimiento

      return res;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'PAYMENT-CREATE',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.URL_API_MASTER}/pdf/ticket-and-print`,

        req_body: JSON.stringify(dataTiket),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  /**
   * @description: Funcion para generar y subir archivo de cierre de lotes
   * @param closingData Datos del cierre de lotes
   * @returns
   */
  public async closingCreateAndUpload(
    closingData: IClosingBatch
  ): Promise<IResponse> {
    let res: IResponse;

    try {
      console.log('🔄 [PDF Service Closing] Iniciando generación de archivo de cierre...');
      console.log('📦 [PDF Service Closing] Datos recibidos:', JSON.stringify(closingData, null, 2));
      
      // Validate file data
      if (!closingData) {
        console.error('❌ [PDF Service Closing] No se proporcionaron datos de cierre');
        res = {
          status: 400,
          message:
            'No se ha proporcionado la informacion para generar el archivo de cierre.',
        };

        return res;
      }

      // Obtener la IP del checkout desde la sesión (guardada en BD)
      console.log('🔍 [PDF Service Closing] Obteniendo IP del checkout...');
      const ipAddress = await this.getCheckoutIpAddress();
      console.log('📡 [PDF Service Closing] IP del checkout obtenida:', ipAddress || 'No disponible');

      // Calcular el monto total del cierre
      let closingAmount = '0.00';
      if (closingData.totalAmount) {
        try {
          const amountValue = typeof closingData.totalAmount === 'string' 
            ? parseFloat(closingData.totalAmount) 
            : closingData.totalAmount;
          closingAmount = amountValue.toFixed(2);
          console.log('💰 [PDF Service Closing] Monto total del cierre:', closingAmount);
        } catch (error) {
          console.warn('⚠️ [PDF Service Closing] Error al procesar monto total:', error);
        }
      } else {
        console.warn('⚠️ [PDF Service Closing] No se encontró monto total en los datos de cierre');
      }

      // Adaptar datos de cierre al formato de ticket para usar el mismo endpoint
      const ticketData: IPrintTicket = {
        date: new Date(closingData.closingDate).toLocaleDateString('es-VE'),
        hours: new Date(closingData.closingDate).toLocaleTimeString('es-VE'),
        refNumber: closingData.referencia || closingData.transConfirmNum || '',
        numSeq: closingData.trace || '',
        abononumber: closingData.afiliado || '',
        status: closingData.transCodeResult === '00' ? 'APROBADO' : 'RECHAZADO',
        describe: `Cierre de Lote - ${closingData.responseType}`,
        amount: closingAmount, // Monto total del cierre
        methodPayment: closingData.metodoEntrada || 'CIERRE',
        checkoutIdentify: closingData.checkoutIdentify,
        id_sede: closingData.id_sede,
        is_anulation: false,
        is_closing: true, // Identificador de cierre de caja
        ...(ipAddress && { ipaddress: ipAddress }),
      };

      console.log('🔄 [PDF Service Closing] Datos adaptados a formato ticket:', JSON.stringify(ticketData, null, 2));
      console.log('🌐 [PDF Service Closing] URL de API driver:', `${environment.API_Printer}/pdf/ticket-and-print`);
      console.log('📤 [PDF Service Closing] Enviando petición POST a API driver...');

      const bodyReq: IRequest = {
        url: `${environment.API_Printer}/pdf/ticket-and-print`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-tkn': environment.API_PRINTER_TOKEN,
        },
        data: ticketData,
      };

      console.log('📤 [PDF Service Closing] Body completo que se envía:', JSON.stringify(bodyReq.data, null, 2));

      const resultReq = await axios.request(bodyReq);

      console.log('✅ [PDF Service Closing] Respuesta recibida de API driver:', resultReq);
      console.log('✅ [PDF Service Closing] Status HTTP:', resultReq.status);
      console.log('✅ [PDF Service Closing] Data recibida:', JSON.stringify(resultReq.data, null, 2));

      res = {
        status: resultReq.status,
        message: 'Archivo de cierre generado y subido.',
        data: resultReq.data.data || resultReq.data,
      };

      console.log('✅ [PDF Service Closing] Respuesta final formateada:', JSON.stringify(res, null, 2));

      // LOGS SAVE SUCCESS
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'CLOSING-FILE',
        is_success: true,
        http_method: 'POST',
        status: res.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: res.status.toString(),
        res_body: JSON.stringify(res.data),
        numSubscriber: null,
      });

      return res;
    } catch (error) {
      console.error('❌ [PDF Service Closing] Error al generar archivo de cierre:', error);
      console.error('❌ [PDF Service Closing] Error completo:', JSON.stringify(error, null, 2));
      
      const errRes: IResponse = handleApiError(error);
      
      console.error('❌ [PDF Service Closing] Error formateado:', JSON.stringify(errRes, null, 2));

      // LOGS SAVE ERROR
      this._logService.storagelog({
        date_time: this.dateNew,
        log_type: 'CLOSING-FILE',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: `${environment.API_Printer}/pdf/ticket-and-print`,

        req_body: JSON.stringify(closingData),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: null,
      });

      return errRes;
    }
  }

  // TODO: ESTA CLABEADO ORDENAR EL TEMA DE UN INICIO DE SESION PARA ESTAS MAQUINAS YA QUE NO PRODREMOS OBTENER LAS MAC ADDRESS
  /**
   * @description: Function to get the mac address string
   * @returns `string`
   */
  getMacAddress(): Promise<string> {
    // return new Promise<string>((resolve, reject) => {
    //   const url = environment.API_Printer + '/divice-info/mac';
    //   axios
    //     .get(url, { headers: this.headersReq })
    //     .then((res) => {
    //       resolve(res.data.data);
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     });
    // });
    return new Promise<string>((resolve, _reject) => {
      resolve('50:9a:4c:50:df:4e');
    });
  }
}
