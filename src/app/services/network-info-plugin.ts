import { registerPlugin } from '@capacitor/core';

export interface NetworkInfoPlugin {
  /**
   * Obtiene la IP local del dispositivo
   * @returns Promise con la IP local
   */
  getLocalIpAddress(): Promise<{ ip: string }>;
}

export const NetworkInfo = registerPlugin<NetworkInfoPlugin>('NetworkInfo', {
  web: () => import('./network-info.web').then(m => new m.NetworkInfoWeb()),
});





