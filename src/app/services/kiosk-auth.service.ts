import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Device } from '@capacitor/device';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { IKioskAuthResponse, IKioskConfig } from '../interfaces/kiosk.interface';

@Injectable({
  providedIn: 'root'
})
export class KioskAuthService {
  private kioskConfig = new BehaviorSubject<IKioskConfig | null>(null);
  public kioskConfig$ = this.kioskConfig.asObservable();

  private kioskStatus = new BehaviorSubject<'LOADING' | 'REGISTERED' | 'NOT_REGISTERED' | 'DISABLED' | 'ERROR'>('LOADING');
  public kioskStatus$ = this.kioskStatus.asObservable();

  private currentUuid: string = '';
  
  // Usamos la URL desde el environment
  private readonly API_URL = env.kioskApiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Inicia el proceso de autenticación del Kiosco
   */
  async initAuth() {
    this.kioskStatus.next('LOADING');
    try {
      const info = await Device.getId();
      this.currentUuid = info.identifier;
      console.log('Kiosk UUID detected:', this.currentUuid);

      this.checkRegistration(this.currentUuid).subscribe();
    } catch (error) {
      console.error('Error getting Device ID:', error);
      this.kioskStatus.next('ERROR');
    }
  }

  /**
   * Consulta al backend real vía UUID
   */
  checkRegistration(uuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);

    return this.http.get<any>(this.API_URL, { params }).pipe(
      tap(res => {
        // Si el backend responde 200 y success: true
        if (res.success && res.data) {
          const config: IKioskConfig = {
            id: res.data.id,
            uuid: res.data.uuid,
            name: res.data.code, // Usamos el código como nombre
            location: `Office ID: ${res.data.commercialOfficeId}`,
            status: res.data.status.toUpperCase() as any,
            settings: res.data
          };

          if (res.data.status === 'active') {
            this.kioskConfig.next(config);
            this.kioskStatus.next('REGISTERED');
          } else {
            this.kioskStatus.next('DISABLED');
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Kiosk Auth Error:', error);
        
        if (error.status === 404) {
          // No registrado en la DB
          this.kioskStatus.next('NOT_REGISTERED');
        } else if (error.status === 400 || error.status === 500) {
          // Error fatal o mal formado
          this.kioskStatus.next('ERROR');
        } else {
          // Otros errores (CORS, Red caída, etc)
          this.kioskStatus.next('ERROR');
        }
        
        return of(null);
      })
    );
  }

  getUuid() {
    return this.currentUuid;
  }

  setLoadingState() {
    this.kioskStatus.next('LOADING');
  }
}
