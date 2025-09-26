import { Injectable } from '@angular/core';

import axios from "axios";
import { Base64Service } from "./base64.service";
import * as mime from "mime-types";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CMSfileService {

  constructor(
    private _base64Service: Base64Service
  ) { }

  /**
   * @description Upload files to the server through API-Master
   * @param fileInfo
   * @param is_anulation
   */
  public async uploadFile(pathRoute: string, name: string) {
    try {
      // Validate file data
      if (!pathRoute) {
        throw new Error('No se ha proporcionado la ruta del archivo para subir');
      }

      const type = mime.lookup(pathRoute);
      const base64 = await this._base64Service.encodeFile(pathRoute);

      const headers_req = {
        Accept: "application/json",
        'TokenAuth': environment.TOKEN_CMS,
        'Authorization': `Basic ${btoa(`${environment.USER_CMS}:${environment.PASS_CMS}`)}`, 
      };

      const data_req = {
        file: `data:${type};base64, ${base64}`,
        name: name,
        folder: 'Auto_Pago_Files',
      };

      return await axios({
        url: `${environment.URL_API_CMS}/${environment.SUFIJOUP_CMS}`,
        method: "POST",
        headers: headers_req,
        data: data_req,
      })
        .then((res) => {
          return Promise.resolve(res.data);
        })
        .catch((err) => {
          console.error(err);
          return Promise.reject(err);
        });
      
    } catch (err) {
      console.error(err);
      throw new Error('Error al subir el archivo');
    }
  }
}
