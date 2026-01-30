import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Device } from '@capacitor/device';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { IKioskAuthResponse, IKioskConfig, IPosUbiFromKiosk } from '../interfaces/kiosk.interface';

@Injectable({
  providedIn: 'root'
})
export class KioskAuthService {
  private kioskConfig = new BehaviorSubject<IKioskConfig | null>(null);
  public kioskConfig$ = this.kioskConfig.asObservable();

  private kioskStatus = new BehaviorSubject<'LOADING' | 'REGISTERED' | 'NOT_REGISTERED' | 'DISABLED' | 'ERROR'>('LOADING');
  public kioskStatus$ = this.kioskStatus.asObservable();

  private currentUuid: string = '';

  /** Regex UUID estándar: 8-4-4-4-12 hex con guiones */
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Usamos la URL desde el environment
  private readonly API_URL = env.kioskApiUrl;
  private readonly API_URL_KIOSKS = `${this.API_URL}/kiosks`;

  constructor(private http: HttpClient) { }

  /**
   * Convierte el identificador del dispositivo a UUID v4 RFC 4122 (versión 4 + variante 10xx)
   * para que validadores estrictos del backend lo acepten.
   */
  private toValidUuid(identifier: string): string {
    const raw = (identifier || '').replace(/-/g, '').toLowerCase();
    if (KioskAuthService.UUID_REGEX.test(identifier)) {
      return identifier;
    }
    const hex16 = raw.padEnd(16, '0').slice(0, 16);
    if (/^[0-9a-f]+$/.test(hex16)) {
      // 3.er grupo debe empezar en "4" (versión), 4.º en "8" (variante RFC 4122)
      return `${hex16.slice(0, 8)}-${hex16.slice(8, 12)}-4${hex16.slice(12, 15)}-8000-000000000000`;
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Inicia el proceso de autenticación del Kiosco
   */
  async initAuth() {
    this.kioskStatus.next('LOADING');
    try {
      const info = await Device.getId();
      this.currentUuid = this.toValidUuid(info.identifier);
      console.log('Kiosk UUID detected:', this.currentUuid);

      this.checkRegistration(this.currentUuid).subscribe();
    } catch (error) {
      console.error('Error getting Device ID:', error);
      this.kioskStatus.next('ERROR');
    }
  }

  /**
   * Consulta al backend real vía UUID.
   * res.data puede ser un array de kiosks: se toma el que coincida con uuid o el primero.
   */
  checkRegistration(uuid: string): Observable<any> {
    const params = new HttpParams().set('uuid', uuid);

    return this.http.get<any>(this.API_URL_KIOSKS, { params }).pipe(
      timeout(15000), // 15s timeout
      tap(res => {
        if (!res.success || !res.data) return;
        const rawList = Array.isArray(res.data) ? res.data : [res.data];
        const item = rawList.find((k: any) => k.uuid === uuid) ?? rawList[0];
        const posUbis: IPosUbiFromKiosk[] = Array.isArray(item.posUbis)
          ? item.posUbis.map((p: any) => ({
              id: p.id,
              ip_address: p.ip_address ?? '',
              kioskId: p.kioskId ?? '',
              status: p.status ?? '',
              port: p.port != null ? Number(p.port) : undefined,
              serial: p.serial,
              code: p.code
            }))
          : [];
        const config: IKioskConfig = {
          id: item.id,
          uuid: item.uuid,
          name: item.code,
          location: `Office ID: ${item.commercialOfficeId}`,
          status: (item.status || '').toUpperCase() as any,
          settings: item,
          posUbis
        };

        if (item.status === 'active') {
          this.kioskConfig.next(config);
          this.kioskStatus.next('REGISTERED');
        } else {
          this.kioskStatus.next('DISABLED');
        }
      }),
      catchError((error: any) => {
        console.error('Kiosk Auth Error:', error);
        if (error.status === 404) {
          // No registrado en la DB
          this.kioskStatus.next('NOT_REGISTERED');
        } else if (error.status === 400 || error.status === 500) {
          // Error fatal o mal formado
          this.kioskStatus.next('ERROR');
        } else {
          // Otros errores (CORS, Red caída, Timeout, etc)
          this.kioskStatus.next('ERROR');
        }
        
        return of(null);
      })
    );
  }

  getUuid() {
    return this.currentUuid;
  }

  /** Puerto fijo para conexión al POS Ubi. */
  private readonly POS_UBI_PORT = 4080;

  /**
   * Devuelve IP y puerto del primer POS Ubi del kiosk actual, o null.
   * El puerto es siempre 4080.
   */
  getFirstPosUbi(): { ip: string; port: number } | null {
    const config = this.kioskConfig.getValue();
    const list = config?.posUbis;
    if (!list?.length) return null;
    const first = list[0];
    const ip = (first.ip_address || '').trim();
    if (!ip) return null;
    return { ip, port: this.POS_UBI_PORT };
  }

  setLoadingState() {
    this.kioskStatus.next('LOADING');
  }
}
