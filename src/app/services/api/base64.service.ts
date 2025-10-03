import { Injectable } from '@angular/core';
import { promises as fs } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class Base64Service {

  constructor() { }

  public async encodeFile(fileRoute: string): Promise<string> {
    // Read File
    const buffer = await fs.readFile(fileRoute);

    const encode: string = await buffer.toString("base64");

    return encode;
  }

  public async decodeFile(
    encodeFile: string,
    outputEncoding: BufferEncoding = "utf-8"
  ) {
    // Puedes especificar el encoding de salida si lo necesitas
    const decode = await Buffer.from(encodeFile, "base64").toString(
      outputEncoding
    );

    return decode;
  }
}

// TODO: METER UN TRY CATCH A ESTAS FUNCIONES

/**
 // ---------------------------------- LOGS try
 // LOGS SAVE SUCCESS
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: true,
        http_method: 'POST',
        status: resReturn.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: response.data.TRANS_CODE_RESULT,
        res_body: resReturn.data,
        numSubscriber: 'N/A',
      });

    // ---------------------------------- LOGS CATCH
    // LOGS SAVE ERROR
      this._logService.storagelog({
        dateTime: new Date(),
        log_type: 'UBIIPOS-TEST',
        is_success: false,
        http_method: 'POST',
        status: errRes.status,
        route_api: bodyReq.url,
        req_body: JSON.stringify(bodyReq.data),
        res_code: 'ERROR',
        res_body: errRes.message,
        numSubscriber: 'N/A',
      });
 */
