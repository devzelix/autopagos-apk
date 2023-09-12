import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { EncryptService } from './encrypt.service';

import * as CryptoJS from 'crypto-js';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CloudynariService implements  OnInit {

  private SignatureLast:string = "";
  private PublicID:string ="";
  constructor( 
    private http: HttpClient,
    private security: EncryptService
    ) { }

   ngOnInit(): void {  }

   /**
    * Permite subir una imagen en base64
    * @param file base64 example: "media/png;base64, A1H3HS2312G31...."
    * @param name Nombre del archivo
    * @returns Url de la imagen subida
    */
  upload_images(file: any, name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const headers = {
        TokenAuth:env.upload_image_token,
        "Authorization": `Basic ${this.security.btoa(`${env.upload_image_user}:${env.upload_image_password}`)}`
      }
  
      // const formData = new FormData()
      // formData.append('file', file),
      // formData.append('name', name),
      // formData.append('folder', env.folder)
  
      axios.post(env.upload_image_url + "/" + env.upload_image_endpoint, {
        file: file,
        name: name,
        folder: env.folder
      }, {headers: headers} )
        .then(res => {
          if(typeof res.data.url === "string") {
            resolve(res.data.url);
          }
          else reject(new Error("No se logró obtener la url"));
        })
        .catch(err => {
          console.error(err);
          reject(err)
        })
    })
    

    // return this.http.post(`${env.upload_image_url}/${env.upload_image_endpoint}`, formData, {headers})
  }

}
