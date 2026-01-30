import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '../../environments/environment.prod';
import { FileUrl } from '../interfaces/file-url';
import { FileBase64 } from '../interfaces/fibe-base64';

@Injectable({
  providedIn: 'root'
})
export class UplaodImageService {

  private URLUPLOAD: string = env.upload_image_url;
  public limitMB: number = 10;
  constructor(
    private http: HttpClient
  ) { }
  
  verifyFileSize(fileSize: number): boolean {
    fileSize =  fileSize / Math.pow(1024 , 2);
    if( fileSize <= this.limitMB ) {
      return true;
    }
    return false;
  }

  getUrlImageBase64( dataFile: FileBase64 ): Observable<FileUrl> {
    return this.http.post<FileUrl>(`${this.URLUPLOAD}file-base-64`, dataFile);
  }

}
