import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from  '@angular/common/http';
import { map } from  'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UploadPHPService {
    SERVER_URL: string = environment.urlPHPapi;

    constructor(private httpClient: HttpClient) { }

    public uploadFile(data:any) {
        let uploadURL = `${this.SERVER_URL}/php-upload-file.php`;
        return this.httpClient.post<any>(uploadURL, data);
      }

    uploadFilePHP(file:any,name:string){
      return new Promise((resolve,reject)=>{
        try {
          const url = `${this.SERVER_URL}/php-upload-file.php`;
          const formData = new FormData();
      
          formData.append("image", file);
          formData.append("nameimg", name);

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
            .catch((error:any)=>{reject(error)})
        } catch (error) {
          reject(error);
        }
      })
  
  
  
    }
}
