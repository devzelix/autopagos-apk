export interface IKioskConfig {
    id: string;
    uuid: string;
    name: string;
    location: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    settings?: any;
}

export interface IKioskAuthResponse {
    success: boolean;
    registered: boolean;
    config?: IKioskConfig;
    message?: string;
}
