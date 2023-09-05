import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { EncryptService } from './encrypt.service';

import * as CryptoJS from 'crypto-js';

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

  upload_images(file: any, name: string){

    const headers = {
      TokenAuth:env.upload_image_token,
      "Authorization": `Basic ${this.security.btoa(`${env.upload_image_user}:${env.upload_image_password}`)}`
    }

    const formData = new FormData()
    formData.append('file', file),
    formData.append('name', name),
    formData.append('folder', env.folder)

    return this.http.post(`${env.upload_image_url}/${env.upload_image_endpoint}`, formData, {headers})
  }

}
