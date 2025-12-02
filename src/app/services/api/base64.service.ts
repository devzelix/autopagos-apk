import { Injectable } from '@angular/core';
import { promises as fs } from 'fs';

@Injectable({
  providedIn: 'root',
})
export class Base64Service {
  constructor() {}

  /**
   * Encode File
   * @param fileRoute
   * @returns
   */
  public async encodeFile(fileRoute: string): Promise<string> {
    // Read File
    const buffer = await fs.readFile(fileRoute);

    const encode: string = await buffer.toString('base64');

    return encode;
  }

  /**
   * Decode File
   * @param encodeFile
   * @param outputEncoding
   * @returns
   */
  public async decodeFile(
    encodeFile: string,
    outputEncoding: BufferEncoding = 'utf-8'
  ) {
    // Puedes especificar el encoding de salida si lo necesitas
    const decode = await Buffer.from(encodeFile, 'base64').toString(
      outputEncoding
    );

    return decode;
  }
}
