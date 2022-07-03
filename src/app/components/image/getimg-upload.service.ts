import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetimgUploadService {

  public  UrlIMG = ""
  constructor() { }

  setImg(img: string) {  this.UrlIMG }

  getImg() { return this.UrlIMG }
}
