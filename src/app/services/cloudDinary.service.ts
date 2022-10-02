import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CloudynariService implements  OnInit {

  private SignatureLast:string = "";
  private PublicID:string ="";
  constructor() { }

   ngOnInit(): void {  }

  //Funciona pero no es seguro ya que no tienes hash de seguridad
  /*UploadImagenCloudynari2(file:any,name:string){
    return new Promise((resolve,reject)=>{
      try {
        const url = `https://api.cloudinary.com/v1_1/${env.CloudName}/image/upload`;
        const formData = new FormData();
    
        formData.append("file", file);
        formData.append("upload_preset", env.upload_preset);
        formData.append("public_id", name);
        formData.append("api_key", env.ApiKey);
        formData.append("folder", "pagos");
    
        fetch(url, {
          method: "POST",
          body: formData
        })
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            resolve(JSON.parse(data));
          })
          .catch((error:any)=>{reject(error)}) //Este es el que ataja el error
      } catch (error) {
        reject(error);
      }
    })
  }*/

  UploadImagenCloudynariSignature(file:any,name:string){
    return new Promise((resolve,reject)=>{
      try {
        const url = `https://api.cloudinary.com/v1_1/${env.CloudName}/image/upload`;
        const formData = new FormData();
    
        let timestamp= Math.floor(Date.now() / 1000)
        let timestampString = timestamp.toString();
        let Carpeta="Pagos"
        let Signature =(`folder=${Carpeta}&public_id=${name}&timestamp=${timestamp}${env.ApiSecret}`)
         this.Has256Generate(Signature)
         .then((resp:any)=>{
          formData.append("file", file);
          formData.append("public_id", name);
          formData.append("api_key", env.ApiKey);
          formData.append("timestamp", timestampString);
          formData.append("signature", resp);
          formData.append("folder", Carpeta);
      
          fetch(url, {
            method: "POST",
            body: formData
          })
            .then((response) => {
              return response.text();
            })
            .then((data) => {
              resolve(JSON.parse(data));
            })
            .catch((error:any)=>{reject(error)}) //Este es el que ataja el error
         })
         .catch((error:any)=>{
          console.log(error);
         })
      } catch (error) {
        reject(error);
      }
    })
  }

  Has256Generate(string:any){
    return new Promise((resolve,reject)=>{
      try {
        let sha1=CryptoJS.SHA1(string).toString()
        resolve(sha1)  
      } catch (error) {
        reject(error);
      }
      
    })
  }

  /*DeleteImageCloudynariSignature(){
    return new Promise((resolve,reject)=>{
      try {
        const url = `https://api.cloudinary.com/v1_1/${env.CloudName}/image/destroy`;
        const formData = new FormData();
        let Carpeta="Pagos";
        let timestamp= Math.floor(Date.now() / 1000)
        let timestampString = timestamp.toString();
        let Signature =(`folder=${Carpeta}&public_id=${this.PublicID}&timestamp=${timestamp}${env.ApiSecret}`);
        this.Has256Generate(Signature)
        .then((resp:any) => {
          console.log("Signature");
          console.log(resp);
          console.log("PublicID");
          console.log(this.PublicID);
          formData.append("public_id", this.PublicID);
          formData.append("signature", resp);
          formData.append("api_key", env.ApiKey);
          formData.append("timestamp", timestampString);
          formData.append("folder", Carpeta);
          
          fetch(url, {
            method: "POST",
            body: formData
          })
            .then((response) => {
              return response.text();
            })
            .then((data) => {
              console.log(data)
              resolve(JSON.parse(data));
            })
            .catch((error:any)=>{reject(error)}) //Este es el que ataja el error
        })
        .catch((error:any)=>{
          console.log(error);
         })


      } catch (error) {
        reject(error);
      }
    })
  }*/

  // Delete an uploaded image
  // Requires setting "Return delete token" to "Yes" in your upload preset configuration
  // See also https://support.cloudinary.com/hc/en-us/articles/202521132-How-to-delete-an-image-from-the-client-side-
  /*deleteImage = (data: any, index: number) => {
    const url = `https://api.cloudinary.com/v1_1/${env.CloudName}/delete_by_token`;
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
    const options = { headers: headers };
    const body = {
      token: "CONEX_HOGAR_PRUEBA-H0465-19-07-2022-225519"
    };
    this.http.post(url, body).subscribe(response => {
      console.log(`Deleted image - ${data.public_id} ${response}`);
      // Remove deleted item for responses
      this.responses.splice(index, 1);
    });
  }*/

}
