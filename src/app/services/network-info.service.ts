import { Injectable } from '@angular/core';
import { NetworkInfo } from './network-info-plugin';
import { SeguridadDatos } from './bscript.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkInfoService {
  
  constructor(private _seguridadDatos: SeguridadDatos) {}

  /**
   * Obtiene la IP local del dispositivo
   * @returns Promise<string | null> - IP local o null si no se puede obtener
   */
  async getLocalIpAddress(): Promise<string | null> {
    try {
      console.log('🌐 [NetworkInfo] Intentando obtener IP local desde plugin...');
      // Llamar al plugin de Capacitor
      const result = await NetworkInfo.getLocalIpAddress();
      console.log('🌐 [NetworkInfo] Resultado del plugin NetworkInfo:', result);
      
      if (result && result.ip && result.ip !== '0.0.0.0') {
        console.log('✅ [NetworkInfo] IP válida obtenida:', result.ip);
        // Guardar en localStorage para próximas veces
        try {
          localStorage.setItem(
            'LocalIpAddress',
            this._seguridadDatos.encrypt(result.ip)
          );
          console.log('💾 [NetworkInfo] IP guardada en localStorage');
        } catch (error) {
          console.warn('⚠️ [NetworkInfo] No se pudo guardar la IP en localStorage:', error);
        }
        
        return result.ip;
      }
      
      console.warn('⚠️ [NetworkInfo] IP no válida o no obtenida. Resultado:', result);
      
      // Intentar obtener desde localStorage como fallback
      try {
        const ipEncrypted = localStorage.getItem('LocalIpAddress');
        if (ipEncrypted) {
          const ipDecrypted = this._seguridadDatos.decrypt(ipEncrypted);
          console.log('💾 [NetworkInfo] IP obtenida desde localStorage:', ipDecrypted);
          return ipDecrypted;
        }
      } catch (e) {
        console.warn('⚠️ [NetworkInfo] No se pudo obtener IP desde localStorage:', e);
      }
      
      return null;
    } catch (error) {
      console.error('❌ [NetworkInfo] Error al obtener IP local:', error);
      return null;
    }
  }
}

