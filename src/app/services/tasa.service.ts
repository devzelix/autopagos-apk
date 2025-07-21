import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { map, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TasaService {
  public tasa = new Subject<string>();
  constructor(private http: HttpClient) { }

  getSaldoBCV() {
    return this.http.get(`https://service.apibcv.net/SearchBCV/ertyhbnjklo89dvty782`, { headers: { 'Content-Type': 'application/json' } }).pipe(
      map((res: any) => {
        // console.log('res', res)
        return res.filter((coin: any) =>coin.moneda == "USD")[0].precio;
      })
    );
  }

  async getTasaSae() {
    try {
      const response = await axios.get('https://tls.fibextelecom.lat/api/dolar');
      return response.data;
    } catch (error: any)  {
      console.error('Error fetching Tasa SAE:', error.message);
      return '0.00'; // Default value in case of error
    }
  }

}
