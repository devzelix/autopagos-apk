import { Injectable } from '@angular/core';
import axios from "axios";
import { IUpLoadFiles } from "../../interfaces/api/upload-files";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  constructor() {}

  /**
   * @description Upload files to the server through API-Master
   * @param fileInfo
   * @param is_anulation
   */
  public async uploadInvoice(
    fileInfo: IUpLoadFiles,
    is_anulation: boolean = false
  ) {
    try {
      // Validate file data
      if (!fileInfo) {
        throw new Error("No se ha proporcionado el archivo a subir");
      }

      const typeFileUp = is_anulation ? "ticket-anulation" : "ticket";


      return await axios({
        url: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        method: "POST",
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: fileInfo,
      })
        .then((res) => {
          return Promise.resolve(res.data);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      
    } catch (err) {
      throw new Error("Error al subir el archivo");
    }
  }

  /**
   * @description Upload Administration files to the server through API-Master
   * @param path Route path to file
   * @param is_closing boolean
   */
  public async uploadAdministrationFiles(
    fileInfo: IUpLoadFiles,
    is_closing: boolean = true
  ) {
    try {
      // Validate file data
      if (!fileInfo) {
        throw new Error("No se ha proporcionado la ruta del archivo a subir");
      }

      const typeFileUp = is_closing ? "closing" : "pre-closing";

      return await axios({
        url: `${environment.URL_API_MASTER}administrative/files/${typeFileUp}/upload`,
        method: "POST",
        headers: {
          Accept: "application/json",
          token: environment.TOKEN_API_MASTER,
        },
        data: fileInfo,
      })
      .then((res) => {
        return Promise.resolve(res.data);
      })
      .catch((err) => {
        return Promise.reject(err);
      });

    } catch (err) {
      throw new Error("Error al subir el archivo");
    }
  }
}
