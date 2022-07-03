import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudynariService implements  OnInit {

  private hasBaseDropZoneOver: boolean = false;
  private title: string;
  responses: any[];

  constructor(
    private zone: NgZone,
    private http: HttpClient
  ) {
    this.responses = [];
    this.title = '';
   }

   ngOnInit(): void {
    
  }

  UploadImagenCloudynari2(file:any,name:string){
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



  }

  // Delete an uploaded image
  // Requires setting "Return delete token" to "Yes" in your upload preset configuration
  // See also https://support.cloudinary.com/hc/en-us/articles/202521132-How-to-delete-an-image-from-the-client-side-
/*  deleteImage = (data: any, index: number) => {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/delete_by_token`;
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
    const options = { headers: headers };
    const body = {
      token: data.delete_token
    };
    this.http.post(url, body, options).subscribe(response => {
      console.log(`Deleted image - ${data.public_id} ${response.result}`);
      // Remove deleted item for responses
      this.responses.splice(index, 1);
    });
  }*/

}
