import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  public dniToReload: string | number = '';
  constructor() { }
}
