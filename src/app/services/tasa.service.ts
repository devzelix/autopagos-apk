import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TasaService {
  public tasa = new Subject<string>();
  constructor() { }
}
