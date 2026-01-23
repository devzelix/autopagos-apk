import { WebPlugin } from '@capacitor/core';
import type { NetworkInfoPlugin } from './network-info-plugin';

export class NetworkInfoWeb extends WebPlugin implements NetworkInfoPlugin {
  
  async getLocalIpAddress(): Promise<{ ip: string }> {
    const ip = await this.getLocalIpViaWebRTC();
    return { ip: ip || '0.0.0.0' };
  }

  private getLocalIpViaWebRTC(): Promise<string | null> {
    return new Promise((resolve) => {
      console.log('🔍 [NetworkInfo Web] Iniciando WebRTC para obtener IP local...');
      
      const RTCPeerConnection = 
        (window as any).RTCPeerConnection || 
        (window as any).webkitRTCPeerConnection || 
        (window as any).mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        console.warn('⚠️ [NetworkInfo Web] WebRTC no está soportado en este navegador');
        resolve(null);
        return;
      }

      console.log('✅ [NetworkInfo Web] WebRTC está disponible');
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      pc.createDataChannel('');
      const localIPs: string[] = [];
      let candidateCount = 0;

      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          candidateCount++;
          const candidate = event.candidate.candidate;
          console.log(`🔍 [NetworkInfo Web] Candidato ICE #${candidateCount}:`, candidate);
          
          // Buscar IPs en el candidato
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          
          if (ipMatch) {
            const ip = ipMatch[1];
            const candidateType = event.candidate.type; // 'host', 'srflx', 'relay', 'prflx'
            console.log(`🔍 [NetworkInfo Web] IP encontrada: ${ip}, Tipo: ${candidateType}`);
            
            // Los candidatos tipo 'host' son los que tienen IP local
            if (candidateType === 'host' && this.isLocalIp(ip) && !localIPs.includes(ip)) {
              console.log(`✅ [NetworkInfo Web] IP local válida encontrada (host): ${ip}`);
              localIPs.push(ip);
            } else if (candidateType === 'host' && !this.isLocalIp(ip)) {
              // Si es tipo host pero no es local, puede ser IPv6 o algo raro
              console.log(`⚠️ [NetworkInfo Web] Candidato host pero IP no es local: ${ip}`);
            } else if (candidateType !== 'host') {
              console.log(`⚠️ [NetworkInfo Web] Candidato tipo ${candidateType} (no es local): ${ip}`);
            } else {
              console.log(`⚠️ [NetworkInfo Web] IP ya está en la lista: ${ip}`);
            }
          } else {
            // Buscar hostnames .local (mDNS) - estos indican que hay una IP local pero no se expone
            const localHostnameMatch = candidate.match(/([a-f0-9-]+\.local)/i);
            if (localHostnameMatch && event.candidate.type === 'host') {
              console.log(`🔍 [NetworkInfo Web] Hostname local encontrado: ${localHostnameMatch[1]} (mDNS - IP local no expuesta por privacidad)`);
            }
          }
        } else {
          console.log('🏁 [NetworkInfo Web] No hay más candidatos ICE');
          pc.close();
          if (localIPs.length > 0) {
            console.log(`✅ [NetworkInfo Web] IP local seleccionada: ${localIPs[0]}`);
            resolve(localIPs[0]);
          } else {
            console.warn('⚠️ [NetworkInfo Web] No se encontraron IPs locales. WebRTC puede estar bloqueado por privacidad del navegador.');
            resolve(null);
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log('🔄 [NetworkInfo Web] Estado de recolección ICE:', pc.iceGatheringState);
      };

      pc.createOffer()
        .then((offer: any) => {
          console.log('📤 [NetworkInfo Web] Oferta WebRTC creada');
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          console.log('✅ [NetworkInfo Web] Descripción local establecida');
        })
        .catch((error: any) => {
          console.error('❌ [NetworkInfo Web] Error al crear oferta WebRTC:', error);
          pc.close();
          resolve(null);
        });

      // Aumentar timeout a 10 segundos
      setTimeout(() => {
        console.log('⏱️ [NetworkInfo Web] Timeout alcanzado. Candidatos encontrados:', candidateCount);
        pc.close();
        if (localIPs.length > 0) {
          console.log(`✅ [NetworkInfo Web] IP local seleccionada (timeout): ${localIPs[0]}`);
          resolve(localIPs[0]);
        } else {
          console.warn('⚠️ [NetworkInfo Web] No se encontraron IPs locales después del timeout');
          resolve(null);
        }
      }, 10000);
    });
  }

  private isLocalIp(ip: string): boolean {
    const privateRanges = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./
    ];
    return privateRanges.some(range => range.test(ip));
  }
}

