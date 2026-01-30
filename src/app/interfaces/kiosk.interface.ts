/** Datos del POS Ubi asociado al kiosk (vienen del backend en la respuesta de kiosks). */
export interface IPosUbiFromKiosk {
    id: string;
    ip_address: string;
    kioskId: string;
    status: string;
    port?: number;
    serial?: string;
    code?: string;
}

export interface IKioskConfig {
    id: string;
    uuid: string;
    name: string;
    location: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    settings?: any;
    posUbis?: IPosUbiFromKiosk[];
}

export interface IKioskAuthResponse {
    success: boolean;
    registered: boolean;
    config?: IKioskConfig;
    message?: string;
}
